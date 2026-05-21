import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const { ANTHROPIC_API_KEY, RESEND_API_KEY, EMAIL_ADDRESS } = process.env;

if (!ANTHROPIC_API_KEY || !RESEND_API_KEY || !EMAIL_ADDRESS) {
  console.log('Missing required secrets — skipping.');
  process.exit(0);
}

// Gather content from all scene JSON files
const scenesDir = join(process.cwd(), 'scenes');
const files = await readdir(scenesDir).catch(() => []);
const jsonFiles = files.filter(f => f.endsWith('.json'));

if (!jsonFiles.length) {
  console.log('No scenes yet — skipping.');
  process.exit(0);
}

const sections = [];
for (const file of jsonFiles) {
  const data = JSON.parse(await readFile(join(scenesDir, file), 'utf-8'));
  const text = data.paragraphs
    .map(p => p.clean || p.raw)
    .filter(Boolean)
    .join('\n\n');
  if (text) sections.push(`## ${data.name}\n\n${text}`);
}

if (!sections.length) {
  console.log('No written content yet — skipping.');
  process.exit(0);
}

const storyContent = sections.join('\n\n---\n\n');

// Ask Claude for story questions
const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    system: `You are a thoughtful writing coach helping a novelist stay connected to their story.

Given the draft content, write 5 short questions that will help the writer think deeply about their story today. Questions should be specific to the actual characters, events, and details — never generic. Mix questions about character feeling, sensory details worth adding, consequences the reader wonders about, or what happens next.

Output exactly 5 questions, one per line, no numbering, no extra text.`,
    messages: [{ role: 'user', content: storyContent }],
  }),
});

const claudeData = await claudeRes.json();
const questions = claudeData.content[0].text.trim().split('\n').filter(Boolean);

if (!questions.length) {
  console.log('No questions generated — skipping.');
  process.exit(0);
}

// Build email HTML
const items = questions
  .map(q => `<li style="margin-bottom:12px;color:#3d2b1f;">${q}</li>`)
  .join('');

const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#fdf6ee;margin:0;padding:40px 20px;">
  <div style="max-width:560px;margin:0 auto;">
    <h2 style="color:#8b4513;font-weight:normal;margin-bottom:8px;">Your story is waiting.</h2>
    <p style="color:#6b4c3b;margin-top:0;">A few things a reader is wondering about:</p>
    <ul style="line-height:1.7;padding-left:20px;">${items}</ul>
    <p style="color:#9a7b6a;font-size:13px;margin-top:32px;border-top:1px solid #e8d5c4;padding-top:16px;">
      BookBuddy · your writing companion
    </p>
  </div>
</body>
</html>`;

// Send via Resend
const resendRes = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'BookBuddy <bookbuddy@resend.dev>',
    to: EMAIL_ADDRESS,
    subject: `Your story, today — ${today}`,
    html,
  }),
});

if (resendRes.ok) {
  console.log(`Daily email sent to ${EMAIL_ADDRESS}`);
} else {
  const err = await resendRes.json();
  console.error('Resend error:', JSON.stringify(err));
  process.exit(1);
}

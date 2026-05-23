const {
  ANTHROPIC_API_KEY, RESEND_API_KEY, EMAIL_ADDRESS,
  DATA_GITHUB_TOKEN, DATA_GITHUB_OWNER, DATA_GITHUB_REPO, DATA_GITHUB_BRANCH,
} = process.env;

if (!ANTHROPIC_API_KEY || !RESEND_API_KEY || !EMAIL_ADDRESS) {
  console.log('Missing required secrets — skipping.');
  process.exit(0);
}

if (!DATA_GITHUB_TOKEN || !DATA_GITHUB_OWNER || !DATA_GITHUB_REPO) {
  console.log('Missing DATA_GITHUB_* secrets — skipping.');
  process.exit(0);
}

const branch = DATA_GITHUB_BRANCH || 'main';
const ghHeaders = {
  Authorization: `Bearer ${DATA_GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};
const ghBase = `https://api.github.com/repos/${DATA_GITHUB_OWNER}/${DATA_GITHUB_REPO}`;

// ── Load reader history ───────────────────────────────────────────────────────

const LOG_PATH = 'reader-log.json';
let readerHistory = [];
let logSha;

try {
  const logRes = await fetch(`${ghBase}/contents/${LOG_PATH}?ref=${branch}`, { headers: ghHeaders });
  if (logRes.ok) {
    const logFile = await logRes.json();
    logSha = logFile.sha;
    const logRaw = Buffer.from(logFile.content.replace(/\s/g, ''), 'base64').toString('utf-8');
    readerHistory = JSON.parse(logRaw);
  }
} catch {
  // No history yet — start fresh
}

// ── Load story content ────────────────────────────────────────────────────────

const dirRes = await fetch(`${ghBase}/contents/scenes?ref=${branch}`, { headers: ghHeaders });
if (!dirRes.ok) {
  console.log('Could not read scenes directory — skipping.');
  process.exit(0);
}
const dirEntries = await dirRes.json();
const jsonFiles = dirEntries.filter(f => f.name.endsWith('.json'));

if (!jsonFiles.length) {
  console.log('No scenes yet — skipping.');
  process.exit(0);
}

const sections = [];
for (const entry of jsonFiles) {
  const fileRes = await fetch(entry.url, { headers: ghHeaders });
  if (!fileRes.ok) continue;
  const file = await fileRes.json();
  const raw = Buffer.from(file.content.replace(/\s/g, ''), 'base64').toString('utf-8');
  const data = JSON.parse(raw);
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

// ── Persona definitions ───────────────────────────────────────────────────────

const PERSONAS = [
  {
    name: 'Maya',
    emoji: '💛',
    color: '#b45309',
    bg: '#fef9ee',
    border: '#f6d860',
    description: `Maya is an emotionally invested reader who bonds deeply with characters. She's empathetic and perceptive — she notices when something feels true about a person, gets genuinely upset when characters hurt each other, and cares almost too much. She's warm and sometimes a little dramatic about it, but never shallow. She asks about feelings, relationships, and what characters want underneath what they say.`,
  },
  {
    name: 'Rex',
    emoji: '🔍',
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#93c5fd',
    description: `Rex is a plot-hungry reader and compulsive theorist. He notices foreshadowing, keeps mental track of every loose thread, and is always one step ahead — or thinks he is. He gets a little smug when he spots something, but he's also genuinely excited. He asks about consequences, what's coming next, and what the author might be setting up. He'll call out if something feels convenient or if a setup hasn't paid off yet.`,
  },
  {
    name: 'Sylvia',
    emoji: '📖',
    color: '#6d28d9',
    bg: '#f5f3ff',
    border: '#c4b5fd',
    description: `Sylvia has a literary eye and reads closely. She notices a well-turned sentence, a thematic echo, an image that does double duty. She's not pretentious — she's delighted, like someone who found a secret. She asks about craft choices, recurring motifs, and what the story seems to be saying beneath the surface. She'll notice when the prose is working especially well and want to know if it was intentional.`,
  },
  {
    name: 'Danny',
    emoji: '🌧️',
    color: '#065f46',
    bg: '#f0fdf4',
    border: '#6ee7b7',
    description: `Danny reads for atmosphere and immersion. He lives for the sensory stuff — the quality of light, what a room smells like, the specific sound of something. He gets pulled out of a story when a place doesn't feel real, and pulled deeply in when it does. He asks about setting, mood, time of day, physical sensation. He notices when a scene has no weather, no texture, no ground under its feet.`,
  },
];

const personaBlock = PERSONAS.map(p => `**${p.name}** — ${p.description}`).join('\n\n');

// ── Build history context ─────────────────────────────────────────────────────

const recentHistory = readerHistory.slice(-7);
const historyContext = recentHistory.length
  ? `\nThese readers have been following this story for a while. Here is what they said in previous sessions (oldest first). They should feel free to reference their earlier reactions, follow up on questions they asked before, or notice how the story has developed since they last read.\n\n` +
    recentHistory.map(entry =>
      `[${entry.date}]\n` +
      entry.messages.map(m => `${m.name}: ${m.message}`).join('\n')
    ).join('\n\n')
  : '';

// ── Call Claude ───────────────────────────────────────────────────────────────

const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 1600,
    system: `You are writing messages from four fictional readers who have been following a novelist's work in progress. Each reader has a distinct personality and reads for different things. Write one message per reader — something they might actually send in a group chat or DM after reading.

Each message should:
- Sound like a real person texting, not a critic writing a review
- Be specific to actual characters, events, and details — never generic
- Reflect that reader's personality without being a caricature
- Include at least one genuine question born from curiosity, not just enthusiasm
- Be 3–6 sentences
- If the reader asked a question in a previous session that now has an answer in the story, they should notice
${historyContext}

The four readers:

${personaBlock}

Output valid JSON — an array of 4 objects, each with "name" and "message" fields. No markdown fences, no other text.`,
    messages: [{ role: 'user', content: storyContent }],
  }),
});

const claudeData = await claudeRes.json();
let personas;
try {
  const raw = claudeData.content[0].text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  personas = JSON.parse(raw);
} catch {
  console.error('Failed to parse persona JSON:', claudeData.content[0].text);
  process.exit(1);
}

if (!personas?.length) {
  console.log('No personas generated — skipping.');
  process.exit(0);
}

// ── Build email HTML ──────────────────────────────────────────────────────────

const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
const todayISO = new Date().toISOString().split('T')[0];

const personaMap = Object.fromEntries(PERSONAS.map(p => [p.name, p]));

const cards = personas.map(({ name, message }) => {
  const p = personaMap[name] || { emoji: '💬', color: '#555', bg: '#f9f9f9', border: '#ddd' };
  return `
    <div style="background:${p.bg};border:1px solid ${p.border};border-radius:16px;padding:20px 24px;margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <span style="font-size:1.4rem;line-height:1;">${p.emoji}</span>
        <span style="font-family:system-ui,sans-serif;font-weight:600;color:${p.color};font-size:0.95rem;">${name}</span>
      </div>
      <p style="margin:0;font-family:Georgia,serif;color:#2d1f14;line-height:1.75;font-size:0.97rem;">${message}</p>
    </div>`;
}).join('');

const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#fdf6ee;margin:0;padding:40px 20px;">
  <div style="max-width:560px;margin:0 auto;">
    <p style="font-family:system-ui,sans-serif;font-size:0.8rem;color:#9a7b6a;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Your readers</p>
    <h2 style="font-family:Georgia,serif;color:#3d2b1f;font-weight:normal;margin:0 0 28px;">${todayLabel}</h2>
    ${cards}
    <p style="font-family:system-ui,sans-serif;color:#9a7b6a;font-size:12px;margin-top:32px;border-top:1px solid #e8d5c4;padding-top:16px;">
      BookBuddy · your writing companion
    </p>
  </div>
</body>
</html>`;

// ── Send email ────────────────────────────────────────────────────────────────

const resendRes = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'BookBuddy <bookbuddy@loganchristensen.com>',
    to: EMAIL_ADDRESS,
    subject: `Your readers checked in — ${todayLabel}`,
    html,
  }),
});

if (!resendRes.ok) {
  const err = await resendRes.json();
  console.error('Resend error:', JSON.stringify(err));
  process.exit(1);
}

console.log(`Daily email sent to ${EMAIL_ADDRESS}`);

// ── Save history to data repo ─────────────────────────────────────────────────

readerHistory.push({ date: todayISO, messages: personas });
// Keep last 30 days
if (readerHistory.length > 30) readerHistory.splice(0, readerHistory.length - 30);

const logContent = Buffer.from(JSON.stringify(readerHistory, null, 2)).toString('base64');

const saveRes = await fetch(`${ghBase}/contents/${LOG_PATH}`, {
  method: 'PUT',
  headers: { ...ghHeaders, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: `Reader log: ${todayISO}`,
    content: logContent,
    branch,
    ...(logSha ? { sha: logSha } : {}),
  }),
});

if (saveRes.ok) {
  console.log('Reader history saved.');
} else {
  const err = await saveRes.json();
  console.error('Failed to save history:', JSON.stringify(err));
  // Non-fatal — email already sent
}

import { getSettings } from '../settings';

const API = 'https://api.anthropic.com/v1/messages';

async function call(system: string, userContent: string, maxTokens = 1024): Promise<string> {
  const { anthropicKey } = getSettings();
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any;
    throw new Error(err?.error?.message ?? `Claude API error ${res.status}`);
  }

  const data = await res.json() as any;
  return (data.content[0].text as string).trim();
}

export async function cleanupProse(raw: string, context = ''): Promise<string> {
  const userContent = context
    ? `Previous context:\n${context}\n\n---\n\nNew dictation to clean up:\n${raw}`
    : `Clean up this dictated text:\n${raw}`;

  return call(CLEANUP_SYSTEM, userContent, 1024);
}

export async function getWarmupQuestions(content: string): Promise<string[]> {
  try {
    const text = await call(WARMUP_SYSTEM, content, 300);
    return text.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

const CLEANUP_SYSTEM = `You are a prose editor working with a novelist on a draft manuscript.

Your job is to clean up raw dictated or typed text into polished, readable prose. You must:
- Fix grammar, punctuation, and sentence flow
- Remove dictation artifacts ("um", "uh", repeated words, false starts)
- Preserve the author's voice, style, and all narrative choices
- Never advance the plot, add new events, or invent details
- Keep every idea present in the raw input — just express it cleanly
- Split into natural paragraphs where appropriate
- Return ONLY the cleaned prose — no commentary, no meta-text, no "Here is the cleaned version:"

Output one or more prose paragraphs, each separated by a blank line. Nothing else.`;

const WARMUP_SYSTEM = `You are a writing coach helping a novelist get back into their story.

Given recent draft content, generate 3 short questions that will help the writer re-engage with the scene. Questions should be about character motivation, sensory details, or what happens next. Be specific to the actual content — no generic advice.

Output exactly 3 questions, one per line, no numbering, no extra text.`;

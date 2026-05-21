import { getSettings } from '../settings';
import { sceneToMarkdown } from '../lib/markdown';
import type { Scene } from '../types';

const BASE = 'https://api.github.com';

async function ghFetch(path: string, options: RequestInit = {}): Promise<any> {
  const { githubToken, githubOwner, githubRepo } = getSettings();
  const res = await fetch(`${BASE}/repos/${githubOwner}/${githubRepo}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any;
    throw new Error(err?.message ?? `GitHub ${res.status}`);
  }
  return res.json();
}

function encodeContent(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

async function putFile(path: string, content: string, message: string, branch: string): Promise<void> {
  let sha: string | undefined;
  try {
    const existing = await ghFetch(`/contents/${path}`);
    sha = existing.sha as string;
  } catch {
    // file doesn't exist yet — omit sha for creation
  }
  await ghFetch(`/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content, branch, ...(sha ? { sha } : {}) }),
  });
}

export async function listSceneSlugs(): Promise<string[]> {
  try {
    const files = await ghFetch('/contents/scenes') as any[];
    return files
      .filter(f => f.name.endsWith('.json'))
      .map(f => (f.name as string).replace('.json', ''));
  } catch {
    return [];
  }
}

export async function loadScene(slug: string): Promise<Scene | null> {
  try {
    const file = await ghFetch(`/contents/scenes/${slug}.json`);
    const raw = decodeURIComponent(escape(atob((file.content as string).replace(/\s/g, ''))));
    return JSON.parse(raw) as Scene;
  } catch {
    return null;
  }
}

export async function saveScene(scene: Scene): Promise<void> {
  const { githubBranch } = getSettings();
  await putFile(
    `scenes/${scene.slug}.json`,
    encodeContent(JSON.stringify(scene, null, 2)),
    `Update scene: ${scene.name}`,
    githubBranch,
  );
  await putFile(
    `scenes/${scene.slug}.md`,
    encodeContent(sceneToMarkdown(scene)),
    `Update markdown: ${scene.name}`,
    githubBranch,
  );
}

export async function createScene(name: string): Promise<Scene> {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const scene: Scene = {
    name,
    slug,
    created_at: new Date().toISOString(),
    paragraphs: [],
  };

  await saveScene(scene);
  return scene;
}

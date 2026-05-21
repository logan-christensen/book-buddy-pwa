import type { AppSettings } from './types';

const KEYS: Record<keyof AppSettings, string> = {
  anthropicKey: 'bb_anthropic_key',
  githubToken: 'bb_github_token',
  githubOwner: 'bb_github_owner',
  githubRepo: 'bb_github_repo',
  githubBranch: 'bb_github_branch',
  emailAddress: 'bb_email',
};

export function getSettings(): AppSettings {
  return {
    anthropicKey: localStorage.getItem(KEYS.anthropicKey) ?? '',
    githubToken: localStorage.getItem(KEYS.githubToken) ?? '',
    githubOwner: localStorage.getItem(KEYS.githubOwner) ?? '',
    githubRepo: localStorage.getItem(KEYS.githubRepo) ?? '',
    githubBranch: localStorage.getItem(KEYS.githubBranch) ?? 'main',
    emailAddress: localStorage.getItem(KEYS.emailAddress) ?? '',
  };
}

export function saveSettings(s: Partial<AppSettings>): void {
  for (const [key, lsKey] of Object.entries(KEYS)) {
    const val = s[key as keyof AppSettings];
    if (val !== undefined) localStorage.setItem(lsKey, val);
  }
}

export function isConfigured(): boolean {
  const s = getSettings();
  return !!(s.anthropicKey && s.githubToken && s.githubOwner && s.githubRepo);
}

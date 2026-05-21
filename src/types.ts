export interface Paragraph {
  pid: string;
  raw: string;
  clean: string;
  type: 'ai' | 'typed' | 'raw';
  created_at: string;
}

export interface Scene {
  name: string;
  slug: string;
  created_at: string;
  paragraphs: Paragraph[];
}

export interface AppSettings {
  anthropicKey: string;
  githubToken: string;
  githubOwner: string;
  githubRepo: string;
  githubBranch: string;
  emailAddress: string;
}

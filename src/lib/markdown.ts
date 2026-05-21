import type { Scene } from '../types';

export function sceneToMarkdown(scene: Scene): string {
  const body = scene.paragraphs
    .map(p => p.clean || p.raw)
    .filter(Boolean)
    .join('\n\n');

  return `# ${scene.name}\n\n${body}\n`;
}

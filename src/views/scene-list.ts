import { listSceneSlugs, createScene } from '../api/github';
import { isConfigured } from '../settings';

export function renderSceneList(container: HTMLElement): void {
  container.innerHTML = `
    <div class="page">
      <header class="page-header">
        <h1>BookBuddy</h1>
        <a href="#/settings" class="icon-btn" title="Settings">⚙</a>
      </header>
      <div class="list-body">
        <div id="scenes-container" class="scenes-loading">
          <span class="spinner"></span>
        </div>
        <div class="new-scene-row">
          <input type="text" id="new-name" class="new-scene-input" placeholder="New scene name…" maxlength="100">
          <button class="btn-primary" id="create-btn">Create</button>
        </div>
      </div>
    </div>
  `;

  const input = document.getElementById('new-name') as HTMLInputElement;
  const createBtn = document.getElementById('create-btn') as HTMLButtonElement;

  createBtn.addEventListener('click', () => onCreate());
  input.addEventListener('keydown', e => { if (e.key === 'Enter') onCreate(); });

  if (!isConfigured()) {
    document.getElementById('scenes-container')!.innerHTML = `
      <div class="empty-state">
        <p>Configure your settings to get started.</p>
        <a href="#/settings" class="btn-primary">Open Settings →</a>
      </div>
    `;
    return;
  }

  loadList();

  async function loadList() {
    const el = document.getElementById('scenes-container');
    if (!el) return;
    try {
      const slugs = await listSceneSlugs();
      if (!slugs.length) {
        el.innerHTML = `<div class="empty-state"><p>No scenes yet. Create your first one below.</p></div>`;
        return;
      }
      el.className = 'scenes-list';
      el.innerHTML = slugs.map(slug => `
        <a href="#/scenes/${slug}" class="scene-card">
          <span class="scene-name">${slugToName(slug)}</span>
          <span>→</span>
        </a>
      `).join('');
    } catch (e: any) {
      el.innerHTML = `<div class="error-state">${e.message}</div>`;
    }
  }

  async function onCreate() {
    const name = input.value.trim();
    if (!name) return;
    createBtn.disabled = true;
    createBtn.textContent = '…';
    try {
      const scene = await createScene(name);
      location.hash = `#/scenes/${scene.slug}`;
    } catch (e: any) {
      alert('Error: ' + e.message);
      createBtn.disabled = false;
      createBtn.textContent = 'Create';
    }
  }
}

function slugToName(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

import { listSceneSlugs, createScene, deleteScene } from '../api/github';
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
        <div class="scene-card" data-slug="${slug}">
          <a href="#/scenes/${slug}" class="scene-card-link">
            <span class="scene-name">${slugToName(slug)}</span>
          </a>
          <span class="scene-card-arrow">→</span>
          <button class="scene-delete-btn">Delete</button>
        </div>
      `).join('');

      setupCardInteractions(el);
    } catch (e: any) {
      el.innerHTML = `<div class="error-state">${e.message}</div>`;
    }
  }

  function setupCardInteractions(el: HTMLElement): void {
    let longPressTimer: ReturnType<typeof setTimeout> | null = null;
    let touchMoved = false;

    function armCard(card: HTMLElement): void {
      disarmAll();
      card.classList.add('is-armed');
    }

    function disarmAll(): void {
      el.querySelectorAll<HTMLElement>('.scene-card.is-armed').forEach(c => {
        c.classList.remove('is-armed');
        const btn = c.querySelector<HTMLButtonElement>('.scene-delete-btn')!;
        btn.textContent = 'Delete';
        btn.classList.remove('is-confirming');
      });
    }

    // Long press — touch
    el.addEventListener('touchstart', e => {
      touchMoved = false;
      const card = (e.target as HTMLElement).closest<HTMLElement>('.scene-card');
      if (!card) return;
      longPressTimer = setTimeout(() => {
        if (!touchMoved) armCard(card);
      }, 500);
    }, { passive: true });

    el.addEventListener('touchmove', () => {
      touchMoved = true;
      if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    }, { passive: true });

    el.addEventListener('touchend', () => {
      if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    }, { passive: true });

    // Long press — desktop (right click)
    el.addEventListener('contextmenu', e => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('.scene-card');
      if (!card) return;
      e.preventDefault();
      armCard(card);
    });

    // Block navigation when card is armed
    el.addEventListener('click', e => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('.scene-card');
      if (card?.classList.contains('is-armed')) {
        const isDeleteBtn = (e.target as HTMLElement).closest('.scene-delete-btn');
        if (!isDeleteBtn) { disarmAll(); e.preventDefault(); }
      }
    }, true); // capture so it fires before the <a>

    // Delete button
    el.addEventListener('click', e => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.scene-delete-btn');
      if (!btn) return;
      e.preventDefault();
      if (!btn.classList.contains('is-confirming')) {
        btn.textContent = 'Sure?';
        btn.classList.add('is-confirming');
        return;
      }
      const slug = btn.closest<HTMLElement>('[data-slug]')?.dataset.slug;
      if (!slug) return;
      btn.textContent = '…';
      btn.disabled = true;
      deleteScene(slug)
        .then(() => loadList())
        .catch(err => { alert('Delete failed: ' + err.message); loadList(); });
    });

    // Dismiss on outside tap
    document.addEventListener('pointerdown', e => {
      if (!el.contains(e.target as Node)) disarmAll();
    });
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

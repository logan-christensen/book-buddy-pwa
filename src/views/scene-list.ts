import { listSceneSlugs, createScene, deleteScene, renameScene } from '../api/github';
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
      el.innerHTML = slugs.map(slug => {
        const name = slugToName(slug);
        return `
          <div class="scene-card" data-slug="${slug}" data-name="${name}">
            <a href="#/scenes/${slug}" class="scene-card-link">
              <span class="scene-name">${name}</span>
            </a>
            <span class="scene-card-arrow">→</span>
            <div class="scene-card-actions">
              <button class="scene-rename-btn">Rename</button>
              <button class="scene-delete-btn">Delete</button>
            </div>
            <input class="scene-rename-input" type="text" value="${name}" maxlength="100">
            <div class="scene-rename-actions">
              <button class="scene-save-btn">Save</button>
              <button class="scene-cancel-btn">✕</button>
            </div>
          </div>`;
      }).join('');

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

    function startRename(card: HTMLElement): void {
      card.classList.remove('is-armed');
      card.classList.add('is-renaming');
      const inp = card.querySelector<HTMLInputElement>('.scene-rename-input')!;
      inp.value = card.dataset.name ?? '';
      inp.focus();
      inp.select();
    }

    function disarmAll(): void {
      el.querySelectorAll<HTMLElement>('.scene-card.is-armed, .scene-card.is-renaming').forEach(c => {
        c.classList.remove('is-armed', 'is-renaming');
        c.querySelector<HTMLButtonElement>('.scene-delete-btn')!.textContent = 'Delete';
        c.querySelector<HTMLButtonElement>('.scene-delete-btn')!.classList.remove('is-confirming');
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

    // Right click
    el.addEventListener('contextmenu', e => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('.scene-card');
      if (!card) return;
      e.preventDefault();
      armCard(card);
    });

    // Block navigation when armed or renaming
    el.addEventListener('click', e => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('.scene-card');
      if (!card) return;
      const isAction = (e.target as HTMLElement).closest('.scene-card-actions, .scene-rename-actions, .scene-rename-input');
      if ((card.classList.contains('is-armed') || card.classList.contains('is-renaming')) && !isAction) {
        disarmAll();
        e.preventDefault();
      }
    }, true);

    // Rename button
    el.addEventListener('click', e => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('.scene-rename-btn');
      if (!btn) return;
      const card = btn.closest<HTMLElement>('.scene-card')!;
      startRename(card);
    });

    // Save rename
    async function doSave(card: HTMLElement): Promise<void> {
      const slug = card.dataset.slug!;
      const inp = card.querySelector<HTMLInputElement>('.scene-rename-input')!;
      const newName = inp.value.trim();
      if (!newName || newName === card.dataset.name) { disarmAll(); return; }
      const saveBtn = card.querySelector<HTMLButtonElement>('.scene-save-btn')!;
      saveBtn.textContent = '…';
      saveBtn.disabled = true;
      try {
        await renameScene(slug, newName);
        await loadList();
      } catch (err: any) {
        alert('Rename failed: ' + err.message);
        saveBtn.textContent = 'Save';
        saveBtn.disabled = false;
      }
    }

    el.addEventListener('click', e => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('.scene-save-btn');
      if (!btn) return;
      doSave(btn.closest<HTMLElement>('.scene-card')!);
    });

    el.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const inp = (e.target as HTMLElement).closest<HTMLElement>('.scene-rename-input');
      if (!inp) return;
      doSave(inp.closest<HTMLElement>('.scene-card')!);
    });

    el.addEventListener('click', e => {
      if ((e.target as HTMLElement).closest('.scene-cancel-btn')) disarmAll();
    });

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

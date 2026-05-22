import { loadScene, saveScene } from '../api/github';
import { cleanupProse, getWarmupQuestions } from '../api/claude';
import { showToast } from './settings-view';
import type { Scene, Paragraph } from '../types';

export async function renderSceneEditor(container: HTMLElement, slug: string): Promise<void> {
  container.innerHTML = `
    <div class="editor-page">
      <header class="editor-header">
        <a href="#/" class="back-btn">←</a>
        <h1 id="scene-title" class="editor-title">Loading…</h1>
        <div class="header-actions">
          <button class="icon-btn" id="theme-btn" title="Toggle theme"></button>
          <button class="icon-btn" id="warmup-btn" title="Writing prompts">✦</button>
        </div>
      </header>

      <div id="draft-scroll" class="draft-scroll">
        <div id="draft-paras"></div>
      </div>

      <div id="composer" class="composer">
        <div id="edit-banner" class="edit-banner hidden">
          <span class="edit-banner-label">Editing paragraph</span>
          <button id="cancel-edit-btn" class="cancel-edit-btn">Cancel</button>
        </div>
        <textarea id="compose-input" class="compose-input" placeholder="Write here…" rows="1"></textarea>
        <div class="compose-actions">
          <button id="compose-add" class="btn-ghost compose-btn" disabled>Add</button>
          <button id="compose-polish" class="btn-amber compose-btn" disabled>Polish ✦</button>
        </div>
      </div>

      <div id="review-sheet" class="review-sheet hidden">
        <div class="review-header">
          <span class="review-ai-label">✦ Polished</span>
          <button class="icon-btn" id="discard-review-btn">✕</button>
        </div>
        <div id="review-text" class="review-text" contenteditable="true" spellcheck="true"></div>
        <div class="review-footer">
          <button id="commit-review-btn" class="btn-amber full-width">Add to draft</button>
        </div>
      </div>

      <div id="warmup-panel" class="sheet hidden">
        <div class="sheet-header">
          <span class="sheet-label">Writing prompts</span>
          <button class="icon-btn" id="close-warmup">✕</button>
        </div>
        <div id="warmup-body" class="warmup-body"></div>
      </div>
    </div>
  `;

  let scene: Scene | null = null;
  let editingPid: string | null = null;
  let saving = false;
  // Track which AI paragraphs are swiped open so we can restore on re-render
  const openParagraphs = new Set<string>();

  try {
    scene = await loadScene(slug);
  } catch (e: any) {
    container.innerHTML = `<div class="error-state">Failed to load: ${e.message}</div>`;
    return;
  }
  if (!scene) {
    container.innerHTML = `<div class="error-state">Scene not found.</div>`;
    return;
  }

  document.getElementById('scene-title')!.textContent = scene.name;

  renderParagraphs();
  setupComposer();
  setupSwipe();
  setupTheme();
  setupWarmup();
  setupKeyboard();

  // ── Paragraphs ──────────────────────────────────────────────

  function renderParagraphs(): void {
    const el = document.getElementById('draft-paras')!;
    if (!scene!.paragraphs.length) {
      el.innerHTML = `<p class="draft-empty">Start writing below.</p>`;
      return;
    }
    el.innerHTML = scene!.paragraphs.map(paraHTML).join('');

    // Restore any open swipe state without animation
    openParagraphs.forEach(pid => {
      const track = el.querySelector<HTMLElement>(`[data-pid="${pid}"] .para-track`);
      if (track) {
        track.style.transition = 'none';
        track.classList.add('is-open');
        requestAnimationFrame(() => { track.style.transition = ''; });
      }
    });

    // Highlight paragraph being edited
    if (editingPid) {
      el.querySelector(`[data-pid="${editingPid}"]`)?.classList.add('is-editing');
    }

    el.querySelectorAll<HTMLElement>('.para-edit-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const pid = btn.closest<HTMLElement>('[data-pid]')?.dataset.pid;
        if (pid) startEdit(pid);
      });
    });
  }

  function paraHTML(p: Paragraph): string {
    const hasOriginal = p.type === 'ai' && p.raw && p.raw !== p.clean;
    if (hasOriginal) {
      return `
        <div class="para-wrap ai-para" data-pid="${p.pid}">
          <div class="para-outer">
            <div class="para-track">
              <div class="para-face para-polished">
                <div class="accent-bar accent-amber"></div>
                <p class="para-text">${esc(p.clean)}</p>
              </div>
              <div class="para-face para-original">
                <div class="accent-bar accent-blue"></div>
                <p class="para-text para-orig-text">${esc(p.raw)}</p>
              </div>
            </div>
          </div>
          <button class="para-edit-btn" title="Edit paragraph">✎</button>
        </div>`;
    }
    return `
      <div class="para-wrap" data-pid="${p.pid}">
        <p class="para-text">${esc(p.clean || p.raw)}</p>
        <button class="para-edit-btn" title="Edit paragraph">✎</button>
      </div>`;
  }

  // ── Composer ────────────────────────────────────────────────

  function setupComposer(): void {
    const input = document.getElementById('compose-input') as HTMLTextAreaElement;
    const addBtn = document.getElementById('compose-add') as HTMLButtonElement;
    const polishBtn = document.getElementById('compose-polish') as HTMLButtonElement;

    input.addEventListener('input', () => {
      autoGrow(input);
      const has = input.value.trim().length > 0;
      addBtn.disabled = !has;
      polishBtn.disabled = !has;
    });

    addBtn.addEventListener('click', handleAdd);
    polishBtn.addEventListener('click', handlePolish);
    document.getElementById('cancel-edit-btn')!.addEventListener('click', cancelEdit);
    document.getElementById('commit-review-btn')!.addEventListener('click', handleCommit);
    document.getElementById('discard-review-btn')!.addEventListener('click', handleDiscard);
  }

  function autoGrow(ta: HTMLTextAreaElement): void {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  }

  async function handlePolish(): Promise<void> {
    const input = document.getElementById('compose-input') as HTMLTextAreaElement;
    const text = input.value.trim();
    if (!text) return;
    setComposerBusy(true);
    try {
      const ctx = scene!.paragraphs.slice(-3).map(p => p.clean || p.raw).join('\n\n');
      const cleaned = await cleanupProse(text, ctx);
      showReview(cleaned);
    } catch (e: any) {
      showToast('AI error: ' + e.message);
      setComposerBusy(false);
    }
  }

  function handleAdd(): void {
    const input = document.getElementById('compose-input') as HTMLTextAreaElement;
    const text = input.value.trim();
    if (!text) return;
    if (editingPid) {
      replaceParagraph(editingPid, text, text, 'typed');
    } else {
      appendParagraph({ pid: crypto.randomUUID(), raw: text, clean: text, type: 'typed', created_at: new Date().toISOString() });
    }
    clearComposer();
  }

  function handleCommit(): void {
    const input = document.getElementById('compose-input') as HTMLTextAreaElement;
    const reviewEl = document.getElementById('review-text')!;
    const rawText = input.value.trim();
    const finalClean = reviewEl.innerText.trim();

    hideReview();
    setComposerBusy(false);

    const blocks = finalClean.split(/\n\n+/).filter(Boolean);
    const now = new Date().toISOString();

    if (editingPid) {
      replaceParagraph(editingPid, rawText, finalClean, 'ai');
    } else {
      blocks.forEach((block, i) => {
        scene!.paragraphs.push({
          pid: crypto.randomUUID(),
          raw: i === 0 ? rawText : '',
          clean: block.trim(),
          type: 'ai',
          created_at: now,
        });
      });
      renderParagraphs();
      scrollBottom();
      autoSave();
    }

    clearComposer();
  }

  function handleDiscard(): void {
    hideReview();
    setComposerBusy(false);
  }

  function setComposerBusy(on: boolean): void {
    const input = document.getElementById('compose-input') as HTMLTextAreaElement;
    const addBtn = document.getElementById('compose-add') as HTMLButtonElement;
    const polishBtn = document.getElementById('compose-polish') as HTMLButtonElement;
    input.disabled = on;
    addBtn.disabled = on;
    polishBtn.disabled = on;
    polishBtn.textContent = on ? '…' : 'Polish ✦';
  }

  function clearComposer(): void {
    const input = document.getElementById('compose-input') as HTMLTextAreaElement;
    input.value = '';
    input.style.height = '';
    input.disabled = false;
    (document.getElementById('compose-add') as HTMLButtonElement).disabled = true;
    (document.getElementById('compose-add') as HTMLButtonElement).textContent = 'Add';
    (document.getElementById('compose-polish') as HTMLButtonElement).disabled = true;
    (document.getElementById('compose-polish') as HTMLButtonElement).textContent = 'Polish ✦';
    cancelEdit();
  }

  // ── Review sheet ─────────────────────────────────────────────

  function showReview(text: string): void {
    const sheet = document.getElementById('review-sheet')!;
    document.getElementById('review-text')!.innerText = text;
    sheet.classList.remove('hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add('is-visible')));
  }

  function hideReview(): void {
    const sheet = document.getElementById('review-sheet')!;
    sheet.classList.remove('is-visible');
    sheet.addEventListener('transitionend', () => sheet.classList.add('hidden'), { once: true });
  }

  // ── Edit existing paragraph ───────────────────────────────────

  function startEdit(pid: string): void {
    const para = scene!.paragraphs.find(p => p.pid === pid);
    if (!para) return;
    editingPid = pid;

    const input = document.getElementById('compose-input') as HTMLTextAreaElement;
    input.value = para.clean || para.raw;
    autoGrow(input);

    const addBtn = document.getElementById('compose-add') as HTMLButtonElement;
    const polishBtn = document.getElementById('compose-polish') as HTMLButtonElement;
    addBtn.textContent = 'Save';
    addBtn.disabled = false;
    polishBtn.disabled = false;

    document.getElementById('edit-banner')!.classList.remove('hidden');
    document.querySelectorAll('.para-wrap').forEach(el => el.classList.remove('is-editing'));
    document.querySelector(`[data-pid="${pid}"]`)?.classList.add('is-editing');

    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function cancelEdit(): void {
    editingPid = null;
    document.getElementById('edit-banner')!.classList.add('hidden');
    document.querySelectorAll('.para-wrap').forEach(el => el.classList.remove('is-editing'));
    (document.getElementById('compose-add') as HTMLButtonElement).textContent = 'Add';
  }

  function replaceParagraph(pid: string, raw: string, clean: string, type: Paragraph['type']): void {
    const idx = scene!.paragraphs.findIndex(p => p.pid === pid);
    if (idx === -1) return;
    scene!.paragraphs[idx] = { ...scene!.paragraphs[idx], raw, clean, type };
    openParagraphs.delete(pid); // reset swipe state on edit
    renderParagraphs();
    autoSave();
  }

  function appendParagraph(para: Paragraph): void {
    scene!.paragraphs.push(para);
    renderParagraphs();
    scrollBottom();
    autoSave();
  }

  function autoSave(): void {
    if (saving || !scene) return;
    saving = true;
    saveScene(scene)
      .then(() => showToast('Saved'))
      .catch(e => showToast('Save failed: ' + e.message))
      .finally(() => { saving = false; });
  }

  function scrollBottom(): void {
    const el = document.getElementById('draft-scroll');
    if (el) el.scrollTop = el.scrollHeight;
  }

  // ── Swipe to reveal original ──────────────────────────────────

  function setupSwipe(): void {
    const scroll = document.getElementById('draft-scroll')!;
    let startX = 0, startY = 0, startTime = 0;
    let track: HTMLElement | null = null;
    let paraW = 0, startOffset = 0;
    let dragging = false;

    scroll.addEventListener('touchstart', e => {
      const para = (e.target as HTMLElement).closest<HTMLElement>('.ai-para');
      if (!para) return;
      track = para.querySelector<HTMLElement>('.para-track');
      if (!track) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      paraW = (track.parentElement as HTMLElement).offsetWidth;
      startOffset = track.classList.contains('is-open') ? -paraW : 0;
      dragging = false;
    }, { passive: true });

    scroll.addEventListener('touchmove', e => {
      if (!track) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (!dragging) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        if (Math.abs(dy) > Math.abs(dx)) { track = null; return; }
        dragging = true;
        track.style.transition = 'none';
      }
      const clamped = Math.max(-paraW, Math.min(0, startOffset + dx));
      track.style.transform = `translateX(${clamped}px)`;
    }, { passive: true });

    scroll.addEventListener('touchend', e => {
      if (!track || !dragging) { track = null; return; }
      const dx = e.changedTouches[0].clientX - startX;
      const velocity = Math.abs(dx) / (Date.now() - startTime);
      const threshold = velocity > 0.4 ? 12 : paraW * 0.28;
      const isOpen = track.classList.contains('is-open');
      const shouldOpen = isOpen ? dx > -threshold : dx < -threshold;

      // Animate the snap
      const targetPx = shouldOpen ? -paraW : 0;
      track.style.transition = 'transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      track.style.transform = `translateX(${targetPx}px)`;

      const pid = track.closest<HTMLElement>('[data-pid]')?.dataset.pid;
      track.addEventListener('transitionend', () => {
        if (!track) return;
        track.style.transition = '';
        track.style.transform = '';
        if (shouldOpen) {
          track.classList.add('is-open');
          if (pid) openParagraphs.add(pid);
        } else {
          track.classList.remove('is-open');
          if (pid) openParagraphs.delete(pid);
        }
      }, { once: true });

      track = null;
      dragging = false;
    }, { passive: true });
  }

  // ── Keyboard / visualViewport ────────────────────────────────

  function setupKeyboard(): void {
    const vv = window.visualViewport;
    if (!vv) return;
    const composer = document.getElementById('composer')!;
    const reviewSheet = document.getElementById('review-sheet')!;
    const draftScroll = document.getElementById('draft-scroll')!;

    const update = () => {
      const keyboardOffset = Math.max(0, window.innerHeight - (vv.offsetTop + vv.height));
      composer.style.bottom = `${keyboardOffset}px`;
      reviewSheet.style.bottom = `${keyboardOffset}px`;
      draftScroll.style.paddingBottom = `${composer.offsetHeight + keyboardOffset + 16}px`;
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
  }

  // ── Theme ────────────────────────────────────────────────────

  function setupTheme(): void {
    const btn = document.getElementById('theme-btn')!;
    const sync = () => {
      const isDark = document.documentElement.classList.contains('dark');
      btn.textContent = isDark ? '☀' : '☾';
    };
    sync();
    btn.addEventListener('click', () => {
      const html = document.documentElement;
      const goLight = html.classList.contains('dark');
      html.classList.toggle('dark', !goLight);
      html.classList.toggle('light', goLight);
      localStorage.setItem('bb_theme', goLight ? 'light' : 'dark');
      sync();
    });
  }

  // ── Warmup ───────────────────────────────────────────────────

  function setupWarmup(): void {
    document.getElementById('warmup-btn')!.addEventListener('click', async () => {
      const panel = document.getElementById('warmup-panel')!;
      const body = document.getElementById('warmup-body')!;
      panel.classList.remove('hidden');
      body.innerHTML = `<p class="muted-text">Thinking…</p>`;
      const content = scene!.paragraphs.slice(-5).map(p => p.clean || p.raw).join('\n\n');
      const qs = await getWarmupQuestions(content);
      body.innerHTML = qs.length
        ? qs.map(q => `<p class="warmup-q">${esc(q)}</p>`).join('')
        : `<p class="muted-text">Could not generate prompts.</p>`;
    });
    document.getElementById('close-warmup')!.addEventListener('click', () => {
      document.getElementById('warmup-panel')!.classList.add('hidden');
    });
  }
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

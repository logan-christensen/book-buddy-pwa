import { loadScene, saveScene } from '../api/github';
import { cleanupProse, getWarmupQuestions } from '../api/claude';
import { SpeechRecognizer } from '../lib/speech';
import { showToast } from './settings-view';
import type { Scene, Paragraph } from '../types';

type State = 'idle' | 'recording' | 'cleaning' | 'reviewing' | 'typing';

export async function renderSceneEditor(container: HTMLElement, slug: string): Promise<void> {
  container.innerHTML = `
    <div class="editor-page">
      <header class="editor-header">
        <a href="#/" class="back-btn">←</a>
        <h1 id="scene-title" class="editor-title">Loading…</h1>
        <button class="icon-btn" id="warmup-btn" title="Writing prompts">✦</button>
      </header>

      <div id="draft-scroll" class="draft-scroll">
        <div id="draft-paras"></div>
        <div id="state-area"></div>
      </div>

      <div id="action-bar" class="action-bar"></div>

      <div id="compare-sheet" class="sheet hidden">
        <div class="sheet-header">
          <span class="sheet-label">Original dictation</span>
          <button class="icon-btn" id="close-compare">✕</button>
        </div>
        <div id="compare-raw" class="compare-body"></div>
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
  let state: State = 'idle';
  let recognizer: SpeechRecognizer | null = null;
  let pendingRaw = '';
  let pendingClean = '';
  let saving = false;

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
  renderBar();
  setupSwipe();
  setupWarmup();

  // --- Paragraph rendering ---

  function renderParagraphs(): void {
    const el = document.getElementById('draft-paras')!;
    if (!scene!.paragraphs.length) {
      el.innerHTML = `<p class="draft-empty">Your draft will appear here.</p>`;
      return;
    }
    el.innerHTML = scene!.paragraphs.map(paraHTML).join('');
  }

  function paraHTML(p: Paragraph): string {
    const isAI = p.type === 'ai';
    return `<div class="draft-para-wrap${isAI ? ' ai-para' : ''}" data-pid="${p.pid}">
      ${isAI ? `<div class="ai-accent-bar"></div>` : ''}
      <p class="draft-para">${esc(p.clean || p.raw)}</p>
    </div>`;
  }

  // --- Action bar & state area ---

  function renderBar(): void {
    const bar = document.getElementById('action-bar')!;
    const area = document.getElementById('state-area')!;

    if (state === 'idle') {
      area.innerHTML = '';
      bar.innerHTML = `
        <button class="mic-btn" id="mic-btn"><span class="rec-dot"></span></button>
        <button class="type-trigger" id="type-btn">
          <span class="type-placeholder">Type your draft here…</span>
        </button>
      `;
      document.getElementById('mic-btn')!.addEventListener('click', startRecording);
      document.getElementById('type-btn')!.addEventListener('click', () => setState('typing'));
    }

    else if (state === 'recording') {
      area.innerHTML = `
        <div class="transcript-area">
          <div id="final-text" class="final-text"></div>
          <div id="interim-text" class="interim-text"></div>
        </div>
        <div class="waveform">${'<span></span>'.repeat(12)}</div>
      `;
      bar.innerHTML = `<button class="stop-btn full-width" id="stop-btn">Stop &amp; clean up</button>`;
      document.getElementById('stop-btn')!.addEventListener('click', stopAndClean);
    }

    else if (state === 'cleaning') {
      area.innerHTML = `<div class="cleaning-row"><span class="spinner"></span><span>Cleaning up…</span></div>`;
      bar.innerHTML = '';
    }

    else if (state === 'reviewing') {
      area.innerHTML = `
        <div class="review-wrap">
          <div class="review-label">Cleaned — tap to edit before adding</div>
          <div id="review-text" class="review-text" contenteditable="true">${esc(pendingClean)}</div>
        </div>
      `;
      bar.innerHTML = `
        <button class="btn-ghost" id="discard-btn">Discard</button>
        <button class="btn-primary" id="commit-btn">Add to draft</button>
      `;
      document.getElementById('discard-btn')!.addEventListener('click', discard);
      document.getElementById('commit-btn')!.addEventListener('click', commit);
    }

    else if (state === 'typing') {
      area.innerHTML = `
        <div class="typing-wrap">
          <div id="type-editor" class="type-editor" contenteditable="true" data-placeholder="Start typing…"></div>
        </div>
      `;
      setTimeout(() => (document.getElementById('type-editor') as HTMLElement)?.focus(), 50);
      bar.innerHTML = `
        <button class="btn-ghost" id="cancel-type-btn">Cancel</button>
        <button class="btn-ghost" id="clean-type-btn">Clean up</button>
        <button class="btn-primary" id="save-type-btn">Save as-is</button>
      `;
      document.getElementById('cancel-type-btn')!.addEventListener('click', () => setState('idle'));
      document.getElementById('clean-type-btn')!.addEventListener('click', cleanTyped);
      document.getElementById('save-type-btn')!.addEventListener('click', saveTyped);
    }
  }

  function setState(s: State): void {
    state = s;
    renderBar();
  }

  // --- Recording ---

  function startRecording(): void {
    try {
      recognizer = new SpeechRecognizer(
        (interim, final) => {
          const fi = document.getElementById('final-text');
          const im = document.getElementById('interim-text');
          if (fi) fi.textContent = final;
          if (im) im.textContent = interim;
        },
        (s, detail) => {
          if (s === 'error') {
            showToast(`Mic error: ${detail ?? 'unknown'}`);
            setState('idle');
          }
        },
      );
      recognizer.start();
      setState('recording');
    } catch (e: any) {
      showToast(e.message);
    }
  }

  async function stopAndClean(): Promise<void> {
    if (!recognizer) return;
    pendingRaw = recognizer.stop();
    recognizer = null;
    if (!pendingRaw) { setState('idle'); return; }
    setState('cleaning');
    try {
      const ctx = scene!.paragraphs.slice(-3).map(p => p.clean || p.raw).join('\n\n');
      pendingClean = await cleanupProse(pendingRaw, ctx);
      setState('reviewing');
    } catch (e: any) {
      showToast('AI error: ' + e.message);
      setState('idle');
    }
  }

  // --- Typing ---

  async function cleanTyped(): Promise<void> {
    const editor = document.getElementById('type-editor') as HTMLElement;
    const text = editor.innerText.trim();
    if (!text) return;
    pendingRaw = text;
    setState('cleaning');
    try {
      const ctx = scene!.paragraphs.slice(-3).map(p => p.clean || p.raw).join('\n\n');
      pendingClean = await cleanupProse(text, ctx);
      setState('reviewing');
    } catch (e: any) {
      showToast('AI error: ' + e.message);
      setState('idle');
    }
  }

  async function saveTyped(): Promise<void> {
    const editor = document.getElementById('type-editor') as HTMLElement;
    const text = editor.innerText.trim();
    if (!text) return;
    pushParagraphs([{ pid: crypto.randomUUID(), raw: text, clean: text, type: 'typed', created_at: new Date().toISOString() }]);
    setState('idle');
  }

  // --- Review ---

  function discard(): void {
    pendingRaw = '';
    pendingClean = '';
    setState('idle');
  }

  async function commit(): Promise<void> {
    const reviewEl = document.getElementById('review-text') as HTMLElement;
    const finalClean = reviewEl?.innerText.trim() ?? pendingClean;
    const raw = pendingRaw;
    pendingRaw = '';
    pendingClean = '';

    const blocks = finalClean.split(/\n\n+/).filter(Boolean);
    const now = new Date().toISOString();
    const paras: Paragraph[] = blocks.map((block, i) => ({
      pid: crypto.randomUUID(),
      raw: i === 0 ? raw : '',
      clean: block.trim(),
      type: 'ai' as const,
      created_at: now,
    }));

    pushParagraphs(paras);
    setState('idle');
  }

  function pushParagraphs(paras: Paragraph[]): void {
    scene!.paragraphs.push(...paras);
    renderParagraphs();
    scrollBottom();
    autoSave();
  }

  // --- Persistence ---

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

  // --- Swipe to compare ---

  function setupSwipe(): void {
    const scroll = document.getElementById('draft-scroll')!;
    let t0x = 0, t0y = 0;
    let target: HTMLElement | null = null;

    scroll.addEventListener('touchstart', e => {
      t0x = e.touches[0].clientX;
      t0y = e.touches[0].clientY;
      target = (e.target as HTMLElement).closest<HTMLElement>('.ai-para');
    }, { passive: true });

    scroll.addEventListener('touchend', e => {
      if (!target) return;
      const dx = e.changedTouches[0].clientX - t0x;
      const dy = e.changedTouches[0].clientY - t0y;
      if (dx < -50 && Math.abs(dx) > Math.abs(dy)) openCompare(target.dataset.pid!);
      target = null;
    }, { passive: true });

    scroll.addEventListener('click', e => {
      const bar = (e.target as HTMLElement).closest('.ai-accent-bar');
      if (bar) {
        const wrap = bar.closest<HTMLElement>('.draft-para-wrap');
        if (wrap?.dataset.pid) openCompare(wrap.dataset.pid);
      }
    });

    document.getElementById('close-compare')!.addEventListener('click', () => {
      document.getElementById('compare-sheet')!.classList.add('hidden');
    });
  }

  function openCompare(pid: string): void {
    const para = scene!.paragraphs.find(p => p.pid === pid);
    if (!para) return;
    document.getElementById('compare-raw')!.textContent = para.raw || '(no original recorded)';
    document.getElementById('compare-sheet')!.classList.remove('hidden');
  }

  // --- Warmup ---

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

import { getSettings, saveSettings } from '../settings';

export function renderSettings(container: HTMLElement): void {
  const s = getSettings();

  container.innerHTML = `
    <div class="page">
      <header class="page-header">
        <a href="#/" class="back-btn">← Scenes</a>
        <h1>Settings</h1>
      </header>
      <div class="settings-body">

        <section class="settings-section">
          <h2>AI — Anthropic</h2>
          <p class="settings-help">Stored in this browser only. <a href="https://console.anthropic.com" target="_blank" rel="noopener">Get a key →</a></p>
          <label class="field">
            <span>API Key</span>
            <input type="password" id="s-anthropic" value="${esc(s.anthropicKey)}" placeholder="sk-ant-…" autocomplete="off">
          </label>
        </section>

        <section class="settings-section">
          <h2>GitHub Storage</h2>
          <p class="settings-help">Scenes save as <code>.json</code> + <code>.md</code> files. <a href="https://github.com/settings/tokens/new?scopes=repo&description=BookBuddy" target="_blank" rel="noopener">Create a token →</a></p>
          <label class="field">
            <span>Personal Access Token</span>
            <input type="password" id="s-gh-token" value="${esc(s.githubToken)}" placeholder="ghp_…" autocomplete="off">
          </label>
          <label class="field">
            <span>Owner</span>
            <input type="text" id="s-gh-owner" value="${esc(s.githubOwner)}" placeholder="your-username">
          </label>
          <label class="field">
            <span>Repository</span>
            <input type="text" id="s-gh-repo" value="${esc(s.githubRepo)}" placeholder="my-novel">
          </label>
          <label class="field">
            <span>Branch</span>
            <input type="text" id="s-gh-branch" value="${esc(s.githubBranch)}" placeholder="main">
          </label>
        </section>

        <section class="settings-section">
          <h2>Daily Email</h2>
          <p class="settings-help">Set <code>ANTHROPIC_API_KEY</code>, <code>RESEND_API_KEY</code>, and <code>EMAIL_ADDRESS</code> as secrets in your GitHub repo to enable the daily questions workflow.</p>
          <label class="field">
            <span>Your Email</span>
            <input type="email" id="s-email" value="${esc(s.emailAddress)}" placeholder="you@example.com">
          </label>
        </section>

        <button class="btn-primary full-width" id="s-save">Save</button>
      </div>
    </div>
  `;

  document.getElementById('s-save')!.addEventListener('click', () => {
    saveSettings({
      anthropicKey: val('s-anthropic'),
      githubToken: val('s-gh-token'),
      githubOwner: val('s-gh-owner'),
      githubRepo: val('s-gh-repo'),
      githubBranch: val('s-gh-branch') || 'main',
      emailAddress: val('s-email'),
    });
    showToast('Settings saved');
  });
}

function val(id: string): string {
  return (document.getElementById(id) as HTMLInputElement).value.trim();
}

function esc(s: string): string {
  return s.replace(/"/g, '&quot;');
}

export function showToast(msg: string): void {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('toast-show'));
  setTimeout(() => {
    t.classList.remove('toast-show');
    setTimeout(() => t.remove(), 300);
  }, 2200);
}

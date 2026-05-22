import './style.css';
import { renderSceneList } from './views/scene-list';
import { renderSceneEditor } from './views/scene-editor';
import { renderSettings } from './views/settings-view';

// Apply saved theme before first render
const savedTheme = localStorage.getItem('bb_theme');
if (savedTheme === 'light') {
  document.documentElement.classList.replace('dark', 'light');
}

function route(): void {
  const hash = location.hash.slice(1) || '/';
  const app = document.getElementById('app')!;
  app.innerHTML = '';

  const sceneMatch = hash.match(/^\/scenes\/(.+)$/);
  if (sceneMatch) {
    renderSceneEditor(app, sceneMatch[1]);
    return;
  }
  if (hash === '/settings') {
    renderSettings(app);
    return;
  }
  renderSceneList(app);
}

window.addEventListener('hashchange', route);
route();

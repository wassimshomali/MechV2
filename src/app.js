import { renderSidebar, initSidebar } from './components/layout/Sidebar.js';
import { renderHeader } from './components/layout/Header.js';
import { renderDashboard, initDashboard } from './components/dashboard/Dashboard.js';
import { initTheme, toggleTheme } from './utils/theme.js';
import { replaceIcons, staggerIn } from './utils/motion.js';

function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <div class="app-shell">
      ${renderSidebar()}
      <div class="main-content">
        ${renderHeader()}
        <main id="main-content" class="flex-1 overflow-y-auto p-6" tabindex="-1">
          ${renderDashboard()}
        </main>
      </div>
    </div>
  `;
}

function bindEvents() {
  initSidebar();
  initDashboard();

  document.getElementById('themeToggle')?.addEventListener('click', () => {
    toggleTheme();
    replaceIcons();
  });
}

function init() {
  initTheme();
  renderApp();
  replaceIcons();
  bindEvents();
  staggerIn('.dashboard-card');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

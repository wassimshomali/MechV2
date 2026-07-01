import { renderSidebar, initSidebar, openMobileSidebar } from './components/layout/Sidebar.js';
import { renderHeader } from './components/layout/Header.js';
import { renderPage } from './pages/index.js';
import { createRouter } from './utils/router.js';
import { initTheme, toggleTheme } from './utils/theme.js';
import { replaceIcons, staggerIn } from './utils/motion.js';

let currentRoute = null;

function renderShell(route) {
  const app = document.getElementById('app');
  if (!app) return;

  currentRoute = route;

  app.innerHTML = `
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <div class="app-shell">
      ${renderSidebar(route.path)}
      <div class="main-content">
        ${renderHeader({
          title: route.title,
          section: route.section,
          breadcrumb: route.breadcrumb,
        })}
        <main id="main-content" class="flex-1 overflow-y-auto p-4 sm:p-6" tabindex="-1"></main>
      </div>
    </div>
  `;
}

async function handleRoute(route) {
  const isNewRoute = !currentRoute || currentRoute.path !== route.path;

  if (isNewRoute) {
    renderShell(route);
    initSidebar();
  } else {
    updateHeader(route);
    updateSidebarActive(route.path);
  }

  bindGlobalEvents();
  await renderPage(route);
  replaceIcons();

  if (route.module === 'dashboard') {
    staggerIn('.dashboard-card');
  }
}

function updateHeader(route) {
  const header = document.querySelector('.app-header');
  if (header) {
    header.outerHTML = renderHeader({
      title: route.title,
      section: route.section,
      breadcrumb: route.breadcrumb,
    });
  }
}

function updateSidebarActive(currentPath) {
  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href')?.replace('#', '') || '/';
    const active = href === currentPath || (href !== '/' && currentPath.startsWith(href));
    link.classList.toggle('active', active);
    if (active) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function bindGlobalEvents() {
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    toggleTheme();
    replaceIcons();
  });

  document.getElementById('mobileMenuToggle')?.addEventListener('click', () => {
    openMobileSidebar();
    replaceIcons();
  });
}

function init() {
  initTheme();

  const router = createRouter({
    onRouteChange: (route) => handleRoute(route),
  });

  router.start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

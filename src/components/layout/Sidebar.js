import { navigation } from '../../utils/navigation.js';
import { isNavActive } from '../../utils/routes.js';
import { renderAvatar } from '../common/Avatar.js';

export function renderSidebar(currentPath = '/') {
  const navHtml = navigation
    .map(
      (section) => `
      <div class="px-3 mb-4">
        <div class="nav-overline sidebar-text px-3 mb-2">${section.label}</div>
        ${section.items
          .map((item) => {
            const active = isNavActive(item.href, currentPath);
            return `
          <a href="${item.href}" class="nav-link ${active ? 'active' : ''}" ${active ? 'aria-current="page"' : ''}>
            <i data-feather="${item.icon}" class="shrink-0"></i>
            <span class="sidebar-text truncate">${item.label}</span>
          </a>
        `;
          })
          .join('')}
      </div>
    `
    )
    .join('');

  return `
    <aside class="sidebar" id="sidebar" aria-label="Main navigation">
      <div class="h-16 px-4 flex items-center justify-between border-b border-secondary-800 shrink-0">
        <a href="#/" class="flex items-center gap-2 min-w-0">
          <i data-feather="tool" class="logo-icon w-7 h-7 text-primary-400 shrink-0"></i>
          <span class="logo-text text-lg font-bold tracking-tight truncate">MoMech</span>
        </a>
        <button type="button" id="toggleSidebar" class="btn btn-icon text-secondary-400 hover:text-white hover:bg-white/5 shrink-0 hidden lg:inline-flex" aria-label="Toggle sidebar" aria-expanded="true">
          <i data-feather="chevron-left"></i>
        </button>
        <button type="button" id="closeSidebar" class="btn btn-icon text-secondary-400 hover:text-white hover:bg-white/5 shrink-0 lg:hidden" aria-label="Close menu">
          <i data-feather="x"></i>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto py-4">
        <div class="px-4 mb-4">
          <div class="relative">
            <label for="sidebar-search" class="sr-only">Search</label>
            <input id="sidebar-search" type="search" placeholder="Search..." class="sidebar-search" />
            <i data-feather="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 pointer-events-none"></i>
          </div>
        </div>
        <nav>${navHtml}</nav>
      </div>

      <div class="p-4 border-t border-secondary-800 shrink-0">
        <div class="flex items-center gap-3">
          ${renderAvatar('John Mechanic')}
          <div class="sidebar-text min-w-0">
            <div class="text-sm font-medium truncate">John Mechanic</div>
            <div class="text-xs text-secondary-400">Owner</div>
          </div>
        </div>
      </div>
    </aside>
    <div id="sidebarOverlay" class="sidebar-overlay hidden" aria-hidden="true"></div>
  `;
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar?.classList.remove('mobile-open');
  overlay?.classList.add('hidden');
  overlay?.setAttribute('aria-hidden', 'true');
}

export function openMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar?.classList.add('mobile-open');
  overlay?.classList.remove('hidden');
  overlay?.setAttribute('aria-hidden', 'false');
}

export function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('toggleSidebar');
  const closeBtn = document.getElementById('closeSidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (!sidebar) return;

  const updateToggleIcon = () => {
    const collapsed = sidebar.classList.contains('collapsed');
    const icon = toggle?.querySelector('i');
    if (icon) {
      icon.setAttribute('data-feather', collapsed ? 'chevron-right' : 'chevron-left');
    }
    toggle?.setAttribute('aria-expanded', String(!collapsed));
    if (window.feather) window.feather.replace();
  };

  toggle?.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    updateToggleIcon();
  });

  closeBtn?.addEventListener('click', closeMobileSidebar);
  overlay?.addEventListener('click', closeMobileSidebar);

  sidebar.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1024) closeMobileSidebar();
    });
  });
}

export { closeMobileSidebar };

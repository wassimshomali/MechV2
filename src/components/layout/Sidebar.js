import { navigation } from '../../utils/navigation.js';
import { renderAvatar } from '../common/Avatar.js';

export function renderSidebar() {
  const navHtml = navigation
    .map(
      (section) => `
      <div class="px-3 mb-4">
        <div class="nav-overline sidebar-text px-3 mb-2">${section.label}</div>
        ${section.items
          .map(
            (item) => `
          <a href="${item.href}" class="nav-link ${item.active ? 'active' : ''}" ${item.active ? 'aria-current="page"' : ''}>
            <i data-feather="${item.icon}" class="shrink-0"></i>
            <span class="sidebar-text truncate">${item.label}</span>
          </a>
        `
          )
          .join('')}
      </div>
    `
    )
    .join('');

  return `
    <aside class="sidebar" id="sidebar" aria-label="Main navigation">
      <div class="h-16 px-4 flex items-center justify-between border-b border-secondary-800 shrink-0">
        <div class="flex items-center gap-2 min-w-0">
          <i data-feather="tool" class="logo-icon w-7 h-7 text-primary-400 shrink-0"></i>
          <span class="logo-text text-lg font-bold tracking-tight truncate">MoMech</span>
        </div>
        <button type="button" id="toggleSidebar" class="btn btn-icon text-secondary-400 hover:text-white hover:bg-white/5 shrink-0" aria-label="Toggle sidebar" aria-expanded="true">
          <i data-feather="chevron-left"></i>
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

export function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('toggleSidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (!sidebar || !toggle) return;

  const updateToggleIcon = () => {
    const collapsed = sidebar.classList.contains('collapsed');
    const icon = toggle.querySelector('i');
    if (icon) {
      icon.setAttribute('data-feather', collapsed ? 'chevron-right' : 'chevron-left');
    }
    toggle.setAttribute('aria-expanded', String(!collapsed));
  };

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    updateToggleIcon();
    if (window.feather) window.feather.replace();
  });

  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    overlay.classList.add('hidden');
  });
}

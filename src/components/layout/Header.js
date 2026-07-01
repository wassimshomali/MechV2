export function renderHeader({ title = 'Dashboard', breadcrumb = 'Overview' } = {}) {
  return `
    <header class="app-header">
      <div class="px-6 py-4 flex items-center justify-between gap-4">
        <div class="min-w-0">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-0.5 hidden sm:block">Dashboard / ${breadcrumb}</p>
          <h1 class="text-2xl font-semibold text-balance truncate">${title}</h1>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button type="button" id="themeToggle" class="theme-toggle" aria-label="Toggle dark mode">
            <i data-feather="moon" class="dark:hidden"></i>
            <i data-feather="sun" class="hidden dark:block"></i>
          </button>
          <button type="button" class="btn btn-icon btn-ghost relative" aria-label="Notifications">
            <i data-feather="bell"></i>
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full"></span>
          </button>
          <button type="button" class="btn btn-icon btn-ghost hidden sm:inline-flex" aria-label="Messages">
            <i data-feather="message-square"></i>
          </button>
          <button type="button" class="btn btn-icon btn-ghost hidden md:inline-flex" aria-label="Help">
            <i data-feather="help-circle"></i>
          </button>
        </div>
      </div>
    </header>
  `;
}

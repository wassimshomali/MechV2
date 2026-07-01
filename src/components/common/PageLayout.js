export function renderPageHeader({ title, description, actionLabel, actionHref, actionIcon = 'plus' }) {
  const action = actionLabel
    ? `<a href="${actionHref || '#'}" class="btn btn-primary shrink-0">
        <i data-feather="${actionIcon}"></i>
        ${actionLabel}
      </a>`
    : '';

  return `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in">
      <div>
        <h2 class="text-xl font-semibold">${title}</h2>
        ${description ? `<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${description}</p>` : ''}
      </div>
      ${action}
    </div>
  `;
}

export function renderDataTable({ columns, rows, emptyMessage = 'No records found' }) {
  if (!rows.length) {
    return `<div class="panel p-8 text-center text-sm text-gray-500">${emptyMessage}</div>`;
  }

  const head = columns.map((col) => `<th scope="col">${col.label}</th>`).join('');
  const body = rows
    .map(
      (row) => `
      <tr class="transition-colors duration-fast hover:bg-gray-50 dark:hover:bg-gray-800/50">
        ${columns.map((col) => `<td>${row[col.key] ?? '—'}</td>`).join('')}
      </tr>
    `
    )
    .join('');

  return `
    <div class="data-table animate-fade-in">
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead><tr>${head}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    </div>
  `;
}

export function renderSearchBar({ placeholder = 'Search...', id = 'page-search' }) {
  return `
    <div class="search-box mb-6 animate-fade-in">
      <i data-feather="search" class="search-icon"></i>
      <input type="search" id="${id}" class="search-input" placeholder="${placeholder}" aria-label="${placeholder}" />
    </div>
  `;
}

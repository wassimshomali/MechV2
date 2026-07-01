export function renderEmptyState({ icon = 'inbox', title, description, actionLabel, actionHref }) {
  const action = actionLabel
    ? `<a href="${actionHref || '#'}" class="btn btn-primary mt-6">${actionLabel}</a>`
    : '';

  return `
    <div class="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div class="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <i data-feather="${icon}" class="w-8 h-8 text-gray-400"></i>
      </div>
      <h3 class="text-lg font-semibold mb-2">${title}</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm">${description}</p>
      ${action}
    </div>
  `;
}

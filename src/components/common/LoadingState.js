export function renderLoadingState({ rows = 5 } = {}) {
  const skeletonRows = Array.from({ length: rows })
    .map(
      () => `
      <div class="flex items-center gap-4 p-4">
        <div class="skeleton w-10 h-10 rounded-full shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="skeleton h-4 w-1/3 rounded"></div>
          <div class="skeleton h-3 w-1/2 rounded"></div>
        </div>
      </div>
    `
    )
    .join('');

  return `
    <div class="panel overflow-hidden animate-fade-in" aria-busy="true" aria-label="Loading">
      <div class="divide-y divide-gray-100 dark:divide-gray-800">
        ${skeletonRows}
      </div>
    </div>
  `;
}

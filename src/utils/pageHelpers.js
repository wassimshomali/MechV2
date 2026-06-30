/**
 * Shared page layout helpers for MoMech components
 */

import { formatStatus } from './formatters.js';

const STATUS_COLORS = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-indigo-100 text-indigo-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    no_show: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    sent: 'bg-blue-100 text-blue-800',
    overdue: 'bg-red-100 text-red-800',
    draft: 'bg-gray-100 text-gray-800',
    open: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
};

const PRIORITY_COLORS = {
    low: 'bg-gray-100 text-gray-800',
    normal: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
};

export function statusBadge(status) {
    const color = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}">${formatStatus(status)}</span>`;
}

export function priorityBadge(priority) {
    const color = PRIORITY_COLORS[priority] || PRIORITY_COLORS.normal;
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}">${formatStatus(priority)}</span>`;
}

export function renderPageHeader(title, subtitle = '', actionHtml = '') {
    return `
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-semibold text-gray-900">${title}</h1>
                ${subtitle ? `<p class="mt-1 text-sm text-gray-500">${subtitle}</p>` : ''}
            </div>
            ${actionHtml ? `<div class="flex items-center space-x-3">${actionHtml}</div>` : ''}
        </div>
    `;
}

export function renderDetailCard(title, contentHtml, actionsHtml = '') {
    return `
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900">${title}</h2>
                ${actionsHtml}
            </div>
            <div class="px-6 py-4">${contentHtml}</div>
        </div>
    `;
}

export function renderDetailGrid(items) {
    return `
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            ${items.map(({ label, value }) => `
                <div>
                    <dt class="text-sm font-medium text-gray-500">${label}</dt>
                    <dd class="mt-1 text-sm text-gray-900">${value ?? '-'}</dd>
                </div>
            `).join('')}
        </dl>
    `;
}

export function renderBackButton(hash, label = 'Back') {
    return `
        <button onclick="window.location.hash = '${hash}'" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <i data-feather="arrow-left" class="w-4 h-4 mr-1 inline"></i>${label}
        </button>
    `;
}

export function renderPrimaryButton(hash, label, icon = 'plus') {
    return `
        <button onclick="window.location.hash = '${hash}'" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
            <i data-feather="${icon}" class="w-4 h-4 mr-2 inline"></i>${label}
        </button>
    `;
}

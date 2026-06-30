/**
 * Work Order Detail Component
 */

import workOrderService from '../../services/workOrderService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { renderPageHeader, renderDetailCard, renderDetailGrid, statusBadge, priorityBadge } from '../../utils/pageHelpers.js';

export class WorkOrderDetail {
    constructor(params = {}) {
        this.id = params.id;
    }

    async render() {
        return `<div id="wo-detail" class="max-w-4xl mx-auto"><div class="flex justify-center py-12"><div class="page-loader"></div></div></div>`;
    }

    async init() {
        try {
            const wo = await workOrderService.getWorkOrder(this.id);
            document.getElementById('wo-detail').innerHTML = `
                <div class="space-y-6">
                    ${renderPageHeader(
                        wo.workOrderNumber,
                        wo.clientName || '',
                        `
                        <button onclick="window.location.hash = '/work-orders/${this.id}/edit'" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Edit</button>
                        <button onclick="window.location.hash = '/work-orders'" class="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white">Back</button>
                        `
                    )}
                    ${renderDetailCard('Work Order Details', renderDetailGrid([
                        { label: 'Status', value: statusBadge(wo.status) },
                        { label: 'Priority', value: priorityBadge(wo.priority) },
                        { label: 'Vehicle', value: wo.vehicleInfo },
                        { label: 'Description', value: wo.description },
                        { label: 'Diagnosis', value: wo.diagnosis || '-' },
                        { label: 'Work Performed', value: wo.workPerformed || '-' },
                        { label: 'Labor Hours', value: wo.totalLaborHours },
                        { label: 'Parts Cost', value: formatCurrency(wo.totalPartsCost) },
                        { label: 'Labor Cost', value: formatCurrency(wo.totalLaborCost) },
                        { label: 'Total', value: formatCurrency(wo.totalCost) },
                        { label: 'Started', value: wo.startedAt ? formatDate(wo.startedAt, 'short') : '-' },
                        { label: 'Completed', value: wo.completedAt ? formatDate(wo.completedAt, 'short') : '-' },
                    ]))}
                </div>
            `;
        } catch (error) {
            document.getElementById('wo-detail').innerHTML = '<p class="text-red-600">Failed to load work order.</p>';
        }
    }

    destroy() {}
}

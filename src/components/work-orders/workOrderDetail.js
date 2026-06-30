/**
 * Work Order Detail Component
 */

import workOrderService from '../../services/workOrderService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { renderPageHeader, renderDetailCard, renderDetailGrid, statusBadge, priorityBadge } from '../../utils/pageHelpers.js';
import { t } from '../../i18n/index.js';

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
                        <button onclick="window.location.hash = '/work-orders/${this.id}/edit'" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">${t('common.edit')}</button>
                        <button onclick="window.location.hash = '/work-orders'" class="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white">${t('common.back')}</button>
                        `
                    )}
                    ${renderDetailCard(t('workOrders.details'), renderDetailGrid([
                        { label: t('fields.status'), value: statusBadge(wo.status) },
                        { label: t('fields.priority'), value: priorityBadge(wo.priority) },
                        { label: t('fields.vehicle'), value: wo.vehicleInfo },
                        { label: t('fields.description'), value: wo.description },
                        { label: t('fields.diagnosis'), value: wo.diagnosis || '-' },
                        { label: t('fields.workPerformed'), value: wo.workPerformed || '-' },
                        { label: t('fields.laborHours'), value: wo.totalLaborHours },
                        { label: t('fields.partsCost'), value: formatCurrency(wo.totalPartsCost) },
                        { label: t('fields.laborCost'), value: formatCurrency(wo.totalLaborCost) },
                        { label: t('fields.total'), value: formatCurrency(wo.totalCost) },
                        { label: t('fields.started'), value: wo.startedAt ? formatDate(wo.startedAt, 'short') : '-' },
                        { label: t('fields.completed'), value: wo.completedAt ? formatDate(wo.completedAt, 'short') : '-' },
                    ]))}
                </div>
            `;
        } catch (error) {
            document.getElementById('wo-detail').innerHTML = `<p class="text-red-600">${t('workOrders.errorLoading')}</p>`;
        }
    }

    destroy() {}
}

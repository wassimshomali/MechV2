/**
 * Work Order List Component
 */

import { DataTable } from '../common/table.js';
import { Modal } from '../common/modal.js';
import workOrderService from '../../services/workOrderService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { renderPageHeader, renderPrimaryButton, statusBadge, priorityBadge } from '../../utils/pageHelpers.js';
import { t } from '../../i18n/index.js';

export class WorkOrderList {
    constructor() {
        this.table = null;
        this.currentPage = 1;
        this.currentSearch = '';
    }

    async render() {
        return `
            <div class="space-y-6">
                ${renderPageHeader(t('workOrders.title'), t('workOrders.subtitle'), renderPrimaryButton('/work-orders/new', t('workOrders.newWorkOrder')))}
                <div id="work-orders-table"></div>
            </div>
        `;
    }

    async init() {
        this.table = new DataTable({
            containerId: 'work-orders-table',
            columns: [
                { key: 'workOrderNumber', label: t('workOrders.woNumber') },
                { key: 'clientName', label: t('workOrders.client') },
                { key: 'vehicleInfo', label: t('workOrders.vehicle'), formatter: v => v || '-' },
                { key: 'status', label: t('fields.status'), formatter: v => statusBadge(v) },
                { key: 'priority', label: t('fields.priority'), formatter: v => priorityBadge(v) },
                { key: 'totalCost', label: t('workOrders.total'), formatter: v => formatCurrency(v) },
                { key: 'createdAt', label: t('workOrders.created'), formatter: v => formatDate(v, 'short') },
                {
                    key: 'actions',
                    label: t('common.actions'),
                    actions: [
                        { name: 'view', icon: 'eye', label: t('common.view'), color: 'blue', handler: (row) => window.location.hash = `/work-orders/${row.id}` },
                        { name: 'edit', icon: 'edit', label: t('common.edit'), color: 'green', handler: (row) => window.location.hash = `/work-orders/${row.id}/edit` },
                        { name: 'delete', icon: 'trash-2', label: t('common.delete'), color: 'red', handler: (row) => this.confirmDelete(row) },
                    ]
                }
            ],
            searchable: true,
            onPageChange: (page) => { this.currentPage = page; this.loadData(); },
            onSearch: (q) => { this.currentSearch = q; this.currentPage = 1; this.loadData(); },
            onRowClick: (row) => window.location.hash = `/work-orders/${row.id}`,
            emptyMessage: t('workOrders.empty'),
        });
        await this.loadData();
    }

    async loadData() {
        try {
            this.table.setLoading(true);
            const response = await workOrderService.getWorkOrders({ page: this.currentPage, limit: 20, search: this.currentSearch });
            this.table.update(response.workOrders, response.pagination);
        } catch (error) {
            window.showNotification(t('workOrders.errorLoading'), 'error');
            this.table.setLoading(false);
        }
    }

    confirmDelete(wo) {
        Modal.confirm(t('workOrders.deleteTitle'), t('workOrders.deleteMessage', { number: wo.workOrderNumber }), async () => {
            await workOrderService.deleteWorkOrder(wo.id);
            window.showNotification(t('workOrders.deleted'), 'success');
            this.loadData();
        });
    }

    destroy() { if (this.table) this.table.destroy(); }
}

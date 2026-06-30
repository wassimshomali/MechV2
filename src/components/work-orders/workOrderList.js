/**
 * Work Order List Component
 */

import { DataTable } from '../common/table.js';
import { Modal } from '../common/modal.js';
import workOrderService from '../../services/workOrderService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { renderPageHeader, renderPrimaryButton, statusBadge, priorityBadge } from '../../utils/pageHelpers.js';

export class WorkOrderList {
    constructor() {
        this.table = null;
        this.currentPage = 1;
        this.currentSearch = '';
    }

    async render() {
        return `
            <div class="space-y-6">
                ${renderPageHeader('Work Orders', 'Service jobs and repairs', renderPrimaryButton('/work-orders/new', 'New Work Order'))}
                <div id="work-orders-table"></div>
            </div>
        `;
    }

    async init() {
        this.table = new DataTable({
            containerId: 'work-orders-table',
            columns: [
                { key: 'workOrderNumber', label: 'WO #' },
                { key: 'clientName', label: 'Client' },
                { key: 'vehicleInfo', label: 'Vehicle', formatter: v => v || '-' },
                { key: 'status', label: 'Status', formatter: v => statusBadge(v) },
                { key: 'priority', label: 'Priority', formatter: v => priorityBadge(v) },
                { key: 'totalCost', label: 'Total', formatter: v => formatCurrency(v) },
                { key: 'createdAt', label: 'Created', formatter: v => formatDate(v, 'short') },
                {
                    key: 'actions',
                    label: 'Actions',
                    actions: [
                        { name: 'view', icon: 'eye', label: 'View', color: 'blue', handler: (row) => window.location.hash = `/work-orders/${row.id}` },
                        { name: 'edit', icon: 'edit', label: 'Edit', color: 'green', handler: (row) => window.location.hash = `/work-orders/${row.id}/edit` },
                        { name: 'delete', icon: 'trash-2', label: 'Delete', color: 'red', handler: (row) => this.confirmDelete(row) },
                    ]
                }
            ],
            searchable: true,
            onPageChange: (page) => { this.currentPage = page; this.loadData(); },
            onSearch: (q) => { this.currentSearch = q; this.currentPage = 1; this.loadData(); },
            onRowClick: (row) => window.location.hash = `/work-orders/${row.id}`,
            emptyMessage: 'No work orders found.',
        });
        await this.loadData();
    }

    async loadData() {
        try {
            this.table.setLoading(true);
            const response = await workOrderService.getWorkOrders({ page: this.currentPage, limit: 20, search: this.currentSearch });
            this.table.update(response.workOrders, response.pagination);
        } catch (error) {
            window.showNotification('Error loading work orders', 'error');
            this.table.setLoading(false);
        }
    }

    confirmDelete(wo) {
        Modal.confirm('Delete Work Order', `Delete ${wo.workOrderNumber}?`, async () => {
            await workOrderService.deleteWorkOrder(wo.id);
            window.showNotification('Work order deleted', 'success');
            this.loadData();
        });
    }

    destroy() { if (this.table) this.table.destroy(); }
}

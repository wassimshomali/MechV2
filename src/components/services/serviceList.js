/**
 * Service List Component
 */

import { DataTable } from '../common/table.js';
import { Modal } from '../common/modal.js';
import serviceService from '../../services/serviceService.js';
import { formatCurrency, formatDuration } from '../../utils/formatters.js';
import { renderPageHeader, renderPrimaryButton } from '../../utils/pageHelpers.js';

export class ServiceList {
    constructor() {
        this.table = null;
        this.currentPage = 1;
        this.currentSearch = '';
    }

    async render() {
        return `
            <div class="space-y-6">
                ${renderPageHeader('Service Templates', 'Predefined services and labor rates', renderPrimaryButton('/services/new', 'Add Service'))}
                <div id="services-table"></div>
            </div>
        `;
    }

    async init() {
        this.table = new DataTable({
            containerId: 'services-table',
            columns: [
                { key: 'name', label: 'Service' },
                { key: 'categoryName', label: 'Category', formatter: v => v || '-' },
                { key: 'estimatedDuration', label: 'Duration', formatter: v => formatDuration(v) },
                { key: 'laborRate', label: 'Labor Rate', formatter: v => formatCurrency(v) },
                { key: 'usageCount', label: 'Used', formatter: v => v ?? 0 },
                {
                    key: 'actions',
                    label: 'Actions',
                    actions: [
                        { name: 'edit', icon: 'edit', label: 'Edit', color: 'green', handler: (row) => window.location.hash = `/services/${row.id}/edit` },
                        { name: 'delete', icon: 'trash-2', label: 'Delete', color: 'red', handler: (row) => this.confirmDelete(row) },
                    ]
                }
            ],
            searchable: true,
            onPageChange: (page) => { this.currentPage = page; this.loadData(); },
            onSearch: (q) => { this.currentSearch = q; this.currentPage = 1; this.loadData(); },
            emptyMessage: 'No services found.',
        });
        await this.loadData();
    }

    async loadData() {
        try {
            this.table.setLoading(true);
            const response = await serviceService.getServices({ page: this.currentPage, limit: 20, search: this.currentSearch });
            this.table.update(response.services, response.pagination);
        } catch (error) {
            window.showNotification('Error loading services', 'error');
            this.table.setLoading(false);
        }
    }

    confirmDelete(service) {
        Modal.confirm('Delete Service', `Delete "${service.name}"?`, async () => {
            await serviceService.deleteService(service.id);
            window.showNotification('Service deleted', 'success');
            this.loadData();
        });
    }

    destroy() { if (this.table) this.table.destroy(); }
}

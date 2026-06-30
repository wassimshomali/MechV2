/**
 * Service List Component
 */

import { DataTable } from '../common/table.js';
import { Modal } from '../common/modal.js';
import serviceService from '../../services/serviceService.js';
import { formatCurrency, formatDuration } from '../../utils/formatters.js';
import { renderPageHeader, renderPrimaryButton } from '../../utils/pageHelpers.js';
import { t } from '../../i18n/index.js';

export class ServiceList {
    constructor() {
        this.table = null;
        this.currentPage = 1;
        this.currentSearch = '';
    }

    async render() {
        return `
            <div class="space-y-6">
                ${renderPageHeader(t('services.title'), t('services.subtitle'), renderPrimaryButton('/services/new', t('services.addService')))}
                <div id="services-table"></div>
            </div>
        `;
    }

    async init() {
        this.table = new DataTable({
            containerId: 'services-table',
            columns: [
                { key: 'name', label: t('services.service') },
                { key: 'categoryName', label: t('services.category'), formatter: v => v || '-' },
                { key: 'estimatedDuration', label: t('services.duration'), formatter: v => formatDuration(v) },
                { key: 'laborRate', label: t('services.laborRate'), formatter: v => formatCurrency(v) },
                { key: 'usageCount', label: t('services.used'), formatter: v => v ?? 0 },
                {
                    key: 'actions',
                    label: t('common.actions'),
                    actions: [
                        { name: 'edit', icon: 'edit', label: t('common.edit'), color: 'green', handler: (row) => window.location.hash = `/services/${row.id}/edit` },
                        { name: 'delete', icon: 'trash-2', label: t('common.delete'), color: 'red', handler: (row) => this.confirmDelete(row) },
                    ]
                }
            ],
            searchable: true,
            onPageChange: (page) => { this.currentPage = page; this.loadData(); },
            onSearch: (q) => { this.currentSearch = q; this.currentPage = 1; this.loadData(); },
            emptyMessage: t('services.empty'),
        });
        await this.loadData();
    }

    async loadData() {
        try {
            this.table.setLoading(true);
            const response = await serviceService.getServices({ page: this.currentPage, limit: 20, search: this.currentSearch });
            this.table.update(response.services, response.pagination);
        } catch (error) {
            window.showNotification(t('services.errorLoading'), 'error');
            this.table.setLoading(false);
        }
    }

    confirmDelete(service) {
        Modal.confirm(t('services.deleteTitle'), t('services.deleteMessage', { name: service.name }), async () => {
            await serviceService.deleteService(service.id);
            window.showNotification(t('services.deleted'), 'success');
            this.loadData();
        });
    }

    destroy() { if (this.table) this.table.destroy(); }
}

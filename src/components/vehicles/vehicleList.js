/**
 * Vehicle List Component
 */

import { DataTable } from '../common/table.js';
import { Modal } from '../common/modal.js';
import vehicleService from '../../services/vehicleService.js';
import { formatMileage } from '../../utils/formatters.js';
import { renderPageHeader, renderPrimaryButton } from '../../utils/pageHelpers.js';
import { t } from '../../i18n/index.js';

export class VehicleList {
    constructor(params = {}) {
        this.params = params;
        this.table = null;
        this.currentPage = 1;
        this.currentSearch = '';
    }

    async render() {
        return `
            <div class="space-y-6">
                ${renderPageHeader(t('vehicles.title'), t('vehicles.subtitle'), renderPrimaryButton('/vehicles/new', t('vehicles.addVehicle')))}
                <div id="vehicles-table"></div>
            </div>
        `;
    }

    async init() {
        this.table = new DataTable({
            containerId: 'vehicles-table',
            columns: [
                {
                    key: 'make',
                    label: t('vehicles.vehicle'),
                    formatter: (_, row) => `
                        <div class="text-sm font-medium text-gray-900">${row.year} ${row.make} ${row.model}</div>
                        <div class="text-sm text-gray-500">${row.clientName || ''}</div>
                    `
                },
                { key: 'licensePlate', label: t('vehicles.plate'), formatter: v => v || '-' },
                { key: 'color', label: t('vehicles.color'), formatter: v => v || '-' },
                { key: 'mileage', label: t('vehicles.mileage'), formatter: v => formatMileage(v) },
                {
                    key: 'actions',
                    label: t('common.actions'),
                    actions: [
                        { name: 'view', icon: 'eye', label: t('common.view'), color: 'blue', handler: (row) => window.location.hash = `/vehicles/${row.id}` },
                        { name: 'edit', icon: 'edit', label: t('common.edit'), color: 'green', handler: (row) => window.location.hash = `/vehicles/${row.id}/edit` },
                        { name: 'delete', icon: 'trash-2', label: t('common.delete'), color: 'red', handler: (row) => this.confirmDelete(row) },
                    ]
                }
            ],
            searchable: true,
            onPageChange: (page) => { this.currentPage = page; this.loadData(); },
            onSearch: (query) => { this.currentSearch = query; this.currentPage = 1; this.loadData(); },
            onRowClick: (row) => window.location.hash = `/vehicles/${row.id}`,
            emptyMessage: t('vehicles.empty'),
        });
        await this.loadData();
    }

    async loadData() {
        try {
            this.table.setLoading(true);
            const response = await vehicleService.getVehicles({ page: this.currentPage, limit: 20, search: this.currentSearch });
            this.table.update(response.vehicles, response.pagination);
        } catch (error) {
            window.showNotification(t('vehicles.errorLoading'), 'error');
            this.table.setLoading(false);
        }
    }

    confirmDelete(vehicle) {
        Modal.confirm(
            t('vehicles.deleteTitle'),
            t('vehicles.deleteMessage', { vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}` }),
            async () => {
                await vehicleService.deleteVehicle(vehicle.id);
                window.showNotification(t('vehicles.deleted'), 'success');
                this.loadData();
            }
        );
    }

    destroy() { if (this.table) this.table.destroy(); }
}

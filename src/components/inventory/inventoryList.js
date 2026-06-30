/**
 * Inventory List Component
 */

import { DataTable } from '../common/table.js';
import { Modal } from '../common/modal.js';
import inventoryService from '../../services/inventoryService.js';
import { formatCurrency } from '../../utils/formatters.js';
import { renderPageHeader, renderPrimaryButton } from '../../utils/pageHelpers.js';
import { t } from '../../i18n/index.js';

export class InventoryList {
    constructor(params = {}) {
        this.filter = params.filter;
        this.table = null;
        this.currentPage = 1;
        this.currentSearch = '';
    }

    async render() {
        const title = this.filter === 'low-stock' ? t('inventory.lowStockTitle') : t('inventory.title');
        return `
            <div class="space-y-6">
                ${renderPageHeader(title, t('inventory.subtitle'), `
                    ${this.filter !== 'low-stock' ? renderPrimaryButton('/inventory/low-stock', t('inventory.lowStock'), 'alert-triangle') : ''}
                    ${renderPrimaryButton('/inventory/new', t('inventory.addItem'))}
                `)}
                <div id="inventory-table"></div>
            </div>
        `;
    }

    async init() {
        this.table = new DataTable({
            containerId: 'inventory-table',
            columns: [
                { key: 'name', label: t('inventory.item'), formatter: (v, row) => `
                    <div class="text-sm font-medium text-gray-900">${v}</div>
                    <div class="text-sm text-gray-500">${row.partNumber || ''}</div>
                `},
                { key: 'categoryName', label: t('inventory.category'), formatter: v => v || '-' },
                { key: 'quantityOnHand', label: t('inventory.quantity'), formatter: (v, row) => {
                    const low = v <= row.minimumQuantity;
                    return `<span class="${low ? 'text-red-600 font-semibold' : ''}">${v}</span>`;
                }},
                { key: 'sellingPrice', label: t('inventory.price'), formatter: v => formatCurrency(v) },
                {
                    key: 'actions',
                    label: t('common.actions'),
                    actions: [
                        { name: 'edit', icon: 'edit', label: t('common.edit'), color: 'green', handler: (row) => window.location.hash = `/inventory/${row.id}/edit` },
                        { name: 'delete', icon: 'trash-2', label: t('common.delete'), color: 'red', handler: (row) => this.confirmDelete(row) },
                    ]
                }
            ],
            searchable: true,
            onPageChange: (page) => { this.currentPage = page; this.loadData(); },
            onSearch: (q) => { this.currentSearch = q; this.currentPage = 1; this.loadData(); },
            emptyMessage: t('inventory.empty'),
        });
        await this.loadData();
    }

    async loadData() {
        try {
            this.table.setLoading(true);
            if (this.filter === 'low-stock') {
                const items = await inventoryService.getLowStockItems();
                this.table.update(items, { page: 1, limit: items.length, total: items.length, totalPages: 1 });
            } else {
                const response = await inventoryService.getInventoryItems({ page: this.currentPage, limit: 20, search: this.currentSearch });
                this.table.update(response.items, response.pagination);
            }
        } catch (error) {
            window.showNotification(t('inventory.errorLoading'), 'error');
            this.table.setLoading(false);
        }
    }

    confirmDelete(item) {
        Modal.confirm(t('inventory.deleteTitle'), t('inventory.deleteMessage', { name: item.name }), async () => {
            await inventoryService.deleteInventoryItem(item.id);
            window.showNotification(t('inventory.deleted'), 'success');
            this.loadData();
        });
    }

    destroy() { if (this.table) this.table.destroy(); }
}

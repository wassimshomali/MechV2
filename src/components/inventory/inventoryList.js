/**
 * Inventory List Component
 */

import { DataTable } from '../common/table.js';
import { Modal } from '../common/modal.js';
import inventoryService from '../../services/inventoryService.js';
import { formatCurrency } from '../../utils/formatters.js';
import { renderPageHeader, renderPrimaryButton } from '../../utils/pageHelpers.js';

export class InventoryList {
    constructor(params = {}) {
        this.filter = params.filter;
        this.table = null;
        this.currentPage = 1;
        this.currentSearch = '';
    }

    async render() {
        const title = this.filter === 'low-stock' ? 'Low Stock Items' : 'Inventory';
        return `
            <div class="space-y-6">
                ${renderPageHeader(title, 'Parts and supplies tracking', `
                    ${this.filter !== 'low-stock' ? renderPrimaryButton('/inventory/low-stock', 'Low Stock', 'alert-triangle') : ''}
                    ${renderPrimaryButton('/inventory/new', 'Add Item')}
                `)}
                <div id="inventory-table"></div>
            </div>
        `;
    }

    async init() {
        this.table = new DataTable({
            containerId: 'inventory-table',
            columns: [
                { key: 'name', label: 'Item', formatter: (v, row) => `
                    <div class="text-sm font-medium text-gray-900">${v}</div>
                    <div class="text-sm text-gray-500">${row.partNumber || ''}</div>
                `},
                { key: 'categoryName', label: 'Category', formatter: v => v || '-' },
                { key: 'quantityOnHand', label: 'Qty', formatter: (v, row) => {
                    const low = v <= row.minimumQuantity;
                    return `<span class="${low ? 'text-red-600 font-semibold' : ''}">${v}</span>`;
                }},
                { key: 'sellingPrice', label: 'Price', formatter: v => formatCurrency(v) },
                {
                    key: 'actions',
                    label: 'Actions',
                    actions: [
                        { name: 'edit', icon: 'edit', label: 'Edit', color: 'green', handler: (row) => window.location.hash = `/inventory/${row.id}/edit` },
                        { name: 'delete', icon: 'trash-2', label: 'Delete', color: 'red', handler: (row) => this.confirmDelete(row) },
                    ]
                }
            ],
            searchable: true,
            onPageChange: (page) => { this.currentPage = page; this.loadData(); },
            onSearch: (q) => { this.currentSearch = q; this.currentPage = 1; this.loadData(); },
            emptyMessage: 'No inventory items found.',
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
            window.showNotification('Error loading inventory', 'error');
            this.table.setLoading(false);
        }
    }

    confirmDelete(item) {
        Modal.confirm('Delete Item', `Delete "${item.name}"?`, async () => {
            await inventoryService.deleteInventoryItem(item.id);
            window.showNotification('Item deleted', 'success');
            this.loadData();
        });
    }

    destroy() { if (this.table) this.table.destroy(); }
}

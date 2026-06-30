/**
 * Inventory Form Component
 */

import { Form } from '../common/form.js';
import inventoryService from '../../services/inventoryService.js';

export class InventoryForm {
    constructor(params = {}) {
        this.id = params.id;
        this.isEdit = Boolean(params.id);
        this.form = null;
    }

    async render() {
        return `
            <div class="max-w-3xl mx-auto space-y-6">
                <h1 class="text-2xl font-semibold text-gray-900">${this.isEdit ? 'Edit' : 'Add'} Inventory Item</h1>
                <div class="bg-white rounded-lg shadow p-6">
                    <div id="inventory-form-container"></div>
                </div>
            </div>
        `;
    }

    async init() {
        const categories = await inventoryService.getCategories();
        const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));

        let data = { quantityOnHand: 0, minimumQuantity: 5, reorderPoint: 10 };
        if (this.isEdit) {
            const item = await inventoryService.getInventoryItem(this.id);
            data = {
                name: item.name,
                description: item.description,
                partNumber: item.partNumber,
                categoryId: item.categoryId,
                quantityOnHand: item.quantityOnHand,
                minimumQuantity: item.minimumQuantity,
                reorderPoint: item.reorderPoint,
                costPrice: item.costPrice,
                sellingPrice: item.sellingPrice,
                location: item.location,
            };
        }

        const fields = [
            { name: 'name', label: 'Item Name', type: 'text', required: true },
            { name: 'partNumber', label: 'Part Number', type: 'text' },
            { name: 'categoryId', label: 'Category', type: 'select', options: categoryOptions },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'quantityOnHand', label: 'Quantity On Hand', type: 'number' },
            { name: 'minimumQuantity', label: 'Minimum Quantity', type: 'number' },
            { name: 'reorderPoint', label: 'Reorder Point', type: 'number' },
            { name: 'costPrice', label: 'Cost Price', type: 'number' },
            { name: 'sellingPrice', label: 'Selling Price', type: 'number' },
            { name: 'location', label: 'Storage Location', type: 'text' },
        ];

        this.form = new Form({
            containerId: 'inventory-form-container',
            fields,
            data,
            submitText: this.isEdit ? 'Update Item' : 'Create Item',
            onSubmit: async (formData) => {
                const payload = {
                    ...formData,
                    categoryId: formData.categoryId ? Number(formData.categoryId) : null,
                    quantityOnHand: Number(formData.quantityOnHand),
                    minimumQuantity: Number(formData.minimumQuantity),
                    reorderPoint: Number(formData.reorderPoint),
                    costPrice: formData.costPrice ? Number(formData.costPrice) : null,
                    sellingPrice: formData.sellingPrice ? Number(formData.sellingPrice) : null,
                };
                if (this.isEdit) {
                    await inventoryService.updateInventoryItem(this.id, payload);
                } else {
                    await inventoryService.createInventoryItem(payload);
                }
                window.location.hash = '/inventory';
            },
        });
        this.form.init();
        document.querySelector('#cancel-btn')?.addEventListener('click', () => window.location.hash = '/inventory');
    }

    destroy() {}
}

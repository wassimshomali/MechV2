/**
 * Inventory Form Component
 */

import { Form } from '../common/form.js';
import inventoryService from '../../services/inventoryService.js';
import { t } from '../../i18n/index.js';

function getInventoryFields(categoryOptions) {
    return [
        { name: 'name', label: t('fields.name'), type: 'text', required: true },
        { name: 'partNumber', label: t('fields.partNumber'), type: 'text' },
        { name: 'categoryId', label: t('fields.category'), type: 'select', options: categoryOptions },
        { name: 'description', label: t('fields.description'), type: 'textarea' },
        { name: 'quantityOnHand', label: t('fields.quantity'), type: 'number' },
        { name: 'minimumQuantity', label: t('fields.minimumQuantity'), type: 'number' },
        { name: 'reorderPoint', label: t('fields.reorderPoint'), type: 'number' },
        { name: 'costPrice', label: t('fields.costPrice'), type: 'number' },
        { name: 'sellingPrice', label: t('fields.sellingPrice'), type: 'number' },
        { name: 'location', label: t('fields.location'), type: 'text' },
    ];
}

export class InventoryForm {
    constructor(params = {}) {
        this.id = params.id;
        this.isEdit = Boolean(params.id);
        this.form = null;
    }

    async render() {
        return `
            <div class="max-w-3xl mx-auto space-y-6">
                <h1 class="text-2xl font-semibold text-gray-900">${this.isEdit ? t('inventory.editItem') : t('inventory.addItemTitle')}</h1>
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

        this.form = new Form({
            containerId: 'inventory-form-container',
            fields: getInventoryFields(categoryOptions),
            data,
            submitText: this.isEdit ? t('inventory.updateItem') : t('inventory.createItem'),
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

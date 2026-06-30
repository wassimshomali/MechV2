/**
 * Service Form Component
 */

import { Form } from '../common/form.js';
import serviceService from '../../services/serviceService.js';

export class ServiceForm {
    constructor(params = {}) {
        this.id = params.id;
        this.isEdit = Boolean(params.id);
    }

    async render() {
        return `
            <div class="max-w-3xl mx-auto space-y-6">
                <h1 class="text-2xl font-semibold text-gray-900">${this.isEdit ? 'Edit' : 'Add'} Service</h1>
                <div class="bg-white rounded-lg shadow p-6">
                    <div id="service-form-container"></div>
                </div>
            </div>
        `;
    }

    async init() {
        const categories = await serviceService.getCategories();
        let data = { estimatedDuration: 60, laborRate: 85, partsMarkup: 0.2 };
        if (this.isEdit) {
            const service = await serviceService.getService(this.id);
            data = {
                name: service.name,
                description: service.description,
                categoryId: service.categoryId,
                estimatedDuration: service.estimatedDuration,
                laborRate: service.laborRate,
                partsMarkup: service.partsMarkup,
            };
        }

        const fields = [
            { name: 'name', label: 'Service Name', type: 'text', required: true },
            { name: 'categoryId', label: 'Category', type: 'select', options: categories.map(c => ({ value: c.id, label: c.name })) },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'estimatedDuration', label: 'Duration (minutes)', type: 'number' },
            { name: 'laborRate', label: 'Labor Rate ($/hr)', type: 'number' },
            { name: 'partsMarkup', label: 'Parts Markup (decimal)', type: 'number' },
        ];

        const form = new Form({
            containerId: 'service-form-container',
            fields,
            data,
            submitText: this.isEdit ? 'Update Service' : 'Create Service',
            onSubmit: async (formData) => {
                const payload = {
                    ...formData,
                    categoryId: formData.categoryId ? Number(formData.categoryId) : null,
                    estimatedDuration: Number(formData.estimatedDuration),
                    laborRate: Number(formData.laborRate),
                    partsMarkup: Number(formData.partsMarkup),
                };
                if (this.isEdit) {
                    await serviceService.updateService(this.id, payload);
                } else {
                    await serviceService.createService(payload);
                }
                window.location.hash = '/services';
            },
        });
        form.init();
        document.querySelector('#cancel-btn')?.addEventListener('click', () => window.location.hash = '/services');
    }

    destroy() {}
}

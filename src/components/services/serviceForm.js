/**
 * Service Form Component
 */

import { Form } from '../common/form.js';
import serviceService from '../../services/serviceService.js';
import { t } from '../../i18n/index.js';

function getServiceFields(categoryOptions) {
    return [
        { name: 'name', label: t('fields.serviceName'), type: 'text', required: true },
        { name: 'categoryId', label: t('fields.category'), type: 'select', options: categoryOptions },
        { name: 'description', label: t('fields.description'), type: 'textarea' },
        { name: 'estimatedDuration', label: t('fields.estimatedDuration'), type: 'number' },
        { name: 'laborRate', label: t('fields.laborRate'), type: 'number' },
        { name: 'partsMarkup', label: t('fields.partsMarkup'), type: 'number' },
    ];
}

export class ServiceForm {
    constructor(params = {}) {
        this.id = params.id;
        this.isEdit = Boolean(params.id);
    }

    async render() {
        return `
            <div class="max-w-3xl mx-auto space-y-6">
                <h1 class="text-2xl font-semibold text-gray-900">${this.isEdit ? t('services.editService') : t('services.addServiceTitle')}</h1>
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

        const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));

        const form = new Form({
            containerId: 'service-form-container',
            fields: getServiceFields(categoryOptions),
            data,
            submitText: this.isEdit ? t('services.updateService') : t('services.createService'),
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

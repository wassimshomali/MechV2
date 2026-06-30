/**
 * Client Form Component
 */

import { Form } from '../common/form.js';
import clientService from '../../services/clientService.js';
import { t } from '../../i18n/index.js';

function getClientFields() {
    return [
        { name: 'firstName', label: t('fields.firstName'), type: 'text', required: true },
        { name: 'lastName', label: t('fields.lastName'), type: 'text', required: true },
        { name: 'email', label: t('fields.email'), type: 'email' },
        { name: 'phone', label: t('fields.phone'), type: 'tel' },
        { name: 'address', label: t('fields.address'), type: 'text' },
        { name: 'city', label: t('fields.city'), type: 'text' },
        { name: 'state', label: t('fields.state'), type: 'text' },
        { name: 'zipCode', label: t('fields.zipCode'), type: 'text' },
        { name: 'preferredContactMethod', label: t('fields.preferredContact'), type: 'select', options: [
            { value: 'phone', label: t('fields.contactMethodPhone') },
            { value: 'email', label: t('fields.contactMethodEmail') },
            { value: 'sms', label: t('fields.contactMethodSms') },
        ]},
        { name: 'notes', label: t('fields.notes'), type: 'textarea' },
    ];
}

export class ClientForm {
    constructor(params = {}) {
        this.id = params.id;
        this.isEdit = Boolean(params.id);
        this.form = null;
    }

    async render() {
        return `
            <div class="max-w-3xl mx-auto space-y-6">
                <h1 class="text-2xl font-semibold text-gray-900">${this.isEdit ? t('clients.editClient') : t('clients.addClientTitle')}</h1>
                <div class="bg-white rounded-lg shadow p-6">
                    <div id="client-form-container"></div>
                </div>
            </div>
        `;
    }

    async init() {
        let data = {};
        if (this.isEdit) {
            const client = await clientService.getClient(this.id);
            data = {
                firstName: client.firstName,
                lastName: client.lastName,
                email: client.email,
                phone: client.phone,
                address: client.address,
                city: client.city,
                state: client.state,
                zipCode: client.zipCode,
                preferredContactMethod: client.preferredContactMethod || 'phone',
                notes: client.notes,
            };
        }

        this.form = new Form({
            containerId: 'client-form-container',
            fields: getClientFields(),
            data,
            submitText: this.isEdit ? t('clients.updateClient') : t('clients.createClient'),
            onSubmit: async (formData) => {
                if (this.isEdit) {
                    await clientService.updateClient(this.id, formData);
                    window.showNotification(t('clients.updated'), 'success');
                    window.location.hash = `/clients/${this.id}`;
                } else {
                    const created = await clientService.createClient(formData);
                    window.showNotification(t('clients.created'), 'success');
                    window.location.hash = `/clients/${created.id}`;
                }
            },
        });

        this.form.init();
        const cancelBtn = document.querySelector('#cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                window.location.hash = this.isEdit ? `/clients/${this.id}` : '/clients';
            });
        }
    }

    destroy() {}
}

/**
 * Client Form Component
 */

import { Form } from '../common/form.js';
import clientService from '../../services/clientService.js';

const CLIENT_FIELDS = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'address', label: 'Address', type: 'text' },
    { name: 'city', label: 'City', type: 'text' },
    { name: 'state', label: 'State', type: 'text' },
    { name: 'zipCode', label: 'ZIP Code', type: 'text' },
    { name: 'preferredContactMethod', label: 'Preferred Contact', type: 'select', options: [
        { value: 'phone', label: 'Phone' },
        { value: 'email', label: 'Email' },
        { value: 'sms', label: 'SMS' },
    ]},
    { name: 'notes', label: 'Notes', type: 'textarea' },
];

export class ClientForm {
    constructor(params = {}) {
        this.id = params.id;
        this.isEdit = Boolean(params.id);
        this.form = null;
    }

    async render() {
        return `
            <div class="max-w-3xl mx-auto space-y-6">
                <h1 class="text-2xl font-semibold text-gray-900">${this.isEdit ? 'Edit' : 'Add'} Client</h1>
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
            fields: CLIENT_FIELDS,
            data,
            submitText: this.isEdit ? 'Update Client' : 'Create Client',
            onSubmit: async (formData) => {
                if (this.isEdit) {
                    await clientService.updateClient(this.id, formData);
                    window.showNotification('Client updated successfully', 'success');
                    window.location.hash = `/clients/${this.id}`;
                } else {
                    const created = await clientService.createClient(formData);
                    window.showNotification('Client created successfully', 'success');
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

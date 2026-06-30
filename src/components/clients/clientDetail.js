/**
 * Client Detail Component
 */

import clientService from '../../services/clientService.js';
import { formatDate, formatPhone, formatAddress, formatCurrency, formatMileage } from '../../utils/formatters.js';
import { renderPageHeader, renderDetailCard, renderDetailGrid, renderPrimaryButton } from '../../utils/pageHelpers.js';
import { t } from '../../i18n/index.js';

export class ClientDetail {
    constructor(params = {}) {
        this.id = params.id;
        this.client = null;
    }

    async render() {
        return `<div id="client-detail" class="max-w-5xl mx-auto space-y-6"><div class="flex justify-center py-12"><div class="page-loader"></div></div></div>`;
    }

    async init() {
        try {
            this.client = await clientService.getClient(this.id);
            const vehicles = this.client.vehicles || await clientService.getClientVehicles(this.id);
            const appointments = this.client.recentAppointments || await clientService.getClientAppointments(this.id, { limit: 5 });

            const container = document.getElementById('client-detail');
            container.innerHTML = `
                ${renderPageHeader(
                    `${this.client.firstName} ${this.client.lastName}`,
                    t('common.customerSince', { date: formatDate(this.client.createdAt, 'short') }),
                    `
                    <button onclick="window.location.hash = '/clients/${this.id}/edit'" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        <i data-feather="edit" class="w-4 h-4 mr-1 inline"></i>${t('common.edit')}
                    </button>
                    <button onclick="window.location.hash = '/clients'" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">${t('common.back')}</button>
                    `
                )}
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 space-y-6">
                        ${renderDetailCard(t('clients.contactInfo'), renderDetailGrid([
                            { label: t('fields.email'), value: this.client.email || '-' },
                            { label: t('fields.phone'), value: formatPhone(this.client.phone) || '-' },
                            { label: t('fields.address'), value: formatAddress(this.client) || '-' },
                            { label: t('fields.preferredContact'), value: this.client.preferredContactMethod || '-' },
                            { label: t('fields.notes'), value: this.client.notes || '-' },
                        ]))}
                        ${renderDetailCard(t('clients.vehicles'), this.renderVehicles(vehicles), renderPrimaryButton(`/vehicles/new`, t('clients.addVehicle')))}
                    </div>
                    <div class="space-y-6">
                        ${renderDetailCard(t('clients.quickStats'), renderDetailGrid([
                            { label: t('clients.vehicles'), value: vehicles.length },
                            { label: t('clients.recentAppointments'), value: appointments.length },
                            { label: t('clients.totalServices'), value: this.client.serviceHistory?.totalServices ?? '-' },
                            { label: t('clients.totalSpent'), value: this.client.serviceHistory?.totalSpent ? formatCurrency(this.client.serviceHistory.totalSpent) : '-' },
                        ]))}
                        ${renderDetailCard(t('clients.recentAppointments'), this.renderAppointments(appointments))}
                    </div>
                </div>
            `;
            replaceFeatherIcons();
        } catch (error) {
            console.error(error);
            document.getElementById('client-detail').innerHTML = `<p class="text-red-600">${t('clients.errorLoading')}</p>`;
        }
    }

    renderVehicles(vehicles) {
        if (!vehicles.length) return `<p class="text-gray-500 text-sm">${t('common.noData')}</p>`;
        return `<ul class="divide-y divide-gray-200">${vehicles.map(v => `
            <li class="py-3 flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-900">${v.year} ${v.make} ${v.model}</p>
                    <p class="text-sm text-gray-500">${v.licensePlate || t('common.noPlate')} · ${formatMileage(v.mileage || 0)}</p>
                </div>
                <button onclick="window.location.hash = '/vehicles/${v.id}'" class="text-blue-600 text-sm hover:text-blue-800">${t('common.view')}</button>
            </li>
        `).join('')}</ul>`;
    }

    renderAppointments(appointments) {
        if (!appointments.length) return `<p class="text-gray-500 text-sm">${t('common.noData')}</p>`;
        return `<ul class="divide-y divide-gray-200">${appointments.map(a => `
            <li class="py-3">
                <p class="text-sm font-medium text-gray-900">${a.serviceName || t('common.generalService')}</p>
                <p class="text-sm text-gray-500">${formatDate(a.appointmentDate, 'short')} ${a.appointmentTime}</p>
            </li>
        `).join('')}</ul>`;
    }

    destroy() {}
}

/**
 * Appointment List Component
 */

import { DataTable } from '../common/table.js';
import { Modal } from '../common/modal.js';
import appointmentService from '../../services/appointmentService.js';
import { formatDate } from '../../utils/formatters.js';
import { renderPageHeader, renderPrimaryButton, statusBadge, priorityBadge } from '../../utils/pageHelpers.js';

export class AppointmentList {
    constructor(params = {}) {
        this.params = params;
        this.filter = params.filter;
        this.table = null;
        this.currentPage = 1;
        this.currentSearch = '';
    }

    async render() {
        const title = this.filter === 'today' ? "Today's Appointments" : 'Appointments';
        return `
            <div class="space-y-6">
                ${renderPageHeader(title, 'Manage service appointments', `
                    ${renderPrimaryButton('/appointments/calendar', 'Calendar', 'calendar')}
                    ${renderPrimaryButton('/appointments/new', 'New Appointment')}
                `)}
                <div id="appointments-table"></div>
            </div>
        `;
    }

    async init() {
        this.table = new DataTable({
            containerId: 'appointments-table',
            columns: [
                {
                    key: 'appointmentDate',
                    label: 'Date / Time',
                    formatter: (v, row) => `
                        <div class="text-sm font-medium text-gray-900">${formatDate(v, 'short')}</div>
                        <div class="text-sm text-gray-500">${row.appointmentTime}</div>
                    `
                },
                { key: 'clientName', label: 'Client' },
                { key: 'vehicleInfo', label: 'Vehicle', formatter: v => v || '-' },
                { key: 'serviceName', label: 'Service', formatter: v => v || '-' },
                { key: 'status', label: 'Status', formatter: v => statusBadge(v) },
                { key: 'priority', label: 'Priority', formatter: v => priorityBadge(v) },
                {
                    key: 'actions',
                    label: 'Actions',
                    actions: [
                        { name: 'edit', icon: 'edit', label: 'Edit', color: 'green', handler: (row) => window.location.hash = `/appointments/${row.id}/edit` },
                        { name: 'cancel', icon: 'x', label: 'Cancel', color: 'red', handler: (row) => this.confirmCancel(row) },
                    ]
                }
            ],
            searchable: true,
            onPageChange: (page) => { this.currentPage = page; this.loadData(); },
            onSearch: (q) => { this.currentSearch = q; this.currentPage = 1; this.loadData(); },
            emptyMessage: 'No appointments found.',
        });
        await this.loadData();
    }

    async loadData() {
        try {
            this.table.setLoading(true);
            let rows, pagination;
            if (this.filter === 'today') {
                rows = await appointmentService.getTodayAppointments();
                pagination = { page: 1, limit: rows.length, total: rows.length, totalPages: 1 };
            } else {
                const response = await appointmentService.getAppointments({ page: this.currentPage, limit: 20, search: this.currentSearch });
                rows = response.appointments;
                pagination = response.pagination;
            }
            this.table.update(rows, pagination);
        } catch (error) {
            window.showNotification('Error loading appointments', 'error');
            this.table.setLoading(false);
        }
    }

    confirmCancel(appointment) {
        Modal.confirm('Cancel Appointment', `Cancel appointment for ${appointment.clientName}?`, async () => {
            await appointmentService.cancelAppointment(appointment.id);
            window.showNotification('Appointment cancelled', 'success');
            this.loadData();
        });
    }

    destroy() { if (this.table) this.table.destroy(); }
}

/**
 * Client List Component for MoMech
 * Displays paginated list of clients with search and filtering
 */

import { DataTable } from '../common/table.js';
import { Modal } from '../common/modal.js';
import clientService from '../../services/clientService.js';
import { formatDate, formatPhone } from '../../utils/formatters.js';

export class ClientList {
    constructor(params = {}) {
        this.params = params;
        this.table = null;
        this.currentPage = 1;
        this.currentSearch = '';
        this.currentFilters = {};
    }
    
    async render() {
        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-semibold text-gray-900">Clients</h1>
                        <p class="mt-1 text-sm text-gray-500">Manage your customer database</p>
                    </div>
                    <button 
                        onclick="window.location.hash = '/clients/new'"
                        class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <i data-feather="plus" class="w-4 h-4 mr-2 inline"></i>
                        Add Client
                    </button>
                </div>
                
                <!-- Filters -->
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select id="status-filter" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                <option value="all">All Clients</option>
                                <option value="true" selected>Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                            <select id="sort-filter" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                <option value="last_name">Last Name</option>
                                <option value="first_name">First Name</option>
                                <option value="created_at">Date Added</option>
                                <option value="email">Email</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Order</label>
                            <select id="order-filter" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                <option value="ASC">Ascending</option>
                                <option value="DESC">Descending</option>
                            </select>
                        </div>
                        <div class="flex items-end">
                            <button 
                                id="reset-filters"
                                type="button" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Table Container -->
                <div id="clients-table"></div>
            </div>
        `;
    }
    
    async init() {
        // Initialize table
        this.table = new DataTable({
            containerId: 'clients-table',
            columns: [
                {
                    key: 'first_name',
                    label: 'Name',
                    formatter: (value, row) => `
                        <div class="flex items-center">
                            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span class="text-sm font-medium text-blue-600">
                                    ${(row.first_name?.[0] || '').toUpperCase()}${(row.last_name?.[0] || '').toUpperCase()}
                                </span>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${row.first_name} ${row.last_name}</div>
                                <div class="text-sm text-gray-500">${row.email || 'No email'}</div>
                            </div>
                        </div>
                    `
                },
                {
                    key: 'phone',
                    label: 'Phone',
                    formatter: (value) => formatPhone(value) || '-'
                },
                {
                    key: 'address',
                    label: 'Location',
                    formatter: (value, row) => {
                        const parts = [];
                        if (row.city) parts.push(row.city);
                        if (row.state) parts.push(row.state);
                        return parts.join(', ') || '-';
                    }
                },
                {
                    key: 'vehicleCount',
                    label: 'Vehicles',
                    formatter: (value) => `
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ${value || 0}
                        </span>
                    `
                },
                {
                    key: 'created_at',
                    label: 'Added',
                    formatter: (value) => formatDate(value, 'relative')
                },
                {
                    key: 'actions',
                    label: 'Actions',
                    actions: [
                        {
                            name: 'view',
                            icon: 'eye',
                            label: 'View',
                            color: 'blue',
                            handler: (row) => window.location.hash = `/clients/${row.id}`
                        },
                        {
                            name: 'edit',
                            icon: 'edit',
                            label: 'Edit',
                            color: 'green',
                            handler: (row) => window.location.hash = `/clients/${row.id}/edit`
                        },
                        {
                            name: 'delete',
                            icon: 'trash-2',
                            label: 'Delete',
                            color: 'red',
                            handler: (row) => this.confirmDelete(row)
                        }
                    ]
                }
            ],
            searchable: true,
            sortable: true,
            selectable: true,
            onSort: (column, direction) => this.handleSort(column, direction),
            onPageChange: (page) => this.handlePageChange(page),
            onSearch: (query) => this.handleSearch(query),
            onRowClick: (row) => window.location.hash = `/clients/${row.id}`,
            emptyMessage: 'No clients found. Add your first client to get started.'
        });
        
        // Attach filter event listeners
        this.attachFilterListeners();
        
        // Load initial data
        await this.loadClients();
    }
    
    attachFilterListeners() {
        const statusFilter = document.getElementById('status-filter');
        const sortFilter = document.getElementById('sort-filter');
        const orderFilter = document.getElementById('order-filter');
        const resetButton = document.getElementById('reset-filters');
        
        [statusFilter, sortFilter, orderFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => this.applyFilters());
            }
        });
        
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetFilters());
        }
    }
    
    async loadClients() {
        try {
            this.table.setLoading(true);
            
            const params = {
                page: this.currentPage,
                limit: 20,
                search: this.currentSearch,
                ...this.currentFilters
            };
            
            const response = await clientService.getClients(params);
            
            this.table.update(response.clients, response.pagination);
            
        } catch (error) {
            console.error('Error loading clients:', error);
            window.showNotification('Error loading clients. Please try again.', 'error');
            this.table.setLoading(false);
        }
    }
    
    handleSort(column, direction) {
        this.currentFilters.sortBy = column;
        this.currentFilters.sortOrder = direction;
        this.currentPage = 1;
        this.loadClients();
    }
    
    handlePageChange(page) {
        this.currentPage = page;
        this.loadClients();
    }
    
    handleSearch(query) {
        this.currentSearch = query;
        this.currentPage = 1;
        this.loadClients();
    }
    
    applyFilters() {
        const statusFilter = document.getElementById('status-filter');
        const sortFilter = document.getElementById('sort-filter');
        const orderFilter = document.getElementById('order-filter');
        
        this.currentFilters = {
            active: statusFilter?.value || 'true',
            sortBy: sortFilter?.value || 'last_name',
            sortOrder: orderFilter?.value || 'ASC'
        };
        
        this.currentPage = 1;
        this.loadClients();
    }
    
    resetFilters() {
        document.getElementById('status-filter').value = 'true';
        document.getElementById('sort-filter').value = 'last_name';
        document.getElementById('order-filter').value = 'ASC';
        
        this.currentFilters = {};
        this.currentSearch = '';
        this.currentPage = 1;
        
        // Clear search input
        const searchInput = document.getElementById('table-search');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.loadClients();
    }
    
    confirmDelete(client) {
        Modal.confirm(
            'Delete Client',
            `Are you sure you want to delete ${client.first_name} ${client.last_name}? This action cannot be undone.`,
            async () => {
                try {
                    await clientService.deleteClient(client.id);
                    window.showNotification('Client deleted successfully', 'success');
                    this.loadClients();
                } catch (error) {
                    console.error('Error deleting client:', error);
                    window.showNotification('Error deleting client. Please try again.', 'error');
                }
            }
        );
    }
    
    destroy() {
        if (this.table) {
            this.table.destroy();
        }
    }
}
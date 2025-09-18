/**
 * Dashboard Component for MoMech
 * Main dashboard with statistics, calendar, and quick actions
 */

import apiService from '../../services/api.js';

export class Dashboard {
    constructor() {
        this.stats = null;
        this.recentActivity = [];
        this.upcomingAppointments = [];
        this.lowStockItems = [];
    }
    
    async render() {
        return `
            <div class="space-y-6">
                <!-- Quick Stats -->
                <div id="dashboard-stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    ${this.renderStatsLoading()}
                </div>

                <!-- Main Content Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Left Column -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Calendar Section -->
                        <div class="bg-white rounded-lg shadow overflow-hidden">
                            <div class="p-6 border-b border-gray-200">
                                <div class="flex items-center justify-between">
                                    <h2 class="text-lg font-semibold text-gray-900">Appointments</h2>
                                    <button onclick="window.location.hash = '/appointments/new'" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        <i data-feather="plus" class="w-4 h-4 mr-1 inline"></i> New Appointment
                                    </button>
                                </div>
                            </div>
                            <div id="dashboard-calendar" class="p-6">
                                ${this.renderCalendarLoading()}
                            </div>
                        </div>

                        <!-- Recent Activity -->
                        <div class="bg-white rounded-lg shadow overflow-hidden">
                            <div class="p-6 border-b border-gray-200">
                                <h2 class="text-lg font-semibold text-gray-900">Recent Activity</h2>
                            </div>
                            <div id="recent-activity" class="divide-y divide-gray-200">
                                ${this.renderActivityLoading()}
                            </div>
                        </div>
                    </div>

                    <!-- Right Column -->
                    <div class="space-y-6">
                        <!-- Quick Actions -->
                        <div class="bg-white rounded-lg shadow overflow-hidden">
                            <div class="p-6 border-b border-gray-200">
                                <h2 class="text-lg font-semibold text-gray-900">Quick Actions</h2>
                            </div>
                            <div class="p-6 grid grid-cols-2 gap-4">
                                <button onclick="window.location.hash = '/clients/new'" class="p-4 bg-blue-50 rounded-lg flex flex-col items-center justify-center text-blue-600 hover:bg-blue-100 transition">
                                    <i data-feather="user-plus" class="w-6 h-6 mb-2"></i>
                                    <span class="text-sm font-medium">Add Client</span>
                                </button>
                                <button onclick="window.location.hash = '/vehicles/new'" class="p-4 bg-green-50 rounded-lg flex flex-col items-center justify-center text-green-600 hover:bg-green-100 transition">
                                    <i data-feather="car" class="w-6 h-6 mb-2"></i>
                                    <span class="text-sm font-medium">Add Vehicle</span>
                                </button>
                                <button onclick="window.location.hash = '/appointments/new'" class="p-4 bg-purple-50 rounded-lg flex flex-col items-center justify-center text-purple-600 hover:bg-purple-100 transition">
                                    <i data-feather="calendar" class="w-6 h-6 mb-2"></i>
                                    <span class="text-sm font-medium">New Appointment</span>
                                </button>
                                <button onclick="window.location.hash = '/financial/invoices/new'" class="p-4 bg-yellow-50 rounded-lg flex flex-col items-center justify-center text-yellow-600 hover:bg-yellow-100 transition">
                                    <i data-feather="file-text" class="w-6 h-6 mb-2"></i>
                                    <span class="text-sm font-medium">Create Invoice</span>
                                </button>
                                <button onclick="window.location.hash = '/inventory/new'" class="p-4 bg-red-50 rounded-lg flex flex-col items-center justify-center text-red-600 hover:bg-red-100 transition">
                                    <i data-feather="package" class="w-6 h-6 mb-2"></i>
                                    <span class="text-sm font-medium">Add Inventory</span>
                                </button>
                                <button onclick="window.location.hash = '/work-orders/new'" class="p-4 bg-indigo-50 rounded-lg flex flex-col items-center justify-center text-indigo-600 hover:bg-indigo-100 transition">
                                    <i data-feather="clipboard" class="w-6 h-6 mb-2"></i>
                                    <span class="text-sm font-medium">New Work Order</span>
                                </button>
                            </div>
                        </div>

                        <!-- Upcoming Appointments -->
                        <div class="bg-white rounded-lg shadow overflow-hidden">
                            <div class="p-6 border-b border-gray-200">
                                <div class="flex items-center justify-between">
                                    <h2 class="text-lg font-semibold text-gray-900">Upcoming</h2>
                                    <a href="#/appointments" class="text-sm font-medium text-blue-600 hover:text-blue-500">View all</a>
                                </div>
                            </div>
                            <div id="upcoming-appointments">
                                ${this.renderUpcomingLoading()}
                            </div>
                        </div>

                        <!-- Low Inventory -->
                        <div class="bg-white rounded-lg shadow overflow-hidden">
                            <div class="p-6 border-b border-gray-200">
                                <div class="flex items-center justify-between">
                                    <h2 class="text-lg font-semibold text-gray-900">Low Inventory</h2>
                                    <a href="#/inventory/low-stock" class="text-sm font-medium text-blue-600 hover:text-blue-500">View all</a>
                                </div>
                            </div>
                            <div id="low-inventory">
                                ${this.renderInventoryLoading()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async init() {
        try {
            // Load all dashboard data
            await Promise.all([
                this.loadStats(),
                this.loadRecentActivity(),
                this.loadUpcomingAppointments(),
                this.loadLowStockItems(),
                this.loadCalendarData()
            ]);
            
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            window.showNotification('Error loading dashboard data', 'error');
        }
    }
    
    async loadStats() {
        try {
            const response = await apiService.get('/dashboard/stats');
            this.stats = response;
            this.renderStats();
        } catch (error) {
            console.error('Error loading stats:', error);
            this.renderStatsError();
        }
    }
    
    async loadRecentActivity() {
        try {
            const response = await apiService.get('/dashboard/recent-activity');
            this.recentActivity = response;
            this.renderRecentActivity();
        } catch (error) {
            console.error('Error loading recent activity:', error);
            this.renderActivityError();
        }
    }
    
    async loadUpcomingAppointments() {
        try {
            const response = await apiService.get('/dashboard/upcoming-appointments');
            this.upcomingAppointments = response;
            this.renderUpcomingAppointments();
        } catch (error) {
            console.error('Error loading upcoming appointments:', error);
            this.renderUpcomingError();
        }
    }
    
    async loadLowStockItems() {
        try {
            const response = await apiService.get('/inventory/low-stock', { limit: 5 });
            this.lowStockItems = response;
            this.renderLowStockItems();
        } catch (error) {
            console.error('Error loading low stock items:', error);
            this.renderInventoryError();
        }
    }
    
    async loadCalendarData() {
        try {
            const today = new Date();
            const response = await apiService.get(`/appointments/calendar/${today.toISOString().split('T')[0]}`, { view: 'month' });
            this.renderCalendar(response);
        } catch (error) {
            console.error('Error loading calendar data:', error);
            this.renderCalendarError();
        }
    }
    
    renderStats() {
        const container = document.getElementById('dashboard-stats');
        if (!container || !this.stats) return;
        
        container.innerHTML = `
            <div class="dashboard-card bg-white rounded-lg shadow p-6 transition duration-300 ease-in-out">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-500">Today's Appointments</p>
                        <p class="text-3xl font-semibold text-gray-900">${this.stats.todayAppointments || 0}</p>
                    </div>
                    <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                        <i data-feather="calendar"></i>
                    </div>
                </div>
                <div class="mt-4">
                    <div class="flex items-center text-sm text-gray-500">
                        <i data-feather="clock" class="w-4 h-4 mr-1"></i>
                        <span>${this.stats.nextAppointment ? `Next: ${this.stats.nextAppointment.time} - ${this.stats.nextAppointment.service}` : 'No upcoming appointments'}</span>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-card bg-white rounded-lg shadow p-6 transition duration-300 ease-in-out">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-500">Monthly Revenue</p>
                        <p class="text-3xl font-semibold text-gray-900">$${(this.stats.monthlyRevenue || 0).toLocaleString()}</p>
                    </div>
                    <div class="p-3 rounded-full bg-green-100 text-green-600">
                        <i data-feather="dollar-sign"></i>
                    </div>
                </div>
                <div class="mt-4">
                    <div class="flex items-center text-sm text-gray-500">
                        <i data-feather="${this.stats.revenueGrowth >= 0 ? 'trending-up' : 'trending-down'}" class="w-4 h-4 mr-1"></i>
                        <span>${Math.abs(this.stats.revenueGrowth || 0)}% from last month</span>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-card bg-white rounded-lg shadow p-6 transition duration-300 ease-in-out">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-500">Active Clients</p>
                        <p class="text-3xl font-semibold text-gray-900">${this.stats.activeClients || 0}</p>
                    </div>
                    <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                        <i data-feather="users"></i>
                    </div>
                </div>
                <div class="mt-4">
                    <div class="flex items-center text-sm text-gray-500">
                        <i data-feather="user-plus" class="w-4 h-4 mr-1"></i>
                        <span>Growing steadily</span>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-card bg-white rounded-lg shadow p-6 transition duration-300 ease-in-out">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-500">Low Inventory Items</p>
                        <p class="text-3xl font-semibold text-gray-900">${this.stats.lowInventoryItems || 0}</p>
                    </div>
                    <div class="p-3 rounded-full bg-red-100 text-red-600">
                        <i data-feather="alert-triangle"></i>
                    </div>
                </div>
                <div class="mt-4">
                    <div class="flex items-center text-sm text-gray-500">
                        <i data-feather="package" class="w-4 h-4 mr-1"></i>
                        <span>Reorder soon</span>
                    </div>
                </div>
            </div>
        `;
        
        replaceFeatherIcons();
    }
    
    renderStatsLoading() {
        return `
            <div class="bg-white rounded-lg shadow p-6 animate-pulse">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div class="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        `.repeat(4);
    }
    
    renderStatsError() {
        const container = document.getElementById('dashboard-stats');
        if (container) {
            container.innerHTML = `
                <div class="col-span-4 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <i data-feather="alert-circle" class="w-8 h-8 text-red-500 mx-auto mb-2"></i>
                    <p class="text-red-700">Error loading statistics</p>
                </div>
            `;
            replaceFeatherIcons();
        }
    }
    
    renderRecentActivity() {
        const container = document.getElementById('recent-activity');
        if (!container) return;
        
        if (!this.recentActivity || this.recentActivity.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <i data-feather="activity" class="w-12 h-12 mx-auto mb-4 text-gray-300"></i>
                    <p>No recent activity</p>
                </div>
            `;
            replaceFeatherIcons();
            return;
        }
        
        container.innerHTML = this.recentActivity.map(activity => `
            <div class="p-4 hover:bg-gray-50 flex items-center">
                <div class="flex-shrink-0">
                    <i data-feather="${this.getActivityIcon(activity.type)}" class="w-5 h-5 text-blue-500"></i>
                </div>
                <div class="ml-4 flex-1">
                    <div class="flex items-center justify-between">
                        <h3 class="text-sm font-medium text-gray-900">${activity.client_name}</h3>
                        <span class="text-xs text-gray-500">${this.formatDate(activity.created_at)}</span>
                    </div>
                    <p class="text-sm text-gray-500">${activity.vehicle} - ${activity.service_name}</p>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getStatusClass(activity.status)}">
                        ${activity.status}
                    </span>
                </div>
            </div>
        `).join('');
        
        replaceFeatherIcons();
    }
    
    renderActivityLoading() {
        return `
            <div class="p-4 animate-pulse">
                <div class="flex items-center">
                    <div class="w-5 h-5 bg-gray-200 rounded-full"></div>
                    <div class="ml-4 flex-1">
                        <div class="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div class="h-3 bg-gray-200 rounded w-48"></div>
                    </div>
                </div>
            </div>
        `.repeat(3);
    }
    
    renderActivityError() {
        const container = document.getElementById('recent-activity');
        if (container) {
            container.innerHTML = `
                <div class="p-4 text-center text-red-500">
                    <i data-feather="alert-circle" class="w-8 h-8 mx-auto mb-2"></i>
                    <p>Error loading recent activity</p>
                </div>
            `;
            replaceFeatherIcons();
        }
    }
    
    renderCalendar(data) {
        const container = document.getElementById('dashboard-calendar');
        if (!container) return;
        
        // Simple calendar view - in a real app this would be more sophisticated
        container.innerHTML = `
            <div class="text-center">
                <h3 class="text-lg font-medium text-gray-900 mb-4">This Month's Overview</h3>
                <div class="grid grid-cols-7 gap-2 mb-4">
                    <div class="text-center font-medium text-gray-500 text-sm">Sun</div>
                    <div class="text-center font-medium text-gray-500 text-sm">Mon</div>
                    <div class="text-center font-medium text-gray-500 text-sm">Tue</div>
                    <div class="text-center font-medium text-gray-500 text-sm">Wed</div>
                    <div class="text-center font-medium text-gray-500 text-sm">Thu</div>
                    <div class="text-center font-medium text-gray-500 text-sm">Fri</div>
                    <div class="text-center font-medium text-gray-500 text-sm">Sat</div>
                </div>
                <div class="text-sm text-gray-600">
                    <p>Total Appointments: ${data?.appointments?.length || 0}</p>
                    <a href="#/appointments/calendar" class="text-blue-600 hover:text-blue-500 font-medium mt-2 inline-block">
                        View Full Calendar
                    </a>
                </div>
            </div>
        `;
    }
    
    renderCalendarLoading() {
        return `
            <div class="animate-pulse">
                <div class="h-6 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
                <div class="grid grid-cols-7 gap-2 mb-4">
                    ${Array(7).fill().map(() => '<div class="h-4 bg-gray-200 rounded"></div>').join('')}
                </div>
                <div class="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
        `;
    }
    
    renderCalendarError() {
        const container = document.getElementById('dashboard-calendar');
        if (container) {
            container.innerHTML = `
                <div class="text-center text-red-500">
                    <i data-feather="calendar-x" class="w-8 h-8 mx-auto mb-2"></i>
                    <p>Error loading calendar</p>
                </div>
            `;
            replaceFeatherIcons();
        }
    }
    
    renderUpcomingAppointments() {
        const container = document.getElementById('upcoming-appointments');
        if (!container) return;
        
        if (!this.upcomingAppointments || this.upcomingAppointments.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <i data-feather="calendar" class="w-12 h-12 mx-auto mb-4 text-gray-300"></i>
                    <p>No upcoming appointments</p>
                </div>
            `;
            replaceFeatherIcons();
            return;
        }
        
        container.innerHTML = `
            <div class="divide-y divide-gray-200">
                ${this.upcomingAppointments.slice(0, 5).map(appointment => `
                    <div class="p-4 hover:bg-gray-50">
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <h4 class="text-sm font-medium text-gray-900">${appointment.client_name}</h4>
                                <p class="text-sm text-gray-500">${appointment.vehicle}</p>
                                <p class="text-xs text-gray-400">${appointment.service_name || 'General Service'}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-medium text-gray-900">${this.formatTime(appointment.appointment_time)}</p>
                                <p class="text-xs text-gray-500">${this.formatDate(appointment.appointment_date)}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderUpcomingLoading() {
        return `
            <div class="divide-y divide-gray-200">
                ${Array(3).fill().map(() => `
                    <div class="p-4 animate-pulse">
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <div class="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                <div class="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                                <div class="h-3 bg-gray-200 rounded w-20"></div>
                            </div>
                            <div class="text-right">
                                <div class="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                                <div class="h-3 bg-gray-200 rounded w-20"></div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderUpcomingError() {
        const container = document.getElementById('upcoming-appointments');
        if (container) {
            container.innerHTML = `
                <div class="p-4 text-center text-red-500">
                    <i data-feather="alert-circle" class="w-8 h-8 mx-auto mb-2"></i>
                    <p>Error loading appointments</p>
                </div>
            `;
            replaceFeatherIcons();
        }
    }
    
    renderLowStockItems() {
        const container = document.getElementById('low-inventory');
        if (!container) return;
        
        if (!this.lowStockItems || this.lowStockItems.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <i data-feather="package" class="w-12 h-12 mx-auto mb-4 text-gray-300"></i>
                    <p>All inventory levels good</p>
                </div>
            `;
            replaceFeatherIcons();
            return;
        }
        
        container.innerHTML = `
            <div class="divide-y divide-gray-200">
                ${this.lowStockItems.map(item => `
                    <div class="p-4 hover:bg-gray-50 flex items-center inventory-${this.getStockLevel(item)}">
                        <div class="flex-shrink-0">
                            <i data-feather="alert-circle" class="w-5 h-5 ${this.getStockColor(item)}"></i>
                        </div>
                        <div class="ml-4 flex-1">
                            <div class="flex items-center justify-between">
                                <h3 class="text-sm font-medium text-gray-900">${item.name}</h3>
                                <span class="text-xs font-semibold ${this.getStockColor(item)}">${item.quantity_on_hand} left</span>
                            </div>
                            <p class="text-sm text-gray-500">${item.part_number || 'No part number'}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        replaceFeatherIcons();
    }
    
    renderInventoryLoading() {
        return `
            <div class="divide-y divide-gray-200">
                ${Array(4).fill().map(() => `
                    <div class="p-4 animate-pulse flex items-center">
                        <div class="w-5 h-5 bg-gray-200 rounded-full"></div>
                        <div class="ml-4 flex-1">
                            <div class="flex items-center justify-between">
                                <div class="h-4 bg-gray-200 rounded w-32"></div>
                                <div class="h-3 bg-gray-200 rounded w-12"></div>
                            </div>
                            <div class="h-3 bg-gray-200 rounded w-20 mt-2"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderInventoryError() {
        const container = document.getElementById('low-inventory');
        if (container) {
            container.innerHTML = `
                <div class="p-4 text-center text-red-500">
                    <i data-feather="alert-circle" class="w-8 h-8 mx-auto mb-2"></i>
                    <p>Error loading inventory</p>
                </div>
            `;
            replaceFeatherIcons();
        }
    }
    
    // Helper methods
    getActivityIcon(type) {
        const icons = {
            appointment: 'calendar',
            work_order: 'clipboard',
            invoice: 'file-text'
        };
        return icons[type] || 'activity';
    }
    
    getStatusClass(status) {
        const classes = {
            scheduled: 'bg-blue-100 text-blue-800',
            confirmed: 'bg-green-100 text-green-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }
    
    getStockLevel(item) {
        if (item.quantity_on_hand <= item.minimum_quantity / 2) return 'low';
        if (item.quantity_on_hand <= item.minimum_quantity) return 'medium';
        return 'good';
    }
    
    getStockColor(item) {
        const level = this.getStockLevel(item);
        const colors = {
            low: 'text-red-500',
            medium: 'text-yellow-500',
            good: 'text-green-500'
        };
        return colors[level];
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }
    
    formatTime(timeString) {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    
    destroy() {
        // Clean up any event listeners or intervals
    }
}
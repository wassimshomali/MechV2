/**
 * Header Component for MoMech
 * Handles top navigation and page title
 */

export class Header {
    constructor() {
        this.title = 'Dashboard';
        this.notifications = [];
    }
    
    async render() {
        const headerHTML = `
            <header class="bg-white shadow-sm z-10">
                <div class="px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center">
                        <h1 id="page-title" class="text-2xl font-semibold text-gray-900">${this.title}</h1>
                        <div id="breadcrumb" class="ml-4 text-sm text-gray-500"></div>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <!-- Quick Search -->
                        <div class="relative hidden md:block">
                            <input 
                                type="text" 
                                id="global-search"
                                placeholder="Search clients, vehicles..." 
                                class="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                            <i data-feather="search" class="absolute left-3 top-2.5 text-gray-400 w-4 h-4"></i>
                        </div>
                        
                        <!-- Notifications -->
                        <div class="relative">
                            <button 
                                id="notifications-btn"
                                class="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 relative"
                            >
                                <i data-feather="bell" class="w-5 h-5"></i>
                                <span id="notification-badge" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hidden">
                                    0
                                </span>
                            </button>
                            
                            <!-- Notifications Dropdown -->
                            <div id="notifications-dropdown" class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50 hidden">
                                <div class="p-4 border-b border-gray-200">
                                    <div class="flex items-center justify-between">
                                        <h3 class="text-lg font-medium text-gray-900">Notifications</h3>
                                        <button id="mark-all-read" class="text-sm text-blue-600 hover:text-blue-500">
                                            Mark all read
                                        </button>
                                    </div>
                                </div>
                                <div id="notifications-list" class="max-h-96 overflow-y-auto">
                                    <div class="p-4 text-center text-gray-500">
                                        No new notifications
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Quick Actions -->
                        <div class="relative">
                            <button 
                                id="quick-actions-btn"
                                class="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                            >
                                <i data-feather="plus" class="w-5 h-5"></i>
                            </button>
                            
                            <!-- Quick Actions Dropdown -->
                            <div id="quick-actions-dropdown" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 hidden">
                                <div class="py-2">
                                    <a href="#/clients/new" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i data-feather="user-plus" class="w-4 h-4 mr-3"></i>
                                        Add Client
                                    </a>
                                    <a href="#/vehicles/new" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i data-feather="car" class="w-4 h-4 mr-3"></i>
                                        Add Vehicle
                                    </a>
                                    <a href="#/appointments/new" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i data-feather="calendar" class="w-4 h-4 mr-3"></i>
                                        New Appointment
                                    </a>
                                    <a href="#/work-orders/new" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i data-feather="clipboard" class="w-4 h-4 mr-3"></i>
                                        New Work Order
                                    </a>
                                    <a href="#/financial/invoices/new" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i data-feather="file-text" class="w-4 h-4 mr-3"></i>
                                        Create Invoice
                                    </a>
                                    <a href="#/inventory/new" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i data-feather="package" class="w-4 h-4 mr-3"></i>
                                        Add Inventory
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Help -->
                        <button 
                            id="help-btn"
                            class="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                            title="Help & Support"
                        >
                            <i data-feather="help-circle" class="w-5 h-5"></i>
                        </button>
                        
                        <!-- Settings -->
                        <button 
                            id="settings-btn"
                            class="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                            title="Settings"
                        >
                            <i data-feather="settings" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>
            </header>
        `;
        
        // Insert into header container
        const container = document.getElementById('header-container');
        container.innerHTML = headerHTML;
        
        // Initialize header functionality
        this.init();
        
        // Replace feather icons
        replaceFeatherIcons();
    }
    
    init() {
        // Global search functionality
        const globalSearch = document.getElementById('global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => this.handleGlobalSearch(e.target.value));
            globalSearch.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }
        
        // Notifications dropdown
        const notificationsBtn = document.getElementById('notifications-btn');
        const notificationsDropdown = document.getElementById('notifications-dropdown');
        if (notificationsBtn && notificationsDropdown) {
            notificationsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown(notificationsDropdown);
            });
        }
        
        // Quick actions dropdown
        const quickActionsBtn = document.getElementById('quick-actions-btn');
        const quickActionsDropdown = document.getElementById('quick-actions-dropdown');
        if (quickActionsBtn && quickActionsDropdown) {
            quickActionsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown(quickActionsDropdown);
            });
        }
        
        // Help button
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelp());
        }
        
        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }
        
        // Mark all notifications as read
        const markAllRead = document.getElementById('mark-all-read');
        if (markAllRead) {
            markAllRead.addEventListener('click', () => this.markAllNotificationsRead());
        }
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            const dropdowns = document.querySelectorAll('[id$="-dropdown"]');
            dropdowns.forEach(dropdown => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            });
        });
        
        // Load notifications
        this.loadNotifications();
    }
    
    updateTitle(title) {
        this.title = title;
        const titleElement = document.getElementById('page-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }
    
    setBreadcrumb(breadcrumb) {
        const breadcrumbElement = document.getElementById('breadcrumb');
        if (breadcrumbElement) {
            breadcrumbElement.innerHTML = breadcrumb;
        }
    }
    
    toggleDropdown(dropdown) {
        // Hide other dropdowns
        const allDropdowns = document.querySelectorAll('[id$="-dropdown"]');
        allDropdowns.forEach(d => {
            if (d !== dropdown) {
                d.classList.add('hidden');
            }
        });
        
        // Toggle current dropdown
        dropdown.classList.toggle('hidden');
    }
    
    handleGlobalSearch(query) {
        // Implement global search suggestions
        if (query.length > 2) {
            // You could show search suggestions here
            console.log('Searching for:', query);
        }
    }
    
    performSearch(query) {
        if (query.trim()) {
            // Navigate to search results page or show search modal
            console.log('Performing search for:', query);
            // For now, just show a notification
            window.showNotification(`Searching for "${query}"...`, 'info');
        }
    }
    
    async loadNotifications() {
        try {
            // In a real app, this would fetch from the API
            // For now, we'll simulate some notifications
            this.notifications = [
                {
                    id: 1,
                    type: 'appointment',
                    title: 'Upcoming Appointment',
                    message: 'Oil change for John Smith at 2:00 PM',
                    time: '10 minutes ago',
                    read: false
                },
                {
                    id: 2,
                    type: 'inventory',
                    title: 'Low Stock Alert',
                    message: 'Brake pads are running low (2 remaining)',
                    time: '1 hour ago',
                    read: false
                },
                {
                    id: 3,
                    type: 'payment',
                    title: 'Payment Received',
                    message: 'Invoice #INV-2024-015 has been paid',
                    time: '2 hours ago',
                    read: true
                }
            ];
            
            this.updateNotificationUI();
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }
    
    updateNotificationUI() {
        const badge = document.getElementById('notification-badge');
        const list = document.getElementById('notifications-list');
        
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
        
        if (list) {
            if (this.notifications.length === 0) {
                list.innerHTML = `
                    <div class="p-4 text-center text-gray-500">
                        No new notifications
                    </div>
                `;
            } else {
                list.innerHTML = this.notifications.map(notification => `
                    <div class="p-4 border-b border-gray-200 hover:bg-gray-50 ${notification.read ? 'opacity-75' : ''}">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                <i data-feather="${this.getNotificationIcon(notification.type)}" class="w-5 h-5 text-blue-500"></i>
                            </div>
                            <div class="ml-3 flex-1">
                                <p class="text-sm font-medium text-gray-900">${notification.title}</p>
                                <p class="text-sm text-gray-600">${notification.message}</p>
                                <p class="text-xs text-gray-400 mt-1">${notification.time}</p>
                            </div>
                            ${!notification.read ? '<div class="w-2 h-2 bg-blue-500 rounded-full"></div>' : ''}
                        </div>
                    </div>
                `).join('');
                
                replaceFeatherIcons();
            }
        }
    }
    
    getNotificationIcon(type) {
        const icons = {
            appointment: 'calendar',
            inventory: 'package',
            payment: 'dollar-sign',
            work_order: 'clipboard',
            system: 'info'
        };
        return icons[type] || 'bell';
    }
    
    markAllNotificationsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.updateNotificationUI();
        window.showNotification('All notifications marked as read', 'success');
    }
    
    addNotification(notification) {
        this.notifications.unshift({
            id: Date.now(),
            read: false,
            time: 'Just now',
            ...notification
        });
        this.updateNotificationUI();
    }
    
    showHelp() {
        // Show help modal or navigate to help page
        window.showNotification('Help system coming soon!', 'info');
    }
    
    showSettings() {
        // Show settings modal or navigate to settings page
        window.showNotification('Settings coming soon!', 'info');
    }
    
    destroy() {
        // Clean up event listeners if needed
        document.removeEventListener('click', this.closeDropdowns);
    }
}
/**
 * Sidebar Component for MoMech
 * Handles navigation and sidebar functionality
 */

export class Sidebar {
    constructor() {
        this.isCollapsed = false;
        this.activeSection = 'dashboard';
        this.activeItem = 'overview';
    }
    
    async render() {
        const sidebarHTML = `
            <div class="sidebar bg-blue-800 text-white w-64 flex flex-col">
                <div class="p-4 flex items-center justify-between border-b border-blue-700">
                    <div class="flex items-center">
                        <i data-feather="tool" class="logo-icon w-8 h-8 text-blue-300"></i>
                        <span class="logo-text ml-2 text-xl font-bold">MoMech</span>
                    </div>
                    <button id="toggleSidebar" class="text-blue-300 hover:text-white">
                        <i data-feather="chevron-left"></i>
                    </button>
                </div>
                
                <div class="flex-1 overflow-y-auto py-4">
                    <div class="px-4 mb-6">
                        <div class="relative">
                            <input 
                                type="text" 
                                id="sidebar-search"
                                placeholder="Search..." 
                                class="w-full bg-blue-700 text-white placeholder-blue-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                            <i data-feather="search" class="absolute left-3 top-2.5 text-blue-300"></i>
                        </div>
                    </div>
                    
                    <nav>
                        <!-- Dashboard Section -->
                        <div class="px-4 mb-2">
                            <div class="text-xs uppercase font-semibold text-blue-300 tracking-wider mb-2">Dashboard</div>
                            <a href="#/" class="nav-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-700 text-white" data-section="dashboard" data-item="overview">
                                <i data-feather="home" class="w-4 h-4 mr-3"></i>
                                <span class="sidebar-text">Overview</span>
                            </a>
                        </div>
                        
                        <!-- Clients Section -->
                        <div class="px-4 mb-2">
                            <div class="text-xs uppercase font-semibold text-blue-300 tracking-wider mb-2">Clients</div>
                            <a href="#/clients" class="nav-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-700 text-white" data-section="clients" data-item="list">
                                <i data-feather="users" class="w-4 h-4 mr-3"></i>
                                <span class="sidebar-text">Client List</span>
                            </a>
                            <a href="#/clients/new" class="nav-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-700 text-white" data-section="clients" data-item="new">
                                <i data-feather="user-plus" class="w-4 h-4 mr-3"></i>
                                <span class="sidebar-text">Add Client</span>
                            </a>
                        </div>
                        
                        <!-- Vehicles Section -->
                        <div class="px-4 mb-2">
                            <div class="text-xs uppercase font-semibold text-blue-300 tracking-wider mb-2">Vehicles</div>
                            <a href="#/vehicles" class="nav-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-700 text-white" data-section="vehicles" data-item="list">
                                <i data-feather="car" class="w-4 h-4 mr-3"></i>
                                <span class="sidebar-text">Vehicle List</span>
                            </a>
                            <a href="#/vehicles/new" class="nav-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-700 text-white" data-section="vehicles" data-item="new">
                                <i data-feather="plus-circle" class="w-4 h-4 mr-3"></i>
                                <span class="sidebar-text">Add Vehicle</span>
                            </a>
                        </div>
                        
                        <!-- Appointments Section -->
                        <div class="px-4 mb-2">
                            <div class="text-xs uppercase font-semibold text-blue-300 tracking-wider mb-2">Appointments</div>
                            <a href="#/appointments" class="nav-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-700 text-white" data-section="appointments" data-item="list">
                                <i data-feather="calendar" class="w-4 h-4 mr-3"></i>
                                <span class="sidebar-text">Schedule</span>
                            </a>
                            <a href="#/appointments/calendar" class="nav-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-700 text-white" data-section="appointments" data-item="calendar">
                                <i data-feather="grid" class="w-4 h-4 mr-3"></i>
                                <span class="sidebar-text">Calendar View</span>
                            </a>
                            <a href="#/appointments/today" class="nav-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-700 text-white" data-section="appointments" data-item="today">
                                <i data-feather="clock" class="w-4 h-4 mr-3"></i>
                                <span class="sidebar-text">Today's Jobs</span>
                            </a>
                        </div>
                        
                        <!-- Work Orders Section -->
                        <div class="px-4 mb-2">
                            <div class="text-xs uppercase font-semibold text-blue-300 tracking-wider mb-2">Work Orders</div>
                            <a href="#/work-orders" class="nav-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-700 text-white" data-section="work-orders" data-item="list">
                                <i data-feather="clipboard" class="w-4 h-4 mr-3"></i>
                                <span class="sidebar-text">All Orders</span>
                            </a>
                            <a href="#/work-orders/new" class="nav-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-700 text-white" data-section="work-orders" data-item="new">
                                <i data-feather="plus-square" class="w-4 h-4 mr-3"></i>
                                <span class="sidebar-text">New Order</span>
                            </a>
                        </div>
                        
                        <!-- Inventory Section -->
                        <div class="px-4 mb-2">
                            <div class="text-xs uppercase font-semibold text-blue-300 tracking-wider mb-2">Inventory</div>
                            <a href="#/inventory" class="nav-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-700 text-white" data-section="inventory" data-item="list">
                                <i data-feather="package" class="w-4 h-4 mr-3"></i>
                                <span class="sidebar-text">Parts & Supplies</span>
                            </a>
                            <a href="#/inventory/low-stock" class="nav-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-700 text-white" data-section="inventory" data-item="low-stock">
                                <i data-feather="alert-circle" class="w-4 h-4 mr-3"></i>
                                <span class="sidebar-text">Low Stock</span>
                            </a>
                            <a href="#/inventory/new" class="nav-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-700 text-white" data-section="inventory" data-item="new">
                                <i data-feather="plus" class="w-4 h-4 mr-3"></i>
                                <span class="sidebar-text">Add Item</span>
                            </a>
                        </div>
                        
                        <!-- Financial Section -->
                        <div class="px-4 mb-2">
                            <div class="text-xs uppercase font-semibold text-blue-300 tracking-wider mb-2">Financial</div>
                            <a href="#/financial/invoices" class="nav-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-700 text-white" data-section="financial" data-item="invoices">
                                <i data-feather="dollar-sign" class="w-4 h-4 mr-3"></i>
                                <span class="sidebar-text">Invoices</span>
                            </a>
                            <a href="#/financial/payments" class="nav-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-700 text-white" data-section="financial" data-item="payments">
                                <i data-feather="credit-card" class="w-4 h-4 mr-3"></i>
                                <span class="sidebar-text">Payments</span>
                            </a>
                            <a href="#/financial/reports" class="nav-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-700 text-white" data-section="financial" data-item="reports">
                                <i data-feather="bar-chart-2" class="w-4 h-4 mr-3"></i>
                                <span class="sidebar-text">Reports</span>
                            </a>
                        </div>
                        
                        <!-- Services Section -->
                        <div class="px-4 mb-2">
                            <div class="text-xs uppercase font-semibold text-blue-300 tracking-wider mb-2">Services</div>
                            <a href="#/services" class="nav-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-700 text-white" data-section="services" data-item="list">
                                <i data-feather="settings" class="w-4 h-4 mr-3"></i>
                                <span class="sidebar-text">Service Templates</span>
                            </a>
                        </div>
                    </nav>
                </div>
                
                <div class="p-4 border-t border-blue-700">
                    <div class="flex items-center">
                        <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <i data-feather="user" class="w-6 h-6 text-white"></i>
                        </div>
                        <div class="ml-3 sidebar-text">
                            <div class="text-sm font-medium">Mechanic</div>
                            <div class="text-xs text-blue-300">Owner</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert into sidebar container
        const container = document.getElementById('sidebar-container');
        container.innerHTML = sidebarHTML;
        
        // Initialize sidebar functionality
        this.init();
        
        // Replace feather icons
        replaceFeatherIcons();
    }
    
    init() {
        // Toggle sidebar collapse
        const toggleButton = document.getElementById('toggleSidebar');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => this.toggleCollapse());
        }
        
        // Search functionality
        const searchInput = document.getElementById('sidebar-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
        
        // Navigation click handling
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const href = item.getAttribute('href');
                if (href) {
                    window.location.hash = href;
                }
            });
        });
        
        // Set initial active state
        this.setActivePage(this.activeSection, this.activeItem);
    }
    
    toggleCollapse() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.getElementById('main-content');
        const toggleIcon = document.querySelector('#toggleSidebar i');
        
        if (sidebar && mainContent && toggleIcon) {
            this.isCollapsed = !this.isCollapsed;
            
            sidebar.classList.toggle('collapsed');
            
            if (this.isCollapsed) {
                toggleIcon.setAttribute('data-feather', 'chevron-right');
            } else {
                toggleIcon.setAttribute('data-feather', 'chevron-left');
            }
            
            replaceFeatherIcons();
        }
    }
    
    setActivePage(section, item = null) {
        // Remove active class from all nav items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(navItem => {
            navItem.classList.remove('bg-blue-700');
        });
        
        // Add active class to current item
        const activeItem = document.querySelector(`[data-section="${section}"]${item ? `[data-item="${item}"]` : ''}`);
        if (activeItem) {
            activeItem.classList.add('bg-blue-700');
        }
        
        this.activeSection = section;
        this.activeItem = item;
    }
    
    handleSearch(query) {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('nav > div');
        
        if (!query.trim()) {
            // Show all items when search is empty
            navItems.forEach(item => {
                item.style.display = 'flex';
            });
            sections.forEach(section => {
                section.style.display = 'block';
            });
            return;
        }
        
        const searchTerm = query.toLowerCase();
        
        sections.forEach(section => {
            let hasVisibleItems = false;
            const items = section.querySelectorAll('.nav-item');
            
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    item.style.display = 'flex';
                    hasVisibleItems = true;
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Hide section if no items match
            section.style.display = hasVisibleItems ? 'block' : 'none';
        });
    }
    
    collapse() {
        if (!this.isCollapsed) {
            this.toggleCollapse();
        }
    }
    
    expand() {
        if (this.isCollapsed) {
            this.toggleCollapse();
        }
    }
    
    destroy() {
        // Clean up event listeners if needed
        const toggleButton = document.getElementById('toggleSidebar');
        if (toggleButton) {
            toggleButton.removeEventListener('click', this.toggleCollapse);
        }
        
        const searchInput = document.getElementById('sidebar-search');
        if (searchInput) {
            searchInput.removeEventListener('input', this.handleSearch);
        }
    }
}
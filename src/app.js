/**
 * MoMech Main Application Controller
 * Handles routing, component loading, and global state management
 */

import { Router } from './utils/router.js';
import { StateManager } from './utils/stateManager.js';
import { Sidebar } from './components/common/sidebar.js';
import { Header } from './components/common/header.js';
import { Dashboard } from './components/dashboard/dashboard.js';

class MoMechApp {
    constructor() {
        this.router = new Router();
        this.state = new StateManager();
        this.currentPage = null;
        this.sidebar = null;
        this.header = null;
        
        this.init();
    }
    
    async init() {
        try {
            // Show loading
            window.showLoading();
            
            // Load common components
            await this.loadCommonComponents();
            
            // Setup routes
            this.setupRoutes();
            
            // Initialize router
            this.router.init();
            
            // Hide loading
            window.hideLoading();
            
            // Show success notification
            window.showNotification('MoMech application loaded successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to initialize MoMech app:', error);
            window.hideLoading();
            window.showNotification('Failed to load application. Please refresh the page.', 'error');
        }
    }
    
    async loadCommonComponents() {
        // Load sidebar
        this.sidebar = new Sidebar();
        await this.sidebar.render();
        
        // Load header
        this.header = new Header();
        await this.header.render();
    }
    
    setupRoutes() {
        // Dashboard routes
        this.router.addRoute('/', () => this.loadPage('dashboard'));
        this.router.addRoute('/dashboard', () => this.loadPage('dashboard'));
        
        // Client routes
        this.router.addRoute('/clients', () => this.loadPage('clients'));
        this.router.addRoute('/clients/new', () => this.loadPage('clients', 'new'));
        this.router.addRoute('/clients/:id', (params) => this.loadPage('clients', 'detail', params));
        this.router.addRoute('/clients/:id/edit', (params) => this.loadPage('clients', 'edit', params));
        
        // Vehicle routes
        this.router.addRoute('/vehicles', () => this.loadPage('vehicles'));
        this.router.addRoute('/vehicles/new', () => this.loadPage('vehicles', 'new'));
        this.router.addRoute('/vehicles/:id', (params) => this.loadPage('vehicles', 'detail', params));
        this.router.addRoute('/vehicles/:id/edit', (params) => this.loadPage('vehicles', 'edit', params));
        
        // Appointment routes
        this.router.addRoute('/appointments', () => this.loadPage('appointments'));
        this.router.addRoute('/appointments/new', () => this.loadPage('appointments', 'new'));
        this.router.addRoute('/appointments/:id', (params) => this.loadPage('appointments', 'detail', params));
        this.router.addRoute('/appointments/:id/edit', (params) => this.loadPage('appointments', 'edit', params));
        this.router.addRoute('/appointments/calendar', () => this.loadPage('appointments', 'calendar'));
        this.router.addRoute('/appointments/today', () => this.loadPage('appointments', 'today'));
        
        // Inventory routes
        this.router.addRoute('/inventory', () => this.loadPage('inventory'));
        this.router.addRoute('/inventory/new', () => this.loadPage('inventory', 'new'));
        this.router.addRoute('/inventory/:id', (params) => this.loadPage('inventory', 'detail', params));
        this.router.addRoute('/inventory/:id/edit', (params) => this.loadPage('inventory', 'edit', params));
        this.router.addRoute('/inventory/low-stock', () => this.loadPage('inventory', 'low-stock'));
        
        // Financial routes
        this.router.addRoute('/financial', () => this.loadPage('financial'));
        this.router.addRoute('/financial/invoices', () => this.loadPage('financial', 'invoices'));
        this.router.addRoute('/financial/invoices/new', () => this.loadPage('financial', 'invoices-new'));
        this.router.addRoute('/financial/invoices/:id', (params) => this.loadPage('financial', 'invoices-detail', params));
        this.router.addRoute('/financial/payments', () => this.loadPage('financial', 'payments'));
        this.router.addRoute('/financial/reports', () => this.loadPage('financial', 'reports'));
        
        // Work order routes
        this.router.addRoute('/work-orders', () => this.loadPage('work-orders'));
        this.router.addRoute('/work-orders/new', () => this.loadPage('work-orders', 'new'));
        this.router.addRoute('/work-orders/:id', (params) => this.loadPage('work-orders', 'detail', params));
        this.router.addRoute('/work-orders/:id/edit', (params) => this.loadPage('work-orders', 'edit', params));
        
        // Service routes
        this.router.addRoute('/services', () => this.loadPage('services'));
        this.router.addRoute('/services/new', () => this.loadPage('services', 'new'));
        this.router.addRoute('/services/:id', (params) => this.loadPage('services', 'detail', params));
        
        // 404 handler
        this.router.addRoute('*', () => this.loadPage('404'));
    }
    
    async loadPage(pageName, subPage = null, params = {}) {
        try {
            // Show loading for page transitions
            const pageContent = document.getElementById('page-content');
            pageContent.innerHTML = '<div class="flex items-center justify-center h-64"><div class="loading"></div><span class="ml-4 text-gray-600">Loading...</span></div>';
            
            // Update sidebar active state
            if (this.sidebar) {
                this.sidebar.setActivePage(pageName, subPage);
            }
            
            // Update header title
            if (this.header) {
                this.header.updateTitle(this.getPageTitle(pageName, subPage));
            }
            
            // Destroy current page if exists
            if (this.currentPage && typeof this.currentPage.destroy === 'function') {
                this.currentPage.destroy();
            }
            
            // Load the appropriate page component
            let PageComponent;
            
            switch (pageName) {
                case 'dashboard':
                    PageComponent = Dashboard;
                    break;
                    
                case 'clients':
                    const { ClientList, ClientForm, ClientDetail } = await import('./components/clients/index.js');
                    switch (subPage) {
                        case 'new':
                        case 'edit':
                            PageComponent = ClientForm;
                            break;
                        case 'detail':
                            PageComponent = ClientDetail;
                            break;
                        default:
                            PageComponent = ClientList;
                    }
                    break;
                    
                case 'vehicles':
                    const { VehicleList, VehicleForm, VehicleDetail } = await import('./components/vehicles/index.js');
                    switch (subPage) {
                        case 'new':
                        case 'edit':
                            PageComponent = VehicleForm;
                            break;
                        case 'detail':
                            PageComponent = VehicleDetail;
                            break;
                        default:
                            PageComponent = VehicleList;
                    }
                    break;
                    
                case 'appointments':
                    const { AppointmentList, AppointmentForm, AppointmentCalendar } = await import('./components/appointments/index.js');
                    switch (subPage) {
                        case 'new':
                        case 'edit':
                            PageComponent = AppointmentForm;
                            break;
                        case 'calendar':
                            PageComponent = AppointmentCalendar;
                            break;
                        case 'today':
                            PageComponent = AppointmentList;
                            params.filter = 'today';
                            break;
                        default:
                            PageComponent = AppointmentList;
                    }
                    break;
                    
                case 'inventory':
                    const { InventoryList, InventoryForm } = await import('./components/inventory/index.js');
                    switch (subPage) {
                        case 'new':
                        case 'edit':
                            PageComponent = InventoryForm;
                            break;
                        case 'low-stock':
                            PageComponent = InventoryList;
                            params.filter = 'low-stock';
                            break;
                        default:
                            PageComponent = InventoryList;
                    }
                    break;
                    
                case 'financial':
                    const { InvoiceList, InvoiceForm, PaymentList, FinancialReports } = await import('./components/financial/index.js');
                    switch (subPage) {
                        case 'invoices':
                            PageComponent = InvoiceList;
                            break;
                        case 'invoices-new':
                        case 'invoices-edit':
                            PageComponent = InvoiceForm;
                            break;
                        case 'payments':
                            PageComponent = PaymentList;
                            break;
                        case 'reports':
                            PageComponent = FinancialReports;
                            break;
                        default:
                            PageComponent = InvoiceList;
                    }
                    break;
                    
                case 'work-orders':
                    const { WorkOrderList, WorkOrderForm, WorkOrderDetail } = await import('./components/work-orders/index.js');
                    switch (subPage) {
                        case 'new':
                        case 'edit':
                            PageComponent = WorkOrderForm;
                            break;
                        case 'detail':
                            PageComponent = WorkOrderDetail;
                            break;
                        default:
                            PageComponent = WorkOrderList;
                    }
                    break;
                    
                case 'services':
                    const { ServiceList, ServiceForm } = await import('./components/services/index.js');
                    switch (subPage) {
                        case 'new':
                        case 'edit':
                            PageComponent = ServiceForm;
                            break;
                        default:
                            PageComponent = ServiceList;
                    }
                    break;
                    
                case '404':
                default:
                    PageComponent = class {
                        constructor() {}
                        async render() {
                            return `
                                <div class="flex flex-col items-center justify-center h-64">
                                    <i data-feather="alert-circle" class="w-16 h-16 text-gray-400 mb-4"></i>
                                    <h2 class="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
                                    <p class="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                                    <button onclick="window.location.hash = '/'" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                        Go to Dashboard
                                    </button>
                                </div>
                            `;
                        }
                    };
            }
            
            // Create and render the page component
            this.currentPage = new PageComponent(params);
            const content = await this.currentPage.render();
            
            // Update page content
            pageContent.innerHTML = content;
            pageContent.classList.add('fade-in');
            
            // Replace feather icons
            replaceFeatherIcons();
            
            // Initialize page-specific functionality
            if (typeof this.currentPage.init === 'function') {
                await this.currentPage.init();
            }
            
        } catch (error) {
            console.error('Error loading page:', error);
            document.getElementById('page-content').innerHTML = `
                <div class="flex flex-col items-center justify-center h-64">
                    <i data-feather="alert-triangle" class="w-16 h-16 text-red-400 mb-4"></i>
                    <h2 class="text-2xl font-semibold text-gray-900 mb-2">Error Loading Page</h2>
                    <p class="text-gray-600 mb-4">There was an error loading this page. Please try again.</p>
                    <button onclick="window.location.reload()" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        Reload Page
                    </button>
                </div>
            `;
            replaceFeatherIcons();
            window.showNotification('Error loading page. Please try again.', 'error');
        }
    }
    
    getPageTitle(pageName, subPage) {
        const titles = {
            'dashboard': 'Dashboard',
            'clients': 'Clients',
            'vehicles': 'Vehicles',
            'appointments': 'Appointments',
            'inventory': 'Inventory',
            'financial': 'Financial',
            'work-orders': 'Work Orders',
            'services': 'Services'
        };
        
        let title = titles[pageName] || 'MoMech';
        
        if (subPage) {
            switch (subPage) {
                case 'new':
                    title = `New ${title.slice(0, -1)}`;
                    break;
                case 'edit':
                    title = `Edit ${title.slice(0, -1)}`;
                    break;
                case 'detail':
                    title = `${title.slice(0, -1)} Details`;
                    break;
                case 'calendar':
                    title = 'Calendar';
                    break;
                case 'today':
                    title = "Today's Appointments";
                    break;
                case 'low-stock':
                    title = 'Low Stock Items';
                    break;
                case 'invoices':
                    title = 'Invoices';
                    break;
                case 'payments':
                    title = 'Payments';
                    break;
                case 'reports':
                    title = 'Financial Reports';
                    break;
            }
        }
        
        return title;
    }
    
    // Global app methods
    navigate(path) {
        this.router.navigate(path);
    }
    
    getState(key) {
        return this.state.get(key);
    }
    
    setState(key, value) {
        this.state.set(key, value);
    }
    
    updateState(key, updates) {
        this.state.update(key, updates);
    }
}

// Initialize the application
const app = new MoMechApp();

// Make app globally available
window.MoMechApp = app;

export default app;
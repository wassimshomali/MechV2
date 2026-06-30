/**
 * MoMech Main Application Controller
 * Handles routing, component loading, and global state management
 */

import { Router } from './utils/router.js';
import { StateManager } from './utils/stateManager.js';
import { Sidebar } from './components/common/sidebar.js';
import { Header } from './components/common/header.js';
import { Dashboard } from './components/dashboard/dashboard.js';
import { init as initI18n, t, onLocaleChange } from './i18n/index.js';

class MoMechApp {
    constructor() {
        this.router = new Router();
        this.state = new StateManager();
        this.currentPage = null;
        this.sidebar = null;
        this.header = null;
        this.currentRoute = { pageName: 'dashboard', subPage: null, params: {} };
        
        this.bootstrap();
    }
    
    async bootstrap() {
        try {
            window.showLoading();
            await initI18n();
            this.updateStaticText();
            onLocaleChange(() => this.handleLocaleChange());
            await this.init();
        } catch (error) {
            console.error('Failed to bootstrap MoMech app:', error);
            window.hideLoading();
            window.showNotification(t('app.loadFailed'), 'error');
        }
    }

    updateStaticText() {
        document.title = t('app.title');
        const loadingText = document.getElementById('loading-text');
        if (loadingText) loadingText.textContent = t('app.loading');
    }

    async handleLocaleChange() {
        this.updateStaticText();
        if (this.sidebar) await this.sidebar.render();
        if (this.header) await this.header.render();
        const { pageName, subPage, params } = this.currentRoute;
        if (this.header) {
            this.header.updateTitle(this.getPageTitle(pageName, subPage));
        }
        await this.loadPage(pageName, subPage, params, { skipRouteUpdate: true });
    }
    
    async init() {
        try {
            await this.loadCommonComponents();
            this.setupRoutes();
            this.router.init();
            window.hideLoading();
            window.showNotification(t('app.loaded'), 'success');
        } catch (error) {
            console.error('Failed to initialize MoMech app:', error);
            window.hideLoading();
            window.showNotification(t('app.loadFailed'), 'error');
        }
    }
    
    async loadCommonComponents() {
        this.sidebar = new Sidebar();
        await this.sidebar.render();
        
        this.header = new Header();
        await this.header.render();
    }
    
    setupRoutes() {
        this.router.addRoute('/', () => this.loadPage('dashboard'));
        this.router.addRoute('/dashboard', () => this.loadPage('dashboard'));
        
        this.router.addRoute('/clients', () => this.loadPage('clients'));
        this.router.addRoute('/clients/new', () => this.loadPage('clients', 'new'));
        this.router.addRoute('/clients/:id', (params) => this.loadPage('clients', 'detail', params));
        this.router.addRoute('/clients/:id/edit', (params) => this.loadPage('clients', 'edit', params));
        
        this.router.addRoute('/vehicles', () => this.loadPage('vehicles'));
        this.router.addRoute('/vehicles/new', () => this.loadPage('vehicles', 'new'));
        this.router.addRoute('/vehicles/:id', (params) => this.loadPage('vehicles', 'detail', params));
        this.router.addRoute('/vehicles/:id/edit', (params) => this.loadPage('vehicles', 'edit', params));
        
        this.router.addRoute('/appointments', () => this.loadPage('appointments'));
        this.router.addRoute('/appointments/new', () => this.loadPage('appointments', 'new'));
        this.router.addRoute('/appointments/:id', (params) => this.loadPage('appointments', 'detail', params));
        this.router.addRoute('/appointments/:id/edit', (params) => this.loadPage('appointments', 'edit', params));
        this.router.addRoute('/appointments/calendar', () => this.loadPage('appointments', 'calendar'));
        this.router.addRoute('/appointments/today', () => this.loadPage('appointments', 'today'));
        
        this.router.addRoute('/inventory', () => this.loadPage('inventory'));
        this.router.addRoute('/inventory/new', () => this.loadPage('inventory', 'new'));
        this.router.addRoute('/inventory/:id', (params) => this.loadPage('inventory', 'detail', params));
        this.router.addRoute('/inventory/:id/edit', (params) => this.loadPage('inventory', 'edit', params));
        this.router.addRoute('/inventory/low-stock', () => this.loadPage('inventory', 'low-stock'));
        
        this.router.addRoute('/financial', () => this.loadPage('financial'));
        this.router.addRoute('/financial/invoices', () => this.loadPage('financial', 'invoices'));
        this.router.addRoute('/financial/invoices/new', () => this.loadPage('financial', 'invoices-new'));
        this.router.addRoute('/financial/invoices/:id', (params) => this.loadPage('financial', 'invoices-detail', params));
        this.router.addRoute('/financial/payments', () => this.loadPage('financial', 'payments'));
        this.router.addRoute('/financial/reports', () => this.loadPage('financial', 'reports'));
        
        this.router.addRoute('/work-orders', () => this.loadPage('work-orders'));
        this.router.addRoute('/work-orders/new', () => this.loadPage('work-orders', 'new'));
        this.router.addRoute('/work-orders/:id', (params) => this.loadPage('work-orders', 'detail', params));
        this.router.addRoute('/work-orders/:id/edit', (params) => this.loadPage('work-orders', 'edit', params));
        
        this.router.addRoute('/services', () => this.loadPage('services'));
        this.router.addRoute('/services/new', () => this.loadPage('services', 'new'));
        this.router.addRoute('/services/:id/edit', (params) => this.loadPage('services', 'edit', params));
        this.router.addRoute('/services/:id', (params) => this.loadPage('services', 'detail', params));
        
        this.router.addRoute('*', () => this.loadPage('404'));
    }
    
    async loadPage(pageName, subPage = null, params = {}, options = {}) {
        if (!options.skipRouteUpdate) {
            this.currentRoute = { pageName, subPage, params };
        }

        try {
            const pageContent = document.getElementById('page-content');
            pageContent.innerHTML = `<div class="flex items-center justify-center h-64"><div class="loading"></div><span class="ml-4 text-gray-600">${t('app.loadingPage')}</span></div>`;
            
            if (this.sidebar) {
                this.sidebar.setActivePage(pageName, subPage);
            }
            
            if (this.header) {
                this.header.updateTitle(this.getPageTitle(pageName, subPage));
            }
            
            if (this.currentPage && typeof this.currentPage.destroy === 'function') {
                this.currentPage.destroy();
            }
            
            let PageComponent;
            
            switch (pageName) {
                case 'dashboard':
                    PageComponent = Dashboard;
                    break;
                    
                case 'clients': {
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
                }
                    
                case 'vehicles': {
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
                }
                    
                case 'appointments': {
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
                }
                    
                case 'inventory': {
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
                }
                    
                case 'financial': {
                    const { InvoiceList, InvoiceForm, InvoiceDetail, PaymentList, FinancialReports } = await import('./components/financial/index.js');
                    switch (subPage) {
                        case 'invoices':
                            PageComponent = InvoiceList;
                            break;
                        case 'invoices-new':
                            PageComponent = InvoiceForm;
                            break;
                        case 'invoices-detail':
                            PageComponent = InvoiceDetail;
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
                }
                    
                case 'work-orders': {
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
                }
                    
                case 'services': {
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
                }
                case '404':
                default:
                    PageComponent = class {
                        constructor() {}
                        async render() {
                            return `
                                <div class="flex flex-col items-center justify-center h-64">
                                    <i data-feather="alert-circle" class="w-16 h-16 text-gray-400 mb-4"></i>
                                    <h2 class="text-2xl font-semibold text-gray-900 mb-2">${t('app.pageNotFound')}</h2>
                                    <p class="text-gray-600 mb-4">${t('app.pageNotFoundMessage')}</p>
                                    <button onclick="window.location.hash = '/'" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                        ${t('app.goToDashboard')}
                                    </button>
                                </div>
                            `;
                        }
                    };
            }
            
            this.currentPage = new PageComponent(params);
            const content = await this.currentPage.render();
            
            pageContent.innerHTML = content;
            pageContent.classList.add('fade-in');
            
            replaceFeatherIcons();
            
            if (typeof this.currentPage.init === 'function') {
                await this.currentPage.init();
            }
            
        } catch (error) {
            console.error('Error loading page:', error);
            document.getElementById('page-content').innerHTML = `
                <div class="flex flex-col items-center justify-center h-64">
                    <i data-feather="alert-triangle" class="w-16 h-16 text-red-400 mb-4"></i>
                    <h2 class="text-2xl font-semibold text-gray-900 mb-2">${t('app.errorLoadingPage')}</h2>
                    <p class="text-gray-600 mb-4">${t('app.errorLoadingPageMessage')}</p>
                    <button onclick="window.location.reload()" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        ${t('app.reloadPage')}
                    </button>
                </div>
            `;
            replaceFeatherIcons();
            window.showNotification(t('app.errorLoadingPageMessage'), 'error');
        }
    }
    
    getPageTitle(pageName, subPage) {
        const entityMap = {
            'dashboard': null,
            'clients': 'entities.client',
            'vehicles': 'entities.vehicle',
            'appointments': 'entities.appointment',
            'inventory': 'entities.inventoryItem',
            'financial': null,
            'work-orders': 'entities.workOrder',
            'services': 'entities.service',
        };

        const baseTitles = {
            'dashboard': 'titles.dashboard',
            'clients': 'titles.clients',
            'vehicles': 'titles.vehicles',
            'appointments': 'titles.appointments',
            'inventory': 'titles.inventory',
            'financial': 'titles.financial',
            'work-orders': 'titles.workOrders',
            'services': 'titles.services',
        };

        let title = t(baseTitles[pageName] || 'app.name');
        
        if (subPage) {
            switch (subPage) {
                case 'new':
                    title = t('titles.new', { entity: t(entityMap[pageName] || 'app.name') });
                    break;
                case 'edit':
                    title = t('titles.edit', { entity: t(entityMap[pageName] || 'app.name') });
                    break;
                case 'detail':
                    title = t('titles.details', { entity: t(entityMap[pageName] || 'app.name') });
                    break;
                case 'calendar':
                    title = t('titles.calendar');
                    break;
                case 'today':
                    title = t('titles.todaysAppointments');
                    break;
                case 'low-stock':
                    title = t('titles.lowStockItems');
                    break;
                case 'invoices':
                    title = t('titles.invoices');
                    break;
                case 'payments':
                    title = t('titles.payments');
                    break;
                case 'reports':
                    title = t('titles.financialReports');
                    break;
            }
        }
        
        return title;
    }
    
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

const app = new MoMechApp();

window.MoMechApp = app;
window.t = t;

export default app;

import { renderDashboardPage } from './dashboardPage.js';
import { renderClientsPage } from './clientsPage.js';
import { renderClientFormPage, renderVehicleFormPage } from './formsPage.js';
import {
  renderVehiclesPage,
  renderServiceHistoryPage,
  renderAppointmentsPage,
  renderAppointmentsTodayPage,
  renderInventoryPage,
  renderInventoryLowStockPage,
  renderInvoicesPage,
  renderPaymentsPage,
  renderQrScannerPage,
} from './listPages.js';

const pageHandlers = {
  dashboard: renderDashboardPage,
  clients: renderClientsPage,
  clientForm: renderClientFormPage,
  qrScanner: renderQrScannerPage,
  vehicles: renderVehiclesPage,
  vehicleForm: renderVehicleFormPage,
  serviceHistory: renderServiceHistoryPage,
  appointments: renderAppointmentsPage,
  appointmentsToday: renderAppointmentsTodayPage,
  inventory: renderInventoryPage,
  inventoryLowStock: renderInventoryLowStockPage,
  invoices: renderInvoicesPage,
  payments: renderPaymentsPage,
};

export async function renderPage(route) {
  const handler = pageHandlers[route.module];
  if (handler) {
    await handler(route);
  }
}

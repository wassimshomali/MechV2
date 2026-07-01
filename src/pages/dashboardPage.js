import { renderDashboard, initDashboard } from '../components/dashboard/Dashboard.js';
import {
  fetchDashboardStats,
  fetchRecentActivity,
  fetchUpcomingAppointments,
  fetchDashboardAlerts,
} from '../services/dashboardService.js';

const fallbackStats = {
  todayAppointments: 5,
  monthlyRevenue: 3450,
  revenueGrowth: 12,
  activeClients: 87,
  lowInventoryItems: 7,
  nextAppointment: { time: '10:30', service: 'Oil Change', client: 'Michael Johnson' },
};

const fallbackActivity = [
  { client_name: 'Michael Johnson', vehicle: '2018 Toyota Camry', service_name: 'Oil Change', created_at: new Date().toISOString() },
  { client_name: 'Sarah Williams', vehicle: '2015 Honda CR-V', service_name: 'Brake Service', created_at: new Date().toISOString() },
];

const fallbackInventory = [
  { name: 'Oil Filter — Toyota', part_number: 'TO-1234', quantity_on_hand: 2, minimum_quantity: 5 },
  { name: 'Brake Pads — Front', part_number: 'BP-F456', quantity_on_hand: 1, minimum_quantity: 4 },
];

async function safeFetch(fetcher, fallback) {
  try {
    return await fetcher();
  } catch {
    return fallback;
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);
}

function formatRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export async function renderDashboardPage() {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = renderDashboard({ loading: true });

  const [stats, activity, appointments, alerts] = await Promise.all([
    safeFetch(fetchDashboardStats, fallbackStats),
    safeFetch(() => fetchRecentActivity(4), fallbackActivity),
    safeFetch(() => fetchUpcomingAppointments(5), []),
    safeFetch(fetchDashboardAlerts, []),
  ]);

  const dashboardData = {
    stats: {
      todayAppointments: stats.todayAppointments ?? fallbackStats.todayAppointments,
      monthlyRevenue: formatCurrency(stats.monthlyRevenue ?? fallbackStats.monthlyRevenue),
      revenueGrowth: stats.revenueGrowth ?? fallbackStats.revenueGrowth,
      activeClients: stats.activeClients ?? fallbackStats.activeClients,
      lowInventoryItems: stats.lowInventoryItems ?? fallbackStats.lowInventoryItems,
      nextAppointment: stats.nextAppointment
        ? `Next: ${stats.nextAppointment.time} — ${stats.nextAppointment.service}`
        : 'No upcoming appointments today',
    },
    clients: activity.map((item) => ({
      name: item.client_name,
      time: formatRelativeTime(item.created_at),
      detail: `${item.vehicle || 'Vehicle'} — ${item.service_name || 'Service'}`,
    })),
    inventory: mapInventoryFromAlerts(alerts) || mapInventoryFallback(fallbackInventory),
    appointments,
  };

  main.innerHTML = renderDashboard(dashboardData);
  initDashboard();
}

function mapInventoryFromAlerts(alerts) {
  const lowStock = alerts.find((a) => a.title === 'Low Inventory');
  if (!lowStock?.items?.length) return null;
  return lowStock.items.map((item) => ({
    name: item.name,
    part: `Part #${item.part_number || 'N/A'}`,
    qty: `${item.quantity_on_hand} left`,
    level: item.quantity_on_hand <= 1 ? 'inventory-low' : 'inventory-medium',
    color: item.quantity_on_hand <= 1 ? 'text-error-500' : 'text-warning-500',
  }));
}

function mapInventoryFallback(items) {
  return items.map((item) => ({
    name: item.name,
    part: `Part #${item.part_number}`,
    qty: `${item.quantity_on_hand} left`,
    level: item.quantity_on_hand <= 2 ? 'inventory-low' : 'inventory-medium',
    color: item.quantity_on_hand <= 2 ? 'text-error-500' : 'text-warning-500',
  }));
}

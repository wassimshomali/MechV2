import { renderPageHeader, renderDataTable, renderSearchBar } from '../components/common/PageLayout.js';
import { renderLoadingState } from '../components/common/LoadingState.js';
import { renderEmptyState } from '../components/common/EmptyState.js';
import { fetchClients } from '../services/clientService.js';

const fallbackClients = [
  { first_name: 'Michael', last_name: 'Johnson', email: 'michael@email.com', phone: '(555) 123-4567', vehicle_count: 2 },
  { first_name: 'Sarah', last_name: 'Williams', email: 'sarah@email.com', phone: '(555) 234-5678', vehicle_count: 1 },
  { first_name: 'Robert', last_name: 'Davis', email: 'robert@email.com', phone: '(555) 345-6789', vehicle_count: 3 },
];

export async function renderClientsPage() {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = `
    ${renderPageHeader({
      title: 'Client List',
      description: 'Manage your garage clients and their contact information.',
      actionLabel: 'Add Client',
      actionHref: '#/clients/new',
    })}
    ${renderSearchBar({ placeholder: 'Search clients by name, email, or phone...' })}
    ${renderLoadingState({ rows: 6 })}
  `;

  let data;
  try {
    data = await fetchClients({ limit: 50 });
  } catch {
    data = { clients: fallbackClients, pagination: { total: fallbackClients.length } };
  }

  const clients = data.clients || data.data || fallbackClients;

  if (!clients.length) {
    main.innerHTML = `
      ${renderPageHeader({ title: 'Client List', description: 'Manage your garage clients and their contact information.', actionLabel: 'Add Client', actionHref: '#/clients/new' })}
      ${renderEmptyState({
        icon: 'users',
        title: 'No clients yet',
        description: 'Add your first client to start tracking vehicles, appointments, and service history.',
        actionLabel: 'Add Client',
        actionHref: '#/clients/new',
      })}
    `;
    return;
  }

  const rows = clients.map((client) => ({
    name: `<span class="font-medium">${client.first_name} ${client.last_name}</span>`,
    email: client.email || '—',
    phone: client.phone || '—',
    vehicles: client.vehicleCount ?? client.vehicle_count ?? '—',
  }));

  main.innerHTML = `
    ${renderPageHeader({
      title: 'Client List',
      description: `${data.pagination?.total || clients.length} clients total`,
      actionLabel: 'Add Client',
      actionHref: '#/clients/new',
    })}
    ${renderSearchBar({ placeholder: 'Search clients by name, email, or phone...' })}
    ${renderDataTable({
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'vehicles', label: 'Vehicles' },
      ],
      rows,
    })}
  `;
}

import { renderPageHeader } from '../components/common/PageLayout.js';

function renderForm({ title, description, fields, submitLabel, cancelHref = '#/' }) {
  const fieldsHtml = fields
    .map(
      (field) => `
      <div class="form-group">
        <label for="${field.id}" class="form-label">${field.label}${field.required ? ' *' : ''}</label>
        ${
          field.type === 'textarea'
            ? `<textarea id="${field.id}" name="${field.id}" class="form-input" rows="3" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}></textarea>`
            : `<input type="${field.type || 'text'}" id="${field.id}" name="${field.id}" class="form-input" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} />`
        }
      </div>
    `
    )
    .join('');

  return `
    ${renderPageHeader({ title, description })}
    <div class="panel max-w-2xl animate-fade-in">
      <form class="panel-body space-y-2" onsubmit="event.preventDefault()">
        ${fieldsHtml}
        <div class="flex gap-3 pt-4">
          <button type="submit" class="btn btn-primary">${submitLabel}</button>
          <a href="${cancelHref}" class="btn btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `;
}

export function renderClientFormPage() {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = renderForm({
    title: 'Add Client',
    description: 'Create a new client record for your garage.',
    submitLabel: 'Save Client',
    fields: [
      { id: 'firstName', label: 'First Name', required: true },
      { id: 'lastName', label: 'Last Name', required: true },
      { id: 'email', label: 'Email', type: 'email' },
      { id: 'phone', label: 'Phone', type: 'tel', placeholder: '(555) 000-0000' },
      { id: 'address', label: 'Address', type: 'textarea' },
      { id: 'notes', label: 'Notes', type: 'textarea' },
    ],
  });
}

export function renderVehicleFormPage() {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = renderForm({
    title: 'Add Vehicle',
    description: 'Register a new vehicle and link it to a client.',
    submitLabel: 'Save Vehicle',
    cancelHref: '#/vehicles',
    fields: [
      { id: 'client', label: 'Client', required: true, placeholder: 'Search client...' },
      { id: 'year', label: 'Year', type: 'number', required: true },
      { id: 'make', label: 'Make', required: true },
      { id: 'model', label: 'Model', required: true },
      { id: 'vin', label: 'VIN' },
      { id: 'licensePlate', label: 'License Plate' },
      { id: 'mileage', label: 'Mileage', type: 'number' },
    ],
  });
}

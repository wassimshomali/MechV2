# MoMech Overnight Development Task

## 🎯 Mission Statement
Complete the MoMech mechanic ERP/CRM system to a fully functional state with working frontend, backend API, database with seed data, and all CRUD operations functional. The user should wake up to a complete, interactive application ready for testing.

## 📋 Project Context
You are working on MoMech, a digital transformation tool for small garage mechanics. The project foundation has been established with:
- Complete folder structure and configuration
- Database schema and migrations
- Basic server setup with error handling
- Tailwind CSS styling system
- Some initial API routes (auth, clients, dashboard)

**IMPORTANT**: This is a single-user application, so skip authentication/authorization entirely. All routes should be accessible without tokens.

## 🚀 Primary Objectives (Must Complete)

### 1. Database & Seed Data (HIGH PRIORITY)
- [ ] Create comprehensive seed data for ALL tables
- [ ] Generate realistic test data:
  - 20-30 clients with complete information
  - 40-60 vehicles (multiple per client)
  - 50+ appointments (past, current, future)
  - 100+ inventory items with realistic auto parts
  - 20+ work orders with detailed service records
  - 15+ invoices in various states
  - 10+ payments
  - Service categories and templates
  - Vehicle service history records
- [ ] Ensure all foreign key relationships are properly populated
- [ ] Create a seed file: `server/database/seeds/001_sample_data.sql`

### 2. Complete All API Routes (HIGH PRIORITY)
Create these missing route files with full CRUD operations:

#### A. Vehicles Routes (`server/routes/vehicles.js`)
- GET `/vehicles` - List all vehicles with pagination, search, filters
- POST `/vehicles` - Create new vehicle
- GET `/vehicles/:id` - Get vehicle details with service history
- PUT `/vehicles/:id` - Update vehicle
- DELETE `/vehicles/:id` - Soft delete vehicle
- GET `/vehicles/:id/service-history` - Get complete service history
- GET `/vehicles/:id/appointments` - Get vehicle appointments

#### B. Appointments Routes (`server/routes/appointments.js`)
- GET `/appointments` - List with filters (date range, status, mechanic)
- POST `/appointments` - Create new appointment
- GET `/appointments/:id` - Get appointment details
- PUT `/appointments/:id` - Update appointment
- DELETE `/appointments/:id` - Cancel appointment
- GET `/appointments/today` - Today's appointments
- GET `/appointments/calendar/:date` - Calendar view data
- PUT `/appointments/:id/status` - Update appointment status

#### C. Inventory Routes (`server/routes/inventory.js`)
- GET `/inventory` - List all items with search, category filters
- POST `/inventory` - Create new inventory item
- GET `/inventory/:id` - Get item details
- PUT `/inventory/:id` - Update inventory item
- DELETE `/inventory/:id` - Delete item
- GET `/inventory/low-stock` - Items below minimum quantity
- POST `/inventory/:id/adjust` - Adjust stock quantity
- GET `/inventory/categories` - Get all categories

#### D. Financial Routes (`server/routes/financial.js`)
- GET `/invoices` - List invoices with filters
- POST `/invoices` - Create new invoice
- GET `/invoices/:id` - Get invoice details
- PUT `/invoices/:id` - Update invoice
- DELETE `/invoices/:id` - Delete invoice
- POST `/invoices/:id/send` - Mark invoice as sent
- GET `/payments` - List all payments
- POST `/payments` - Record new payment
- GET `/reports/revenue` - Revenue reports
- GET `/reports/outstanding` - Outstanding invoices

#### E. Services Routes (`server/routes/services.js`)
- GET `/services` - List all service templates
- POST `/services` - Create service template
- GET `/services/:id` - Get service details
- PUT `/services/:id` - Update service
- DELETE `/services/:id` - Delete service
- GET `/service-categories` - List categories

#### F. Work Orders Routes (`server/routes/work-orders.js`)
- GET `/work-orders` - List work orders with filters
- POST `/work-orders` - Create new work order
- GET `/work-orders/:id` - Get work order details
- PUT `/work-orders/:id` - Update work order
- DELETE `/work-orders/:id` - Delete work order
- POST `/work-orders/:id/items` - Add items to work order
- PUT `/work-orders/:id/status` - Update work order status

### 3. Refactor HTML into Modular Components (HIGH PRIORITY)
Transform the monolithic `index.html` into a proper SPA:

#### A. Create Base HTML Template (`index.html`)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Keep existing head content -->
</head>
<body class="bg-gray-50">
    <div id="app" class="flex h-screen overflow-hidden">
        <!-- Sidebar will be loaded here -->
        <div id="sidebar-container"></div>
        
        <!-- Main content area -->
        <div id="main-content" class="flex-1 flex flex-col overflow-hidden">
            <!-- Header will be loaded here -->
            <div id="header-container"></div>
            
            <!-- Page content will be loaded here -->
            <div id="page-content" class="flex-1 overflow-y-auto p-6"></div>
        </div>
    </div>
    
    <!-- Modals container -->
    <div id="modals-container"></div>
    
    <!-- Scripts -->
    <script src="src/app.js" type="module"></script>
</body>
</html>
```

#### B. Create Component Files in `src/components/`:

**Common Components:**
- `common/sidebar.js` - Sidebar navigation with active states
- `common/header.js` - Top navigation bar
- `common/modal.js` - Reusable modal component
- `common/table.js` - Data table with sorting, pagination
- `common/form.js` - Form handling utilities
- `common/notification.js` - Toast notifications

**Page Components:**
- `dashboard/dashboard.js` - Complete dashboard with all widgets
- `clients/clientList.js` - Client listing with search/filters
- `clients/clientForm.js` - Client add/edit form
- `clients/clientDetail.js` - Client detail view
- `vehicles/vehicleList.js` - Vehicle listing
- `vehicles/vehicleForm.js` - Vehicle add/edit form
- `vehicles/vehicleDetail.js` - Vehicle detail with service history
- `appointments/appointmentList.js` - Appointment listing
- `appointments/appointmentForm.js` - Appointment scheduler
- `appointments/calendar.js` - Calendar view
- `inventory/inventoryList.js` - Inventory management
- `inventory/inventoryForm.js` - Inventory item form
- `financial/invoiceList.js` - Invoice management
- `financial/invoiceForm.js` - Invoice creation
- `financial/paymentList.js` - Payment tracking

### 4. Frontend JavaScript Implementation (CRITICAL)
Create a complete SPA with these features:

#### A. Main App Controller (`src/app.js`)
```javascript
// Router, state management, component loading
import { Router } from './utils/router.js';
import { StateManager } from './utils/stateManager.js';
import { ApiService } from './services/api.js';

class MoMechApp {
    constructor() {
        this.router = new Router();
        this.state = new StateManager();
        this.api = new ApiService();
        this.init();
    }
    
    init() {
        this.setupRoutes();
        this.loadSidebar();
        this.loadHeader();
        this.router.init();
    }
}

new MoMechApp();
```

#### B. Service Layer (`src/services/`)
- `clientService.js` - All client-related API calls
- `vehicleService.js` - Vehicle management API calls
- `appointmentService.js` - Appointment scheduling API calls
- `inventoryService.js` - Inventory management API calls
- `financialService.js` - Invoice and payment API calls
- `dashboardService.js` - Dashboard data API calls

#### C. Utilities (`src/utils/`)
- `router.js` - SPA routing system
- `stateManager.js` - Global state management
- `validation.js` - Form validation
- `formatters.js` - Data formatting (dates, currency, etc.)
- `helpers.js` - General utility functions

### 5. Complete UI Functionality (CRITICAL)
Every page must be fully functional:

#### A. Dashboard Page
- [ ] Live statistics cards with real data
- [ ] Interactive calendar with appointment dots
- [ ] Recent clients list with click-through
- [ ] Quick action buttons that work
- [ ] Low inventory alerts with real data
- [ ] Revenue charts with actual data

#### B. Client Management
- [ ] Searchable client list with pagination
- [ ] Add/Edit client forms with validation
- [ ] Client detail pages with service history
- [ ] Delete confirmation modals
- [ ] Filter by active/inactive status

#### C. Vehicle Management
- [ ] Vehicle list with client associations
- [ ] Add/Edit vehicle forms
- [ ] Vehicle detail with complete service history
- [ ] QR code generation for vehicles
- [ ] Maintenance reminders

#### D. Appointment Scheduling
- [ ] Calendar view with drag-and-drop
- [ ] Appointment list with status filters
- [ ] Create/Edit appointment forms
- [ ] Status updates (scheduled, in-progress, completed)
- [ ] Time slot availability checking

#### E. Inventory Management
- [ ] Searchable inventory with categories
- [ ] Add/Edit inventory items
- [ ] Stock adjustment functionality
- [ ] Low stock alerts and reorder points
- [ ] Barcode scanning ready interface

#### F. Financial Management
- [ ] Invoice creation and editing
- [ ] Payment recording
- [ ] Outstanding invoice tracking
- [ ] Revenue reports and charts
- [ ] Payment history

## 🔧 Technical Requirements

### Database Connection
Update `server/index.js` to remove authentication middleware entirely:
```javascript
// Remove any auth middleware
// All routes should be publicly accessible
```

### Error Handling
- All API endpoints must have proper error handling
- Frontend should show user-friendly error messages
- Loading states for all async operations

### Data Validation
- Client-side form validation with real-time feedback
- Server-side validation for all inputs
- Proper error messages for validation failures

### Responsive Design
- All pages must work on mobile, tablet, and desktop
- Use existing Tailwind classes and custom components
- Maintain the current blue color scheme

### Performance
- Lazy load components where possible
- Paginate large data sets
- Optimize database queries
- Minimize API calls

## 📁 File Structure to Create/Modify

### New Files to Create:
```
server/
├── routes/
│   ├── vehicles.js
│   ├── appointments.js
│   ├── inventory.js
│   ├── financial.js
│   ├── services.js
│   └── work-orders.js
├── database/
│   └── seeds/
│       └── 001_sample_data.sql

src/
├── app.js
├── components/
│   ├── common/
│   │   ├── sidebar.js
│   │   ├── header.js
│   │   ├── modal.js
│   │   ├── table.js
│   │   ├── form.js
│   │   └── notification.js
│   ├── dashboard/
│   │   └── dashboard.js
│   ├── clients/
│   │   ├── clientList.js
│   │   ├── clientForm.js
│   │   └── clientDetail.js
│   ├── vehicles/
│   │   ├── vehicleList.js
│   │   ├── vehicleForm.js
│   │   └── vehicleDetail.js
│   ├── appointments/
│   │   ├── appointmentList.js
│   │   ├── appointmentForm.js
│   │   └── calendar.js
│   ├── inventory/
│   │   ├── inventoryList.js
│   │   └── inventoryForm.js
│   └── financial/
│       ├── invoiceList.js
│       ├── invoiceForm.js
│       └── paymentList.js
├── services/
│   ├── clientService.js
│   ├── vehicleService.js
│   ├── appointmentService.js
│   ├── inventoryService.js
│   ├── financialService.js
│   └── dashboardService.js
└── utils/
    ├── router.js
    ├── stateManager.js
    ├── validation.js
    ├── formatters.js
    └── helpers.js
```

### Files to Modify:
- `server/index.js` - Remove auth middleware, add new routes
- `index.html` - Refactor to SPA structure
- `src/services/api.js` - Remove authentication headers

## 🎨 UI/UX Requirements

### Sidebar Navigation
- [ ] Fully functional with active states
- [ ] Collapsible with icon-only mode
- [ ] Smooth animations
- [ ] All menu items should navigate properly

### Data Tables
- [ ] Sortable columns
- [ ] Search functionality
- [ ] Pagination controls
- [ ] Row actions (edit, delete, view)
- [ ] Loading states

### Forms
- [ ] Real-time validation
- [ ] Clear error messages
- [ ] Success notifications
- [ ] Auto-save for long forms
- [ ] Cancel/Save buttons

### Modals
- [ ] Smooth animations
- [ ] Proper focus management
- [ ] ESC key to close
- [ ] Overlay click to close
- [ ] Confirmation dialogs

## 🧪 Testing Requirements

### Data Verification
- [ ] All seed data loads correctly
- [ ] All API endpoints return proper responses
- [ ] Frontend displays real data from database
- [ ] CRUD operations work end-to-end

### User Flow Testing
- [ ] Complete client workflow (add → view → edit → delete)
- [ ] Complete vehicle workflow
- [ ] Complete appointment workflow
- [ ] Complete inventory workflow
- [ ] Complete invoice workflow

## 📊 Success Criteria

When complete, the user should be able to:
1. Navigate to any page via sidebar menu
2. See real data from the database on every page
3. Create, read, update, and delete records in all sections
4. Use search and filter functionality
5. View detailed information and relationships between records
6. Generate invoices and record payments
7. Track inventory and get low-stock alerts
8. Schedule and manage appointments
9. View dashboard analytics with real data

## ⚠️ Critical Notes

1. **No Authentication**: Remove all auth middleware and token requirements
2. **Real Data**: Every page must show actual database data, not mock data
3. **Complete Functionality**: Every button, form, and interaction must work
4. **Error Handling**: Graceful error handling throughout
5. **Performance**: Fast loading and responsive interactions
6. **Mobile Ready**: Must work perfectly on mobile devices

## 📋 Completion Checklist

Before considering the task complete, verify:
- [ ] All API routes respond correctly
- [ ] Database has comprehensive seed data
- [ ] Frontend loads without errors
- [ ] All sidebar navigation works
- [ ] All CRUD operations functional
- [ ] Search and filtering works
- [ ] Forms validate and submit correctly
- [ ] Tables sort and paginate
- [ ] Modals open and close properly
- [ ] Mobile responsive design works
- [ ] No console errors
- [ ] All data relationships display correctly

## 🚀 Getting Started

1. Review the existing codebase in `/Users/wassim/Documents/Code/MechV2/`
2. Read `dev.md` for project guidelines and standards
3. Start with database seed data creation
4. Build API routes systematically
5. Refactor HTML and create components
6. Implement frontend functionality
7. Test everything thoroughly

The user expects to wake up to a fully functional application ready for real-world use. Make it happen! 🎯

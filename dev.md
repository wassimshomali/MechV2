# MoMech - Mechanic ERP/CRM System Development Guide

## Project Overview
MoMech is a comprehensive digital transformation tool designed for small garage mechanics. It provides ERP and CRM functionality to help mechanics manage clients, vehicles, appointments, inventory, and finances efficiently.

## Tech Stack
- **Frontend**: Vanilla JavaScript, HTML5, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Build Tools**: Webpack, Tailwind CLI
- **Development**: Live-server, Nodemon, Concurrently

## Project Structure
```
MechV2/
├── src/                          # Frontend source code
│   ├── components/              # Reusable UI components
│   │   ├── common/             # Generic components (buttons, modals, etc.)
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── clients/            # Client management components
│   │   ├── vehicles/           # Vehicle management components
│   │   ├── appointments/       # Appointment scheduling components
│   │   ├── inventory/          # Inventory management components
│   │   └── financial/          # Financial management components
│   ├── services/               # API service layer
│   │   ├── api.js             # Base API configuration
│   │   ├── clientService.js   # Client-related API calls
│   │   ├── vehicleService.js  # Vehicle-related API calls
│   │   ├── appointmentService.js
│   │   ├── inventoryService.js
│   │   └── financialService.js
│   ├── utils/                  # Utility functions
│   │   ├── helpers.js         # General helper functions
│   │   ├── validation.js      # Form validation utilities
│   │   ├── formatters.js      # Data formatting utilities
│   │   └── constants.js       # Application constants
│   ├── styles/                 # Styling files
│   │   ├── main.css           # Main Tailwind CSS file
│   │   ├── components.css     # Component-specific styles
│   │   └── variables.css      # CSS custom properties
│   ├── pages/                  # Page-specific JavaScript
│   │   ├── dashboard.js       # Dashboard functionality
│   │   ├── clients.js         # Client management page
│   │   ├── vehicles.js        # Vehicle management page
│   │   ├── appointments.js    # Appointment management
│   │   ├── inventory.js       # Inventory management
│   │   └── financial.js       # Financial management
│   └── app.js                  # Main application entry point
├── server/                      # Backend source code
│   ├── controllers/            # Route controllers
│   │   ├── clientController.js
│   │   ├── vehicleController.js
│   │   ├── appointmentController.js
│   │   ├── inventoryController.js
│   │   └── financialController.js
│   ├── models/                 # Database models
│   │   ├── Client.js
│   │   ├── Vehicle.js
│   │   ├── Appointment.js
│   │   ├── Inventory.js
│   │   └── Invoice.js
│   ├── routes/                 # API routes
│   │   ├── clients.js
│   │   ├── vehicles.js
│   │   ├── appointments.js
│   │   ├── inventory.js
│   │   └── financial.js
│   ├── middleware/             # Custom middleware
│   │   ├── auth.js            # Authentication middleware
│   │   ├── validation.js      # Request validation
│   │   └── errorHandler.js    # Error handling
│   ├── database/               # Database configuration
│   │   ├── connection.js      # SQLite connection setup
│   │   ├── migrations/        # Database migrations
│   │   └── seeds/             # Sample data
│   ├── utils/                  # Server utilities
│   │   ├── logger.js          # Logging utility
│   │   ├── email.js           # Email service
│   │   └── qrGenerator.js     # QR code generation
│   └── index.js                # Server entry point
├── config/                      # Configuration files
│   ├── database.js             # Database configuration
│   ├── api.js                  # API endpoints configuration
│   ├── colors.js               # Centralized color scheme
│   └── app.js                  # Application configuration
├── public/                      # Static assets
│   ├── images/                 # Image assets
│   ├── icons/                  # Icon files
│   └── uploads/                # User uploaded files
├── dist/                        # Built/compiled files
├── tests/                       # Test files
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
├── docs/                        # Documentation
│   ├── api.md                  # API documentation
│   ├── database.md             # Database schema
│   └── deployment.md           # Deployment guide
├── index.html                   # Main HTML file
├── tailwind.config.js          # Tailwind configuration
├── webpack.config.js           # Webpack configuration
├── .eslintrc.js                # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

## Development Guidelines

### Code Organization
1. **Modular Architecture**: Break down functionality into small, reusable modules
2. **Separation of Concerns**: Keep UI, business logic, and data access separate
3. **Single Responsibility**: Each function/class should have one clear purpose
4. **DRY Principle**: Don't repeat yourself - centralize common functionality

### Naming Conventions
- **Files**: Use kebab-case (e.g., `client-service.js`)
- **Variables/Functions**: Use camelCase (e.g., `getUserData`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Classes**: Use PascalCase (e.g., `ClientService`)
- **CSS Classes**: Use BEM methodology with Tailwind utilities

### Styling Guidelines
1. **Centralized Colors**: Use the color scheme defined in `config/colors.js`
2. **Component-Based Styling**: Create reusable style components
3. **Responsive Design**: Mobile-first approach with Tailwind breakpoints
4. **Consistent Spacing**: Use Tailwind's spacing scale consistently
5. **Accessibility**: Follow WCAG guidelines for color contrast and keyboard navigation

### API Design
1. **RESTful Routes**: Follow REST conventions for API endpoints
2. **Consistent Response Format**: Use standardized JSON response structure
3. **Error Handling**: Implement comprehensive error handling with appropriate HTTP status codes
4. **Validation**: Validate all input data on both client and server sides
5. **Security**: Implement authentication, authorization, and input sanitization

### Database Design
1. **Normalized Structure**: Follow database normalization principles
2. **Proper Indexing**: Index frequently queried columns
3. **Foreign Key Constraints**: Maintain referential integrity
4. **Soft Deletes**: Use soft deletes for important records
5. **Audit Trail**: Track creation and modification timestamps

### Performance Guidelines
1. **Lazy Loading**: Load components and data on demand
2. **Caching**: Implement appropriate caching strategies
3. **Optimized Queries**: Write efficient database queries
4. **Asset Optimization**: Minimize and compress CSS/JS files
5. **Progressive Enhancement**: Ensure basic functionality works without JavaScript

## Color Scheme
```javascript
// Primary Colors
primary: {
  50: '#eff6ff',
  100: '#dbeafe',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a'
}

// Status Colors
success: '#10b981',
warning: '#f59e0b',
error: '#ef4444',
info: '#06b6d4'

// Neutral Colors
gray: {
  50: '#f9fafb',
  100: '#f3f4f6',
  500: '#6b7280',
  800: '#1f2937',
  900: '#111827'
}
```

## API Endpoints Structure
```
Base URL: /api/v1

Authentication:
POST /auth/login
POST /auth/logout
POST /auth/refresh

Clients:
GET    /clients
POST   /clients
GET    /clients/:id
PUT    /clients/:id
DELETE /clients/:id

Vehicles:
GET    /vehicles
POST   /vehicles
GET    /vehicles/:id
PUT    /vehicles/:id
DELETE /vehicles/:id
GET    /clients/:id/vehicles

Appointments:
GET    /appointments
POST   /appointments
GET    /appointments/:id
PUT    /appointments/:id
DELETE /appointments/:id
GET    /appointments/today
GET    /appointments/calendar/:date

Inventory:
GET    /inventory
POST   /inventory
GET    /inventory/:id
PUT    /inventory/:id
DELETE /inventory/:id
GET    /inventory/low-stock

Financial:
GET    /invoices
POST   /invoices
GET    /invoices/:id
PUT    /invoices/:id
DELETE /invoices/:id
GET    /payments
POST   /payments
```

## Development Workflow

### Setup
1. Clone the repository
2. Run `npm install` to install dependencies
3. Set up environment variables in `.env` file
4. Run `npm run dev` to start development servers
5. Access the application at `http://localhost:3000`

### Daily Development
1. Pull latest changes from main branch
2. Create feature branch for new work
3. Write tests for new functionality
4. Implement features following the guidelines
5. Run linting and formatting tools
6. Test thoroughly before committing
7. Create pull request for code review

### Testing Strategy
1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test API endpoints and database interactions
3. **E2E Tests**: Test complete user workflows
4. **Manual Testing**: Test UI/UX on different devices and browsers

## Deployment Plan

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up project structure and development environment
- [ ] Create centralized configuration and styling system
- [ ] Implement basic authentication and user management
- [ ] Set up database schema and initial migrations
- [ ] Create core API endpoints for CRUD operations

### Phase 2: Core Features (Weeks 3-5)
- [ ] Implement client management system
- [ ] Build vehicle management functionality
- [ ] Create appointment scheduling system
- [ ] Develop inventory management features
- [ ] Build basic financial management (invoicing)

### Phase 3: Advanced Features (Weeks 6-7)
- [ ] Implement QR code scanning functionality
- [ ] Add reporting and analytics dashboard
- [ ] Create email notification system
- [ ] Build mobile-responsive interface
- [ ] Add data export/import capabilities

### Phase 4: Polish & Deployment (Week 8)
- [ ] Comprehensive testing and bug fixes
- [ ] Performance optimization
- [ ] Security audit and improvements
- [ ] Documentation completion
- [ ] Production deployment setup

### Deployment Environment
1. **Development**: Local development with live-reload
2. **Staging**: Cloud deployment for testing (e.g., Heroku, Vercel)
3. **Production**: Stable cloud deployment with monitoring

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate installed
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented
- [ ] Performance monitoring enabled
- [ ] Error tracking configured
- [ ] Load testing completed

## Security Considerations
1. **Input Validation**: Validate and sanitize all user inputs
2. **Authentication**: Implement secure login with JWT tokens
3. **Authorization**: Role-based access control
4. **Data Protection**: Encrypt sensitive data at rest and in transit
5. **CORS Configuration**: Properly configure cross-origin requests
6. **Rate Limiting**: Implement API rate limiting
7. **SQL Injection Prevention**: Use parameterized queries
8. **XSS Prevention**: Sanitize output and use CSP headers

## Performance Targets
- **Page Load Time**: < 3 seconds on 3G connection
- **API Response Time**: < 500ms for most endpoints
- **Database Query Time**: < 100ms for simple queries
- **Bundle Size**: < 500KB for JavaScript bundles
- **Lighthouse Score**: > 90 for Performance, Accessibility, SEO

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Maintenance and Updates
1. **Regular Updates**: Keep dependencies updated monthly
2. **Security Patches**: Apply security updates immediately
3. **Feature Releases**: Monthly feature releases
4. **Bug Fixes**: Weekly bug fix releases as needed
5. **Backup Strategy**: Daily database backups with weekly full system backups

## Resources and References
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [SQLite Documentation](https://sqlite.org/docs.html)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [JavaScript Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)

---

This document should be referenced by any LLM or developer working on the MoMech project to ensure consistency and adherence to project standards.

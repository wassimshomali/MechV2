# Background Agent Instructions for MoMech Development

## 🎯 Repository Information
- **Repository URL**: https://github.com/wassimshomali/MechV2.git
- **Branch**: `main` (work on `overnight-development` branch)
- **Project**: MoMech - Mechanic ERP/CRM System

## 🚀 Quick Start for Background Agent

### 1. Clone and Setup
```bash
git clone https://github.com/wassimshomali/MechV2.git
cd MechV2
npm install
git checkout -b overnight-development
```

### 2. Verify Setup
```bash
# Test that everything works
npm run dev
# Should start both frontend (port 3000) and backend (port 3001)
```

### 3. Main Task
**READ THE COMPLETE TASK**: `OVERNIGHT_DEVELOPMENT_PROMPT.md`

This file contains the comprehensive instructions for completing the entire application.

## 📋 Key Deliverables Required

### 🗄️ Database & Seed Data (FIRST PRIORITY)
- Create `server/database/seeds/001_sample_data.sql`
- Generate 20-30 clients, 40-60 vehicles, 50+ appointments
- 100+ realistic auto parts inventory items
- Complete service history, invoices, payments
- All foreign key relationships properly populated

### 🛠️ Complete API Routes (SECOND PRIORITY)
Create these missing route files:
- `server/routes/vehicles.js` - Full CRUD for vehicles
- `server/routes/appointments.js` - Appointment management
- `server/routes/inventory.js` - Inventory management
- `server/routes/financial.js` - Invoices and payments
- `server/routes/services.js` - Service templates
- `server/routes/work-orders.js` - Work order management

### 🎨 Frontend Refactor (THIRD PRIORITY)
- Convert `index.html` to proper SPA structure
- Create all component files in `src/components/`
- Implement routing system in `src/utils/router.js`
- Build service layer for API communication
- Make every page fully functional with real data

### ✅ Complete UI Functionality (CRITICAL)
- Every sidebar menu item must work
- All tables with sorting, pagination, search
- All forms with validation and submission
- All CRUD operations functional
- Mobile responsive design

## 🚨 Critical Requirements

### No Authentication
- Remove ALL authentication middleware from server
- Remove token requirements from API calls
- All routes should be publicly accessible

### Real Data Only
- No mock data - everything from database
- All statistics and charts with actual data
- Complete relationships between entities

### Complete Functionality
- Every button, form, and interaction must work
- Error handling throughout
- Loading states for async operations
- Success/error notifications

## 📁 Key Files to Reference

1. **`dev.md`** - Development guidelines and standards
2. **`OVERNIGHT_DEVELOPMENT_PROMPT.md`** - Complete task specification
3. **`config/`** - All configuration files
4. **`server/database/migrations/001_initial_schema.sql`** - Database structure

## 🎯 Success Criteria

When complete, user should be able to:
- Navigate to any page via sidebar
- See real data from database on every page
- Create, edit, update, delete records in all sections
- Use search and filters
- Generate invoices and record payments
- Track inventory with low-stock alerts
- Schedule and manage appointments
- View dashboard analytics with real data

## 📊 Development Workflow

### Recommended Order:
1. **Database Seeds** - Create comprehensive test data
2. **API Routes** - Build all missing endpoints
3. **Remove Auth** - Strip authentication from server
4. **Frontend Refactor** - Convert to SPA components
5. **UI Implementation** - Make everything interactive
6. **Testing** - Verify all functionality works
7. **Polish** - Error handling, loading states, notifications

### Commit Strategy:
```bash
git add .
git commit -m "feat: create comprehensive database seed data"
git push origin overnight-development

git add .
git commit -m "feat: implement vehicle management API routes"
git push origin overnight-development

git add .
git commit -m "refactor: convert HTML to SPA components"
git push origin overnight-development
```

## 🔧 Technical Notes

### Database:
- SQLite database at `./database/momech.db`
- Migrations run automatically on server start
- Use existing connection in `server/database/connection.js`

### Styling:
- Use existing Tailwind classes
- Follow color scheme in `config/colors.js`
- Maintain responsive design
- Use existing component classes

### API:
- Follow RESTful conventions
- Use existing error handling patterns
- Return consistent JSON responses
- Implement proper validation

## ⚠️ Important Notes

1. **Test Everything**: Every feature must work end-to-end
2. **Mobile First**: Ensure mobile compatibility
3. **Performance**: Fast loading, efficient queries
4. **Error Handling**: Graceful error states
5. **Real Data**: No hardcoded or mock data

## 📞 Verification Checklist

Before finishing:
- [ ] All API routes return proper responses
- [ ] Database has comprehensive seed data
- [ ] Frontend loads without console errors
- [ ] All sidebar navigation functional
- [ ] All CRUD operations work
- [ ] Search and filtering operational
- [ ] Forms validate and submit correctly
- [ ] Tables sort and paginate
- [ ] Mobile responsive design works
- [ ] All data relationships display correctly

## 🎉 Final Steps

When development is complete:
1. **Test thoroughly** - Every feature and page
2. **Create Pull Request** from `overnight-development` to `main`
3. **Document any issues** or incomplete features
4. **Provide testing instructions** for the user

## 🚀 Repository Status
- ✅ All foundation files committed
- ✅ Database schema ready
- ✅ Server structure complete
- ✅ Configuration files ready
- ✅ Development environment configured

**You have everything needed to complete this project overnight!**

Good luck! 🎯

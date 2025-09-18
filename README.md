# MoMech - Mechanic ERP/CRM System

A comprehensive digital transformation tool designed for small garage mechanics to manage their business operations efficiently.

## 🚗 Features

- **Client Management**: Complete customer database with contact information and service history
- **Vehicle Management**: Track vehicle details, service records, and maintenance schedules
- **Appointment Scheduling**: Advanced calendar system with mechanic assignment and notifications
- **Work Order Management**: Detailed service tracking with parts and labor
- **Inventory Management**: Parts and supplies tracking with low-stock alerts
- **Financial Management**: Invoicing, payments, and financial reporting
- **QR Code Integration**: Quick access to vehicle and client information
- **Dashboard Analytics**: Business insights and performance metrics
- **Mobile Responsive**: Works seamlessly on all devices

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: SQLite with migrations
- **Authentication**: JWT tokens
- **Build Tools**: Webpack, Tailwind CLI
- **Development**: Live-server, Nodemon

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MechV2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:3001`
   - Frontend dev server on `http://localhost:3000`

5. **Access the application**
   Open `http://localhost:3000` in your browser

## 📁 Project Structure

```
MechV2/
├── src/                          # Frontend source code
│   ├── components/              # Reusable UI components
│   ├── services/               # API service layer
│   ├── utils/                  # Utility functions
│   ├── styles/                 # Styling files
│   └── pages/                  # Page-specific JavaScript
├── server/                      # Backend source code
│   ├── controllers/            # Route controllers
│   ├── models/                 # Database models
│   ├── routes/                 # API routes
│   ├── middleware/             # Custom middleware
│   ├── database/               # Database setup and migrations
│   └── utils/                  # Server utilities
├── config/                      # Configuration files
├── public/                      # Static assets
├── docs/                        # Documentation
└── tests/                       # Test files
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development servers (frontend + backend)
- `npm start` - Start production server
- `npm run server:dev` - Start backend development server only
- `npm run client:dev` - Start frontend development server only
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Database Management

The application uses SQLite with automatic migrations:

- Database file: `./database/momech.db`
- Migrations: `./server/database/migrations/`
- Seeds: `./server/database/seeds/`

Migrations run automatically on server start.

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3001
HOST=localhost
NODE_ENV=development

# Database
DB_PATH=./database/momech.db

# Security
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 📚 API Documentation

### Authentication

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/profile` - Get user profile

### Clients

- `GET /api/v1/clients` - Get all clients
- `POST /api/v1/clients` - Create new client
- `GET /api/v1/clients/:id` - Get client by ID
- `PUT /api/v1/clients/:id` - Update client
- `DELETE /api/v1/clients/:id` - Delete client

### Vehicles

- `GET /api/v1/vehicles` - Get all vehicles
- `POST /api/v1/vehicles` - Create new vehicle
- `GET /api/v1/vehicles/:id` - Get vehicle by ID
- `PUT /api/v1/vehicles/:id` - Update vehicle
- `DELETE /api/v1/vehicles/:id` - Delete vehicle

### Appointments

- `GET /api/v1/appointments` - Get all appointments
- `POST /api/v1/appointments` - Create new appointment
- `GET /api/v1/appointments/:id` - Get appointment by ID
- `PUT /api/v1/appointments/:id` - Update appointment
- `DELETE /api/v1/appointments/:id` - Delete appointment

### Dashboard

- `GET /api/v1/dashboard/stats` - Get dashboard statistics
- `GET /api/v1/dashboard/recent-activity` - Get recent activity
- `GET /api/v1/dashboard/alerts` - Get system alerts

For complete API documentation, see [docs/api.md](docs/api.md)

## 🎨 Styling Guidelines

The project uses Tailwind CSS with a centralized color system:

- Colors are defined in `config/colors.js`
- Custom components are in `tailwind.config.js`
- Main styles are in `src/styles/main.css`

### Color Palette

- **Primary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)
- **Info**: Cyan (#06b6d4)

## 🧪 Testing

Run tests with:

```bash
npm test
```

Test files are located in the `tests/` directory:

- `tests/unit/` - Unit tests
- `tests/integration/` - Integration tests
- `tests/e2e/` - End-to-end tests

## 📦 Deployment

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   export NODE_ENV=production
   export JWT_SECRET=your-production-jwt-secret
   export SESSION_SECRET=your-production-session-secret
   ```

3. **Start the server**
   ```bash
   npm start
   ```

### Docker Deployment

```bash
# Build Docker image
docker build -t momech .

# Run container
docker run -p 3001:3001 -e NODE_ENV=production momech
```

### Cloud Deployment

The application can be deployed to various cloud platforms:

- **Heroku**: See [docs/deployment.md](docs/deployment.md)
- **Vercel**: Frontend deployment
- **Railway**: Full-stack deployment
- **AWS**: EC2 or Elastic Beanstalk

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the coding standards defined in `.eslintrc.js`
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please:

1. Check the [documentation](docs/)
2. Search existing [issues](../../issues)
3. Create a new issue if needed

## 🗺️ Roadmap

- [ ] Mobile app development
- [ ] Multi-location support
- [ ] Advanced reporting
- [ ] Customer portal
- [ ] SMS notifications
- [ ] Integration with accounting software
- [ ] Automated backup system
- [ ] Advanced analytics dashboard

## 👥 Team

- **Development Team**: MoMech Solutions
- **Project Type**: Digital transformation tool for automotive service businesses

## 📊 Project Status

Current Version: 1.0.0
Status: In Development

---

**MoMech** - Transforming small garage operations through digital innovation.
# MechV2
# MechV2

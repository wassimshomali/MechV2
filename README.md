# MoMech - Mechanic ERP/CRM System

A digital transformation tool for small garage mechanics to manage clients, vehicles, appointments, inventory, work orders, and invoicing.

## Features

- **Client Management** — customer database with contact info and service history
- **Vehicle Management** — vehicle details, service records, VIN/plate tracking
- **Appointment Scheduling** — calendar with mechanic assignment
- **Work Order Management** — service tracking with parts and labor
- **Inventory Management** — parts tracking with low-stock alerts
- **Financial Management** — invoicing, payments, and revenue reports
- **Dashboard Analytics** — business metrics and recent activity
- **Mobile Responsive** — works on desktop and mobile browsers

## Tech Stack

- **Frontend**: Vanilla JavaScript SPA, Tailwind CSS, hash-based routing
- **Backend**: Node.js, Express.js
- **Database**: SQLite with migrations and seed data
- **Build**: Webpack, Tailwind CLI
- **Testing**: Jest, Supertest
- **CI**: GitHub Actions

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start development (backend :3001 + frontend :3000)
npm run dev
```

Open http://localhost:3000 in your browser. The backend API runs at http://localhost:3001.

## Project Structure

```
MechV2/
├── src/                    # Frontend SPA
│   ├── app.js              # Application entry point
│   ├── components/         # UI components (dashboard, clients, etc.)
│   ├── services/           # API service layer
│   ├── utils/              # Router, state manager, helpers
│   └── styles/             # Tailwind CSS source
├── server/                 # Express backend
│   ├── routes/             # API route handlers
│   ├── database/           # Migrations, seeds, connection
│   ├── middleware/         # Error handling
│   └── utils/              # Logger
├── config/                 # App, API, and color configuration
├── docs/                   # API documentation
├── tests/                  # Integration tests
└── index.html              # SPA shell
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend + frontend dev servers |
| `npm start` | Start production server |
| `npm test` | Run integration tests |
| `npm run lint` | Run ESLint |
| `npm run build` | Build CSS and JS for production |
| `npm run format` | Format code with Prettier |

## Authentication

MoMech is designed as a **single-user application**. All API routes are accessible without authentication tokens. Auth endpoints exist for optional future use but registration is disabled by default. Set `ENABLE_REGISTRATION=true` in `.env` to allow new user registration.

## API Documentation

See [docs/api.md](docs/api.md) for the full endpoint reference.

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | Environment |
| `DB_PATH` | `./database/momech.db` | SQLite database path |
| `JWT_SECRET` | — | Required in production |
| `SESSION_SECRET` | — | Required in production |
| `ENABLE_REGISTRATION` | `false` | Allow user registration |

## Testing

```bash
npm test
```

Tests use a separate SQLite database and cover health checks, client CRUD, route ordering, dashboard stats, and auth behavior.

## Production Deployment

```bash
npm run build
NODE_ENV=production JWT_SECRET=your-secret SESSION_SECRET=your-secret npm start
```

The server serves the SPA from `index.html` and static assets from `src/` and `dist/`.

## License

MIT

---

**MoMech** — Transforming small garage operations through digital innovation.

# MoMech API Reference

Base URL: `http://localhost:3001/api/v1`

This is a single-user application. All resource routes are accessible without authentication.

## Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check (outside `/api/v1`) |

## Clients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/clients` | List clients (pagination, search, sort) |
| GET | `/clients/search?q=` | Quick search (min 2 chars) |
| GET | `/clients/:id` | Get client with vehicles and appointments |
| POST | `/clients` | Create client |
| PUT | `/clients/:id` | Update client |
| DELETE | `/clients/:id` | Soft-delete client |
| GET | `/clients/:id/vehicles` | Client's vehicles |
| GET | `/clients/:id/appointments` | Client's appointments |

## Vehicles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vehicles` | List vehicles |
| GET | `/vehicles/search?q=` | Search vehicles |
| GET | `/vehicles/:id` | Get vehicle details |
| POST | `/vehicles` | Create vehicle |
| PUT | `/vehicles/:id` | Update vehicle |
| DELETE | `/vehicles/:id` | Soft-delete vehicle |
| GET | `/vehicles/:id/service-history` | Service history |
| GET | `/vehicles/:id/appointments` | Vehicle appointments |

## Appointments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/appointments` | List appointments (filters: date, status, client) |
| GET | `/appointments/today` | Today's appointments |
| GET | `/appointments/calendar/:date` | Calendar view (`?view=week\|month`) |
| GET | `/appointments/:id` | Get appointment |
| POST | `/appointments` | Create appointment |
| PUT | `/appointments/:id` | Update appointment |
| PUT | `/appointments/:id/status` | Update status |
| DELETE | `/appointments/:id` | Cancel appointment |

## Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory` | List inventory items |
| GET | `/inventory/low-stock` | Low-stock items |
| GET | `/inventory/categories` | Categories |
| GET | `/inventory/search?q=` | Search items |
| GET | `/inventory/:id` | Get item |
| POST | `/inventory` | Create item |
| PUT | `/inventory/:id` | Update item |
| DELETE | `/inventory/:id` | Soft-delete item |
| POST | `/inventory/:id/adjust` | Adjust stock quantity |

## Financial

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/financial/invoices` | List invoices |
| POST | `/financial/invoices` | Create invoice |
| GET | `/financial/invoices/:id` | Get invoice |
| PUT | `/financial/invoices/:id` | Update invoice |
| DELETE | `/financial/invoices/:id` | Delete invoice |
| GET | `/financial/payments` | List payments |
| POST | `/financial/payments` | Record payment |
| GET | `/financial/reports/revenue` | Revenue report |
| GET | `/financial/reports/outstanding` | Outstanding invoices |

## Services & Work Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/services` | List service templates |
| GET | `/work-orders` | List work orders |
| GET | `/work-orders/:id` | Get work order |

## Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Dashboard statistics |
| GET | `/dashboard/recent-activity` | Recent activity feed |
| GET | `/dashboard/upcoming-appointments` | Upcoming appointments |
| GET | `/dashboard/revenue-chart` | Revenue chart data |
| GET | `/dashboard/alerts` | System alerts |
| GET | `/dashboard/metrics` | Business metrics |

## Auth (optional, disabled by default)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/logout` | User logout |
| POST | `/auth/refresh` | Refresh token |
| GET | `/auth/profile` | Get user profile |
| POST | `/auth/register` | Register (requires `ENABLE_REGISTRATION=true`) |

# Grassroots Backend

This backend powers the Grassroots sales lead system and serves the frontend from the sibling `frontend` folder.

## Current Local Database

The backend is now wired to a local MySQL dev instance with:

- host: `127.0.0.1`
- port: `3307`
- database: `grassroots_sales`
- user: `root`
- password: empty

Useful files:

- `backend/.env`
- `backend/schema.sql`
- `backend/scripts/start-mysql-dev.ps1`
- `backend/scripts/stop-mysql-dev.ps1`

## Structure

- `server.js`: starts the HTTP server
- `app.js`: Express app bootstrap
- `db.js`: Sequelize/MySQL connection bootstrap
- `routes`: API route definitions
- `Controllers`: request handlers
- `Middleware`: request middleware
- `Models`: Sequelize model definitions and associations
- `utils/services`: business logic
- `utils/repositories`: persistence layer
- `utils`: shared helpers for fiscal logic, auth tokens, validation, and lead logic
- `data/*.json`: JSON fallback persistence when no database is configured
- `schema.sql`: MySQL schema

## Run

```powershell
cd backend
npm install
npm run dev
```

If the local MySQL dev server is not already running, start it first:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-mysql-dev.ps1
```

Open:

`http://localhost:3000`

## Environment

Copy `.env.example` to `.env`.

Supported variables:

- `PORT`: backend port
- `JWT_SECRET`: JWT signing secret
- `DATABASE_URL`: optional full DB connection string
- `DB_DIALECT`: database dialect, currently `mysql`
- `DB_HOST`: database host
- `DB_PORT`: database port
- `DB_NAME`: database name
- `DB_USER`: database username
- `DB_PASSWORD`: database password
- `AUTO_MIGRATE`: `true` to auto-apply `schema.sql` on startup

## Storage Modes

### JSON fallback

If `DATABASE_URL` is not set, the backend uses:

- `data/users.json`
- `data/clients.json`
- `data/leads.json`

This is useful while the final database is not available yet.

### MySQL

If DB settings are set in `.env`, repositories use Sequelize with MySQL.

If `AUTO_MIGRATE=true`, the backend will try to apply `schema.sql` on startup.

## Main API

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`

### Leads

- `GET /api/leads`
- `GET /api/leads/:id`
- `GET /api/leads/:id/activity`
- `POST /api/leads`
- `PATCH /api/leads/:id`
- `DELETE /api/leads/:id`
- `POST /api/leads/:id/comments`

### Clients

- `GET /api/clients`
- `GET /api/clients/:id`
- `GET /api/clients/:id/leads`
- `POST /api/clients`
- `PATCH /api/clients/:id`

### Users

- `GET /api/users`
- `GET /api/users/analytics`
- `GET /api/users/:id`
- `PATCH /api/users/me`
- `PATCH /api/users/:id`

### Reports

- `GET /api/reports/dashboard`
- `GET /api/reports/summary`
- `GET /api/reports/team-performance`
- `GET /api/reports/owners/:owner`

## Current Rules

- JWT auth is required for all non-auth API routes
- lead updates/deletes/comments are restricted to the lead owner or an administrator
- closed leads cannot be edited
- comments are blocked once a lead is closed
- activity timeline is persisted on the lead record

## Tests

```powershell
npm test
```

The test suite currently covers:

- login
- authenticated lead listing
- authenticated client listing
- authenticated report summary

# HostelSwap

A campus marketplace for buying and selling pre-loved textbooks, electronics, room essentials, sports gear, and cycles. Students list items, find nearby sellers, and arrange pickup by college email.

Built with **React 19, Vite, Tailwind CSS, Express 5, and PostgreSQL 17**. The interface uses a campus noticeboard style with responsive desktop and mobile layouts.

## Features

- College-domain registration, login, and protected account routes.
- Search, category, price, condition, and hostel-block filters; sorting and pagination.
- Listing creation with photos, editing, deletion, and sold/available status.
- Seller contact details for signed-in buyers and campus pickup information.
- Profile and personal listing management.
- Listing reports and administrator hide/restore controls.
- Saved listing hearts stored on the current device.
- Persistent database and uploaded photos when running with Docker.

Buyers and sellers arrange payment directly. The app does not include checkout or real-time chat. College-domain checks do not verify ownership of an email address.

## Quick start with Docker

**Requirements:** Docker Desktop or Docker Engine with Docker Compose v2. Node.js and a local PostgreSQL installation are not needed for this option.

From the repository root:

```bash
cp .env.example .env
docker compose up --build -d
```

Open **http://localhost:8080**. The first start downloads dependencies, initializes PostgreSQL, and adds demo data. To inspect startup:

```bash
docker compose ps
docker compose logs -f
```

Edit `.env` to change the port, college domains, or credentials. The example values are for local demonstrations. Before deploying publicly, replace the database password and JWT secret, and review [deployment considerations](docs/SECURITY.md). Generate a JWT secret with:

```bash
openssl rand -hex 32
```

Common commands:

| Command | Purpose |
| --- | --- |
| `docker compose up --build -d` | Build and start all three services |
| `docker compose logs -f backend` | Follow API logs |
| `docker compose down` | Stop containers; keep database and uploaded photos |
| `docker compose exec backend npm run seed` | Add any missing demo data |
| `bash scripts/compose-smoke.sh` | Check the running Docker stack |

`docker compose down -v` **deletes the database and uploaded photos**. Use it only when intentionally resetting disposable local data. Changes to `database/init.sql` apply automatically only to a fresh database volume.

## Run locally without Docker

**Requirements:** Node.js **22.12 or newer**, npm, and a running PostgreSQL server. `.nvmrc` selects Node 22 if you use nvm.

### 1. Install dependencies

Run from the repository root:

```bash
npm run setup
```

This installs the backend and frontend using their committed lockfiles. There are no root application dependencies.

### 2. Create and initialize the database

Using an account with PostgreSQL administration privileges:

```bash
psql -U postgres -c "CREATE USER hostelswap WITH PASSWORD 'classroom-db-change-me';"
psql -U postgres -c "CREATE DATABASE hostelswap OWNER hostelswap;"
psql "postgresql://hostelswap:classroom-db-change-me@localhost:5432/hostelswap" -v ON_ERROR_STOP=1 -f database/init.sql
```

These are first-time setup commands. Skip user/database creation if they already exist. Adjust the administrator username, password, and host for your PostgreSQL installation.

### 3. Configure the backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` so `DATABASE_URL` matches your database. The supplied example matches the commands above. With `SEED_DEMO=true`, the API adds missing demo data on startup.

The root `.env` configures Docker Compose; `backend/.env` configures the API when running Node directly. The frontend uses relative `/api` and `/uploads` paths and does not need an environment file.

### 4. Start the API and frontend

In one terminal, from the repository root:

```bash
npm run dev:backend
```

In a second terminal:

```bash
npm run dev:frontend
```

Open **http://localhost:5173**. The API runs at **http://localhost:3000**, and Vite proxies API and photo requests to it. Check API readiness at **http://localhost:3000/api/health**. Stop each development server with `Ctrl+C`.

## Demo accounts

With the default `COLLEGE_EMAIL_DOMAINS=college.edu`, all accounts below use **`CampusSwap2026!`** unless you change `DEMO_PASSWORD` before their creation.

| Name | Email | Role |
| --- | --- | --- |
| Aarav Sharma | aarav@college.edu | Student |
| Ananya Rao | ananya@college.edu | Student |
| Rohan Mehta | rohan@college.edu | Student |
| Ishita Singh | admin@college.edu | Administrator |

Seeded accounts use the first configured college domain. Seeding preserves existing accounts and passwords; changing `DEMO_PASSWORD` does not update existing users. Set `SEED_DEMO=false` to disable automatic demo seeding. Browser tests use separate, temporary accounts and credentials.

## Project structure

```text
hostelswap/
├── frontend/
│   ├── src/
│   │   ├── main.jsx                 # React entry point
│   │   ├── App.jsx                  # Providers and application layout
│   │   ├── routes/                  # Route table, auth guard, scroll reset
│   │   ├── pages/                   # Home, marketplace, auth, listings, etc.
│   │   ├── components/
│   │   │   ├── layout/              # Header and footer
│   │   │   ├── listings/            # Shared listing card
│   │   │   └── ui/                  # Fields, dialogs, loading, errors, toast
│   │   ├── context/                 # Session, categories, notifications
│   │   ├── constants/               # Category labels and icons
│   │   ├── lib/                     # API client and formatting helpers
│   │   └── styles/                  # Global styling and responsive design
│   ├── public/                     # Favicon and bundled demo illustrations
│   ├── e2e/                        # Playwright tests and fixtures
│   ├── vite.config.js              # Development API/upload proxy
│   └── nginx.conf                  # Production proxy and SPA fallback
├── backend/
│   ├── src/
│   │   ├── app.js                   # Express configuration and route mounting
│   │   ├── server.js                # Startup and graceful shutdown
│   │   ├── routes/                  # Auth, users, listings, reports, admin, system
│   │   ├── middleware/              # Authentication and centralized errors
│   │   ├── services/                # Image validation, storage, cleanup
│   │   ├── validation/              # Shared Zod schemas
│   │   ├── utils/                   # HTTP error helper
│   │   ├── db/                     # Shared SQL query fragments
│   │   ├── db.js                    # PostgreSQL connection pool
│   │   └── seed*.js                 # Demo data and seed command
│   └── tests/                      # API tests and browser-test API server
├── database/init.sql               # Tables, constraints, indexes, categories
├── scripts/compose-smoke.sh         # Running Docker-stack smoke check
├── docs/                           # API, architecture, security, validation
├── .github/workflows/ci.yml         # Automated checks on pushes and PRs
├── .env.example                    # Docker configuration template
├── docker-compose.yml              # Frontend, backend, database services
└── package.json                    # Root convenience commands
```

The frontend route table lives in `frontend/src/routes/AppRoutes.jsx`. Add page components in `pages/` and wire their URLs there. Backend resource routers live in `backend/src/routes/` and are mounted under `/api` by `backend/src/app.js`. Runtime dependencies are injected into routers so tests can use an isolated database.

## Frontend routes

| URL | Page | Access |
| --- | --- | --- |
| `/` | Home | Public |
| `/marketplace` | Search and browse | Public |
| `/listings/:id` | Listing details | Public; contact requires login |
| `/login`, `/register` | Authentication | Public |
| `/sell` | Create listing | Signed in |
| `/listings/:id/edit` | Edit listing | Owner |
| `/my-listings` | Manage listings | Signed in |
| `/profile` | Edit profile | Signed in |
| `/admin` | Review reports | Administrator |
| `/help` | Help and community guidelines | Public |

The frontend guard handles navigation; the API independently enforces authentication, ownership, and administrator permissions.

## Configuration

| Variable | Used by | Purpose |
| --- | --- | --- |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Docker | Database identity and password |
| `FRONTEND_PORT` | Docker | Website port; defaults to `8080` |
| `DATABASE_URL` | Local API | PostgreSQL connection string |
| `JWT_SECRET` | API | Signing secret; at least 32 characters |
| `COLLEGE_EMAIL_DOMAINS` | API | Exact allowed domains, comma-separated without `@` |
| `SEED_DEMO` | API | Seed demo data on startup when `true` |
| `DEMO_PASSWORD` | Seed | Password for newly created demo users; at least 10 characters |
| `PORT` | Local API | API port; defaults to `3000` |
| `FRONTEND_ORIGIN` | API | Allowed frontend origin; local default `http://localhost:5173` |
| `UPLOAD_DIR` | API | Photo storage; local default `./uploads` |
| `TRUST_PROXY` | Docker API | Set to `1` for the single Nginx proxy hop |

Use URL-safe database passwords with Compose's connection-string interpolation. If using reserved URL characters, encode them correctly in `DATABASE_URL`. Existing database volumes retain their original PostgreSQL credentials.

## Build and test

Run from the repository root after `npm run setup`:

```bash
# API regression tests; no external PostgreSQL server required
npm test

# Production frontend build, written to frontend/dist
npm run build

# Both of the above
npm run check

# Install the browser once
cd frontend
npx playwright install chromium
cd ..

# User journeys, keyboard interactions, mobile account controls, and responsive layouts
npm run test:e2e
```

API tests use PGlite with the real SQL schema and temporary uploads. Browser tests start their own temporary API on port `3000` and Vite on `5174`; stop local development servers using those ports first. On Linux CI, Playwright may require `npx playwright install --with-deps chromium`. `CHROMIUM_PATH` can select an existing Chromium executable.

The browser suite also checks keyboard focus in dialogs, removable search filters, recovery from malformed saved-item storage, mobile sign-out, guideline anchors, and page widths from 320px to 1440px. Screenshots and traces go into ignored `qa-artifacts/`. Tests do not use or modify your normal PostgreSQL database. GitHub Actions runs the API tests, frontend build, browser journeys, and a Docker smoke check on pushes and pull requests. Local Docker verification requires a working Docker daemon.

`frontend/dist` is the client build only. To run the complete built application with routing, API proxying, PostgreSQL, and uploads, use Docker Compose.

## Before pushing to GitHub

The repository includes ignore rules for dependencies, build output, uploads, browser artifacts, local agent configuration, and real environment files. Commit both application lockfiles and the `.env.example` templates.

From the root, inspect the files Git will include:

```bash
git status --short --untracked-files=all
```

After your checks pass, create a commit and push to your own repository:

```bash
git add .
git diff --cached --stat
git commit -m "Organize HostelSwap application and document setup"
# Add your repository URL if a remote is not already configured:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin HEAD
```

Replace the placeholder URL. If `origin` already exists, inspect it with `git remote -v` and skip the `remote add` command. Never commit real `.env` files or deployment credentials.

## Troubleshooting

| Problem | Check |
| --- | --- |
| Docker cannot connect | Start Docker Desktop or your Docker daemon. |
| Port `8080` is busy | Change `FRONTEND_PORT` in the root `.env`, then recreate Compose services. |
| API does not start | Verify `DATABASE_URL`, PostgreSQL availability, and the JWT secret length. |
| Local frontend cannot reach the API | Start the API on port `3000`; Vite proxies to that port. |
| College email rejected | Set `COLLEGE_EMAIL_DOMAINS` to your exact domain without `@`, then restart the API. |
| Photo rejected | Use a genuine JPEG, PNG, or WebP under 5 MB and 25 megapixels. |
| Browser tests cannot start | Free ports `3000` and `5174`, and install Playwright Chromium. |
| Database schema changes are missing | `init.sql` initializes new databases; existing data needs an explicit migration. |

## Further documentation

- [API endpoints and request formats](docs/API.md)
- [Architecture, Docker services, and database lifecycle](docs/ARCHITECTURE.md)
- [Security and deployment considerations](docs/SECURITY.md)
- [Verification record and environment limitations](docs/VALIDATION.md)
- [Demo walkthrough and viva notes](docs/VIVA.md)

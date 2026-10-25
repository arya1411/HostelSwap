# Verification record

Verified in the development workspace on 2026-10-25.

## Folder and route refactor

The frontend now separates route definitions, page components, shared UI, session state, API calls, formatting, constants, and styles. The backend separates resource routers, authentication/error middleware, validation schemas, image services, and shared SQL fragments. Public URL paths and API behavior are preserved. Root npm commands wrap the existing backend and frontend scripts.

The API suite (11 tests), Playwright suite (7 tests), and production frontend build were rerun after restructuring. The source also passed a referenced-identifier check. Root and backend environment templates remain public examples; real environment files, uploads, dependencies, build output, and local tool directories are ignored.

## Final UI and project review

Verified on 2026-10-25 after the UI refinements:

- **11 API tests** passed, covering authentication, uploads, ownership, filtering, reporting, moderation, and deletion.
- **7 browser tests** passed, including keyboard focus containment/restoration, mobile account navigation and sign-out, saved-item storage recovery, removable filters, hash navigation, and responsive public pages.
- A broader browser review checked **60 public, student, and admin page/viewport combinations** at 320, 390, 768, 1024, and 1440 pixels, with no horizontal overflow or runtime errors. Desktop, mobile, marketplace, profile, and selling screenshots were captured and reviewed.
- The production frontend build passed. All 48 source modules passed import/reference checks. Documentation links and all three package lockfiles were consistent.
- Frontend and backend dependency audits reported **zero known vulnerabilities**, including development dependencies.
- Compose configuration and smoke-script shell syntax passed. Docker runtime checks remain limited by daemon permissions, as described below.
- Git ignore rules exclude environment files, dependencies, uploads, builds, browser artifacts, and local agent configuration. No GitHub commit or push was performed.

UI refinements cover listing-card title alignment, search/filter controls, form sections and uploads, account statistics, help panels, loading states, mobile input sizing, keyboard navigation, and reduced-motion behavior.

## Completed

| Check | Result |
| --- | --- |
| Backend API suite | 11 passing tests |
| Desktop browser journey | Passed: register → protected selling route → genuine image upload → listing discovery/filter → separate buyer contact/report → edit → sold → delete |
| Mobile browser journey | Passed at 390 × 844: landing, no horizontal overflow, categories, filters, empty state, mobile navigation and help |
| Admin browser journey | Passed: student reports → admin signs in → reviews → hides → restores |
| Frontend production build | Passed with Vite |
| Dependency security audit | Full frontend and backend `npm audit` runs reported zero known vulnerabilities |
| Compose configuration | `docker compose config --quiet` passed after the folder refactor |
| Docker smoke script | Shell syntax checked |
| Visual review | Desktop hero and full mobile landing screenshots reviewed |

Automated API/browser runs used the actual schema and a temporary PGlite PostgreSQL engine, never a mocked repository. The production application uses `pg` with the PostgreSQL service. Host tests ran with Node 26; Dockerfiles and CI target Node 22. Browser tests used an available Chromium executable through `CHROMIUM_PATH`.

Browser-test fixture servers stopped when the test runner completed. Test state and screenshots are excluded from version control.

## Not executed here

Docker Compose is installed and configuration validation passes. The current workspace cannot access the Docker daemon (`permission denied` on `/var/run/docker.sock`), so these steps have **not** been verified here:

- Container image builds and Alpine/non-root runtime behavior.
- Starting all three services through `docker compose up --build`.
- Live Nginx-to-Express proxying inside the Compose network.
- Native PostgreSQL 17 startup and database health checks.
- Persistence of database records and uploaded images across container recreation.
- The live `scripts/compose-smoke.sh` run.

These are remaining environment-dependent verification steps, not claimed passes. Run them on a Docker-capable host using the README and viva checklist. The included GitHub Actions workflow is configured to run the application tests, build/start the actual Compose stack, run the live smoke test, print logs and stop containers. That workflow has not been pushed or executed from this workspace.

## Reproduce

```bash
npm ci --prefix backend
npm test --prefix backend
npm ci --prefix frontend
npm run build --prefix frontend
cd frontend
npx playwright install chromium
npm run test:e2e
cd ..
docker compose config --quiet
docker compose up --build -d --wait --wait-timeout 180
bash scripts/compose-smoke.sh
docker compose ps
```

Then perform the README's explicit down/up persistence check with a student-created listing and uploaded image. Do not use `down -v` during that check.

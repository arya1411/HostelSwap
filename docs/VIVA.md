# Docker viva and demo guide

## Before the presentation

- Install Docker with Compose v2; run `docker --version` and `docker compose version`.
- Build once while online so packages/images are cached: `docker compose build`.
- Keep `.env` private. Use the documented disposable demo accounts.
- Have two browser sessions ready (normal + incognito) for seller and buyer.
- Use a small real PNG/JPEG/WebP photo for a live listing.
- Read `docs/VALIDATION.md` and verify the Compose stack on your own Docker host.

## Live demonstration

1. Run `docker compose up --build -d`. Explain the three services.
2. Run `docker compose ps`; wait for all services to be healthy.
3. Open http://localhost:8080; show the landing page and category navigation.
4. Register a new allowed-domain student. Explain domain restriction and the missing email-verification limitation.
5. Create a listing with a photo and a distinctive title such as “Viva study lamp”.
6. Find it through search; show category, price, condition and block filtering and sorting.
7. Sign in as another student in incognito; show seller contact and submit a report.
8. Return to the seller; edit the price and mark the item sold. Show that it leaves available search.
9. Sign in as the admin; show reports, hide/restore and explain server-side authorization.
10. Run `docker compose logs -f backend`; Ctrl+C exits the viewer.
11. Run the database inspection command from README; show rows and statuses.
12. Run `docker compose down` and then `docker compose up -d`. Explain that containers are replaced while named volumes persist.
13. Reopen My Listings and show the same listing, status and uploaded photo.
14. Optionally run `bash scripts/compose-smoke.sh` to verify the actual container API.
15. Explain why `docker compose down -v` would destroy both saved database data and uploads. Do not use it during the persistence demo.

## Questions you can answer

**Why three containers?** Each service has one responsibility, an independent runtime and an independently rebuildable image.

**Why PostgreSQL rather than browser storage?** Accounts, listings and reports need shared persistent data, relationships, uniqueness, constraints and server-side access control. Browser state only stores a JWT for the tab's session and local saved item IDs.

**What is the difference between an image and a container?** An image is a repeatable application package; a container is an isolated running instance. Many containers can be created from one image.

**Why does Express connect to `database`, not `localhost`?** Each container has its own network namespace. Compose DNS resolves the database service's name on the shared bridge network.

**Why can the browser use `/api`?** Nginx serves React and forwards those paths internally to Express. The browser only contacts localhost:8080. It cannot resolve Docker service names itself.

**What survives a restart?** Named volume contents. PostgreSQL's files and uploaded photos live outside the disposable container filesystem. The browser token can expire independently without deleting account/listing data.

**How is startup ordering handled?** PostgreSQL reports readiness with `pg_isready`. Compose waits for healthy dependencies. Express retries connection setup too. Nginx starts after Express's health endpoint can query the database.

**What does a multi-stage build do?** Node/Vite builds the frontend, then only the built files enter the Nginx runtime image. Build tools and frontend development dependencies stay out of the runtime image.

**Why non-root users?** Express uses the Node image's `node` user; Nginx uses an unprivileged image and a non-privileged port. This limits container process privileges.

**Where are passwords?** Only bcrypt hashes are stored. Login verifies a supplied password against its hash; the hash is never returned in API responses.

**How do JWTs work here?** The API signs an 8-hour token containing the student's ID. Protected requests carry a Bearer token. The server verifies the signature and expiration, then reads the current account/role from PostgreSQL.

**How are sellers prevented from editing other students' items?** Every mutation queries the listing and compares its seller ID with the authenticated student's ID on the server. Hiding a frontend button alone would not provide authorization.

**Can a student become admin by sending `role: admin`?** No. Registration/profile validation only accepts permitted fields, registration uses the database's student default, and administrator actions require the current database role.

**What prevents SQL injection?** All user values are separate query parameters. Sort clauses are chosen from fixed server strings. Input validation is an additional layer, not a substitute for parameterization.

**How are uploads handled safely?** Authenticate before parsing, limit input sizes, accept JPEG/PNG/WebP, validate the decoded image format, re-encode to WebP, use a random generated filename, and serve it as a static image. No original filename becomes a filesystem path.

**What are initialization scripts versus migrations?** The PostgreSQL Docker initializer runs once on an empty volume. Subsequent schema changes need explicitly applied migrations; changing init.sql doesn't update existing data automatically.

**Is it production-ready?** No. It needs verified student identity/email ownership, HTTPS, stronger session/account recovery, protected secrets, backups, shared abuse controls, monitoring and a fuller moderation workflow before real deployment.

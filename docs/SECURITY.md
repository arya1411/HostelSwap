# Security scope

This is a classroom MVP, **not a production-hardened deployment**.

Implemented: bcrypt cost 12, 8-hour HS256 JWTs, minimum secret length, authenticated database lookups on each request, ownership/admin checks, server validation, parameterized SQL, safe centralized errors, Helmet headers, JSON/upload limits, strict accepted image MIME types plus decoded-format validation, pixel limits, metadata-stripping re-encoding, generated filenames, no execution of uploaded files, and authentication rate limiting (30 requests / 15 minutes / IP).

Remaining deployment work:

- College-domain checks do not verify email ownership or student enrollment. Add verification links and an institutional identity provider before relying on the “students only” boundary.
- Local HTTP is bound to loopback. Add HTTPS, real secret management, backups, monitoring and tested restore procedures before hosting beyond a classroom.
- JWTs live in `sessionStorage`, expire after eight hours, and are cleared locally on logout. There is no refresh flow, password reset, individual-token revocation or cross-device logout. An XSS compromise could steal a token. Prefer a reviewed cookie/session design for a public deployment.
- Demo credentials are intentionally documented. Disable seeding and provision administrators through a trusted operator. Changing role/email fields through registration/profile APIs cannot grant admin access.
- Rate limits are in memory per backend process. Use a shared store for multiple replicas. Shared campus NAT addresses may share a limit.
- Seller email disclosure is limited to authenticated requests. Users explicitly consent through registration/listing copy; add stronger abuse controls and verified enrollment for a real campus launch.
- Local image storage is appropriate for one backend instance. Shared/object storage and image lifecycle reconciliation are needed for multiple replicas and rare filesystem/database partial failures.
- Report review is minimal, without appeals, immutable audit logging or notifications.
- Google Fonts is optional external typography; the UI falls back to system fonts offline. All demo illustrations are original local SVG assets. User uploads cannot use SVG.

# API reference

JSON responses use `{ "error": "Useful message" }` for errors. Send `Authorization: Bearer <token>` to protected endpoints. Auth returns `{user,token}`; `GET /api/listings` returns `{items,total,page,pages}`. Other resource endpoints return an object/array; deletion returns 204.

| Method | Route | Access / behavior |
| --- | --- | --- |
| GET | `/api/health` | Database-backed health check |
| GET | `/api/config` | Permitted college email domains |
| POST | `/api/auth/register` | `name,email,password,hostel_name,block` |
| POST | `/api/auth/login` | `email,password` |
| GET | `/api/auth/me` | Current student |
| GET | `/api/categories` | Category array |
| GET | `/api/listings` | Available items only; public |
| GET | `/api/listings/:id` | Available or sold; hidden returns 404 |
| GET | `/api/listings/:id/contact` | Authenticated; seller name/email for available items |
| POST | `/api/listings` | Authenticated; multipart fields + `image` |
| PUT | `/api/listings/:id` | Owner; all listing fields; replacement `image` optional |
| DELETE | `/api/listings/:id` | Owner; delete row, reports and uploaded photo |
| PATCH | `/api/listings/:id/status` | Owner; `{status: "available"}` or `"sold"`; hidden cannot be overridden |
| GET | `/api/users/me` | Current student's safe account fields |
| PATCH | `/api/users/me` | `name,hostel_name,block` only |
| GET | `/api/users/me/listings` | Own listings including sold/hidden |
| POST | `/api/reports` | Authenticated; `listing_id,reason` (10–1000 chars) |
| GET | `/api/admin/reports` | Admin only |
| PATCH | `/api/admin/listings/:id/moderation` | Admin only; `{action: "hide"}` or `"restore"` |

Listing form fields: `title`, `description`, `category_id`, `price`, `original_price` (optional/empty), `condition` (`Like New`, `Good`, `Fair`), `hostel_name`, `block`, and file `image`.

Search example:

```text
/api/listings?q=lamp&category_id=3&min=100&max=1000&condition=Good&block=A&sort=price_asc&page=1&limit=12
```

`sort` is `newest`, `price_asc` or `price_desc`. Limit is 1–48, page starts at 1. Values are validated; SQL values are parameterized. Ordering comes from a fixed server-side allowlist. IDs are positive integers. API status codes: 201 created, 204 deleted, 400 validation, 401 unauthenticated, 403 unauthorized, 404 missing/hidden, 409 duplicate/conflict, 429 rate limited, 500 unexpected failure.

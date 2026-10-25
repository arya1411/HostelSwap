import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import request from "supertest";
import { readFile, mkdtemp, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { createApp } from "../src/app.js";
let db, app, uploadDir, token, otherToken, adminToken, listingId, photo;
const auth = (token) => ({ Authorization: `Bearer ${token}` });
const student = {
  name: "Test Student",
  email: "student@college.edu",
  password: "SecurePassword123",
  hostel_name: "Vindhya Hostel",
  block: "A",
};
const listing = {
  title: "Study lamp",
  description: "A working study lamp in excellent condition.",
  category_id: 3,
  price: 450,
  original_price: 900,
  condition: "Good",
  hostel_name: "Vindhya Hostel",
  block: "A",
};
before(async () => {
  db = new PGlite();
  await db.exec(
    await readFile(new URL("../../database/init.sql", import.meta.url), "utf8"),
  );
  uploadDir = await mkdtemp(path.join(tmpdir(), "hs-test-"));
  app = createApp(db, {
    jwtSecret: "test-only-secret-at-least-thirty-two-characters",
    domains: "college.edu",
    uploadDir,
  });
  photo = await sharp({
    create: { width: 20, height: 20, channels: 3, background: "#fff" },
  })
    .png()
    .toBuffer();
});
after(async () => {
  await db?.close();
  if (uploadDir) await rm(uploadDir, { recursive: true, force: true });
});
function postListing(t = token, fields = listing, file = photo) {
  let r = request(app).post("/api/listings").set(auth(t));
  for (const [k, v] of Object.entries(fields)) r = r.field(k, String(v));
  return r.attach("image", file, {
    filename: "lamp.png",
    contentType: "image/png",
  });
}
test("registration restricts domains and validates password", async () => {
  await request(app)
    .post("/api/auth/register")
    .send({ ...student, email: "student@gmail.com" })
    .expect(400);
  await request(app)
    .post("/api/auth/register")
    .send({ ...student, password: "short" })
    .expect(400);
});
test("registration hashes passwords, returns safe user, prevents duplicate email and role injection", async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ ...student, role: "admin" })
    .expect(201);
  token = res.body.token;
  assert.equal(res.body.user.role, "student");
  assert.equal(res.body.user.password_hash, undefined);
  const stored = await db.query(
    "SELECT password_hash FROM users WHERE email=$1",
    [student.email],
  );
  assert.notEqual(stored.rows[0].password_hash, student.password);
  assert.match(stored.rows[0].password_hash, /^\$2/);
  await request(app).post("/api/auth/register").send(student).expect(409);
});
test("login accepts correct credentials and rejects incorrect credentials", async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: student.email, password: student.password })
    .expect(200);
  assert.ok(res.body.token);
  assert.equal(res.body.user.password_hash, undefined);
  await request(app)
    .post("/api/auth/login")
    .send({ email: student.email, password: "wrong" })
    .expect(401);
  await request(app).get("/api/auth/me").set(auth(token)).expect(200);
  await request(app).get("/api/auth/me").set(auth("invalid")).expect(401);
});
test("listing creation requires authentication and a genuine image", async () => {
  await request(app).post("/api/listings").send(listing).expect(401);
  await postListing(token, listing, Buffer.from("not an image")).expect(400);
  await postListing(token, { ...listing, price: -1 }).expect(400);
  const res = await postListing().expect(201);
  listingId = res.body.id;
  assert.match(res.body.image_path, /^\/uploads\/.*\.webp$/);
  const list = await request(app).get("/api/listings").expect(200);
  assert.equal(list.body.total, 1);
  assert.equal(list.body.items[0].password_hash, undefined);
  assert.equal(list.body.items[0].email, undefined);
  assert.equal((await readdir(uploadDir)).length, 1);
});
test("search, filters, sorting, pagination and injection-shaped text are safe", async () => {
  for (const query of [
    "q=lamp",
    "min=400&max=500",
    "block=A&condition=Good",
    "category_id=3&sort=price_desc&page=1&limit=1",
  ]) {
    const res = await request(app).get(`/api/listings?${query}`).expect(200);
    assert.equal(res.body.total, 1);
  }
  const empty = await request(app)
    .get("/api/listings?q=" + encodeURIComponent("' OR 1=1 --"))
    .expect(200);
  assert.equal(empty.body.total, 0);
  await request(app).get("/api/listings?sort=DROP").expect(400);
});
test("other students cannot edit/delete/change status; ordinary users cannot moderate", async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ ...student, email: "second@college.edu" })
    .expect(201);
  otherToken = res.body.token;
  for (const method of ["put", "delete"])
    await request(app)
      [method](`/api/listings/${listingId}`)
      .set(auth(otherToken))
      .send(listing)
      .expect(403);
  await request(app)
    .patch(`/api/listings/${listingId}/status`)
    .set(auth(otherToken))
    .send({ status: "sold" })
    .expect(403);
  await request(app)
    .get("/api/admin/reports")
    .set(auth(otherToken))
    .expect(403);
  await request(app)
    .patch(`/api/admin/listings/${listingId}/moderation`)
    .set(auth(token))
    .send({ action: "hide" })
    .expect(403);
});
test("contact is authenticated; report creation and duplicate protection work", async () => {
  await request(app).get(`/api/listings/${listingId}/contact`).expect(401);
  const res = await request(app)
    .get(`/api/listings/${listingId}/contact`)
    .set(auth(otherToken))
    .expect(200);
  assert.equal(res.body.email, student.email);
  await request(app)
    .post("/api/reports")
    .set(auth(otherToken))
    .send({
      listing_id: listingId,
      reason: "This looks like a suspicious listing.",
    })
    .expect(201);
  await request(app)
    .post("/api/reports")
    .set(auth(otherToken))
    .send({ listing_id: listingId, reason: "Reporting it a second time." })
    .expect(409);
});
test("owner edits, marks sold, and unavailable items disappear from search", async () => {
  let r = request(app).put(`/api/listings/${listingId}`).set(auth(token));
  for (const [k, v] of Object.entries({
    ...listing,
    title: "Updated study lamp",
  }))
    r = r.field(k, String(v));
  const edited = await r.expect(200);
  assert.equal(edited.body.title, "Updated study lamp");
  await request(app)
    .patch(`/api/listings/${listingId}/status`)
    .set(auth(token))
    .send({ status: "sold" })
    .expect(200);
  const res = await request(app).get("/api/listings").expect(200);
  assert.equal(res.body.total, 0);
  await request(app).get(`/api/listings/${listingId}`).expect(200);
  await request(app)
    .get(`/api/listings/${listingId}/contact`)
    .set(auth(otherToken))
    .expect(404);
});
test("admin hides/restores, preserves sold status and prevents seller bypass", async () => {
  await db.query("UPDATE users SET role='admin' WHERE email=$1", [
    "second@college.edu",
  ]);
  adminToken = otherToken;
  const reports = await request(app)
    .get("/api/admin/reports")
    .set(auth(adminToken))
    .expect(200);
  assert.equal(reports.body.length, 1);
  await request(app)
    .patch(`/api/admin/listings/${listingId}/moderation`)
    .set(auth(adminToken))
    .send({ action: "hide" })
    .expect(200);
  await request(app).get(`/api/listings/${listingId}`).expect(404);
  await request(app)
    .patch(`/api/listings/${listingId}/status`)
    .set(auth(token))
    .send({ status: "available" })
    .expect(403);
  await request(app)
    .patch(`/api/admin/listings/${listingId}/moderation`)
    .set(auth(adminToken))
    .send({ action: "restore" })
    .expect(200);
  const detail = await request(app)
    .get(`/api/listings/${listingId}`)
    .expect(200);
  assert.equal(detail.body.status, "sold");
});
test("profile whitelist prevents email/role changes; owner deletes listing and image", async () => {
  const res = await request(app)
    .patch("/api/users/me")
    .set(auth(token))
    .send({
      ...student,
      name: "Updated Name",
      role: "admin",
      email: "changed@college.edu",
    })
    .expect(200);
  assert.equal(res.body.role, "student");
  assert.equal(res.body.email, student.email);
  await request(app)
    .delete(`/api/listings/${listingId}`)
    .set(auth(token))
    .expect(204);
  assert.equal((await readdir(uploadDir)).length, 0);
  await request(app).get(`/api/listings/${listingId}`).expect(404);
});
test("seed is PostgreSQL-compatible and idempotent without resetting user changes", async () => {
  const { seed } = await import("../src/seed-data.js");
  process.env.DEMO_PASSWORD = "TestSeedPassword123!";
  process.env.COLLEGE_EMAIL_DOMAINS = "college.edu";
  await seed(db);
  const before = (await db.query("SELECT count(*)::int AS count FROM listings"))
    .rows[0].count;
  assert.equal(before, 8);
  await db.query(
    "UPDATE listings SET status='sold' WHERE title='Casio fx-991EX Scientific Calculator'",
  );
  await seed(db);
  const after = (await db.query("SELECT count(*)::int AS count FROM listings"))
    .rows[0].count;
  assert.equal(after, before);
  assert.equal(
    (
      await db.query(
        "SELECT status FROM listings WHERE title='Casio fx-991EX Scientific Calculator'",
      )
    ).rows[0].status,
    "sold",
  );
});

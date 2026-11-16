import test from "node:test";
import assert from "node:assert/strict";
import { googleLogin } from "../controller/googleController.js";
import adminOnly from "../Middlewares/adminAuthMiddleware.js";
const response = () => ({
  code: 200,
  status(n) {
    this.code = n;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});
test("Google login fails explicitly without configuration", async () => {
  const old = process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_ID;
  try {
    const res = response();
    await googleLogin({ body: { credential: "invalid" } }, res);
    assert.equal(res.code, 503);
  } finally {
    if (old !== undefined) process.env.GOOGLE_CLIENT_ID = old;
  }
});
test("Google login rejects missing browser credential before verification", async () => {
  const old = process.env.GOOGLE_CLIENT_ID;
  process.env.GOOGLE_CLIENT_ID = "test-client";
  try {
    const res = response();
    await googleLogin({ body: {} }, res);
    assert.equal(res.code, 400);
  } finally {
    if (old === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = old;
  }
});
test("Admin middleware blocks providers", () => {
  const res = response();
  let continued = false;
  adminOnly({ user: { role: "provider" } }, res, () => (continued = true));
  assert.equal(res.code, 403);
  assert.equal(continued, false);
});

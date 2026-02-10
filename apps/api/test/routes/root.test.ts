import { test } from "node:test";
import assert from "node:assert/strict";
import { resetUsersForTests } from "../../src/app";
import { build } from "../helper";

test("GET /api/users requires x-user-role header", async (t) => {
  resetUsersForTests();
  const app = await build(t);

  const response = await app.inject({
    method: "GET",
    url: "/api/users",
  });

  assert.equal(response.statusCode, 401);
  const body = JSON.parse(response.payload) as {
    error: string;
    message: string;
  };
  assert.equal(body.error, "Unauthorized");
});

test("GET /api/users works for Viewer role", async (t) => {
  resetUsersForTests();
  const app = await build(t);

  const response = await app.inject({
    method: "GET",
    url: "/api/users",
    headers: {
      "x-user-role": "Viewer",
    },
  });

  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.payload) as Array<{
    id: string;
    role: string;
  }>;
  assert.ok(Array.isArray(body));
  assert.ok(body.length > 0);
  assert.ok(body.every((user) => typeof user.id === "string"));
});

test("POST /api/users is forbidden for Viewer role", async (t) => {
  resetUsersForTests();
  const app = await build(t);

  const response = await app.inject({
    method: "POST",
    url: "/api/users",
    headers: {
      "content-type": "application/json",
      "x-user-role": "Viewer",
    },
    payload: {
      name: "Blocked User",
      email: "blocked@example.com",
      role: "Developer",
    },
  });

  assert.equal(response.statusCode, 403);
  const body = JSON.parse(response.payload) as { error: string };
  assert.equal(body.error, "Forbidden");
});

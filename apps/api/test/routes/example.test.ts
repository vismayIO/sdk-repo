import { test } from "node:test";
import assert from "node:assert/strict";
import { resetUsersForTests } from "../../src/app";
import { build } from "../helper";

test("POST /api/users validates request body", async (t) => {
  resetUsersForTests();
  const app = await build(t);

  const response = await app.inject({
    method: "POST",
    url: "/api/users",
    headers: {
      "content-type": "application/json",
      "x-user-role": "Admin",
    },
    payload: {
      name: "A",
      email: "invalid-email",
      role: "NotARole",
    },
  });

  assert.equal(response.statusCode, 400);
});

test("Admin can create, update and delete a user", async (t) => {
  resetUsersForTests();
  const app = await build(t);

  const createResponse = await app.inject({
    method: "POST",
    url: "/api/users",
    headers: {
      "content-type": "application/json",
      "x-user-role": "Admin",
    },
    payload: {
      name: "Test Engineer",
      email: "test.engineer@example.com",
      role: "Developer",
    },
  });

  assert.equal(createResponse.statusCode, 201);
  const createdUser = JSON.parse(createResponse.payload) as {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  assert.match(
    createdUser.id,
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );

  const updateResponse = await app.inject({
    method: "PUT",
    url: `/api/users/${createdUser.id}`,
    headers: {
      "content-type": "application/json",
      "x-user-role": "Developer",
    },
    payload: {
      role: "Manager",
    },
  });

  assert.equal(updateResponse.statusCode, 200);
  const updatedUser = JSON.parse(updateResponse.payload) as { role: string };
  assert.equal(updatedUser.role, "Manager");

  const forbiddenDeleteResponse = await app.inject({
    method: "DELETE",
    url: `/api/users/${createdUser.id}`,
    headers: {
      "x-user-role": "Manager",
    },
  });
  assert.equal(forbiddenDeleteResponse.statusCode, 403);

  const deleteResponse = await app.inject({
    method: "DELETE",
    url: `/api/users/${createdUser.id}`,
    headers: {
      "x-user-role": "Admin",
    },
  });
  assert.equal(deleteResponse.statusCode, 204);

  const getDeletedResponse = await app.inject({
    method: "GET",
    url: `/api/users/${createdUser.id}`,
    headers: {
      "x-user-role": "Admin",
    },
  });
  assert.equal(getDeletedResponse.statusCode, 404);
});

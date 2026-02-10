import { randomUUID } from "node:crypto";
import fastifyCors from "@fastify/cors";
import type {
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
  FastifyServerOptions,
} from "fastify";

export interface AppOptions extends FastifyServerOptions {}

const USER_ROLES = [
  "Admin",
  "Manager",
  "Developer",
  "Designer",
  "Viewer",
] as const;

type UserRole = (typeof USER_ROLES)[number];
type PermissionAction = "read" | "create" | "update" | "delete";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

interface CreateUserBody {
  name: string;
  email: string;
  role: UserRole;
}

interface UpdateUserBody {
  name?: string;
  email?: string;
  role?: UserRole;
}

interface ApiError {
  error: string;
  message: string;
}

const ROLE_PERMISSIONS: Record<UserRole, Record<PermissionAction, boolean>> = {
  Admin: { read: true, create: true, update: true, delete: true },
  Manager: { read: true, create: true, update: true, delete: false },
  Developer: { read: true, create: true, update: true, delete: false },
  Designer: { read: true, create: false, update: true, delete: false },
  Viewer: { read: true, create: false, update: false, delete: false },
};

function seedUsers(): User[] {
  return [
    {
      id: randomUUID(),
      name: "Rahul Kumar",
      email: "rahul@company.com",
      role: "Admin",
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: randomUUID(),
      name: "Priya Sharma",
      email: "priya@company.com",
      role: "Developer",
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: randomUUID(),
      name: "Amit Patel",
      email: "amit@company.com",
      role: "Designer",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: randomUUID(),
      name: "Neha Singh",
      email: "neha@company.com",
      role: "Manager",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: randomUUID(),
      name: "Vikram Joshi",
      email: "vikram@company.com",
      role: "Developer",
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ];
}

let users = seedUsers();

function getRoleFromRequest(request: FastifyRequest): UserRole | null {
  const rawHeader = request.headers["x-user-role"];
  const value = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

  if (!value) {
    return null;
  }

  const normalized = value.toString();
  return USER_ROLES.includes(normalized as UserRole)
    ? (normalized as UserRole)
    : null;
}

function sendError(
  reply: FastifyReply,
  statusCode: number,
  error: string,
  message: string,
) {
  reply.code(statusCode).send({ error, message } satisfies ApiError);
}

function ensureAuthorization(
  request: FastifyRequest,
  reply: FastifyReply,
  action: PermissionAction,
): boolean {
  const role = getRoleFromRequest(request);

  if (!role) {
    sendError(
      reply,
      401,
      "Unauthorized",
      "Missing or invalid x-user-role header",
    );
    return false;
  }

  if (!ROLE_PERMISSIONS[role][action]) {
    sendError(
      reply,
      403,
      "Forbidden",
      `Role '${role}' cannot perform '${action}' action`,
    );
    return false;
  }

  return true;
}

const userSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "name", "email", "role", "createdAt"],
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string", minLength: 2, maxLength: 100 },
    email: { type: "string", format: "email" },
    role: { type: "string", enum: [...USER_ROLES] },
    createdAt: { type: "string", format: "date-time" },
  },
} as const;

const userIdParamSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: { type: "string", format: "uuid" },
  },
} as const;

const createUserSchema = {
  type: "object",
  additionalProperties: false,
  required: ["name", "email", "role"],
  properties: {
    name: { type: "string", minLength: 2, maxLength: 100 },
    email: { type: "string", format: "email" },
    role: { type: "string", enum: [...USER_ROLES] },
  },
} as const;

const updateUserSchema = {
  type: "object",
  additionalProperties: false,
  minProperties: 1,
  properties: {
    name: { type: "string", minLength: 2, maxLength: 100 },
    email: { type: "string", format: "email" },
    role: { type: "string", enum: [...USER_ROLES] },
  },
} as const;

const errorSchema = {
  type: "object",
  additionalProperties: false,
  required: ["error", "message"],
  properties: {
    error: { type: "string" },
    message: { type: "string" },
  },
} as const;

const app: FastifyPluginAsync<AppOptions> = async (fastify): Promise<void> => {
  fastify.register(fastifyCors as any, {
    origin: true,
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-role"],
  });

  fastify.get(
    "/api/users",
    {
      schema: {
        response: {
          200: { type: "array", items: userSchema },
          401: errorSchema,
          403: errorSchema,
        },
      },
    },
    async (request, reply) => {
      if (!ensureAuthorization(request, reply, "read")) {
        return;
      }

      return users;
    },
  );

  fastify.get(
    "/api/users/:id",
    {
      schema: {
        params: userIdParamSchema,
        response: {
          200: userSchema,
          401: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
      },
    },
    async (request, reply) => {
      if (!ensureAuthorization(request, reply, "read")) {
        return;
      }

      const { id } = request.params as { id: string };
      const user = users.find((candidate) => candidate.id === id);

      if (!user) {
        sendError(reply, 404, "Not Found", "User not found");
        return;
      }

      return user;
    },
  );

  fastify.post(
    "/api/users",
    {
      schema: {
        body: createUserSchema,
        response: {
          201: userSchema,
          401: errorSchema,
          403: errorSchema,
        },
      },
    },
    async (request, reply) => {
      if (!ensureAuthorization(request, reply, "create")) {
        return;
      }

      const payload = request.body as CreateUserBody;
      const newUser: User = {
        id: randomUUID(),
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        role: payload.role,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      reply.code(201);
      return newUser;
    },
  );

  fastify.put(
    "/api/users/:id",
    {
      schema: {
        params: userIdParamSchema,
        body: updateUserSchema,
        response: {
          200: userSchema,
          401: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
      },
    },
    async (request, reply) => {
      if (!ensureAuthorization(request, reply, "update")) {
        return;
      }

      const { id } = request.params as { id: string };
      const payload = request.body as UpdateUserBody;
      const index = users.findIndex((candidate) => candidate.id === id);

      if (index === -1) {
        sendError(reply, 404, "Not Found", "User not found");
        return;
      }

      const existing = users[index];
      users[index] = {
        ...existing,
        ...payload,
        name: payload.name?.trim() ?? existing.name,
        email: payload.email?.trim().toLowerCase() ?? existing.email,
      };

      return users[index];
    },
  );

  fastify.delete(
    "/api/users/:id",
    {
      schema: {
        params: userIdParamSchema,
        response: {
          204: { type: "null" },
          401: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
      },
    },
    async (request, reply) => {
      if (!ensureAuthorization(request, reply, "delete")) {
        return;
      }

      const { id } = request.params as { id: string };
      const index = users.findIndex((candidate) => candidate.id === id);

      if (index === -1) {
        sendError(reply, 404, "Not Found", "User not found");
        return;
      }

      users.splice(index, 1);
      reply.code(204).send();
    },
  );
};

export function resetUsersForTests() {
  users = seedUsers();
}

export default app;
export { app };

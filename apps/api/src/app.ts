import { AutoloadPluginOptions } from "@fastify/autoload";
import fastifyCors from "@fastify/cors";
import { FastifyPluginAsync, FastifyServerOptions } from "fastify";

export interface AppOptions
  extends FastifyServerOptions, Partial<AutoloadPluginOptions> {}

let users = [
  {
    id: "1",
    name: "Rahul Kumar",
    email: "rahul@company.com",
    role: "Admin",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "2",
    name: "Priya Sharma",
    email: "priya@company.com",
    role: "Developer",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "3",
    name: "Amit Patel",
    email: "amit@company.com",
    role: "Designer",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "4",
    name: "Neha Singh",
    email: "neha@company.com",
    role: "Manager",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "5",
    name: "Vikram Joshi",
    email: "vikram@company.com",
    role: "Developer",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const app: FastifyPluginAsync<AppOptions> = async (fastify): Promise<void> => {
  fastify.register(fastifyCors as any, {
    origin: true,
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  fastify.get("/api/users", async () => {
    return users;
  });

  fastify.get("/api/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = users.find((u) => u.id === id);
    if (!user) {
      reply.status(404).send({ error: "User not found" });
      return;
    }
    return user;
  });

  fastify.post("/api/users", async (request, reply) => {
    const payload = (request.body || {}) as {
      name: string;
      email: string;
      role: string;
    };
    const id = String(Date.now());
    const newUser = {
      id,
      name: payload.name || "Unnamed",
      email: payload.email || `user+${id}@example.com`,
      role: payload.role || "Developer",
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    reply.code(201);
    return newUser;
  });

  fastify.put("/api/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const payload = request.body || {};
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) {
      reply.status(404).send({ error: "User not found" });
      return;
    }
    users[idx] = { ...users[idx], ...payload };
    return users[idx];
  });

  fastify.delete("/api/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const prevLen = users.length;
    users = users.filter((u) => u.id !== id);
    if (users.length === prevLen) {
      reply.status(404).send({ error: "User not found" });
      return;
    }
    return { ok: true };
  });
};

export default app;
export { app };

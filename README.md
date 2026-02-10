# Turborepo Micro-Frontend Starter

This Turborepo starter demonstrates Module Federation with NATS real-time messaging using **Webpack 5**.

## 🚀 Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Build SDK
cd packages/sdk && bun run build && cd ../..

# 3. Start Web App (Terminal 1)
cd apps/web && bun run dev

# 4. Start Host App (Terminal 2)
cd apps/host && bun run dev

# 5. Open browser
open http://localhost:5001
```

## 🏗️ Architecture

- **Host App** (Port 5001): Container application with Webpack Module Federation
- **Web App** (Port 5173): Remote MFE exposing UserDashboard
- **NATS Server** (Port 8080): Real-time messaging via WebSocket
- **Shared SDK**: Common components, hooks, and utilities

## ✨ Features

- ✅ Module Federation with Webpack 5
- ✅ NATS.ws for real-time events
- ✅ DuckDB WASM for analytics
- ✅ Shared UI component library
- ✅ TypeScript throughout
- ✅ Turborepo monorepo

## Workspaces

- `apps/host`: Host shell app on `:5001` consuming remote modules
- `apps/web`: Remote MFE on `:5173` exposing `./UserDashboard`
- `apps/api`: Fastify backend with role-based authorization and schema validation
- `packages/sdk`: Shared hooks, UI kit, API client, and DuckDB helpers
- `packages/cli`: `create-sdk-remote` scaffolding CLI

## Tooling

- Bun workspaces + Turborepo
- TypeScript
- Webpack 5 + Module Federation Enhanced
- Tailwind CSS 4
- Prettier

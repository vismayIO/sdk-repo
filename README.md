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


## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
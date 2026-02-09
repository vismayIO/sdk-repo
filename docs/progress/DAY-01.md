# Day 1 — Micro-Frontend Basics & Host Integration

> **Status**: COMPLETED  
> **Focus**: Module Federation setup, scaffolding, host-remote integration

---

## What Was Done

### 1. Scaffolded Monorepo Structure

```
sdk-repo/
├── apps/
│   ├── host/          ← Host (container) application
│   └── web/           ← Remote micro-frontend (User Management MFE)
├── packages/
│   └── sdk/           ← Shared SDK package
├── turbo.json         ← Turborepo orchestration
├── package.json       ← Bun workspaces
└── bun.lock
```

- **Turborepo** for monorepo task orchestration (`build`, `dev`, `lint`)
- **Bun** as package manager (`bun@1.3.6`)
- **Workspaces**: `apps/*` and `packages/*`

### 2. Module Federation Configuration

**Remote MFE** (`apps/web/webpack.config.js`):
- Name: `user_management_mfe`
- Exposes: `./UserDashboard` → `./src/pages/UserDashboardExpose.tsx`
- Port: `5173`
- Manifest enabled for runtime discovery

**Host App** (`apps/host/webpack.config.js`):
- Name: `host_app`
- Remotes: `userManagementMfe` → `http://localhost:5173/mf-manifest.json`
- Port: `5001`

**Shared dependencies** (singleton):
- `react` (^19.2.0)
- `react-dom` (^19.2.0)
- `react-router-dom`
- `@sdk-repo/sdk`

### 3. Async Bootstrap Pattern

Both apps use the async bootstrap pattern to avoid eager consumption errors:

```
src/index.ts → import('./bootstrap') → bootstrap.tsx renders <App />
```

This ensures shared modules are resolved before React renders.

### 4. Exposed Module Wrapper

`UserDashboardExpose.tsx` bundles CSS with the federated module:
```tsx
import '../index.css';
import '@sdk-repo/sdk/styles.css';
export { UserDashboard } from './UserDashboard';
```

### 5. Host Loads Remote MFE

Host uses `React.lazy()` with error handling:
```tsx
const UserDashboard = lazy(() =>
    import("userManagementMfe/UserDashboard")
        .then(module => ({ default: module.UserDashboard }))
        .catch(() => ({ default: ErrorFallback }))
);
```

---

## Files Involved

| File | Role |
|------|------|
| `apps/web/webpack.config.js` | Remote federation config |
| `apps/host/webpack.config.js` | Host federation config |
| `apps/web/src/index.ts` | Async bootstrap entry |
| `apps/web/src/bootstrap.tsx` | React root render |
| `apps/web/src/pages/UserDashboardExpose.tsx` | Federation wrapper |
| `apps/host/src/App.tsx` | Host app with lazy MFE |
| `apps/host/src/types/remotes.d.ts` | TypeScript type declarations |
| `turbo.json` | Build orchestration |
| `package.json` | Workspace config |

---

## Thinking Questions — Answers

**Q: Why Module Federation over monorepo?**  
Module Federation allows **independent deployment** — each MFE can be built and deployed separately without rebuilding the entire app. Monorepo is used for code organization, but federation provides runtime module loading.

**Q: What should NEVER be shared between MFEs?**  
- Application state (Redux store, local component state)
- Internal routing (each MFE owns its own routes)
- Business logic specific to one MFE
- CSS that could leak and affect other MFEs

**Q: How do you version a micro-frontend safely?**  
Use `manifest: true` in Module Federation — the manifest file (`mf-manifest.json`) is fetched at runtime, so the host always loads the latest version. For breaking changes, use versioned endpoints or fallback mechanisms.

---

## How to Verify

```bash
# Start both servers
cd apps/web && bun run dev    # Port 5173
cd apps/host && bun run dev   # Port 5001

# Open http://localhost:5001
# Click "User Management" → MFE loads dynamically
```

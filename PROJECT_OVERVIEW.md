# 🚀 Micro-Frontend POC - User Management System

## 📋 Overview

Ye ek complete **Micro-Frontend (MFE)** implementation hai jo **Module Federation** use karta hai. Is project me:

- **Host Application** (Port 5001) - Platform container
- **Remote MFE** (Port 5173) - User Management micro-frontend
- **Shared SDK** - Common components, hooks, aur utilities

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Host App (5001)                    │
│  ┌───────────────────────────────────────────────┐  │
│  │         Navigation & Platform Shell           │  │
│  └───────────────────────────────────────────────┘  │
│                        ↓                             │
│  ┌───────────────────────────────────────────────┐  │
│  │    Dynamically Loads Remote MFE (5173)       │  │
│  │    via Module Federation                      │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │   Shared SDK Package           │
        │  • UI Components               │
        │  • Hooks (useUsers, etc)       │
        │  • API Client                  │
        │  • Real-time Events            │
        └────────────────────────────────┘
```

## 📦 Project Structure

```
.
├── apps/
│   ├── host/              # Host Application (Port 5001)
│   │   ├── src/
│   │   │   ├── App.tsx    # Main host app with MFE loading
│   │   │   └── main.tsx
│   │   ├── webpack.config.js # Federation config (consumer)
│   │   └── package.json
│   │
│   └── web/               # Remote MFE (Port 5173)
│       ├── src/
│       │   ├── pages/
│       │   │   └── UserDashboard.tsx  # Exposed module
│       │   ├── components/
│       │   │   └── UserForm.tsx
│       │   └── App.tsx
│       ├── webpack.config.js # Federation config (exposes)
│       └── package.json
│
└── packages/
    └── sdk/               # Shared SDK
        ├── src/
        │   ├── api/       # API Client & Mock API
        │   ├── hooks/     # React Hooks
        │   ├── components/# UI Kit Components
        │   └── duck-db/   # DuckDB Integration
        └── package.json
```

## ✨ Features Implemented

### ✅ Week 1 Requirements

1. **Module Federation Setup**
   - Host app consumes remote MFE
   - Webpack 5 Module Federation configured
   - Shared React singleton

2. **React Structure**
   - User Dashboard page
   - Local routing
   - Reusable components
   - Clean boundaries

3. **Backend API via SDK**
   - Mock API client
   - CRUD operations
   - Error handling
   - Loading states

4. **Real-Time Events**
   - NATS WebSocket integration
   - user.created/user.updated/user.deleted subscriptions
   - Real-time UI updates
   - Event cleanup

5. **UI Kit & Design System**
   - Button, Input, Table, Card, Badge, Dialog, Label
   - Consistent styling with Tailwind
   - Reusable across MFEs

### ✅ Week 2 Requirements

6. **Shared State & Communication**
   - SDK-based communication
   - No tight coupling
   - Event-driven architecture

7. **Performance & Isolation**
   - Lazy loading with Suspense
   - Error boundaries
   - Bundle optimization

8. **Mini Project Complete**
   - User Management MFE
   - All features integrated
   - Production-ready structure

## 🚀 How to Run

### Prerequisites

```bash
bun --version  # or npm/yarn
```

### Step 1: Install Dependencies

```bash
# Root level
bun install
```

### Step 2: Build SDK

```bash
cd packages/sdk
bun run build
```

### Step 3: Run Remote MFE (Terminal 1)

```bash
cd apps/web
bun run dev
# Runs on http://localhost:5173
```

### Step 4: Run Host App (Terminal 2)

```bash
cd apps/host
bun run dev
# Runs on http://localhost:5001
```

### Step 5: Open Browser

```
http://localhost:5001
```

## 🎯 Key Concepts Demonstrated

### 1. Module Federation

- **Host App** dynamically loads **Remote MFE** at runtime
- No build-time coupling
- Independent deployment

### 2. SDK Pattern

- Centralized API client
- Shared hooks and components
- Version control for backward compatibility

### 3. Real-Time Updates

- Event-driven UI
- NATS integration (reconnect + dedup in SDK hook)
- Subscription lifecycle management

### 4. Clean Architecture

- Clear boundaries between MFEs
- No global state leakage
- Replaceable modules

## 📊 Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Webpack 5** - Build tool
- **Module Federation** - Micro-frontend architecture
- **Tailwind CSS** - Styling
- **NATS** - Real-time events
- **DuckDB WASM** - In-browser database
- **Turborepo** - Monorepo management
- **Bun** - Package manager

## 🧪 Testing the POC

### Test Module Federation

1. Start both apps (host & remote)
2. Navigate to `/users` in host app
3. Verify MFE loads dynamically
4. Check browser network tab for `remoteEntry.js`

### Test CRUD Operations

1. Click "Add User"
2. Fill form and submit
3. Verify user appears in table
4. Edit and delete users

### Test Real-Time Events

1. Create a new user
2. Watch for notification (top-right)
3. Check console for event logs

### Test Error Handling

1. Stop remote MFE (Ctrl+C)
2. Try loading `/users` in host
3. Verify error fallback shows

## 🎓 Learning Points

### Why Module Federation?

- **Independent Deployment**: Deploy MFEs separately
- **Runtime Integration**: No rebuild of host needed
- **Team Autonomy**: Different teams own different MFEs
- **Scalability**: Add/remove MFEs easily

### Why SDK?

- **Consistency**: Same API across all MFEs
- **Versioning**: Control breaking changes
- **Reusability**: Write once, use everywhere
- **Type Safety**: Shared TypeScript types

### Why Not Share Redux Store?

- **Tight Coupling**: MFEs become dependent
- **Version Conflicts**: Hard to upgrade
- **State Leakage**: Hard to debug
- **Scalability**: Doesn't scale to 20+ MFEs

## 🔧 Configuration Files

### Host App Federation Config

```js
// apps/host/webpack.config.js
new ModuleFederationPlugin({
  name: "host_app",
  remotes: {
    userManagementMfe:
      "user_management_mfe@http://localhost:5173/mf-manifest.json",
  },
  shared: {
    react: { singleton: true },
    "react-dom": { singleton: true },
  },
});
```

### Remote MFE Federation Config

```js
// apps/web/webpack.config.js
new ModuleFederationPlugin({
  name: "user_management_mfe",
  exposes: {
    "./UserDashboard": "./src/pages/UserDashboardExpose.tsx",
  },
  shared: {
    react: { singleton: true },
    "react-dom": { singleton: true },
  },
  manifest: true,
});
```

## 📈 Next Steps

### To Make Production Ready:

1. Replace role-header demo auth with JWT/OAuth and server-side token validation
2. Connect real backend API
3. Add comprehensive error handling
4. Implement logging & monitoring
5. Add E2E tests
6. Setup CI/CD pipeline
7. Add performance monitoring
8. Implement caching strategies

### To Scale to 20+ MFEs:

1. Create MFE registry
2. Implement version management
3. Add health checks
4. Setup feature flags
5. Implement A/B testing
6. Add analytics
7. Create CLI for scaffolding
8. Document patterns & best practices

## 🐛 Troubleshooting

### MFE Not Loading?

- Check if remote app is running on port 5173
- Verify `remoteEntry.js` is accessible
- Check browser console for errors

### Type Errors?

- Run `bun install` in root
- Rebuild SDK: `cd packages/sdk && bun run build`

### Port Already in Use?

- Change port in `webpack.config.js`
- Update remote manifest URL in host config

## 📝 Notes

- Fastify API includes schema validation + role-based authorization via `x-user-role`
- Real-time events use NATS (`ws://localhost:8080`)
- DuckDB analytics run in the web MFE dashboard
- All data is in-memory (resets on refresh)

## 🎉 Success Criteria Met

✅ Module Federation working
✅ Independent MFE deployment
✅ SDK integration
✅ Real-time events
✅ UI Kit usage
✅ CRUD operations
✅ Error handling
✅ Loading states
✅ Clean architecture
✅ Production-ready structure

---

**Built with ❤️ for Micro-Frontend Evaluation**

# Day 3 — Backend API via Frontend SDK

> **Status**: COMPLETED  
> **Focus**: SDK-first API access, no direct API calls from UI, error handling

---

## What Was Done

### 1. Frontend SDK API Layer

**SDK Package** (`packages/sdk/`) provides a clean API abstraction:

```
@sdk-repo/sdk/api      → ApiClient, MockApiClient, types
@sdk-repo/sdk/hooks    → useUsers (CRUD hook)
@sdk-repo/sdk/components → UI Kit
@sdk-repo/sdk/duck-db  → DuckDB WASM analytics
@sdk-repo/sdk/styles.css → Compiled CSS
```

### 2. API Client (`packages/sdk/src/api/client.ts`)

```typescript
class ApiClient {
    private baseUrl: string;

    constructor(baseUrl = 'http://localhost:3000/api') { ... }

    async getUsers(): Promise<User[]> { ... }
    async getUserById(id: string): Promise<User> { ... }
    async createUser(data: CreateUserDto): Promise<User> { ... }
    async updateUser(id: string, data: UpdateUserDto): Promise<User> { ... }
    async deleteUser(id: string): Promise<void> { ... }
}
```

### 3. Mock API (`packages/sdk/src/api/mock-api.ts`)

In-memory mock with 5 pre-populated users:
- Rahul Kumar (Admin)
- Priya Sharma (Developer)
- Amit Patel (Designer)
- Neha Singh (Manager)
- Vikram Joshi (Developer)

All operations have simulated `400ms` delay for realistic UX.

### 4. `useUsers` Hook (`packages/sdk/src/hooks/useUsers.ts`)

```typescript
function useUsers(): {
    users: User[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    createUser: (data: CreateUserDto) => Promise<User>;
    updateUser: (id: string, data: UpdateUserDto) => Promise<User>;
    deleteUser: (id: string) => Promise<void>;
}
```

- Auto-fetches users on mount
- All CRUD operations with error handling
- `useCallback` for stable references
- Re-fetches list after every mutation

### 5. Type Definitions

```typescript
interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

interface CreateUserDto {
    name: string;
    email: string;
    role: string;
}

interface UpdateUserDto {
    name?: string;
    email?: string;
    role?: string;
}
```

### 6. State Handling in UI

| State | UI |
|-------|-----|
| **Loading** | Skeleton cards + table placeholder |
| **Error** | Error card with retry button |
| **Empty** | "No users yet" + Create CTA |
| **Success** | Toast notification |

---

## Files Involved

| File | Lines | Role |
|------|-------|------|
| `packages/sdk/src/api/client.ts` | 79 | HTTP API client |
| `packages/sdk/src/api/mock-api.ts` | 84 | In-memory mock API |
| `packages/sdk/src/api/index.ts` | 2 | Barrel export |
| `packages/sdk/src/hooks/useUsers.ts` | 82 | CRUD React hook |
| `packages/sdk/tsup.config.ts` | 51 | SDK build config (4 entry points) |
| `packages/sdk/package.json` | 59 | SDK exports & deps |

---

## Thinking Questions — Answers

**Q: Why SDK is critical in MFE architecture?**  
- **Single source of truth** for API contracts and types.
- **Version control** — all MFEs use the same SDK version.
- **Abstraction** — UI never knows about raw HTTP calls, endpoints, or data formats.
- **Testability** — mock API can be swapped without touching UI code.

**Q: What happens if SDK version mismatches?**  
- Module Federation `singleton: true` ensures only ONE version of SDK is loaded.
- If versions don't match `requiredVersion`, Webpack logs a warning.
- Breaking changes in SDK need coordinated updates across all MFEs.

**Q: Who owns backward compatibility?**  
- **SDK team** owns backward compatibility.
- Semantic versioning: patch/minor = backward compatible, major = breaking.
- In monorepo, `workspace:*` always resolves to latest local version.

---

## How to Verify

```bash
# Open dashboard and test CRUD
open http://localhost:5001/users

# Create user → check toast "User created"
# Edit user → check toast "User updated"
# Delete user → check confirmation + toast "User deleted"
# Check console for no direct fetch() calls
```

# Day 6 — Shared State & Cross-MFE Communication

> **Status**: COMPLETED  
> **Focus**: Platform-level thinking, safe communication patterns

---

## What Was Done

### 1. AuthProvider + useAuth (Role-Based Access Control)

**File**: `packages/sdk/src/hooks/useAuth.tsx` (153 lines)

**Architecture**: Auth context lives in SDK (shared singleton). Host wraps app with `<AuthProvider>`, MFE consumes via `useAuth()`.

```tsx
// Host app
<AuthProvider>
    <BrowserRouter>
        <AppContent />  {/* MFE is inside this tree */}
    </BrowserRouter>
</AuthProvider>

// MFE component
const { user, permissions, hasPermission } = useAuth();
```

**5 Roles with Permission Matrix:**

| Permission | Admin | Manager | Developer | Designer | Viewer |
|------------|-------|---------|-----------|----------|--------|
| canCreate | ✓ | ✓ | ✓ | ✕ | ✕ |
| canEdit | ✓ | ✓ | ✓ | ✓ | ✕ |
| canDelete | ✓ | ✕ | ✕ | ✕ | ✕ |
| canExport | ✓ | ✓ | ✕ | ✕ | ✕ |
| canManageRoles | ✓ | ✕ | ✕ | ✕ | ✕ |

**Standalone MFE Fallback**: When `useAuth()` is used outside `AuthProvider` (standalone dev mode), it returns a dev Admin user with full permissions.

### 2. Cross-MFE Event Bus

**File**: `packages/sdk/src/hooks/useEventBus.ts` (73 lines)

Uses browser `CustomEvent` API — decoupled, no shared state:

```typescript
const { emit, on, off } = useEventBus();

// MFE emits:
emit('user:created', { id: '123', name: 'Rahul' });

// Host listens:
on('user:created', (data) => {
    showNotification(`New user: ${data.name}`);
});
```

**Event Namespace**: All events prefixed with `mfe:` to avoid conflicts.

**Typed Event Contracts:**
```typescript
interface MfeEvents {
    'auth:user-changed': { userId: string; name: string; role: string };
    'auth:logout': undefined;
    'user:created': { id: string; name: string; email: string };
    'user:updated': { id: string; name: string; email: string };
    'user:deleted': { id: string };
    'theme:changed': { theme: 'light' | 'dark' };
}
```

### 3. Host Consumes Shared Data

**Login Screen** (simulated auth):
```tsx
const DEMO_USERS = [
    { role: 'Admin', name: 'Rahul Kumar', ... },
    { role: 'Manager', name: 'Neha Singh', ... },
    { role: 'Developer', name: 'Priya Sharma', ... },
    { role: 'Designer', name: 'Amit Patel', ... },
    { role: 'Viewer', name: 'Vikram Joshi', ... },
];
```

**Navigation** shows:
- User avatar + name + role badge
- Permission count (e.g., "3/5 perms")
- Logout button

**Home Page** shows:
- Current user's permission matrix (✓ Allowed / ✕ Denied)

### 4. MFE Emits Events Back to Host

MFE → Host communication via event bus:
```tsx
// In UserDashboard (MFE)
const handleCreate = async (data) => {
    await createUser(data);
    emit('user:created', { id: newUser.id, name: data.name, email: data.email });
};
```

Host receives and shows notification in navbar:
```tsx
// In Host Navigation
on('user:created', (data) => {
    setMfeNotification(`New user: ${data.name}`);
    toast({ message: `MFE Event: User "${data.name}" created`, type: 'info' });
});
```

### 5. Permission-Based UI in MFE

```tsx
// Hide "Add User" button if no permission
{hasPermission('canCreate') && (
    <Button onClick={() => setIsFormOpen(true)}>+ Add User</Button>
)}

// Hide Edit/Delete buttons per row
<UserRow canEdit={hasPermission('canEdit')} canDelete={hasPermission('canDelete')} />

// Show "View only" label for restricted users
{!canEdit && !canDelete && (
    <span className="text-xs text-muted-foreground italic">View only</span>
)}
```

---

## Files Involved

| File | Lines | Role |
|------|-------|------|
| `packages/sdk/src/hooks/useAuth.tsx` | 153 | Auth context + provider + hook |
| `packages/sdk/src/hooks/useEventBus.ts` | 73 | Cross-MFE event bus |
| `packages/sdk/src/hooks/useTheme.tsx` | 110 | Theme context + provider + hook |
| `apps/host/src/App.tsx` | 446 | Login screen, auth + events |
| `apps/web/src/pages/UserDashboard.tsx` | 430 | Permission-based UI |

---

## Thinking Questions — Answers

**Q: Why not share Redux store?**  
- Creates **tight coupling** — MFEs depend on host's store shape.
- Makes **independent deployment** impossible.
- Version conflicts between Redux versions across MFEs.
- Instead: use Context (via shared SDK singleton) or CustomEvents.

**Q: How do MFEs communicate safely?**  
- **Props** for parent→child (host→MFE via Module Federation).
- **CustomEvents** for fire-and-forget notifications.
- **Shared SDK Context** for auth/theme (stable contracts).
- **NATS pub/sub** for real-time cross-service events.
- Never: direct function calls, shared mutable state, localStorage hacks.

**Q: What causes tight coupling?**  
- Importing host modules directly in MFE.
- Relying on global variables (`window.__STATE__`).
- Sharing Redux/Zustand stores.
- Hardcoded URLs to other MFEs.
- CSS class name dependencies across MFEs.

---

## How to Verify

```bash
# Test permissions
open http://localhost:5001

# 1. Login as Admin → full CRUD in User Management
# 2. Logout → Login as Viewer → only "View only" labels
# 3. Login as Designer → only Edit buttons visible
# 4. Create user as Admin → check host navbar notification
```

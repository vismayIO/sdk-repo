# Day 8 — Performance & Isolation

> **Status**: COMPLETED  
> **Focus**: Performance awareness, bundle size discipline, optimization patterns

---

## What Was Done

### 1. Lazy Loading via Module Federation

```tsx
// Host app — MFE is lazy loaded
const UserDashboard = lazy(() =>
    import("userManagementMfe/UserDashboard")
        .then(module => ({ default: module.UserDashboard }))
        .catch(() => ({ default: ErrorFallback }))
);

// With Suspense boundary
<Suspense fallback={<LoadingFallback />}>
    <UserDashboard />
</Suspense>
```

- MFE code is **NOT** in the initial bundle
- Loaded only when user navigates to `/users`
- Error fallback if remote is unavailable

### 2. Shared Singletons (No Duplication)

```javascript
// webpack shared config
shared: {
    react: { singleton: true },         // ~50KB loaded once
    'react-dom': { singleton: true },   // ~130KB loaded once
    'react-router-dom': { singleton: true },
    '@sdk-repo/sdk': { singleton: true },
}
```

Without singletons: React loaded 2x = ~100KB wasted.

### 3. React.memo for Expensive Components

```tsx
// Memoized stat card — only re-renders if props change
const StatCard = memo(function StatCard({ title, value, subtitle, color }) {
    return <Card>...</Card>;
});

// Memoized user row — prevents full table re-render
const UserRow = memo(function UserRow({ user, onEdit, onDelete, canEdit, canDelete }) {
    return <TableRow>...</TableRow>;
});

// Memoized form
export const UserForm = memo(function UserForm({ open, onClose, onSubmit, initialData }) {
    return <Dialog>...</Dialog>;
});
```

### 4. useCallback for Stable Handler References

```tsx
const handleSort = useCallback((field: SortField) => { ... }, []);
const handleCreate = useCallback(async (data) => { ... }, [createUser, toast, publish, emit]);
const handleUpdate = useCallback(async (data) => { ... }, [editingUser, updateUser, ...]);
const handleDelete = useCallback(async () => { ... }, [deleteConfirmId, users, ...]);
const handleEdit = useCallback((user: User) => { ... }, []);
const handleCloseForm = useCallback(() => { ... }, []);
```

### 5. useMemo for Derived Data

```tsx
// Filtered + sorted users — only recomputes when deps change
const filteredUsers = useMemo(() => {
    let result = [...users];
    // search filter
    // role filter
    // sort
    return result;
}, [users, searchQuery, roleFilter, sortField, sortOrder]);

// Unique roles list
const uniqueRoles = useMemo(
    () => [...new Set(users.map(u => u.role))],
    [users]
);
```

### 6. SDK Tree Shaking

```typescript
// tsup.config.ts — treeshake enabled
{
    name: "components",
    entryPoints: ["src/components/index.ts"],
    treeshake: true,  // ← removes unused exports
    ...
}
```

4 separate entry points prevent loading unnecessary code:
- Import `@sdk-repo/sdk/hooks` → only hooks bundle
- Import `@sdk-repo/sdk/components` → only components bundle
- Never loads DuckDB if not needed

### 7. Async Bootstrap Pattern

```typescript
// src/index.ts
import('./bootstrap');
```

Prevents eager consumption of shared modules — a critical performance pattern for Module Federation.

### 8. Bundle Sizes (from webpack output)

| Bundle | Size | Description |
|--------|------|-------------|
| `remoteEntry.js` | 431 KB | MFE federation entry |
| `main.js` | 431 KB | MFE main chunk |
| `UserDashboard chunk` | 121 KB | Dashboard code + CSS |
| `federation expose` | 47 KB | Exposed module |
| `bootstrap` | 12 KB | Bootstrap entry |
| **Vendor chunks** | 3.13 MB | react, react-dom, router (shared) |

---

## Files Involved

| File | Optimization |
|------|-------------|
| `apps/web/src/pages/UserDashboard.tsx` | memo, useCallback, useMemo |
| `apps/web/src/components/UserForm.tsx` | memo |
| `apps/host/src/App.tsx` | React.lazy, Suspense, error boundary |
| `packages/sdk/tsup.config.ts` | treeshake, multiple entry points |
| Webpack configs | singleton sharing, code splitting |

---

## Thinking Questions — Answers

**Q: What should be shared vs isolated?**  
- **Shared**: React, React DOM, React Router, SDK (big, singleton, stable).
- **Isolated**: MFE business logic, MFE-specific styles, local state.
- Rule: Share framework-level deps, isolate application-level code.

**Q: How MFEs impact initial load?**  
- MFEs are **lazy loaded** — zero impact on initial page load.
- Only the host shell + navigation loads initially.
- Each MFE adds network request for its chunk when navigated to.
- Shared singletons are loaded once and cached.

**Q: How to debug performance in MFEs?**  
- **Chrome DevTools → Network tab**: Check MFE chunk load times.
- **React DevTools → Profiler**: Check render counts, highlight updates.
- **Webpack Bundle Analyzer**: Visualize bundle composition.
- **console.time()**: Measure MFE mount time.
- Check for unnecessary re-renders caused by non-memoized props.

---

## How to Verify

```bash
# Open Chrome DevTools → Network tab
open http://localhost:5001

# 1. Initial load: only host chunks (main.js, vendors)
# 2. Click "User Management": see MFE chunks load (remoteEntry.js, UserDashboard)
# 3. Navigate back and forth: MFE chunks cached (no re-download)

# React DevTools → Profiler:
# 1. Record a profile
# 2. Create a user → check that StatCards don't re-render
# 3. Type in search → check that only filteredUsers updates
```

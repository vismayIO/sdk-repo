# Day 2 — React Structure Inside a Micro-Frontend

> **Status**: COMPLETED  
> **Focus**: Component isolation, local routing, clean boundaries

---

## What Was Done

### 1. User Dashboard Page

Built a complete `UserDashboard.tsx` (430+ lines) with:
- Stats cards (Total Users, Admins, Developers, NATS status)
- User table with avatars, badges, and action buttons
- Search by name/email
- Filter by role
- Sort by any column (name, email, role, created date)
- Loading skeleton state
- Error state with retry
- Empty state with CTA
- Delete confirmation dialog

### 2. Local Routing (MFE-owned)

```tsx
// apps/web/src/App.tsx
<BrowserRouter>
    <Navigation />
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<UserDashboard />} />
    </Routes>
</BrowserRouter>
```

MFE owns its own routes (`/`, `/dashboard`). When loaded via host, only `UserDashboard` is exposed — no routing conflict.

### 3. Reusable Components

| Component | File | Purpose |
|-----------|------|---------|
| `UserForm` | `src/components/UserForm.tsx` | Create/Edit user dialog |
| `UserRow` | Inside `UserDashboard.tsx` | Memoized table row |
| `StatCard` | Inside `UserDashboard.tsx` | Memoized stat card |
| `SortIcon` | Inside `UserDashboard.tsx` | Column sort indicator |

### 4. Local State Only

All state is local to the MFE — no global state management:
```tsx
const [isFormOpen, setIsFormOpen] = useState(false);
const [editingUser, setEditingUser] = useState<User | null>(null);
const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
const [searchQuery, setSearchQuery] = useState('');
const [roleFilter, setRoleFilter] = useState<string>('all');
const [sortField, setSortField] = useState<SortField>('createdAt');
const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
```

---

## Files Involved

| File | Lines | Role |
|------|-------|------|
| `apps/web/src/pages/UserDashboard.tsx` | 430 | Main dashboard page |
| `apps/web/src/components/UserForm.tsx` | 137 | User create/edit form |
| `apps/web/src/App.tsx` | 105 | Local routing + nav |
| `apps/web/src/hooks/useUserAnalytics.ts` | 43 | DuckDB analytics hook |

---

## Thinking Questions — Answers

**Q: Where should routing live: host or MFE?**  
- **Top-level routing** lives in the host (e.g., `/users` → loads MFE).
- **Internal routing** lives inside the MFE (e.g., `/users/dashboard`, `/users/settings`).
- This ensures each MFE is self-contained and independently navigable.

**Q: How do you avoid global CSS conflicts?**  
- Tailwind CSS with `@layer` and scoped utility classes — no global CSS leakage.
- CSS variables for theming (`:root` and `.dark`).
- SDK components use `cn()` utility for safe class merging.
- No raw CSS selectors that could leak.

**Q: How do you keep MFEs replaceable?**  
- MFE communicates only via defined contracts (exported components, events, props).
- No shared state between MFEs.
- SDK provides the stable API layer.
- Any MFE can be swapped out as long as it exposes the same interface.

---

## How to Verify

```bash
# Open standalone MFE
open http://localhost:5173

# Navigate to Dashboard
# Try: search, filter, sort, create user, edit user
```

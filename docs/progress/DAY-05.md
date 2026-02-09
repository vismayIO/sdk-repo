# Day 5 — UI Kit & Design System Compliance

> **Status**: COMPLETED  
> **Focus**: Shared UI Kit, design tokens, theme compatibility, consistency

---

## What Was Done

### 1. SDK UI Kit Components (11 Components)

All components live in `packages/sdk/src/components/ui/`:

| Component | File | Description |
|-----------|------|-------------|
| `Button` | `button.tsx` | Variant-based (default, outline, secondary, ghost, destructive, link) with size options |
| `Input` | `input.tsx` | Styled form input with focus ring |
| `Select` | `select.tsx` | Styled select dropdown with options array |
| `Label` | `label.tsx` | Form label with peer styling |
| `Card` | `card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| `Table` | `table.tsx` | Table, TableHeader, TableBody, TableRow, TableHead, TableCell |
| `Badge` | `badge.tsx` | Status badges (default, success, warning, error) |
| `Dialog` | `dialog.tsx` | Modal dialog with overlay, header, title, description |
| `Avatar` | `avatar.tsx` | User avatar with image or initials fallback, consistent colors |
| `Toast` | `toast.tsx` | Toast notifications (useToast hook + Toaster component) |
| `Skeleton` | `skeleton.tsx` | Animated loading placeholder |

### 2. Design Token System (CSS Variables)

Both apps use identical CSS variables for consistent theming:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --primary: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  /* ... more tokens */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... dark overrides */
}
```

Tailwind maps these via `@theme inline`:
```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  /* ... enables bg-background, text-foreground, etc. */
}
```

### 3. Dark Mode Support

- All SDK components updated to use CSS variable tokens:
  - `bg-white` → `bg-card`
  - `text-gray-950` → `text-card-foreground`
  - `text-gray-500` → `text-muted-foreground`
  - `border-gray-300` → `border-input`
  - `hover:bg-gray-50` → `hover:bg-muted/50`

- **ThemeProvider** + **useTheme** hook in SDK for programmatic control
- `.dark` class toggle on `<html>` element
- Persisted in `localStorage`

### 4. Removed Custom Local UI

- **Deleted** `apps/web/src/components/button.tsx` (was a local wrapper)
- All components now imported from `@sdk-repo/sdk/components`
- UserForm updated to use SDK `Select` instead of raw `<select>`

### 5. Utility Function

```typescript
// cn() - Tailwind class name merger
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
```

---

## Files Involved

| File | Lines | Role |
|------|-------|------|
| `packages/sdk/src/components/ui/button.tsx` | 68 | Button with CVA variants |
| `packages/sdk/src/components/ui/input.tsx` | 25 | Styled input |
| `packages/sdk/src/components/ui/select.tsx` | 43 | Styled select |
| `packages/sdk/src/components/ui/card.tsx` | 79 | Card family |
| `packages/sdk/src/components/ui/table.tsx` | 81 | Table family |
| `packages/sdk/src/components/ui/badge.tsx` | 33 | Status badges |
| `packages/sdk/src/components/ui/dialog.tsx` | 77 | Modal dialog |
| `packages/sdk/src/components/ui/avatar.tsx` | 81 | User avatar |
| `packages/sdk/src/components/ui/toast.tsx` | 94 | Toast system |
| `packages/sdk/src/components/ui/skeleton.tsx` | 21 | Loading skeleton |
| `packages/sdk/src/components/ui/label.tsx` | 22 | Form label |
| `packages/sdk/src/components/index.ts` | 12 | Barrel exports |
| `packages/sdk/src/components/style/index.css` | 124 | Design tokens |
| `apps/web/src/index.css` | 82 | App theme tokens |
| `apps/host/src/index.css` | 82 | App theme tokens |

---

## Thinking Questions — Answers

**Q: Why UI kit is critical in MFEs?**  
- **Visual consistency** across independently deployed MFEs.
- **Single source of truth** for design tokens.
- **Reduced duplication** — components written once, used everywhere.
- **Accessibility** built into SDK components once, inherited by all.

**Q: How to extend UI kit without breaking others?**  
- All components accept `className` prop for overrides via `cn()`.
- Use **composition** (wrap SDK component) not **modification** (fork it).
- Add new variants via PR to SDK, don't create local copies.
- Version SDK properly — breaking changes require major version bump.

**Q: How to enforce usage across teams?**  
- ESLint rules to warn on raw HTML elements (prefer SDK components).
- Code review checklist: "Are all UI elements from SDK?".
- CLI generates pages/components with SDK imports pre-configured.
- Delete local component files that duplicate SDK functionality.

---

## How to Verify

```bash
# Open host app → toggle dark mode (moon/sun icon)
open http://localhost:5001

# All components should switch themes seamlessly
# Check: cards, buttons, inputs, dialogs, badges, table
# No hardcoded colors should be visible
```

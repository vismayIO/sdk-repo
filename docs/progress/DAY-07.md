# Day 7 — Frontend CLI & Developer Experience

> **Status**: COMPLETED  
> **Focus**: Tooling mindset, automation discipline

---

## What Was Done

### 1. CLI Tool (`cli.js` — 240 lines)

Run with: `bun run cli <command>`

### 2. Available Commands

#### `generate:page <PageName>`

Generates a new page with SDK integration pre-configured:

```bash
bun run cli generate:page Settings
# ✅ Page created: apps/web/src/pages/Settings.tsx
```

Generated template includes:
- `useAuth` hook for permissions
- SDK Card, Button components
- Proper className tokens (bg-foreground, text-muted-foreground)
- TypeScript types

#### `generate:component <ComponentName>`

Generates a memoized React component:

```bash
bun run cli generate:component UserCard
# ✅ Component created: apps/web/src/components/UserCard.tsx
```

Template includes:
- `React.memo` wrapper
- Props interface
- Proper TypeScript structure

#### `add:route <PageName>`

**Auto-injects** import + route into `App.tsx`:

```bash
bun run cli add:route Settings
# ✅ Route added: /settings -> Settings
#    Import and Route both added to App.tsx
```

Before (only showed instructions) → Now actually modifies the file!

#### `expose:module <ModuleName>` (NEW)

Configures Module Federation exposure:

```bash
bun run cli expose:module Settings
# ✅ Expose wrapper created: apps/web/src/pages/SettingsExpose.tsx
# ✅ Module Federation updated: ./Settings -> SettingsExpose.tsx
```

This command:
1. Creates `SettingsExpose.tsx` (federation wrapper with CSS imports)
2. Updates `webpack.config.js` exposes section automatically
3. Shows reminders for host app type declarations

---

## Files Involved

| File | Lines | Role |
|------|-------|------|
| `cli.js` | 240 | CLI tool with 5 commands |

---

## CLI Output Examples

```bash
$ bun run cli help

🛠️  Frontend CLI — Micro-Frontend Platform Tooling

Available Commands:

  generate:page <PageName>         Generate a new page with SDK integration
  generate:component <Name>        Generate a new React component
  add:route <PageName>             Add route to App.tsx automatically
  expose:module <ModuleName>       Expose module via Module Federation
  help                             Show this help message
```

---

## Thinking Questions — Answers

**Q: Why CLI is critical at scale?**  
- **Consistency**: Every new page/component follows the same structure.
- **Speed**: Minutes → seconds for scaffolding.
- **Correctness**: No manual webpack config errors.
- **Onboarding**: New devs can be productive immediately.

**Q: Risks of manual setup?**  
- Missing CSS imports in federation wrappers → unstyled MFE.
- Wrong webpack `exposes` path → build failure.
- Forgetting route imports → runtime errors.
- Inconsistent component structure → code review overhead.

**Q: How would you improve the CLI?**  
- Add `generate:hook` command for custom hooks.
- Add `remove:module` command to clean up exposures.
- Interactive mode with prompts (role, permissions needed).
- Auto-update host app's `remotes.d.ts` type declarations.
- Validate that target page exists before `expose:module`.

---

## How to Verify

```bash
# Test generate commands
bun run cli generate:page TestPage
bun run cli generate:component TestComponent
bun run cli add:route TestPage
bun run cli expose:module TestPage

# Check that files were created and webpack config updated
cat apps/web/src/pages/TestPage.tsx
cat apps/web/src/pages/TestPageExpose.tsx
cat apps/web/webpack.config.js
```

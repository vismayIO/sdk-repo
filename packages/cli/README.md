# create-sdk-remote

Bun CLI for scaffolding remote applications.

Internally it uses:
- `plop` / `node-plop` generators
- strict TypeScript source (`src/cli.ts`, `plopfile.ts`)

## Usage

```bash
bunx create-sdk-remote
bunx create-sdk-remote billing --yes
bunx create-sdk-remote create billing --port 5174
```

## Local Dev

```bash
bun packages/cli/bin/create-sdk-remote.ts help
bun run --cwd packages/cli typecheck
```

## Publish

```bash
cd packages/cli
bun publish
```

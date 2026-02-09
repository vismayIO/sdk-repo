# ⚡ Webpack Quick Start

## Start Commands

```bash
# Terminal 1: Web App (Remote MFE)
cd apps/web && bun run dev

# Terminal 2: Host App
cd apps/host && bun run dev

# Optional Terminal 3: NATS
docker run -p 4222:4222 -p 8222:8222 -p 8080:8080 \
  --name nats nats:latest -c /dev/null --websocket
```

## URLs

| Service | URL |
|---------|-----|
| **Host App** | http://localhost:5001 |
| **Web MFE** | http://localhost:5173 |
| **Remote Entry** | http://localhost:5173/remoteEntry.js |
| **NATS Monitor** | http://localhost:8222/varz |

## Module Federation

### Host Config
```javascript
remotes: {
  userManagementMfe: 'user_management_mfe@http://localhost:5173/remoteEntry.js'
}
```

### Remote Config
```javascript
exposes: {
  './UserDashboard': './src/pages/UserDashboard.tsx'
}
```

## Build Commands

```bash
# Development
bun run dev

# Production build
bun run build

# Serve production build
bun run serve
```

## Webpack Features

- ✅ Native Module Federation Plugin
- ✅ Babel transpilation (React + TypeScript)
- ✅ Hot Module Replacement (HMR)
- ✅ PostCSS + Tailwind CSS
- ✅ HTML generation via plugin
- ✅ Shared dependencies (singleton)

## File Structure

```
apps/host/
├── webpack.config.js    # Webpack configuration
├── postcss.config.js    # PostCSS for Tailwind
├── package.json         # Dependencies
├── src/
│   └── main.tsx        # Entry point
└── index.html          # HTML template

apps/web/
├── webpack.config.js    # Webpack configuration
├── postcss.config.js    # PostCSS for Tailwind
├── package.json         # Dependencies
├── src/
│   └── main.tsx        # Entry point
└── index.html          # HTML template
```

## Troubleshooting

```bash
# Check remoteEntry.js
curl http://localhost:5173/remoteEntry.js

# Kill port processes
lsof -ti:5001 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Clear cache
rm -rf node_modules/.cache

# Rebuild
bun install
cd packages/sdk && bun run build
```

## Key Differences from Vite

| Feature | Vite | Webpack |
|---------|------|---------|
| **Build Speed** | Faster (ESM) | Slower (bundling) |
| **HMR** | Instant | Fast |
| **Module Federation** | Plugin | Native |
| **Config** | Simple | Detailed |
| **Production** | Rollup | Webpack |
| **Ecosystem** | Growing | Mature |

## Shared Dependencies

```javascript
shared: {
  react: {
    singleton: true,        // Only one instance
    requiredVersion: '^19.2.0'
  },
  'react-dom': {
    singleton: true,
    requiredVersion: '^19.2.0'
  },
  'react-router-dom': {
    singleton: true
  }
}
```

## Verification Checklist

- [ ] Host app loads on port 5001
- [ ] Web app loads on port 5173
- [ ] remoteEntry.js accessible
- [ ] Click "User Management (MFE)"
- [ ] UserDashboard renders
- [ ] No console errors
- [ ] NATS connected (optional)
- [ ] HMR working

---

**Build Tool**: Webpack 5  
**Status**: ✅ Ready

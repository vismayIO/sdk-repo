# 🚀 Quick Reference Card

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
| **NATS Monitor** | http://localhost:8222/varz |

## Test Commands

```bash
./test-federation.sh    # Test setup
./setup.sh              # Complete setup
./restart-apps.sh       # Restart apps
```

## Port Reference

```
5001 → Host Application
5173 → Web App (Remote MFE)
8080 → NATS WebSocket
4222 → NATS TCP
8222 → NATS HTTP Monitoring
```

## Module Federation Config

```typescript
// Host (apps/host/vite.config.ts)
remotes: {
  userManagementMfe: "http://localhost:5173/assets/remoteEntry.js"
}

// Web (apps/web/vite.config.ts)
exposes: {
  "./UserDashboard": "./src/pages/UserDashboard.tsx"
}
```

## NATS Usage

```typescript
// In component
const { subscribe, publish, connected } = useNats({ autoConnect: true });

// Subscribe
subscribe('user.created', (data) => {
  console.log('User created:', data);
});

// Publish
publish('user.created', { id: '123', name: 'John' });
```

## Troubleshooting

```bash
# Check ports
lsof -i :5001
lsof -i :5173

# Kill processes
lsof -ti:5001 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Check NATS
curl http://localhost:8222/varz

# Check remoteEntry.js
curl http://localhost:5173/assets/remoteEntry.js
```

## Documentation

- **START.md** - Setup guide
- **SUMMARY.md** - Overview
- **FIXES.md** - Technical details
- **ARCHITECTURE.md** - System design
- **COMPLETE.md** - Status summary

## Key Changes

✅ Host: 5000 → 5001  
✅ Web: 5001 → 5173  
✅ Removed: socket.io-client  
✅ Using: NATS.ws only  
✅ Fixed: Module Federation  

## Build SDK

```bash
cd packages/sdk
bun run build
cd ../..
```

## Verification

1. ✅ Host loads on 5001
2. ✅ Web runs on 5173
3. ✅ Click "User Management (MFE)"
4. ✅ UserDashboard appears
5. ✅ No console errors
6. ✅ NATS connected (optional)

---

**Status**: ✅ Ready to use  
**Version**: 1.0.0

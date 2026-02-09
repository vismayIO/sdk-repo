# 🚀 Quick Start Guide

## Fixed Issues
✅ Host application now correctly points to web app on port 5173
✅ Removed Socket.io mock - using NATS only
✅ Proper port configuration for Module Federation

## Architecture
- **Host App**: Port 5001 (loads remote MFE)
- **Web App (Remote MFE)**: Port 5173 (exposes UserDashboard)
- **NATS Server**: Port 8080 (WebSocket for real-time events)

## Start the Application

### 1. Install Dependencies
```bash
bun install
```

### 2. Build SDK Package
```bash
cd packages/sdk
bun run build
cd ../..
```

### 3. Start NATS Server (Optional but Recommended)
```bash
# Option A: Using Docker
docker run -p 4222:4222 -p 8222:8222 -p 8080:8080 --name nats-server nats:latest -c /dev/null --websocket

# Option B: Using local NATS binary with config
./nats.sh

# Option C: Without NATS (mock mode)
# Skip this step - app will work in mock mode
```

### 4. Start Web App (Remote MFE)
```bash
# Terminal 1
cd apps/web
bun run dev
# Runs on http://localhost:5173
```

### 5. Start Host App
```bash
# Terminal 2
cd apps/host
bun run dev
# Runs on http://localhost:5001
```

### 6. Open Browser
```
http://localhost:5001
```

## Verify Setup

1. **Host App**: Should load successfully on port 5001
2. **Navigation**: Click "User Management (MFE)" in the nav
3. **Remote MFE**: UserDashboard should load from port 5173
4. **NATS Connection**: Check browser console for "✅ NATS Connected" message
5. **Real-time Events**: Create a user and watch for NATS event notifications

## Troubleshooting

### MFE Not Loading
- Ensure web app is running on port 5173
- Check browser console for federation errors
- Verify `http://localhost:5173/assets/remoteEntry.js` is accessible

### NATS Not Connecting
- Check if NATS server is running: `curl http://localhost:8222/varz`
- App will work in mock mode if NATS is unavailable
- Check browser console for connection status

### Port Conflicts
```bash
# Check what's using the ports
lsof -i :5001
lsof -i :5173
lsof -i :8080

# Kill processes if needed
kill -9 <PID>
```

## Quick Restart Script
```bash
# Use the provided restart script
./restart-apps.sh
```

## Tech Stack
- **Module Federation**: @originjs/vite-plugin-federation
- **Real-time**: NATS.ws (WebSocket)
- **UI**: React 19 + Tailwind CSS
- **Build**: Vite + Turborepo
- **Database**: DuckDB WASM

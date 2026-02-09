# 🚀 NATS Server Setup Guide

## Install NATS Server

### Option 1: Docker (Recommended)
```bash
docker run -p 4222:4222 -p 8222:8222 -p 6222:6222 --name nats-server nats:latest --websocket
```

### Option 2: Binary
```bash
# Download from https://nats.io/download/
curl -L https://github.com/nats-io/nats-server/releases/download/v2.10.7/nats-server-v2.10.7-linux-amd64.zip -o nats-server.zip
unzip nats-server.zip
cd nats-server-v2.10.7-linux-amd64
./nats-server --websocket
```

### Option 3: Homebrew (Mac)
```bash
brew install nats-server
nats-server --websocket
```

---

## Start NATS Server

```bash
# With WebSocket support (required for browser)
nats-server --websocket

# Or with Docker
docker start nats-server
```

**Default Ports:**
- 4222: Client connections
- 8222: HTTP monitoring
- 6222: Cluster connections

---

## Verify NATS is Running

```bash
# Check if NATS is running
curl http://localhost:8222/varz

# Should return JSON with server info
```

---

## Test NATS Connection

```bash
# Install NATS CLI
go install github.com/nats-io/natscli/nats@latest

# Subscribe to test subject
nats sub "user.created"

# In another terminal, publish
nats pub "user.created" '{"name":"John","email":"john@test.com"}'
```

---

## Application Configuration

The app will automatically:
1. Try to connect to `ws://localhost:4222`
2. Fall back to mock mode if NATS is unavailable
3. Show connection status in dashboard

---

## Run Complete Stack

```bash
# Terminal 1: Start NATS
docker run -p 4222:4222 -p 8222:8222 --name nats nats:latest --websocket

# Terminal 2: Build SDK
cd packages/sdk && bun run build

# Terminal 3: Start Remote MFE
cd apps/web && bun run dev

# Terminal 4: Start Host
cd apps/host && bun run dev
```

---

## Troubleshooting

### NATS Not Connecting
```bash
# Check if port is open
lsof -i :4222

# Check NATS logs
docker logs nats-server
```

### WebSocket Issues
Make sure NATS is started with `--websocket` flag:
```bash
nats-server --websocket
```

### Mock Mode
If NATS is unavailable, the app runs in mock mode:
- Events are logged to console
- No actual pub/sub
- Still functional for demo

---

## Production Setup

For production, use NATS with authentication:

```bash
nats-server \
  --websocket \
  --user admin \
  --pass secret \
  --tls \
  --tlscert server-cert.pem \
  --tlskey server-key.pem
```

Update config in app:
```typescript
const { subscribe, publish } = useNats({
  servers: ['wss://nats.production.com:4222'],
  user: 'admin',
  pass: 'secret'
});
```

---

## Quick Start (No NATS)

App works without NATS server:
```bash
# Just start the apps
cd apps/web && bun run dev
cd apps/host && bun run dev

# Mock mode will be used automatically
```

---

**✅ NATS is now integrated with real WebSocket support!**

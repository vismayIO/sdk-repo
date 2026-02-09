# Day 4 — Real-Time Events (NATS WebSocket)

> **Status**: COMPLETED  
> **Focus**: Event-driven UI, subscription lifecycle, reconnect, dedup

---

## What Was Done

### 1. NATS Server Configuration

```conf
# nats-server.conf
port: 4222
http_port: 8222

jetstream {
  store_dir: /tmp/nats
}

websocket {
  port: 8080
  no_tls: true
}
```

**Ports**:
- `4222` — NATS client connections
- `8080` — WebSocket (browser connects here)
- `8222` — HTTP monitoring dashboard

### 2. NATS Management Script (`nats.sh`)

```bash
bash nats.sh start    # Start NATS server
bash nats.sh stop     # Stop NATS server
bash nats.sh status   # Check if running
bash nats.sh restart  # Restart
bash nats.sh logs     # Tail logs
```

### 3. Production-Grade `useNats` Hook

**File**: `packages/sdk/src/hooks/useNats.ts` (238 lines)

#### Features:

**Auto-Reconnect with Exponential Backoff:**
```typescript
// Delay increases: 2s → 3s → 4.5s → 6.75s → ... (max 30s)
const delay = Math.min(reconnectDelayMs * Math.pow(1.5, attempt), 30000);
```
- Up to 10 reconnect attempts
- Status tracking: `connected`, `reconnecting`, `reconnectAttempt`, `error`

**Duplicate Event Detection:**
```typescript
// 2-second dedup window using fingerprinting
const getFingerprint = (subject, data) => {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    const timeWindow = Math.floor(Date.now() / 2000);
    return `${subject}:${payload}:${timeWindow}`;
};
```
- Events with same subject + payload within 2s are skipped
- Fingerprint cache clears every 10 seconds

**Subscription Persistence Across Reconnects:**
```typescript
// After reconnect, all subscriptions are re-attached
for (const [subject, { callback }] of subscriptionsRef.current.entries()) {
    attachSubscription(subject, callback);
}
```

**Connection Status Monitoring:**
```typescript
interface NatsStatus {
    connected: boolean;      // Currently connected
    reconnecting: boolean;   // Trying to reconnect
    reconnectAttempt: number; // Current attempt #
    error: string | null;    // Error message
}
```

### 4. Dashboard NATS Integration

```tsx
// Subscribe to real-time events
useEffect(() => {
    subscribe('user.created', handleEvent);
    subscribe('user.updated', handleEvent);
    subscribe('user.deleted', handleEvent);
    return () => {
        unsubscribe('user.created');
        unsubscribe('user.updated');
        unsubscribe('user.deleted');
    };
}, [subscribe, unsubscribe]);
```

**Live Status Indicator** in dashboard header:
- Green dot + "Live" → connected
- Yellow dot + "Reconnecting (N)" → reconnecting
- Red dot + "Offline" → disconnected

### 5. Event Publishing on CRUD

```typescript
const handleCreate = async (data) => {
    const newUser = await createUser(data);
    publish('user.created', { ...data, id: newUser.id, action: 'created' });
};
```

---

## Files Involved

| File | Lines | Role |
|------|-------|------|
| `packages/sdk/src/hooks/useNats.ts` | 238 | NATS hook with reconnect + dedup |
| `nats-server.conf` | 21 | NATS server config |
| `nats.sh` | 52 | NATS management script |
| `NATS_SETUP.md` | 161 | Setup documentation |

---

## Thinking Questions — Answers

**Q: Should socket live in host or MFE?**  
In this architecture, the NATS connection lives in the **SDK** (shared singleton). Each MFE creates its own `useNats()` instance, but the subscription management is per-component. If the host also needs events, it can use the same hook. The SDK being singleton means only the necessary connections are made.

**Q: How do you avoid event storms?**  
- **Dedup window** (2s) prevents duplicate processing.
- **Subject namespacing** (`user.created`, `user.updated`) limits scope.
- **Unsubscribe on unmount** prevents zombie subscriptions.
- **Fingerprint clearing** every 10s prevents memory leaks.

**Q: REST vs events — where is the boundary?**  
- **REST (SDK)**: CRUD operations, data fetching, mutations.
- **Events (NATS)**: Real-time notifications, cross-service updates, live UI.
- Rule: REST for commands, Events for notifications.

---

## How to Test

```bash
# Terminal 1: Start NATS
bash nats.sh start

# Terminal 2: Subscribe to all user events
nats sub "user.>"

# Terminal 3: Open browser
open http://localhost:5001/users
# Create a user → see event in Terminal 2

# Terminal 4: Publish external event
nats pub "user.created" '{"name":"External User","action":"created"}'
# → Dashboard shows notification instantly

# Test reconnect:
bash nats.sh stop    # Dashboard shows "Reconnecting..."
bash nats.sh start   # Dashboard reconnects → "Live"
```

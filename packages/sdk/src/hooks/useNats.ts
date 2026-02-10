import { useEffect, useCallback, useRef, useState } from 'react';
import { connect, StringCodec } from 'nats.ws';
import type { NatsConnection } from 'nats.ws';

interface NatsConfig {
  servers?: string[];
  autoConnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelayMs?: number;
}

export interface NatsStatus {
  connected: boolean;
  reconnecting: boolean;
  reconnectAttempt: number;
  error: string | null;
}

interface UseNatsReturn {
  subscribe: (subject: string, callback: (data: any) => void) => void;
  unsubscribe: (subject: string) => void;
  publish: (subject: string, data: any) => void;
  status: NatsStatus;
  connected: boolean;
}

const sc = StringCodec();

/**
 * Production-grade NATS WebSocket hook with:
 * - Auto-reconnect with exponential backoff
 * - Duplicate event detection (2-second dedup window)
 * - Subscription persistence across reconnects
 * - Connection status monitoring
 */
export function useNats(config: NatsConfig = {}): UseNatsReturn {
  const {
    servers = ['ws://localhost:8080'],
    autoConnect = true,
    maxReconnectAttempts = 10,
    reconnectDelayMs = 2000,
  } = config;

  const [status, setStatus] = useState<NatsStatus>({
    connected: false,
    reconnecting: false,
    reconnectAttempt: 0,
    error: null,
  });

  const ncRef = useRef<NatsConnection | null>(null);
  const subscriptionsRef = useRef<Map<string, { sub: any; callback: (data: any) => void }>>(new Map());
  const processedEventsRef = useRef<Set<string>>(new Set());
  const mountedRef = useRef(true);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate event fingerprint for dedup (2-second window)
  const getFingerprint = (subject: string, data: any): string => {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    const timeWindow = Math.floor(Date.now() / 2000);
    return `${subject}:${payload}:${timeWindow}`;
  };

  // Cleanup old fingerprints periodically
  useEffect(() => {
    const interval = setInterval(() => {
      processedEventsRef.current.clear();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Attach a subscription to the current NATS connection
  const attachSubscription = (subject: string, callback: (data: any) => void) => {
    if (!ncRef.current) return;

    (async () => {
      try {
        const sub = ncRef.current!.subscribe(subject);
        subscriptionsRef.current.set(subject, { sub, callback });

        for await (const msg of sub) {
          try {
            const decoded = sc.decode(msg.data);
            let data: any;
            try {
              data = JSON.parse(decoded);
            } catch {
              data = decoded;
            }

            // Duplicate detection
            const fp = getFingerprint(subject, data);
            if (processedEventsRef.current.has(fp)) {
              console.log('🔄 Duplicate event skipped:', subject);
              continue;
            }
            processedEventsRef.current.add(fp);

            callback(data);
          } catch (e) {
            console.error('Error processing NATS message:', e);
          }
        }
      } catch (e) {
        console.warn('Subscription error for', subject, e);
      }
    })();
  };

  // Connection lifecycle
  useEffect(() => {
    mountedRef.current = true;

    if (!autoConnect) return;

    const tryConnect = async (attempt: number) => {
      if (!mountedRef.current) return;

      try {
        if (attempt > 0) {
          setStatus({
            connected: false,
            reconnecting: true,
            reconnectAttempt: attempt,
            error: null,
          });
        }

        const nc = await connect({ servers });

        if (!mountedRef.current) {
          await nc.close();
          return;
        }

        ncRef.current = nc;
        setStatus({
          connected: true,
          reconnecting: false,
          reconnectAttempt: 0,
          error: null,
        });
        console.log(`✅ NATS Connected (attempt ${attempt + 1})`);

        // Re-attach all pending subscriptions
        for (const [subject, { callback }] of subscriptionsRef.current.entries()) {
          attachSubscription(subject, callback);
        }

        // Monitor connection status
        (async () => {
          for await (const s of nc.status()) {
            if (!mountedRef.current) return;
            console.log('NATS Status:', s.type);
            if (s.type === 'disconnect' || s.type === 'error') {
              ncRef.current = null;
              setStatus(prev => ({ ...prev, connected: false }));
              scheduleReconnect();
            }
          }
        })();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Connection failed';
        console.warn(`⚠️ NATS attempt ${attempt + 1} failed:`, errorMsg);

        if (!mountedRef.current) return;

        if (attempt < maxReconnectAttempts) {
          const delay = Math.min(reconnectDelayMs * Math.pow(1.5, attempt), 30000);
          setStatus({
            connected: false,
            reconnecting: true,
            reconnectAttempt: attempt + 1,
            error: `Retry in ${Math.round(delay / 1000)}s...`,
          });
          reconnectTimerRef.current = setTimeout(() => tryConnect(attempt + 1), delay);
        } else {
          setStatus({
            connected: false,
            reconnecting: false,
            reconnectAttempt: attempt,
            error: `Failed after ${maxReconnectAttempts} attempts`,
          });
        }
      }
    };

    const scheduleReconnect = () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = setTimeout(() => tryConnect(1), reconnectDelayMs);
    };

    tryConnect(0);

    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (ncRef.current) ncRef.current.close();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const subscribe = useCallback((subject: string, callback: (data: any) => void) => {
    // Unsubscribe existing if any
    const existing = subscriptionsRef.current.get(subject);
    if (existing?.sub) {
      try { existing.sub.unsubscribe(); } catch { /* ignore */ }
    }

    if (ncRef.current) {
      attachSubscription(subject, callback);
    } else {
      // Queue for when connection is established
      subscriptionsRef.current.set(subject, { sub: null, callback });
      console.log('📡 Queued subscription:', subject);
    }
  }, []);

  const unsubscribe = useCallback((subject: string) => {
    const entry = subscriptionsRef.current.get(subject);
    if (entry?.sub) {
      try { entry.sub.unsubscribe(); } catch { /* ignore */ }
    }
    subscriptionsRef.current.delete(subject);
  }, []);

  const publish = useCallback((subject: string, data: any) => {
    if (!ncRef.current) {
      console.warn('📤 Cannot publish - not connected:', subject);
      return;
    }
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    ncRef.current.publish(subject, sc.encode(payload));
    console.log('📤 Published:', subject);
  }, []);

  return { subscribe, unsubscribe, publish, status, connected: status.connected };
}

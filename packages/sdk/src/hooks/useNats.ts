import { useEffect, useCallback, useRef, useState } from "react";
import { connect, StringCodec } from "nats.ws";
import type { NatsConnection, Subscription } from "nats.ws";

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
  subscribe: (subject: string, callback: (data: unknown) => void) => void;
  unsubscribe: (subject: string) => void;
  publish: (subject: string, data: unknown) => void;
  status: NatsStatus;
  connected: boolean;
}

interface SubscriptionEntry {
  sub: Subscription | null;
  callback: (data: unknown) => void;
}

const DEFAULT_SERVERS = ["ws://localhost:8080"];
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
    servers = DEFAULT_SERVERS,
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
  const subscriptionsRef = useRef<Map<string, SubscriptionEntry>>(new Map());
  const processedEventsRef = useRef<Set<string>>(new Set());
  const mountedRef = useRef(true);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serversKey = servers.join(",");

  const getFingerprint = useCallback(
    (subject: string, data: unknown): string => {
      let payload = "[unserializable]";

      if (typeof data === "string") {
        payload = data;
      } else {
        try {
          payload = JSON.stringify(data);
        } catch {
          payload = "[unserializable]";
        }
      }

      const timeWindow = Math.floor(Date.now() / 2000);
      return `${subject}:${payload}:${timeWindow}`;
    },
    [],
  );

  // Cleanup old fingerprints periodically
  useEffect(() => {
    const interval = setInterval(() => {
      processedEventsRef.current.clear();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const attachSubscription = useCallback(
    (subject: string, callback: (data: unknown) => void) => {
      const connection = ncRef.current;
      if (!connection) {
        return;
      }

      void (async () => {
        try {
          const sub = connection.subscribe(subject);
          subscriptionsRef.current.set(subject, { sub, callback });

          for await (const msg of sub) {
            try {
              const decoded = sc.decode(msg.data);
              let data: unknown;

              try {
                data = JSON.parse(decoded) as unknown;
              } catch {
                data = decoded;
              }

              const fingerprint = getFingerprint(subject, data);
              if (processedEventsRef.current.has(fingerprint)) {
                console.log("Duplicate event skipped:", subject);
                continue;
              }

              processedEventsRef.current.add(fingerprint);
              callback(data);
            } catch (error) {
              console.error("Error processing NATS message:", error);
            }
          }
        } catch (error) {
          console.warn("Subscription error for", subject, error);
        }
      })();
    },
    [getFingerprint],
  );

  // Connection lifecycle
  useEffect(() => {
    mountedRef.current = true;

    if (!autoConnect) {
      return;
    }

    const tryConnect = async (attempt: number) => {
      if (!mountedRef.current) {
        return;
      }

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
        console.log(`NATS connected (attempt ${attempt + 1})`);

        for (const [subject, { callback }] of subscriptionsRef.current) {
          attachSubscription(subject, callback);
        }

        void (async () => {
          for await (const statusEvent of nc.status()) {
            if (!mountedRef.current) {
              return;
            }

            console.log("NATS status:", statusEvent.type);
            if (
              statusEvent.type === "disconnect" ||
              statusEvent.type === "error"
            ) {
              ncRef.current = null;
              setStatus((previous) => ({ ...previous, connected: false }));
              scheduleReconnect();
            }
          }
        })();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Connection failed";
        console.warn(`NATS attempt ${attempt + 1} failed:`, message);

        if (!mountedRef.current) {
          return;
        }

        if (attempt < maxReconnectAttempts) {
          const delay = Math.min(
            reconnectDelayMs * Math.pow(1.5, attempt),
            30000,
          );
          setStatus({
            connected: false,
            reconnecting: true,
            reconnectAttempt: attempt + 1,
            error: `Retry in ${Math.round(delay / 1000)}s...`,
          });
          reconnectTimerRef.current = setTimeout(() => {
            void tryConnect(attempt + 1);
          }, delay);
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
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      reconnectTimerRef.current = setTimeout(() => {
        void tryConnect(1);
      }, reconnectDelayMs);
    };

    void tryConnect(0);

    return () => {
      mountedRef.current = false;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      if (ncRef.current) {
        void ncRef.current.close();
      }
    };
  }, [
    attachSubscription,
    autoConnect,
    maxReconnectAttempts,
    reconnectDelayMs,
    serversKey,
  ]);

  const subscribe = useCallback(
    (subject: string, callback: (data: unknown) => void) => {
      const existing = subscriptionsRef.current.get(subject);
      if (existing?.sub) {
        try {
          existing.sub.unsubscribe();
        } catch {
          // Ignore stale subscriptions.
        }
      }

      if (ncRef.current) {
        attachSubscription(subject, callback);
      } else {
        subscriptionsRef.current.set(subject, { sub: null, callback });
        console.log("Queued subscription:", subject);
      }
    },
    [attachSubscription],
  );

  const unsubscribe = useCallback((subject: string) => {
    const entry = subscriptionsRef.current.get(subject);
    if (entry?.sub) {
      try {
        entry.sub.unsubscribe();
      } catch {
        // Ignore stale subscriptions.
      }
    }

    subscriptionsRef.current.delete(subject);
  }, []);

  const publish = useCallback((subject: string, data: unknown) => {
    if (!ncRef.current) {
      console.warn("Cannot publish, NATS is not connected:", subject);
      return;
    }

    const payload = typeof data === "string" ? data : JSON.stringify(data);
    ncRef.current.publish(subject, sc.encode(payload));
    console.log("Published:", subject);
  }, []);

  return {
    subscribe,
    unsubscribe,
    publish,
    status,
    connected: status.connected,
  };
}

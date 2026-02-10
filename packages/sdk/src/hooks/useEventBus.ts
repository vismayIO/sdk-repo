import { useEffect, useCallback, useRef } from 'react';

type EventCallback = (detail: any) => void;

const EVENT_PREFIX = 'mfe:';

/**
 * Cross-MFE communication via browser CustomEvents.
 *
 * This provides a safe, decoupled communication channel between
 * micro-frontends without shared state or tight coupling.
 *
 * Events are namespaced with 'mfe:' prefix to avoid conflicts.
 */
export function useEventBus() {
  const listenersRef = useRef<Map<string, EventListener>>(new Map());

  const emit = useCallback((event: string, detail?: any) => {
    window.dispatchEvent(
      new CustomEvent(`${EVENT_PREFIX}${event}`, { detail })
    );
  }, []);

  const on = useCallback((event: string, callback: EventCallback) => {
    // Remove existing listener for this event if any
    const existing = listenersRef.current.get(event);
    if (existing) {
      window.removeEventListener(`${EVENT_PREFIX}${event}`, existing);
    }

    const handler = ((e: Event) => {
      callback((e as CustomEvent).detail);
    }) as EventListener;

    listenersRef.current.set(event, handler);
    window.addEventListener(`${EVENT_PREFIX}${event}`, handler);
  }, []);

  const off = useCallback((event: string) => {
    const handler = listenersRef.current.get(event);
    if (handler) {
      window.removeEventListener(`${EVENT_PREFIX}${event}`, handler);
      listenersRef.current.delete(event);
    }
  }, []);

  // Cleanup all listeners on unmount
  useEffect(() => {
    return () => {
      for (const [event, handler] of listenersRef.current.entries()) {
        window.removeEventListener(`${EVENT_PREFIX}${event}`, handler);
      }
      listenersRef.current.clear();
    };
  }, []);

  return { emit, on, off };
}

/**
 * Typed event contracts for cross-MFE communication.
 * Use these as documentation for available events.
 */
export interface MfeEvents {
  'auth:user-changed': { userId: string; name: string; role: string };
  'auth:logout': undefined;
  'notification:show': { message: string; type: 'success' | 'error' | 'info' | 'warning' };
  'user:created': { id: string; name: string; email: string };
  'user:updated': { id: string; name: string; email: string };
  'user:deleted': { id: string };
  'theme:changed': { theme: 'light' | 'dark' };
}

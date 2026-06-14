import { useEffect, useRef, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isOnlineFromState(state: NetInfoState): boolean {
  return state.isConnected === true && state.isInternetReachable !== false;
}

// ---------------------------------------------------------------------------
// One-shot connectivity check (for use inside async mutation fns / non-hook ctx)
// ---------------------------------------------------------------------------

export async function getIsOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return isOnlineFromState(state);
}

// ---------------------------------------------------------------------------
// "Came online" callback — registered by the queue processor so regaining
// connectivity while foregrounded triggers a drain without a full AppState cycle.
// ---------------------------------------------------------------------------

let _cameOnlineCallback: (() => void) | null = null;

export function registerCameOnlineCallback(cb: () => void): void {
  _cameOnlineCallback = cb;
  // Ensure the subscription is running even if no React component has mounted
  // useOnlineStatus yet — the queue processor calls this from a non-React context.
  ensureSubscription();
}

// ---------------------------------------------------------------------------
// Module-level NetInfo subscription (single shared listener)
// Drives both the came-online callback and the React hook below.
// ---------------------------------------------------------------------------

type Listener = (online: boolean) => void;
const _listeners = new Set<Listener>();
let _subscriptionStarted = false;
let _lastOnline: boolean | null = null;

function ensureSubscription(): void {
  if (_subscriptionStarted) return;
  _subscriptionStarted = true;

  NetInfo.addEventListener((state: NetInfoState) => {
    const online = isOnlineFromState(state);

    // Fire "came online" callback only on a false→true transition
    if (online && _lastOnline === false) {
      _cameOnlineCallback?.();
    }

    _lastOnline = online;

    for (const listener of _listeners) {
      listener(online);
    }
  });
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

// Returns null while the initial connectivity check is in flight (unknown state).
// Callers should treat null as "possibly offline" — the OfflineBanner does this
// by showing when online === false (null is not false, so it stays hidden until
// the first fetch resolves, which avoids a false-positive flash on cold launch).
export function useOnlineStatus(): boolean | null {
  const [online, setOnline] = useState<boolean | null>(null);
  const setRef = useRef(setOnline);
  setRef.current = setOnline;

  useEffect(() => {
    ensureSubscription();

    const listener: Listener = (isOnline) => setRef.current(isOnline);
    _listeners.add(listener);

    // Resolve the initial null: one-shot fetch to get the true current state.
    NetInfo.fetch().then((state: NetInfoState) => {
      setRef.current(isOnlineFromState(state));
    });

    return () => {
      _listeners.delete(listener);
    };
  }, []);

  return online;
}

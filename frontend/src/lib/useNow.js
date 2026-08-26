import { useSyncExternalStore } from 'react';

// Reading the clock while rendering is impure — React's own lint rule refuses it,
// and a list left open would keep showing a stale answer anyway. So the clock is
// an external store instead: it ticks once a minute, which is as fine-grained as
// anything here needs (a visit turning into the past, a slot entering the
// cancellation window).

const MINUTE = 60_000;
const listeners = new Set();
let snapshot = Date.now();
let timer = null;

function tick() {
  snapshot = Date.now();
  listeners.forEach((notify) => notify());
}

function subscribe(listener) {
  listeners.add(listener);
  if (!timer) {
    tick(); // the stored value may be minutes old if nothing was subscribed
    timer = setInterval(tick, MINUTE);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => snapshot;

/** Milliseconds since the epoch, refreshed every minute. */
export const useNow = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

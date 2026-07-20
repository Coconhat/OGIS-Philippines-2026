"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/* Portals need to know they're on the client. useSyncExternalStore
   gives us that without a setState-in-effect cascade: the server
   snapshot is false, the client snapshot is true. */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

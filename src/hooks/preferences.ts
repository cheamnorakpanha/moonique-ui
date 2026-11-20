"use client";

import { useSyncExternalStore } from "react";

const preferenceChanged = "moonique-preference";
const sessionPreferences = new Map<string, string>();

function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(preferenceChanged, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(preferenceChanged, notify);
  };
}

export function usePreference<T extends string>(key: string, initial: T, choices: readonly T[]) {
  const value = useSyncExternalStore(subscribe, () => {
    let stored = sessionPreferences.get(key);
    try { stored = localStorage.getItem(key) ?? undefined; }
    catch { /* Use the in-memory preference when storage is unavailable. */ }
    return choices.find((choice) => choice === stored) ?? initial;
  }, () => initial);
  return [value, (next: T) => {
    sessionPreferences.set(key, next);
    try { localStorage.setItem(key, next); } catch { /* The current session still works. */ }
    window.dispatchEvent(new Event(preferenceChanged));
  }] as const;
}

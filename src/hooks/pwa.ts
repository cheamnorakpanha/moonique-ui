"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

interface InstallPrompt extends Event {
  prompt: () => Promise<unknown>;
}

function subscribeNetwork(notify: () => void) {
  window.addEventListener("online", notify);
  window.addEventListener("offline", notify);
  return () => {
    window.removeEventListener("online", notify);
    window.removeEventListener("offline", notify);
  };
}

const standaloneQuery = "(display-mode: standalone)";

function subscribeDisplay(notify: () => void) {
  const display = matchMedia(standaloneQuery);
  display.addEventListener("change", notify);
  return () => display.removeEventListener("change", notify);
}

export function usePwa() {
  const online = useSyncExternalStore(subscribeNetwork, () => navigator.onLine, () => true);
  const standalone = useSyncExternalStore(subscribeDisplay, () => matchMedia(standaloneQuery).matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true, () => false);
  const [promptEvent, setPromptEvent] = useState<InstallPrompt>();
  const [installedThisSession, setInstalledThisSession] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker>();

  useEffect(() => {
    const install = (event: Event) => { event.preventDefault(); setPromptEvent(event as InstallPrompt); };
    const installed = () => { setPromptEvent(undefined); setInstalledThisSession(true); };
    window.addEventListener("beforeinstallprompt", install);
    window.addEventListener("appinstalled", installed);
    let disposed = false;
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((registration) => {
        if (disposed) return;
        if (registration.waiting && navigator.serviceWorker.controller) setWaiting(registration.waiting);
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          worker?.addEventListener("statechange", () => {
            if (!disposed && worker.state === "installed" && navigator.serviceWorker.controller) setWaiting(registration.waiting ?? worker);
          });
        });
        void registration.update().catch(() => undefined);
      }).catch(() => { /* Browsing still works if worker registration fails. */ });
    }
    return () => {
      disposed = true;
      window.removeEventListener("beforeinstallprompt", install);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  return {
    online, standalone: standalone || installedThisSession, waiting, canPrompt: Boolean(promptEvent),
    async install() {
      if (!promptEvent) return;
      await promptEvent.prompt().catch(() => undefined);
      setPromptEvent(undefined);
    },
    update() {
      navigator.serviceWorker.addEventListener("controllerchange", () => location.reload(), { once: true });
      waiting?.postMessage({ type: "SKIP_WAITING" });
    },
  };
}

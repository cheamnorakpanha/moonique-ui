import type { Metadata } from "next";

export const metadata: Metadata = { title: "Offline | Moonique Shop", robots: { index: false } };

export default function OfflinePage() {
  return <main className="fallback wrap">
    <h1>You’re offline</h1><p>Reconnect to load the menu and send orders. Your cart stays on this device.</p>
    {/* Full navigation lets the service worker serve the cached storefront HTML. */}
    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
    <a className="button button--primary" href="/">Return to the storefront</a>
  </main>;
}

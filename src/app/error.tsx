"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="fallback wrap">
    <h1>Moonique Shop</h1><p>Something interrupted the storefront. Please try again.</p>
    <button className="button button--primary" onClick={reset}>Try again</button>
  </main>;
}

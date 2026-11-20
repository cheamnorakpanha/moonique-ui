# Architecture and operations

## Storefront

The App Router serves a statically prerendered homepage and offline page. Layout metadata, robots, sitemap and organization JSON-LD are produced on the server. The storefront client boundary owns language and currency preferences, shopping interactions and service-worker status. Local Fontsource assets keep typography available without an external build-time service.

## Product and checkout rules

Configure products in `src/data/products.ts`. Use stable IDs and integer USD cents. KHR amounts are rounded to the nearest riel per line and the displayed subtotal sums those rounded lines. Set confirmed unavailable products to `sold-out`. Unknown-price lines remain in an inquiry and are excluded from numeric totals. Availability and final price are confirmed by the shop.

The local cart stores product IDs and validated quantities. Customer name, phone, delivery address and notes live only in the checkout form. Generating a summary enables clipboard or supported native sharing. When a valid Telegram contact is configured, the Open Telegram action navigates to that contact. The customer pastes the summary and sends it manually. Closing checkout clears the form.

## PWA

The service worker registers only on production builds. It warms the public HTML shell and referenced Next.js assets. Navigations use the network when available and fall back to the cached storefront or the offline page. Runtime image caching is bounded. For a worker or cache schema change, bump the cache version in `public/sw.js`. On activation the new worker removes older Moonique cache versions. A waiting worker offers an update button to activate and reload.

Test on localhost or HTTPS after a production build. Wait for the page to be controlled, add a product, go offline and reload. Verify the banner, cached catalog and cart. Open an uncached path to verify the fallback. For update testing, increment the worker version, rebuild and revisit online. The browser controls install eligibility and may expose installation via its menu.

## Dependency management

The workspace pins pnpm and requires review of dependency lifecycle scripts. Optional native packages resolve from the lockfile and their lifecycle scripts are skipped. ESLint 9 currently matches all peer ranges in Next.js’s ESLint configuration. Run the audit following dependency changes and use frozen installs for reproducible builds.

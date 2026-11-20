# App Router

Keep the storefront on the root route and use anchors for sections. Prefer Server Components for layouts, metadata and static routing. Use client boundaries for interactive or translated UI. Keep server and initial client output consistent during persistence hydration. Use build-time public configuration for canonical metadata, sitemap and robots. Keep essential pages statically renderable. Use route boundaries for rendering errors and reserve loading feedback for operations that take time. Register the service worker in production only and preserve the offline fallback.

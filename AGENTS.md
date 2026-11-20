# Moonique Shop

Moonique Shop is a bilingual, single-page Cambodian homemade food storefront. The Next.js App Router and strict TypeScript own rendering and routing. Tailwind CSS owns the design system. Zustand persists cart quantities and stable product IDs.

Read this file first, then the applicable nested AGENTS.md. Nested instructions apply within their own directory and extend these project rules.

## Working conventions

- Use pnpm exclusively and retain the pinned package manager and lockfile. Use frozen installs for reproducible builds and review dependency changes, lifecycle scripts, and audit findings.
- Keep route files in src/app, reusable UI in src/components, business settings in src/config, the catalog in src/data, order and currency logic in src/lib, state in src/stores, and UI dictionaries in src/i18n.
- Use descriptive names, PascalCase for components and types, camelCase for functions, and stable kebab-case product IDs. Prefer typed props, pure domain functions, and small, composable components.
- Preserve the Modern Artisan and Khmer Heritage visual direction, responsive layout, reduced motion, keyboard navigation, focus visibility, readable contrast, and Khmer typography.
- Optimize local photography, avoid unnecessary client code and dependencies, and preserve a usable first render.
- Use verified business information. Keep unknown details configurable and visibly identify placeholders. Validate customer inputs and keep credentials and customer details out of persisted state, logs, and shared caches.
- Preserve unrelated changes. Keep diffs focused and document architectural or operational decisions in the README or docs.

## Verification

Run pnpm install --frozen-lockfile, pnpm exec tsc --noEmit, pnpm lint, pnpm test, pnpm build, and pnpm audit as applicable. Verify affected storefront flows across mobile and desktop and test PWA changes with a production server. Report actual results and any limits. Work is complete when the normal user flow works, configuration is documented, and relevant checks pass.

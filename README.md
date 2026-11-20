# Moonique Shop

A bilingual storefront for a Cambodian homemade food business. Browse 13 products, build a cart, and prepare an order inquiry for Telegram. The storefront uses Next.js App Router, strict TypeScript, Tailwind CSS, the shadcn-style Radix dialog primitive, Lucide, Motion and Zustand.

## Run locally

Use Node.js 22.13 or newer and pnpm 10.34.9. With Corepack, use `corepack pnpm` in place of `pnpm` if your system has no working pnpm shim. In PowerShell, the `.cmd` shim works when script execution is restricted.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The development server defaults to http://localhost:3000.

## Configure the shop

- [Business settings](src/config/site.ts) hold the public contact details, fulfillment information, featured product IDs, reviews and manual KHR exchange rate. The starting rate is 4,000 KHR per USD for display and should be confirmed by the shop before configuring prices.
- [Catalog](src/data/products.ts) holds product names, availability, price in USD cents, photos, descriptions, portions and ingredients. Add verified Khmer names and descriptions there. Unknown prices display **Contact for Price** and contribute no numeric amount to the subtotal.
- Copy [.env.example](.env.example) to `.env.local` and fill in `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_TELEGRAM_USERNAME`. Both values are public and read at build time. Use the verified Telegram username or its HTTPS `t.me` contact link.
- The editorial imagery and three product images are AI-generated illustrations labeled in the storefront. The other products use photo placeholders. Replace these when approved shop photography is available and clear each replaced product’s illustrative flag.
- Add the verified phone, Facebook page, address, location, hours, pickup and delivery details to the business settings. The review section appears when genuine reviews are configured.

## Verify

```sh
pnpm exec tsc --noEmit
pnpm lint
pnpm test
pnpm build
pnpm audit
pnpm exec playwright install chromium
pnpm test:browser
```

Run `pnpm start` to serve the production build. For a local Playwright run using installed Edge, set `MOONIQUE_BROWSER_CHANNEL=msedge` in your shell before running the browser suite.

## Deploy to Vercel

1. Push the project and its `pnpm-lock.yaml` to the Git repository used by Vercel.
2. Import it as a Next.js project. Use Node.js 22 and set the install command to `pnpm install --frozen-lockfile` if needed. The build command is `pnpm build`.
3. Set the two public environment variables in Vercel and deploy. Check the canonical URL, sitemap, Telegram destination and PWA behavior on the HTTPS domain.
4. On standard Node.js hosting, run the same frozen install and build, then serve with `pnpm start` behind HTTPS.

See [architecture and operations](docs/architecture.md) for the order flow and PWA details. Repository-wide maintenance conventions live in [AGENTS.md](AGENTS.md).

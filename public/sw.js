/* global self, caches, fetch, Response, URL */
const version = "mooniqueshop-v1";
const shell = `${version}-shell`;
const images = `${version}-images`;
const fallback = "/offline";
const essentials = ["/", fallback, "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/maskable-512.png"];

function firstPartyAsset(reference, base) {
  const url = new URL(reference, base);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")
    || url.pathname.startsWith("/images/") || url.pathname === "/_next/image") return url.href;
}

async function warm(cache) {
  await cache.addAll(essentials);
  for (const page of ["/", fallback]) {
    const html = await (await cache.match(page)).text();
    const references = new Set([...html.matchAll(/\b(?:src|href)="([^"]+)"/g)]
      .map((match) => firstPartyAsset(match[1].replace(/&amp;/g, "&"), self.location.origin))
      .filter(Boolean));
    const assets = [...references].filter((url) => new URL(url).pathname.startsWith("/_next/static/"));
    await cache.addAll(assets);
    await Promise.all(assets.filter((url) => url.endsWith(".css")).map(async (url) => {
      const css = await (await cache.match(url)).text();
      const fonts = [...new Set([...css.matchAll(/url\(["']?([^"'()]+)["']?\)/g)]
        .map((match) => firstPartyAsset(match[1], url)).filter(Boolean))];
      await Promise.allSettled(fonts.map((font) => cache.add(font)));
    }));
    await Promise.allSettled([...references].filter((url) => !assets.includes(url)).map((url) => cache.add(url)));
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(shell).then(warm));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    await Promise.all((await caches.keys())
      .filter((name) => name.startsWith("mooniqueshop-") && name !== shell && name !== images)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") event.waitUntil(self.skipWaiting());
});

async function navigate(request, requestUrl) {
  const cache = await caches.open(shell);
  try {
    const response = await fetch(request);
    if (response.ok && requestUrl.pathname === "/" && !requestUrl.search) {
      await cache.put("/", response.clone()).catch(() => undefined);
    }
    return response;
  } catch {
    if (requestUrl.pathname === "/") {
      const cached = await cache.match("/");
      if (cached) return cached;
    }
    return await cache.match(fallback) ?? new Response("Moonique Shop is offline.", { status: 503 });
  }
}

async function cachedAsset(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request) ?? (cacheName === images ? await (await caches.open(shell)).match(request) : undefined);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      await cache.put(request, response.clone()).catch(() => undefined);
      if (cacheName === images) {
        const keys = await cache.keys();
        await Promise.all(keys.slice(0, Math.max(0, keys.length - 60)).map((key) => cache.delete(key)));
      }
    }
    return response;
  } catch {
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(navigate(request, url));
  } else if (firstPartyAsset(request.url, self.location.origin)) {
    const cacheName = request.destination === "image" || url.pathname.startsWith("/images/") ? images : shell;
    event.respondWith(cachedAsset(request, cacheName));
  }
});

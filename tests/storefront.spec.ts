import { expect, test } from "@playwright/test";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

test("search, categories, details, persistent cart and Telegram summary handoff", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  const main = page.getByRole("main");
  await page.getByRole("navigation", { name: "Navigation" }).getByRole("link", { name: "Our Menu" }).click();
  await expect(page).toHaveURL(/#menu$/);
  const search = page.getByRole("searchbox", { name: "Search the menu" });
  await search.fill("spring roll");
  await expect(main.getByRole("article")).toHaveCount(2);
  await page.getByRole("button", { name: "Traditional Treats" }).click();
  await expect(page.getByText("No products found.")).toBeVisible();
  await page.getByRole("button", { name: "Snacks & Appetizers" }).click();
  await expect(main.getByRole("article")).toHaveCount(2);
  const product = page.getByRole("button", { name: "Product details · Deep-fried Spring Roll" });
  await product.click();
  const detail = page.getByRole("dialog", { name: "Deep-fried Spring Roll" });
  await detail.getByRole("button", { name: "Increase quantity" }).click();
  await detail.getByRole("button", { name: "Add to cart" }).click();
  await expect(detail).toBeHidden();
  await expect(product).toBeFocused();
  await expect(page.getByRole("status").filter({ hasText: "Added to your cart" })).toBeVisible();
  await page.getByLabel("Currency").selectOption("KHR");
  await page.getByLabel("Language").selectOption("km");
  await expect(page.locator("html")).toHaveAttribute("lang", "km");
  await page.reload();
  await expect(page.getByLabel("រូបិយប័ណ្ណ")).toHaveValue("KHR");
  await expect(page.locator("html")).toHaveAttribute("lang", "km");
  await page.getByLabel("ភាសា").selectOption("en");
  await page.getByRole("button", { name: "Your Cart (2)" }).click();
  const cart = page.getByRole("dialog");
  await cart.getByRole("button", { name: "Increase quantity" }).click();
  await cart.getByRole("button", { name: "Decrease quantity" }).click();
  await cart.getByRole("button", { name: "Prepare your order" }).click();
  await cart.getByRole("button", { name: "Generate order summary" }).click();
  await expect(cart.getByText("Enter your name")).toBeVisible();
  await cart.getByLabel("Your name").fill("Example Customer");
  await cart.getByLabel("Phone").fill("012345678");
  await cart.getByLabel("Fulfillment").selectOption("delivery");
  await cart.getByLabel("Delivery address (optional)").fill("Example address");
  await cart.getByRole("button", { name: "Generate order summary" }).click();
  await expect(cart.getByRole("textbox", { name: "Order summary" })).toHaveValue(/Deep-fried Spring Roll × 2[\s\S]+Address: Example address/);
  const telegram = process.env.NEXT_PUBLIC_TELEGRAM_USERNAME;
  if (telegram) {
    await expect(cart.getByRole("link", { name: "Open Telegram" })).toHaveAttribute("href", `https://t.me/${telegram.replace(/^@/, "")}`);
  } else {
    await expect(cart.getByText("Moonique Shop’s Telegram contact is awaiting confirmation.", { exact: false })).toBeVisible();
  }
  await cart.getByRole("button", { name: "Copy order" }).click();
  await expect(cart.getByText("Order summary copied.")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("Example address");
  await cart.getByRole("button", { name: "Back to cart" }).click();
  await cart.getByRole("button", { name: "Remove · Deep-fried Spring Roll" }).click();
  await expect(cart.getByText("Your cart is empty.")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Add to cart · Meatball", exact: true }).click();
  await page.getByRole("button", { name: "Your Cart (1)" }).click();
  await cart.getByRole("button", { name: "Clear cart" }).click();
  await expect(cart.getByText("Your cart is empty.")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(cart).toBeHidden();
});

test("all target widths keep the English and Khmer storefront and overlays within the viewport", async ({ page }, testInfo) => {
  for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 850 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const language of ["en", "km"]) {
      await page.locator(".preference--language select").selectOption(language);
      await expect(page.locator("html")).toHaveAttribute("lang", language);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      expect(overflow, `horizontal overflow at ${width}px in ${language}`).toBe(false);
      if (language === "en" && (width === 390 || width === 1440)) {
        await page.screenshot({ path: testInfo.outputPath(`storefront-${width}.png`), animations: "disabled" });
      }
    }
    if (width < 1024) {
      await page.getByRole("button", { name: "ម៉ឺនុយរុករក" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toBeHidden();
    }
    await page.locator("[data-cart-trigger]").click();
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    expect(await drawer.evaluate((element) => (element as HTMLElement).offsetWidth)).toBeLessThanOrEqual(width);
    await page.keyboard.press("Escape");
    await page.locator(".preference--language select").selectOption("en");
  }
});

test("production manifest, icons, offline navigation, cached catalog and local cart", async ({ page, context, request }) => {
  const manifestResponse = await request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toBe("/");
  for (const icon of manifest.icons) {
    const response = await request.get(icon.src);
    expect(response.ok()).toBe(true);
    const bytes = await response.body();
    const size = Number(icon.sizes.split("x")[0]);
    expect(bytes.readUInt32BE(16)).toBe(size);
    expect(bytes.readUInt32BE(20)).toBe(size);
  }
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await page.getByRole("button", { name: "Add to cart · Meatball", exact: true }).click();
  await context.setOffline(true);
  await expect.poll(() => page.evaluate(() => navigator.onLine)).toBe(false);
  await page.reload();
  await expect(page.getByText("You’re offline. You can browse cached items", { exact: false })).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(13);
  await page.getByRole("button", { name: "Your Cart (1)" }).click();
  await expect(page.getByRole("dialog").getByText("Meatball")).toBeVisible();
  await page.goto("/offline-check");
  await expect(page.getByRole("heading", { name: "You’re offline" })).toBeVisible();
  await context.setOffline(false);
  await page.goto("/");
  const devTools = await context.newCDPSession(page);
  const { installabilityErrors } = await devTools.send("Page.getInstallabilityErrors");
  expect(installabilityErrors.filter(({ errorId }) => errorId !== "in-incognito")).toEqual([]);
  await devTools.detach();
});

test("a waiting service worker can be activated from the storefront", async ({ page, baseURL }) => {
  let updated = false;
  const worker = await fetch(new URL("/sw.js", baseURL)).then((response) => response.text());
  const proxy = createServer(async (request, response) => {
    try {
      if (request.url === "/sw.js") {
        response.writeHead(200, { "Content-Type": "application/javascript", "Cache-Control": "no-store" });
        response.end(updated ? worker.replace('const version = "mooniqueshop-', 'const version = "mooniqueshop-test-') : worker);
        return;
      }
      const upstream = await fetch(new URL(request.url || "/", baseURL));
      response.writeHead(upstream.status, { "Content-Type": upstream.headers.get("content-type") || "application/octet-stream" });
      response.end(Buffer.from(await upstream.arrayBuffer()));
    } catch {
      response.writeHead(502).end();
    }
  });
  await new Promise<void>((resolve) => proxy.listen(0, "127.0.0.1", resolve));

  try {
    await page.goto(`http://127.0.0.1:${(proxy.address() as AddressInfo).port}/`);
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await page.getByRole("button", { name: "Add to cart · Meatball", exact: true }).click();
    updated = true;
    await page.evaluate(async () => { await (await navigator.serviceWorker.ready).update(); });
    const update = page.getByRole("button", { name: "Update app" });
    await expect(update).toBeVisible();
    await Promise.all([page.waitForEvent("load"), update.click()]);
    await expect(update).toBeHidden();
    await expect(page.getByRole("button", { name: "Your Cart (1)" })).toBeVisible();
    const names = await page.evaluate(() => caches.keys());
    expect(names.some((name) => name.startsWith("mooniqueshop-test-"))).toBe(true);
    expect(names.every((name) => name.startsWith("mooniqueshop-test-"))).toBe(true);
  } finally {
    proxy.closeAllConnections();
    await new Promise<void>((resolve) => proxy.close(() => resolve()));
  }
});

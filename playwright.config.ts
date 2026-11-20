import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  use: { baseURL: "http://127.0.0.1:3210" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], ...(process.env.MOONIQUE_BROWSER_CHANNEL ? { channel: process.env.MOONIQUE_BROWSER_CHANNEL } : {}) } }],
  webServer: { command: "pnpm start --port 3210 --hostname 127.0.0.1", url: "http://127.0.0.1:3210", reuseExistingServer: !process.env.CI },
});

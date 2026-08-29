import { defineConfig, devices } from "@playwright/test";
import path from "path";

const STORAGE_STATE_PATH = path.join(__dirname, "playwright/.auth/user.json");

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: "http://localhost:3000",
    navigationTimeout: 15_000,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },
  reporter: [["list"], ["html", { open: "never" }]],
  webServer: {
    command: "pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [
    // 1. Setup project for UI login and storageState generation
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    // 2. Unauthenticated Smoke tests (e.g. Auth Boundary SMOKE-001)
    {
      name: "unauthenticated-smoke",
      testMatch: /auth\.smoke\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    // 3. Authenticated Smoke tests (Desktop)
    {
      name: "authenticated-smoke-desktop",
      testMatch: /(navigation|core-pages)\.smoke\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: STORAGE_STATE_PATH,
      },
    },
    // 4. Authenticated Smoke tests (Mobile)
    {
      name: "authenticated-smoke-mobile",
      testMatch: /(navigation|core-pages)\.smoke\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 390, height: 844 },
        storageState: STORAGE_STATE_PATH,
      },
    },
  ],
});

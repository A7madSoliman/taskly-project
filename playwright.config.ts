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
    // 1. Dedicated project for Phase B Node fixture lifecycle validation (runs without browser auth setup)
    {
      name: "disposable-fixture-validation",
      testMatch: /fixtures[\\/]disposable-data\.validation\.spec\.ts$/,
    },
    // 2. Setup project for UI login and storageState generation
    {
      name: "setup",
      testMatch: /auth\.setup\.ts$/,
    },
    // 3. Unauthenticated Smoke tests (e.g. Auth Boundary SMOKE-001)
    {
      name: "unauthenticated-smoke",
      testMatch: /smoke[\\/]auth\.smoke\.spec\.ts$/,
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    // 4. Authenticated Smoke tests (Desktop)
    {
      name: "authenticated-smoke-desktop",
      testMatch: /smoke[\\/](navigation|core-pages)\.smoke\.spec\.ts$/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: STORAGE_STATE_PATH,
      },
    },
    // 5. Authenticated Smoke tests (Mobile)
    {
      name: "authenticated-smoke-mobile",
      testMatch: /smoke[\\/](navigation|core-pages)\.smoke\.spec\.ts$/,
      dependencies: ["setup"],
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 390, height: 844 },
        storageState: STORAGE_STATE_PATH,
      },
    },
    // 6. Phase C Core CRUD Regression suite (Desktop)
    {
      name: "core-crud-regression",
      testMatch: /regression[\\/]core-.*\.spec\.ts$/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: STORAGE_STATE_PATH,
      },
    },
    // 7. Phase D Advanced Tasks Regression suite (Desktop)
    {
      name: "advanced-task-regression-desktop",
      testMatch:
        /regression[\\/]advanced-task-(search|pagination|dnd|errors)\.spec\.ts$/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: STORAGE_STATE_PATH,
      },
    },
    // 8. Phase D Advanced Tasks Regression suite (Mobile)
    {
      name: "advanced-task-regression-mobile",
      testMatch: /regression[\\/]advanced-task-mobile\.spec\.ts$/,
      dependencies: ["setup"],
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 390, height: 844 },
        storageState: STORAGE_STATE_PATH,
      },
    },
    // 9. Phase E Statistics Regression suite (Desktop)
    {
      name: "statistics-regression-desktop",
      testMatch: /regression[\\/]statistics-(data|errors)\.spec\.ts$/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: STORAGE_STATE_PATH,
      },
    },
    // 10. Phase E Statistics Regression suite (Mobile)
    {
      name: "statistics-regression-mobile",
      testMatch: /regression[\\/]statistics-responsive\.spec\.ts$/,
      dependencies: ["setup"],
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 390, height: 844 },
        storageState: STORAGE_STATE_PATH,
      },
    },
  ],
});

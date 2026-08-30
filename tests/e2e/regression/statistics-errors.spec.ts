import { test, expect } from "@playwright/test";

test.describe("Advanced Statistics Regression — Error Handling & Recovery (TM-31)", () => {
  test("STAT-007: Statistics RPC Failure and Retry Recovery", async ({
    page,
  }) => {
    let shouldFailStats = true;

    // Mock Projects List
    await page.route("**/rest/v1/rpc/get_projects", async (route) => {
      const req = route.request();
      if (
        req.method() === "POST" &&
        new URL(req.url()).pathname === "/rest/v1/rpc/get_projects"
      ) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      } else {
        await route.continue();
      }
    });

    // Mock Calendar Stats with controlled failure on first attempt
    await page.route(
      "**/rest/v1/rpc/get_tasks_calendar_stats",
      async (route) => {
        const req = route.request();
        if (
          req.method() === "POST" &&
          new URL(req.url()).pathname ===
            "/rest/v1/rpc/get_tasks_calendar_stats"
        ) {
          if (shouldFailStats) {
            await route.fulfill({
              status: 500,
              contentType: "application/json",
              body: JSON.stringify({
                code: "500",
                message: "Simulated internal database error",
              }),
            });
          } else {
            await route.fulfill({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify({
                daily: [],
                totals: { DONE: 7 },
                total_tasks: 7,
                done_tasks: 7,
                overdue_tasks: 0,
              }),
            });
          }
        } else {
          await route.continue();
        }
      }
    );

    // Mock Tasks Count Per Project
    await page.route(
      "**/rest/v1/rpc/get_tasks_count_per_project",
      async (route) => {
        const req = route.request();
        if (
          req.method() === "POST" &&
          new URL(req.url()).pathname ===
            "/rest/v1/rpc/get_tasks_count_per_project"
        ) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([]),
          });
        } else {
          await route.continue();
        }
      }
    );

    // Navigate to /my-statistics with initial 500 failure
    await page.goto("/my-statistics");

    // 1. Verify Error Banner UI
    const errorHeading = page.getByRole("heading", {
      name: "Failed to load statistics",
    });
    await expect(errorHeading).toBeVisible();

    const errorMessage = page.locator("p", {
      hasText:
        "There was a problem retrieving your task statistics. Please try again.",
    });
    await expect(errorMessage).toBeVisible();

    const retryButton = page.getByRole("button", { name: "Retry" });
    await expect(retryButton).toBeVisible();

    // 2. Set backend mock to succeed on Retry
    shouldFailStats = false;

    // 3. Click Retry and verify error banner disappears
    await retryButton.click();
    await expect(errorHeading).toHaveCount(0);

    // 4. Verify Dashboard content successfully recovered
    const totalKpi = page.locator("div.rounded-\\[8px\\]").filter({
      has: page.locator("span", { hasText: "TOTAL TASKS" }),
    });
    await expect(totalKpi.locator("div.text-\\[32px\\]")).toHaveText("7");

    const completedKpi = page.locator("div.rounded-\\[8px\\]").filter({
      has: page.locator("span", { hasText: "COMPLETED TASKS" }),
    });
    await expect(completedKpi.locator("div.text-\\[32px\\]")).toHaveText("7");
  });
});

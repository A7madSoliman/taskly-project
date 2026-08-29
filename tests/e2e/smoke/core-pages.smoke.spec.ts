import { test, expect } from "../fixtures/monitoring.fixture";

test.describe("Core Pages Smoke", () => {
  test("SMOKE-003: Projects List / Landing", async ({
    monitoredPage: page,
  }) => {
    await page.goto("/project");
    await expect(page).toHaveURL(/\/project/);
    await expect(page.locator("main")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Projects", exact: true })
    ).toBeVisible();
  });

  test("SMOKE-004: My Statistics Dashboard", async ({
    monitoredPage: page,
  }) => {
    await page.goto("/my-statistics");
    await expect(page).toHaveURL(/\/my-statistics/);

    // Verify header and core sections
    await expect(
      page.getByRole("heading", { name: "Weekly Planner" })
    ).toBeVisible();
    await expect(page.getByLabel("Start date")).toBeVisible();
    await expect(page.getByLabel("End date")).toBeVisible();
    await expect(page.getByLabel("Filter by project")).toBeVisible();
    await expect(page.getByLabel("Filter by status")).toBeVisible();

    // Verify KPI section
    await expect(page.getByText("TOTAL TASKS")).toBeVisible();
    await expect(page.getByText("COMPLETED TASKS")).toBeVisible();
    await expect(page.getByText("OVERDUE TASKS")).toBeVisible();

    // Verify Schedule and Bottom Cards
    await expect(page.getByText("Weekly Schedule")).toBeVisible();
    await expect(page.getByText("Tasks by Status")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "All Projects",
        exact: true,
      })
    ).toBeVisible();
  });

  test("SMOKE-007 / SMOKE-008: Read-Only Project Journey", async ({
    monitoredPage: page,
  }) => {
    await page.goto("/project");
    await expect(page).toHaveURL(/\/project/);

    // Check if any existing project card is accessible
    const projectCardLink = page
      .locator('a[href^="/project/"][href$="/tasks"]')
      .first();
    const hasProject = await projectCardLink.isVisible().catch(() => false);

    if (hasProject) {
      await projectCardLink.click();
      await expect(page).toHaveURL(/\/project\/.*\/tasks/);
      await expect(page.locator("main")).toBeVisible();
    } else {
      // Graceful report when account has 0 projects without failure
      test.info().annotations.push({
        type: "info",
        description:
          "PROJECT JOURNEY — NOT EXECUTED: dedicated QA account has no accessible Project",
      });
    }
  });
});

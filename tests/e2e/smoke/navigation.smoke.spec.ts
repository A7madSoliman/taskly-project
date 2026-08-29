import { test, expect } from "../fixtures/monitoring.fixture";

test.describe("Navigation Smoke", () => {
  test("SMOKE-005: Desktop Sidebar Navigation", async ({
    monitoredPage: page,
  }, testInfo) => {
    // Only run on desktop project
    if (testInfo.project.name.includes("mobile")) return;

    await page.goto("/project");
    await expect(page).toHaveURL(/\/project/);

    // Verify My Statistics navigation link
    const statsLink = page.getByRole("link", { name: "My Statistics" });
    await expect(statsLink).toBeVisible();
    await statsLink.click();

    await expect(page).toHaveURL(/\/my-statistics/);
    await expect(
      page.getByRole("heading", { name: "Weekly Planner" })
    ).toBeVisible();

    // Verify active styling on My Statistics link
    await expect(statsLink).toHaveClass(/bg-\[#0052cc\]|text-\[#0052cc\]/);

    // Navigate back to Projects
    const projectsLink = page.getByRole("link", { name: "Projects" }).first();
    await projectsLink.click();
    await expect(page).toHaveURL(/\/project/);
  });

  test("SMOKE-006: Mobile Global Navigation", async ({
    monitoredPage: page,
  }, testInfo) => {
    // Only run on mobile project
    if (!testInfo.project.name.includes("mobile")) return;

    await page.goto("/my-statistics");
    await expect(page).toHaveURL(/\/my-statistics/);

    // Verify global bottom navigation contains Projects and My Statistics
    const bottomNav = page.getByRole("navigation", {
      name: "Mobile Bottom Navigation",
    });
    await expect(bottomNav).toBeVisible();

    const bottomNavLinks = bottomNav.getByRole("link");
    await expect(bottomNavLinks).toHaveCount(2);

    const firstLink = bottomNavLinks.nth(0);
    const secondLink = bottomNavLinks.nth(1);

    await expect(firstLink).toContainText("Projects");
    await expect(secondLink).toContainText("My Statistics");
    await expect(secondLink).toHaveAttribute("aria-current", "page");
  });
});

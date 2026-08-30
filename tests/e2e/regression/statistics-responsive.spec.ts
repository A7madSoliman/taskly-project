import { test, expect } from "../fixtures/monitoring.fixture";

// Helper to format local Date as YYYY-MM-DD
function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper to calculate current local Sunday-Saturday week
function getCurrentLocalWeek(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const sunday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - dayOfWeek
  );
  const saturday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - dayOfWeek + 6
  );
  return {
    start: formatLocalDate(sunday),
    end: formatLocalDate(saturday),
  };
}

// Helper to get dates array in range
function getDatesInRange(startStr: string, endStr: string): string[] {
  const [sy, sm, sd] = startStr.split("-").map(Number);
  const [ey, em, ed] = endStr.split("-").map(Number);
  const cur = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  const dates: string[] = [];
  while (cur <= end && dates.length < 10) {
    dates.push(formatLocalDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

test.describe("Advanced Statistics Regression — Responsive Presentation (TM-31)", () => {
  test("STAT-009: MOBILE — Statistics Responsive Presentation", async ({
    monitoredPage: page,
  }) => {
    const { start, end } = getCurrentLocalWeek();
    const weekDates = getDatesInRange(start, end);
    const todayStr = formatLocalDate(new Date());

    // Mock Projects List
    await page.route("**/rest/v1/rpc/get_projects", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    // Mock Calendar Stats
    await page.route(
      "**/rest/v1/rpc/get_tasks_calendar_stats",
      async (route) => {
        const daily = weekDates.map((dayStr) => {
          if (dayStr === todayStr) {
            return {
              day: dayStr,
              statuses: {
                IN_PROGRESS: 3,
                DONE: 2,
              },
            };
          }
          return { day: dayStr, statuses: {} };
        });

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            daily,
            totals: {
              IN_PROGRESS: 3,
              DONE: 2,
            },
            total_tasks: 5,
            done_tasks: 2,
            overdue_tasks: 0,
          }),
        });
      }
    );

    // Mock Tasks Count Per Project
    await page.route(
      "**/rest/v1/rpc/get_tasks_count_per_project",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      }
    );

    await page.goto("/my-statistics");

    // 1. Heading "Weekly Planner" visible
    await expect(
      page.getByRole("heading", { name: "Weekly Planner" })
    ).toBeVisible();

    // 2. Controls visible
    await expect(page.getByLabel("Start date")).toBeVisible();
    await expect(page.getByLabel("End date")).toBeVisible();
    await expect(page.getByLabel("Filter by project")).toBeVisible();
    await expect(page.getByLabel("Filter by status")).toBeVisible();

    // 3. Mobile Bottom Navigation visible and "My Statistics" is current page
    const mobileNav = page.getByRole("navigation", {
      name: "Mobile Bottom Navigation",
    });
    await expect(mobileNav).toBeVisible();

    const statsNavLink = mobileNav.getByRole("link", { name: "My Statistics" });
    await expect(statsNavLink).toBeVisible();
    await expect(statsNavLink).toHaveAttribute("aria-current", "page");

    // 4. Mobile Calendar vertical day layout is visible, Desktop 7-col grid is CSS-hidden
    const mobileCalendar = page.locator("div.flex.flex-col.gap-3.lg\\:hidden");
    await expect(mobileCalendar).toBeVisible();

    const desktopCalendar = page.locator("div.hidden.lg\\:grid.grid-cols-7");
    await expect(desktopCalendar).toBeHidden();

    // 5. Verify "Today" badge is visible within mobile day stream
    const todayBadge = mobileCalendar.locator("span", { hasText: "Today" });
    await expect(todayBadge).toBeVisible();

    // 6. Verify Mobile status count badges for today's entry
    await expect(
      mobileCalendar.getByText("IN PROGRESS:", { exact: true })
    ).toBeVisible();
    await expect(
      mobileCalendar.getByText("DONE:", { exact: true })
    ).toBeVisible();

    // 7. Verify all three KPI cards exist in the mobile view
    const kpiContainer = page.locator("div.overflow-x-auto");
    await expect(kpiContainer).toBeVisible();
    await expect(
      kpiContainer.locator("span", { hasText: "TOTAL TASKS" })
    ).toBeVisible();
    await expect(
      kpiContainer.locator("span", { hasText: "COMPLETED TASKS" })
    ).toBeVisible();
    await expect(
      kpiContainer.locator("span", { hasText: "OVERDUE TASKS" })
    ).toBeVisible();
  });
});

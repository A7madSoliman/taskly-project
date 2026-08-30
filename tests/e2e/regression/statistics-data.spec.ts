import { test, expect } from "../fixtures/monitoring.fixture";

// Canonical ordered statuses for verification
const CANONICAL_STATUS_ITEMS = [
  { status: "TO_DO", label: "TO DO" },
  { status: "IN_PROGRESS", label: "IN PROGRESS" },
  { status: "BLOCKED", label: "BLOCKED" },
  { status: "IN_REVIEW", label: "IN REVIEW" },
  { status: "READY_FOR_QA", label: "READY FOR QA" },
  { status: "REOPENED", label: "REOPENED" },
  { status: "READY_FOR_PRODUCTION", label: "READY FOR PRODUCTION" },
  { status: "DONE", label: "DONE" },
];

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

test.describe("Advanced Statistics Regression — Data & Filter Mapping (TM-31)", () => {
  test("STAT-001: Default Sunday-Saturday Week and Dashboard Rendering", async ({
    monitoredPage: page,
  }) => {
    const { start: expectedStart, end: expectedEnd } = getCurrentLocalWeek();
    const weekDates = getDatesInRange(expectedStart, expectedEnd);

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
          body: JSON.stringify([
            {
              id: "11111111-1111-4111-8111-111111111111",
              name: "Alpha Project",
              description: "Alpha desc",
              created_at: new Date().toISOString(),
            },
            {
              id: "22222222-2222-4222-8222-222222222222",
              name: "Beta Project",
              description: "Beta desc",
              created_at: new Date().toISOString(),
            },
          ]),
        });
      } else {
        await route.continue();
      }
    });

    // Mock Calendar Stats
    await page.route(
      "**/rest/v1/rpc/get_tasks_calendar_stats",
      async (route) => {
        const req = route.request();
        if (
          req.method() === "POST" &&
          new URL(req.url()).pathname ===
            "/rest/v1/rpc/get_tasks_calendar_stats"
        ) {
          // Construct daily stats: First day has tasks, last day has zero tasks (No Tasks)
          const daily = weekDates.map((dayStr, idx) => {
            if (idx === weekDates.length - 1) {
              // Last day is empty to test No Tasks rendering
              return { day: dayStr, statuses: {} };
            }
            if (idx === 0) {
              return {
                day: dayStr,
                statuses: {
                  TO_DO: 1,
                  IN_PROGRESS: 2,
                  BLOCKED: 3,
                  IN_REVIEW: 4,
                  READY_FOR_QA: 5,
                  REOPENED: 6,
                  READY_FOR_PRODUCTION: 7,
                  DONE: 8,
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
                TO_DO: 1,
                IN_PROGRESS: 2,
                BLOCKED: 3,
                IN_REVIEW: 4,
                READY_FOR_QA: 5,
                REOPENED: 6,
                READY_FOR_PRODUCTION: 7,
                DONE: 8,
              },
              total_tasks: 36,
              done_tasks: 8,
              overdue_tasks: 3,
            }),
          });
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
            body: JSON.stringify([
              {
                project_id: "11111111-1111-4111-8111-111111111111",
                project_name: "Alpha Project",
                tasks_count: 24,
              },
              {
                project_id: "22222222-2222-4222-8222-222222222222",
                project_name: "Beta Project",
                tasks_count: 12,
              },
            ]),
          });
        } else {
          await route.continue();
        }
      }
    );

    await page.goto("/my-statistics");

    // 1. Page heading is "Weekly Planner"
    await expect(
      page.getByRole("heading", { name: "Weekly Planner" })
    ).toBeVisible();

    // 2. Start date and End date default to current local Sunday & Saturday
    const startDateInput = page.getByLabel("Start date");
    const endDateInput = page.getByLabel("End date");
    await expect(startDateInput).toHaveValue(expectedStart);
    await expect(endDateInput).toHaveValue(expectedEnd);

    // 3. KPI Cards
    const totalKpi = page.locator("div.rounded-\\[8px\\]").filter({
      has: page.locator("span", { hasText: "TOTAL TASKS" }),
    });
    await expect(totalKpi.locator("div.text-\\[32px\\]")).toHaveText("36");

    const completedKpi = page.locator("div.rounded-\\[8px\\]").filter({
      has: page.locator("span", { hasText: "COMPLETED TASKS" }),
    });
    await expect(completedKpi.locator("div.text-\\[32px\\]")).toHaveText("8");

    const overdueKpi = page.locator("div.rounded-\\[8px\\]").filter({
      has: page.locator("span", { hasText: "OVERDUE TASKS" }),
    });
    await expect(overdueKpi.locator("div.text-\\[32px\\]")).toHaveText("3");

    // 4. Weekly Schedule
    const weeklyScheduleSection = page.locator("div.rounded-\\[8px\\]").filter({
      has: page.getByRole("heading", { name: "Weekly Schedule" }),
    });
    await expect(weeklyScheduleSection).toBeVisible();

    // Desktop 7-day grid contains day with tasks and day with No Tasks
    const desktopGrid = weeklyScheduleSection.locator(
      "div.hidden.lg\\:grid.grid-cols-7"
    );
    await expect(desktopGrid).toBeVisible();
    await expect(
      desktopGrid.getByText("No Tasks", { exact: true })
    ).toHaveCount(6);

    // 5. Tasks by Status (Doughnut)
    const statusSection = page.locator("div.rounded-\\[8px\\]").filter({
      has: page.getByRole("heading", { name: "Tasks by Status" }),
    });
    await expect(statusSection).toBeVisible();
    await expect(statusSection.locator("span.text-\\[24px\\]")).toHaveText(
      "36"
    );

    // Verify all canonical legend items with correct counts
    for (const item of CANONICAL_STATUS_ITEMS) {
      const legendItem = statusSection
        .locator("div.flex.items-center.justify-between")
        .filter({
          hasText: item.label,
        });
      await expect(legendItem).toBeVisible();
    }

    // 6. All Projects section
    const allProjectsSection = page.locator("div.rounded-\\[8px\\]").filter({
      has: page.getByRole("heading", { name: "All Projects" }),
    });
    await expect(allProjectsSection).toBeVisible();

    const alphaRow = allProjectsSection
      .locator("div.flex.items-center.justify-between.rounded-\\[6px\\]")
      .filter({
        has: page.getByText("Alpha Project", { exact: true }),
      });
    await expect(alphaRow).toBeVisible();
    await expect(
      alphaRow.locator("span.font-bold", { hasText: "24" })
    ).toBeVisible();
    await expect(alphaRow.locator("span", { hasText: "tasks" })).toBeVisible();

    const betaRow = allProjectsSection
      .locator("div.flex.items-center.justify-between.rounded-\\[6px\\]")
      .filter({
        has: page.getByText("Beta Project", { exact: true }),
      });
    await expect(betaRow).toBeVisible();
    await expect(
      betaRow.locator("span.font-bold", { hasText: "12" })
    ).toBeVisible();
    await expect(betaRow.locator("span", { hasText: "tasks" })).toBeVisible();
  });

  test("STAT-002: Exact Seven-Day Inclusive Custom Range", async ({
    monitoredPage: page,
  }) => {
    const customStart = "2026-05-01";
    const customEnd = "2026-05-07";
    const expectedDates = getDatesInRange(customStart, customEnd);

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
        const postData = route.request().postDataJSON() || {};
        const start = postData.p_start_date || customStart;
        const end = postData.p_end_date || customEnd;
        const dates = getDatesInRange(start, end);
        const daily = dates.map((d) => ({ day: d, statuses: { TO_DO: 1 } }));

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            daily,
            totals: { TO_DO: dates.length },
            total_tasks: dates.length,
            done_tasks: 0,
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
    await expect(
      page.getByRole("heading", { name: "Weekly Planner" })
    ).toBeVisible();

    const startDateInput = page.getByLabel("Start date");
    const endDateInput = page.getByLabel("End date");

    // Set custom range
    await startDateInput.fill(customStart);
    await endDateInput.fill(customEnd);

    // Verify date range text header in Weekly Schedule matches custom dates
    const weeklyHeader = page.locator("div.flex.items-center.gap-1\\.5", {
      hasText: `${customStart} to ${customEnd}`,
    });
    await expect(weeklyHeader).toBeVisible();

    // Verify absence of product validation alert messages
    await expect(
      page.getByText("Please enter valid dates.", { exact: true })
    ).toHaveCount(0);
    await expect(
      page.getByText("End date must be on or after start date.", {
        exact: true,
      })
    ).toHaveCount(0);
    await expect(
      page.getByText("Date range cannot exceed 7 days.", { exact: true })
    ).toHaveCount(0);

    // Verify desktop grid renders exactly 7 column cards
    const desktopGrid = page.locator("div.hidden.lg\\:grid.grid-cols-7");
    await expect(desktopGrid).toBeVisible();
    for (const d of expectedDates) {
      const [y, m, dayNum] = d.split("-").map(Number);
      const monthShort = new Date(y, m - 1, dayNum).toLocaleDateString(
        "en-US",
        {
          month: "short",
        }
      );
      await expect(
        desktopGrid.locator("span", { hasText: `${dayNum} ${monthShort}` })
      ).toBeVisible();
    }
  });

  test("STAT-003: Date Validation Blocks Statistics RPCs", async ({
    monitoredPage: page,
  }) => {
    let statsCallCount = 0;
    let projCountCallCount = 0;

    await page.route("**/rest/v1/rpc/get_projects", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.route(
      "**/rest/v1/rpc/get_tasks_calendar_stats",
      async (route) => {
        statsCallCount++;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            daily: [],
            totals: {},
            total_tasks: 0,
            done_tasks: 0,
            overdue_tasks: 0,
          }),
        });
      }
    );

    await page.route(
      "**/rest/v1/rpc/get_tasks_count_per_project",
      async (route) => {
        projCountCallCount++;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      }
    );

    await page.goto("/my-statistics");
    await expect(
      page.getByRole("heading", { name: "Weekly Planner" })
    ).toBeVisible();

    const startDateInput = page.getByLabel("Start date");
    const endDateInput = page.getByLabel("End date");

    // --- Branch 1: Date range > 7 days ---
    const initialStatsCallsA = statsCallCount;
    const initialProjCallsA = projCountCallCount;
    expect(initialStatsCallsA).toBeGreaterThanOrEqual(1);
    expect(initialProjCallsA).toBeGreaterThanOrEqual(1);

    await startDateInput.fill("2026-05-01");
    await endDateInput.fill("2026-05-15"); // 15 days
    const rangeAlert = page
      .getByRole("alert")
      .filter({ hasText: "Date range cannot exceed 7 days." });
    await expect(rangeAlert).toBeVisible();

    // Verify zero additional statistics RPCs were made for the invalid range
    expect(statsCallCount).toBe(initialStatsCallsA);
    expect(projCountCallCount).toBe(initialProjCallsA);

    // --- Branch 2: End date before start date ---
    // Changing start to 2026-05-10 while end is 2026-05-15 creates a valid intermediate 6-day range
    const intermediateCalendarResponse = page.waitForResponse((response) => {
      const request = response.request();
      if (
        request.method() === "POST" &&
        new URL(request.url()).pathname ===
          "/rest/v1/rpc/get_tasks_calendar_stats"
      ) {
        const data = request.postDataJSON() || {};
        return (
          data.p_start_date === "2026-05-10" && data.p_end_date === "2026-05-15"
        );
      }
      return false;
    });

    const intermediateProjectCountResponse = page.waitForResponse(
      (response) => {
        const request = response.request();
        if (
          request.method() === "POST" &&
          new URL(request.url()).pathname ===
            "/rest/v1/rpc/get_tasks_count_per_project"
        ) {
          const data = request.postDataJSON() || {};
          return (
            data.p_start_date === "2026-05-10" &&
            data.p_end_date === "2026-05-15"
          );
        }
        return false;
      }
    );

    await startDateInput.fill("2026-05-10");

    await Promise.all([
      intermediateCalendarResponse,
      intermediateProjectCountResponse,
    ]);

    // Capture new baseline after both valid intermediate RPC responses have completed
    const baselineStatsCallsB = statsCallCount;
    const baselineProjCallsB = projCountCallCount;

    // Now trigger invalid end before start (2026-05-05 < 2026-05-10)
    await endDateInput.fill("2026-05-05");
    const orderAlert = page
      .getByRole("alert")
      .filter({ hasText: "End date must be on or after start date." });
    await expect(orderAlert).toBeVisible();

    // Verify zero additional statistics RPCs after Branch B invalid state
    expect(statsCallCount).toBe(baselineStatsCallsB);
    expect(projCountCallCount).toBe(baselineProjCallsB);

    // --- Branch 3: Invalid date (empty date field) ---
    const baselineStatsCallsC = statsCallCount;
    const baselineProjCallsC = projCountCallCount;

    await startDateInput.fill("");
    const invalidAlert = page
      .getByRole("alert")
      .filter({ hasText: "Please enter valid dates." });
    await expect(invalidAlert).toBeVisible();

    // Verify zero additional statistics RPCs after Branch C invalid state
    expect(statsCallCount).toBe(baselineStatsCallsC);
    expect(projCountCallCount).toBe(baselineProjCallsC);
  });

  test("STAT-004: Project Filter Request Mapping", async ({
    monitoredPage: page,
  }) => {
    const targetProjectId = "11111111-1111-4111-8111-111111111111";
    let capturedProjectId: string | null = "UNSET";

    await page.route("**/rest/v1/rpc/get_projects", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: targetProjectId,
            name: "Platform Security",
            description: null,
            created_at: new Date().toISOString(),
          },
        ]),
      });
    });

    await page.route(
      "**/rest/v1/rpc/get_tasks_calendar_stats",
      async (route) => {
        const postData = route.request().postDataJSON() || {};
        capturedProjectId = postData.p_project_id ?? null;

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            daily: [],
            totals: {},
            total_tasks: 0,
            done_tasks: 0,
            overdue_tasks: 0,
          }),
        });
      }
    );

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
    await expect(
      page.getByRole("heading", { name: "Weekly Planner" })
    ).toBeVisible();

    const projectSelect = page.getByLabel("Filter by project");
    await expect(projectSelect).toBeVisible();

    // 1. Initial State: All Projects -> p_project_id is null
    expect(capturedProjectId).toBeNull();

    // 2. Select specific project -> p_project_id is targetProjectId
    const reqPromise1 = page.waitForRequest((req) =>
      req.url().includes("/rest/v1/rpc/get_tasks_calendar_stats")
    );
    await projectSelect.selectOption(targetProjectId);
    await reqPromise1;
    expect(capturedProjectId).toBe(targetProjectId);

    // 3. Return to All Projects -> p_project_id is null
    const reqPromise2 = page.waitForRequest((req) =>
      req.url().includes("/rest/v1/rpc/get_tasks_calendar_stats")
    );
    await projectSelect.selectOption("ALL");
    await reqPromise2;
    expect(capturedProjectId).toBeNull();
  });

  test("STAT-005: Status Filter Request Mapping", async ({
    monitoredPage: page,
  }) => {
    let capturedStatus: string | null = "UNSET";

    await page.route("**/rest/v1/rpc/get_projects", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.route(
      "**/rest/v1/rpc/get_tasks_calendar_stats",
      async (route) => {
        const postData = route.request().postDataJSON() || {};
        capturedStatus = postData.p_status ?? null;

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            daily: [],
            totals: {},
            total_tasks: 0,
            done_tasks: 0,
            overdue_tasks: 0,
          }),
        });
      }
    );

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
    await expect(
      page.getByRole("heading", { name: "Weekly Planner" })
    ).toBeVisible();

    const statusSelect = page.getByLabel("Filter by status");
    await expect(statusSelect).toBeVisible();

    // 1. Initial State: All Statuses -> p_status is null
    expect(capturedStatus).toBeNull();

    // 2. Select READY FOR QA (value READY_FOR_QA) -> p_status is "READY_FOR_QA"
    const reqPromise1 = page.waitForRequest((req) =>
      req.url().includes("/rest/v1/rpc/get_tasks_calendar_stats")
    );
    await statusSelect.selectOption({ label: "READY FOR QA" });
    await reqPromise1;
    expect(capturedStatus).toBe("READY_FOR_QA");

    // 3. Return to All Statuses -> p_status is null
    const reqPromise2 = page.waitForRequest((req) =>
      req.url().includes("/rest/v1/rpc/get_tasks_calendar_stats")
    );
    await statusSelect.selectOption({ label: "All Statuses" });
    await reqPromise2;
    expect(capturedStatus).toBeNull();
  });

  test("STAT-006: Zero Data Dashboard Rendering", async ({
    monitoredPage: page,
  }) => {
    const { start, end } = getCurrentLocalWeek();
    const weekDates = getDatesInRange(start, end);

    await page.route("**/rest/v1/rpc/get_projects", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.route(
      "**/rest/v1/rpc/get_tasks_calendar_stats",
      async (route) => {
        const daily = weekDates.map((d) => ({ day: d, statuses: {} }));
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            daily,
            totals: {},
            total_tasks: 0,
            done_tasks: 0,
            overdue_tasks: 0,
          }),
        });
      }
    );

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
    await expect(
      page.getByRole("heading", { name: "Weekly Planner" })
    ).toBeVisible();

    // 1. KPI Cards show 0
    const totalKpi = page.locator("div.rounded-\\[8px\\]").filter({
      has: page.locator("span", { hasText: "TOTAL TASKS" }),
    });
    await expect(totalKpi.locator("div.text-\\[32px\\]")).toHaveText("0");

    const completedKpi = page.locator("div.rounded-\\[8px\\]").filter({
      has: page.locator("span", { hasText: "COMPLETED TASKS" }),
    });
    await expect(completedKpi.locator("div.text-\\[32px\\]")).toHaveText("0");

    const overdueKpi = page.locator("div.rounded-\\[8px\\]").filter({
      has: page.locator("span", { hasText: "OVERDUE TASKS" }),
    });
    await expect(overdueKpi.locator("div.text-\\[32px\\]")).toHaveText("0");

    // 2. Weekly Calendar shows "No Tasks" on days
    const desktopGrid = page.locator("div.hidden.lg\\:grid.grid-cols-7");
    await expect(desktopGrid).toBeVisible();
    const noTasksEntries = desktopGrid.getByText("No Tasks", { exact: true });
    await expect(noTasksEntries).toHaveCount(weekDates.length);

    // 3. Tasks by Status Doughnut Center shows 0 Total
    const statusSection = page.locator("div.rounded-\\[8px\\]").filter({
      has: page.getByRole("heading", { name: "Tasks by Status" }),
    });
    await expect(statusSection.locator("span.text-\\[24px\\]")).toHaveText("0");

    // Legend still renders all 8 canonical statuses with 0 counts
    for (const item of CANONICAL_STATUS_ITEMS) {
      const legendItem = statusSection
        .locator("div.flex.items-center.justify-between")
        .filter({
          hasText: item.label,
        });
      await expect(legendItem).toBeVisible();
      await expect(legendItem.locator("span.font-bold")).toHaveText("0");
    }

    // 4. All Projects shows exact empty message
    const allProjectsSection = page.locator("div.rounded-\\[8px\\]").filter({
      has: page.getByRole("heading", { name: "All Projects" }),
    });
    await expect(allProjectsSection).toBeVisible();
    await expect(
      allProjectsSection.locator("span", {
        hasText: "No projects found in this date range",
      })
    ).toBeVisible();
  });

  test("STAT-008: Out-of-Order Dashboard Response Protection", async ({
    monitoredPage: page,
  }) => {
    let resolveGenA: () => void = () => {};
    const genAPromise = new Promise<void>((r) => {
      resolveGenA = r;
    });

    await page.route("**/rest/v1/rpc/get_projects", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.route(
      "**/rest/v1/rpc/get_tasks_calendar_stats",
      async (route) => {
        const postData = route.request().postDataJSON() || {};
        const status = postData.p_status;

        if (status === "TO_DO") {
          // Generation A: Delay until released
          await genAPromise;
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              daily: [],
              totals: { TO_DO: 100 },
              total_tasks: 100,
              done_tasks: 0,
              overdue_tasks: 0,
            }),
          });
        } else if (status === "DONE") {
          // Generation B: Immediate fulfillment with 42 tasks
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              daily: [],
              totals: { DONE: 42 },
              total_tasks: 42,
              done_tasks: 42,
              overdue_tasks: 0,
            }),
          });
        } else {
          // Initial load
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              daily: [],
              totals: {},
              total_tasks: 0,
              done_tasks: 0,
              overdue_tasks: 0,
            }),
          });
        }
      }
    );

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
    await expect(
      page.getByRole("heading", { name: "Weekly Planner" })
    ).toBeVisible();

    const statusSelect = page.getByLabel("Filter by status");

    // 1. Trigger Generation A (TO DO) - in flight & held
    await statusSelect.selectOption({ label: "TO DO" });

    // 2. Quickly trigger Generation B (DONE) - immediately fulfills
    await statusSelect.selectOption({ label: "DONE" });

    // 3. Verify Generation B data renders in Total Tasks (42)
    const totalKpi = page.locator("div.rounded-\\[8px\\]").filter({
      has: page.locator("span", { hasText: "TOTAL TASKS" }),
    });
    await expect(totalKpi.locator("div.text-\\[32px\\]")).toHaveText("42");

    // 4. Release held Generation A (100 tasks)
    if (resolveGenA) {
      resolveGenA();
    }

    // 5. Verify Generation A does NOT overwrite Generation B data (Total Tasks remains 42)
    await expect(totalKpi.locator("div.text-\\[32px\\]")).toHaveText("42");
    const statusSection = page.locator("div.rounded-\\[8px\\]").filter({
      has: page.getByRole("heading", { name: "Tasks by Status" }),
    });
    await expect(statusSection.locator("span.text-\\[24px\\]")).toHaveText(
      "42"
    );
  });
});

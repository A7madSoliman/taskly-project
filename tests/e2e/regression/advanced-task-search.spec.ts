import { test, expect } from "../fixtures/disposable-data.fixture";

test.describe("Advanced Tasks Regression — Search (TM-29)", () => {
  test("SEARCH-001: Desktop List Search with Debounced Query and Result Filtering", async ({
    page,
    disposableData,
  }) => {
    const project = await disposableData.createProject("QA Search Project");
    const epic = await disposableData.createEpic(project.id, "QA Search Epic");

    const uniqueMatchTerm = `AlphaMatch${Date.now()}`;
    const targetTask = await disposableData.createTask(
      project.id,
      epic.id,
      `Task ${uniqueMatchTerm}`
    );
    const otherTask = await disposableData.createTask(
      project.id,
      epic.id,
      `Task BetaOther ${Date.now()}`
    );

    await page.goto(`/project/${project.id}/tasks?view=list`);

    // Verify search input placeholder
    const searchInput = page
      .locator("div.hidden.lg\\:flex")
      .getByRole("textbox", { name: "Search tasks" });
    await expect(searchInput).toBeVisible();

    // Verify initial state renders both tasks
    await expect(page.getByText(targetTask.title)).toBeVisible();
    await expect(page.getByText(otherTask.title)).toBeVisible();

    // Set up request waiter for filtered GET /rest/v1/project_tasks
    const searchRequestPromise = page.waitForRequest((req) => {
      if (req.method() !== "GET") return false;
      const url = new URL(req.url());
      if (url.pathname !== "/rest/v1/project_tasks") return false;
      const titleParam = url.searchParams.get("title");
      return (
        titleParam !== null &&
        titleParam.toLowerCase().includes(uniqueMatchTerm.toLowerCase())
      );
    });

    // Type query with harmless whitespace: raw input preserves whitespace, debounced term trims it
    await searchInput.fill(`  ${uniqueMatchTerm}  `);
    await expect(searchInput).toHaveValue(`  ${uniqueMatchTerm}  `);

    await searchRequestPromise;

    // Verify matching task visible, non-matching task absent
    await expect(page.getByText(targetTask.title)).toBeVisible();
    await expect(page.getByText(otherTask.title)).not.toBeVisible();

    // Verify pagination is at page 1
    const page1Btn = page.getByRole("button", { name: "1", exact: true });
    await expect(page1Btn).toHaveAttribute("aria-current", "page");
  });

  test("SEARCH-002: Desktop Board Empty-State Search", async ({
    page,
    disposableData,
  }) => {
    const project = await disposableData.createProject(
      "QA Empty Search Project"
    );
    const epic = await disposableData.createEpic(
      project.id,
      "QA Empty Search Epic"
    );
    const task = await disposableData.createTask(
      project.id,
      epic.id,
      "QA Existing Board Task"
    );

    await page.goto(`/project/${project.id}/tasks?view=board`);

    // Verify initial task is visible on board
    await expect(page.getByRole("button", { name: task.title })).toBeVisible();

    const searchInput = page
      .locator("div.hidden.lg\\:flex")
      .getByRole("textbox", { name: "Search tasks" });
    await expect(searchInput).toBeVisible();

    const noMatchTerm = `NonExistentTaskXYZ_${Date.now()}`;

    // Set up request waiter for filtered GET /rest/v1/project_tasks
    const searchRequestPromise = page.waitForRequest((req) => {
      if (req.method() !== "GET") return false;
      const url = new URL(req.url());
      if (url.pathname !== "/rest/v1/project_tasks") return false;
      const titleParam = url.searchParams.get("title");
      return (
        titleParam !== null &&
        titleParam.toLowerCase().includes(noMatchTerm.toLowerCase())
      );
    });

    await searchInput.fill(noMatchTerm);
    await searchRequestPromise;

    // Verify exact empty-state assertion in Board view
    await expect(
      page.getByText("No tasks found matching your search")
    ).toBeVisible();

    // Verify previous task is not visible
    await expect(page.getByRole("button", { name: task.title })).toHaveCount(0);
  });

  test("SEARCH-003: Stale / Out-of-Order Search Resolution", async ({
    page,
    disposableData,
  }) => {
    const project = await disposableData.createProject(
      "QA Stale Search Project"
    );
    const epic = await disposableData.createEpic(
      project.id,
      "QA Stale Search Epic"
    );

    const queryA = `TermA_${Date.now()}`;
    const queryB = `TermB_${Date.now()}`;

    const taskA = await disposableData.createTask(
      project.id,
      epic.id,
      `Task Match ${queryA}`
    );
    const taskB = await disposableData.createTask(
      project.id,
      epic.id,
      `Task Match ${queryB}`
    );

    // Route interception on specific read route to delay Query A
    let resolveQueryA: (() => void) | null = null;
    const queryAHoldPromise = new Promise<void>((resolve) => {
      resolveQueryA = resolve;
    });

    await page.route("**/rest/v1/project_tasks*", async (route) => {
      const url = new URL(route.request().url());
      const titleParam = url.searchParams.get("title") || "";
      if (titleParam.includes(queryA)) {
        // Hold query A until query B has completed
        await queryAHoldPromise;
      }
      await route.continue();
    });

    await page.goto(`/project/${project.id}/tasks?view=list`);
    const searchInput = page
      .locator("div.hidden.lg\\:flex")
      .getByRole("textbox", { name: "Search tasks" });

    // 1. Type query A (held by route interceptor)
    await searchInput.fill(queryA);

    // 2. Type query B (completes normally)
    await searchInput.fill(queryB);

    // Task B should appear when query B finishes
    await expect(page.getByText(taskB.title)).toBeVisible();

    // 3. Release Query A
    if (resolveQueryA) {
      (resolveQueryA as () => void)();
    }

    // Assert that Task B remains visible and stale Query A result does not overwrite it
    await expect(page.getByText(taskB.title)).toBeVisible();
    await expect(page.getByText(taskA.title)).not.toBeVisible();
  });
});

import { test, expect } from "../fixtures/disposable-data.fixture";

test.describe("Advanced Tasks Regression — Drag and Drop (TM-27)", () => {
  test("DND-001: Desktop Board Drag and Drop Status Transition (TO_DO to IN_PROGRESS)", async ({
    page,
    disposableData,
  }) => {
    const project = await disposableData.createProject(
      "QA DnD Success Project"
    );
    const epic = await disposableData.createEpic(
      project.id,
      "QA DnD Success Epic"
    );
    const task = await disposableData.createTask(
      project.id,
      epic.id,
      "QA DnD Move Task"
    );

    await page.goto(`/project/${project.id}/tasks?view=board`);

    const sourceTask = page.getByRole("button", { name: task.title });
    await expect(sourceTask).toBeVisible();

    const sourceBox = await sourceTask.boundingBox();
    expect(sourceBox).not.toBeNull();

    // Target: IN_PROGRESS droppable column
    const targetColumn = page.getByText("IN PROGRESS", { exact: true });
    await expect(targetColumn).toBeVisible();
    const targetBox = await targetColumn.boundingBox();
    expect(targetBox).not.toBeNull();

    const sourceCenter = {
      x: sourceBox!.x + sourceBox!.width / 2,
      y: sourceBox!.y + sourceBox!.height / 2,
    };
    const targetCenter = {
      x: targetBox!.x + targetBox!.width / 2,
      y: targetBox!.y + targetBox!.height + 50,
    };

    // Install exact PATCH response waiter BEFORE pointer interaction
    const patchPromise = page.waitForResponse((resp) => {
      if (resp.request().method() !== "PATCH") return false;
      const url = new URL(resp.url());
      if (url.pathname !== "/rest/v1/tasks") return false;
      const idParam = url.searchParams.get("id");
      return idParam === `eq.${task.id}` && resp.ok();
    });

    // Execute PointerSensor compliant drag (>6px threshold)
    await page.mouse.move(sourceCenter.x, sourceCenter.y);
    await page.mouse.down();
    await page.mouse.move(sourceCenter.x + 12, sourceCenter.y + 12);
    await page.mouse.move(targetCenter.x, targetCenter.y);
    await page.mouse.up();

    await patchPromise;

    // Verify task is now visible and count is exactly 1 (no duplicates)
    const movedTask = page.getByRole("button", { name: task.title });
    await expect(movedTask).toBeVisible();
    await expect(movedTask).toHaveCount(1);
  });

  test("DND-002: Same-Status Drag and Drop No-Op (No Backend PATCH)", async ({
    page,
    disposableData,
  }) => {
    const project = await disposableData.createProject("QA DnD No-Op Project");
    const epic = await disposableData.createEpic(
      project.id,
      "QA DnD No-Op Epic"
    );
    const task = await disposableData.createTask(
      project.id,
      epic.id,
      "QA DnD Same Status Task"
    );

    await page.goto(`/project/${project.id}/tasks?view=board`);

    const sourceTask = page.getByRole("button", { name: task.title });
    await expect(sourceTask).toBeVisible();

    const sourceBox = await sourceTask.boundingBox();
    expect(sourceBox).not.toBeNull();

    const sourceCenter = {
      x: sourceBox!.x + sourceBox!.width / 2,
      y: sourceBox!.y + sourceBox!.height / 2,
    };

    let patchCount = 0;
    page.on("request", (req) => {
      if (req.method() === "PATCH") {
        const url = new URL(req.url());
        if (
          url.pathname === "/rest/v1/tasks" &&
          url.searchParams.get("id") === `eq.${task.id}`
        ) {
          patchCount++;
        }
      }
    });

    // Drag slightly within same column and drop
    await page.mouse.move(sourceCenter.x, sourceCenter.y);
    await page.mouse.down();
    await page.mouse.move(sourceCenter.x + 12, sourceCenter.y + 12);
    await page.mouse.move(sourceCenter.x + 20, sourceCenter.y + 30);
    await page.mouse.up();

    // Verify task is still visible in source column and zero PATCH requests were made
    await expect(sourceTask).toBeVisible();
    expect(patchCount).toBe(0);
    await expect(
      page.getByText("Failed to update task status. The task was restored.")
    ).toHaveCount(0);
  });

  test("DND-003: Drag and Drop with Active Filtered Search State", async ({
    page,
    disposableData,
  }) => {
    const project = await disposableData.createProject("QA DnD Search Project");
    const epic = await disposableData.createEpic(
      project.id,
      "QA DnD Search Epic"
    );
    const uniqueSearchTerm = `FilterDnD_${Date.now()}`;
    const task = await disposableData.createTask(
      project.id,
      epic.id,
      `Task ${uniqueSearchTerm}`
    );

    await page.goto(`/project/${project.id}/tasks?view=board`);

    const searchInput = page
      .locator("div.hidden.lg\\:flex")
      .getByRole("textbox", { name: "Search tasks" });
    await searchInput.fill(uniqueSearchTerm);

    const sourceTask = page.getByRole("button", { name: task.title });
    await expect(sourceTask).toBeVisible();

    const sourceBox = await sourceTask.boundingBox();
    expect(sourceBox).not.toBeNull();

    const targetColumn = page.getByText("DONE", { exact: true });
    await expect(targetColumn).toBeVisible();
    const targetBox = await targetColumn.boundingBox();
    expect(targetBox).not.toBeNull();

    const sourceCenter = {
      x: sourceBox!.x + sourceBox!.width / 2,
      y: sourceBox!.y + sourceBox!.height / 2,
    };
    const targetCenter = {
      x: targetBox!.x + targetBox!.width / 2,
      y: targetBox!.y + targetBox!.height + 50,
    };

    const patchPromise = page.waitForResponse((resp) => {
      if (resp.request().method() !== "PATCH") return false;
      const url = new URL(resp.url());
      if (url.pathname !== "/rest/v1/tasks") return false;
      const idParam = url.searchParams.get("id");
      return idParam === `eq.${task.id}` && resp.ok();
    });

    await page.mouse.move(sourceCenter.x, sourceCenter.y);
    await page.mouse.down();
    await page.mouse.move(sourceCenter.x + 12, sourceCenter.y + 12);
    await page.mouse.move(targetCenter.x, targetCenter.y);
    await page.mouse.up();

    await patchPromise;

    // Verify task moved to target while search query is still active
    await expect(page.getByRole("button", { name: task.title })).toBeVisible();
    await expect(page.getByRole("button", { name: task.title })).toHaveCount(1);
    await expect(searchInput).toHaveValue(uniqueSearchTerm);
  });
});

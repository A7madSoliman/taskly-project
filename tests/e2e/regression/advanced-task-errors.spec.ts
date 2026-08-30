import { test, expect } from "../fixtures/disposable-data.fixture";

test.describe("Advanced Tasks Regression — Status Updates & Error Handling (TM-27 & TM-30)", () => {
  test("STATUS-001: Modal Status Change with Optimistic Board Reconciliation", async ({
    page,
    disposableData,
  }) => {
    const project = await disposableData.createProject("QA Status Project");
    const epic = await disposableData.createEpic(project.id, "QA Status Epic");
    const task = await disposableData.createTask(
      project.id,
      epic.id,
      "QA Modal Status Task"
    );

    await page.goto(`/project/${project.id}/tasks?view=board`);

    // Open Task Details modal from Board view
    const taskCard = page.getByRole("button", { name: task.title });
    await expect(taskCard).toBeVisible();
    await taskCard.click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    const desktopModal = modal.locator("div.hidden.lg\\:flex");
    await expect(desktopModal).toBeVisible();

    // Set up exact PATCH response waiter
    const patchPromise = page.waitForResponse((resp) => {
      if (resp.request().method() !== "PATCH") return false;
      const url = new URL(resp.url());
      if (url.pathname !== "/rest/v1/tasks") return false;
      const idParam = url.searchParams.get("id");
      return idParam === `eq.${task.id}` && resp.ok();
    });

    // Select new status inside modal (e.g. IN_PROGRESS)
    const statusDropdown = desktopModal
      .locator("button[aria-haspopup='listbox']")
      .filter({ hasText: /TO DO|IN PROGRESS/ });
    await statusDropdown.click();

    const optionInProgress = desktopModal.getByRole("option", {
      name: "IN PROGRESS",
    });
    await optionInProgress.click();

    await patchPromise;

    // Close modal
    await desktopModal
      .getByRole("button", { name: "Close task details" })
      .click();
    await expect(modal).not.toBeVisible();

    // Reopen task to verify persisted status
    await page.getByRole("button", { name: task.title }).click();
    const reopenedModal = page
      .getByRole("dialog")
      .locator("div.hidden.lg\\:flex");
    await expect(reopenedModal.getByText("IN PROGRESS")).toBeVisible();
  });

  test("ERROR-001: Modal Field Rollback on Controlled PATCH Failure", async ({
    page,
    disposableData,
  }) => {
    const project = await disposableData.createProject(
      "QA Error Field Project"
    );
    const epic = await disposableData.createEpic(
      project.id,
      "QA Error Field Epic"
    );
    const task = await disposableData.createTask(
      project.id,
      epic.id,
      "QA Rollback Field Task"
    );

    const initialDesc = "Initial stable description text.";

    await page.goto(`/project/${project.id}/tasks?view=board`);

    // Open task details modal
    await page.getByRole("button", { name: task.title }).click();
    const desktopModal = page
      .getByRole("dialog")
      .locator("div.hidden.lg\\:flex");
    await expect(desktopModal).toBeVisible();

    // Set initial description
    const descArea = desktopModal.getByLabel("Task description");
    await descArea.fill(initialDesc);
    await descArea.blur();

    // Intercept exact PATCH for this task and abort with 500 error
    await page.route("**/rest/v1/tasks*", async (route) => {
      const req = route.request();
      if (
        req.method() === "PATCH" &&
        new URL(req.url()).searchParams.get("id") === `eq.${task.id}`
      ) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Simulated backend error" }),
        });
      } else {
        await route.continue();
      }
    });

    // Try updating description to failing string
    await descArea.fill("Failing updated description");
    await descArea.blur();

    // Verify exact error message appears
    await expect(
      desktopModal.getByText("Failed to update task. Please try again.")
    ).toBeVisible();

    // Verify rollback to previous value
    await expect(descArea).toHaveValue(initialDesc);
  });

  test("ERROR-002: Drag and Drop Rollback on Controlled PATCH Failure", async ({
    page,
    disposableData,
  }) => {
    const project = await disposableData.createProject("QA Error DnD Project");
    const epic = await disposableData.createEpic(
      project.id,
      "QA Error DnD Epic"
    );
    const task = await disposableData.createTask(
      project.id,
      epic.id,
      "QA Rollback DnD Task"
    );

    await page.goto(`/project/${project.id}/tasks?view=board`);

    const sourceTask = page.getByRole("button", { name: task.title });
    await expect(sourceTask).toBeVisible();

    const sourceBox = await sourceTask.boundingBox();
    expect(sourceBox).not.toBeNull();

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

    // Intercept exact PATCH for this task and abort with 500 error
    await page.route("**/rest/v1/tasks*", async (route) => {
      const req = route.request();
      if (
        req.method() === "PATCH" &&
        new URL(req.url()).searchParams.get("id") === `eq.${task.id}`
      ) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Simulated DnD error" }),
        });
      } else {
        await route.continue();
      }
    });

    // Execute Pointer DnD
    await page.mouse.move(sourceCenter.x, sourceCenter.y);
    await page.mouse.down();
    await page.mouse.move(sourceCenter.x + 12, sourceCenter.y + 12);
    await page.mouse.move(targetCenter.x, targetCenter.y);
    await page.mouse.up();

    // Verify exact rollback error message appears
    await expect(
      page.getByText("Failed to update task status. The task was restored.")
    ).toBeVisible();

    // Verify task is restored to source column and still accessible
    await expect(page.getByRole("button", { name: task.title })).toBeVisible();
    await expect(page.getByRole("button", { name: task.title })).toHaveCount(1);
  });
});

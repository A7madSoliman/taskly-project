import { test, expect } from "../fixtures/disposable-data.fixture";

test.describe("Core Tasks CRUD Regression", () => {
  test("CRUD-TASK-001: Task UI Create", async ({ page, disposableData }) => {
    const project = await disposableData.createProject("QA Parent Project");
    const epic = await disposableData.createEpic(project.id, "QA Parent Epic");
    const uniqueTaskTitle = `QA E2E Task ${Date.now()}`;
    const uniqueDescription = "Task created via automated UI regression test.";

    await page.goto(`/project/${project.id}/tasks/new`);

    await expect(
      page.getByRole("heading", { name: "Create New Task" })
    ).toBeVisible();

    // Scope to desktop form
    const desktopForm = page
      .locator("div.hidden.lg\\:block")
      .filter({ has: page.getByRole("button", { name: "Create Task" }) });
    await expect(desktopForm).toBeVisible();

    // Fill Title
    await desktopForm.getByLabel("TITLE *").fill(uniqueTaskTitle);

    // Select Epic within desktop form
    const epicDropdownBtn = desktopForm.getByRole("button", {
      name: "Select Epic Link",
    });
    await epicDropdownBtn.click();

    // Select specific option from the opened listbox
    const listbox = desktopForm.getByRole("listbox");
    await expect(listbox).toBeVisible();
    const epicOption = listbox
      .getByRole("option")
      .filter({ hasText: epic.title });
    await expect(epicOption).toBeVisible();
    await epicOption.click();

    // Fill Description
    await desktopForm.getByLabel("DESCRIPTION").fill(uniqueDescription);

    // Install exact POST response waiter before submission
    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.request().method() === "POST" &&
        new URL(resp.url()).pathname === "/rest/v1/tasks" &&
        resp.ok()
    );

    await desktopForm.getByRole("button", { name: "Create Task" }).click();

    const response = await responsePromise;
    const registeredTask = await disposableData.registerUiCreatedTaskResponse(
      response,
      project.id,
      epic.id
    );
    expect(registeredTask.id).toBeTruthy();

    // Verify navigation to tasks view and visibility of new task
    await expect(page).toHaveURL(new RegExp(`/project/${project.id}/tasks`));
    await expect(page.getByText(uniqueTaskTitle)).toBeVisible();
  });

  test("CRUD-TASK-002: Task UI Details", async ({ page, disposableData }) => {
    const project = await disposableData.createProject("QA Parent Project");
    const epic = await disposableData.createEpic(project.id, "QA Parent Epic");
    const task = await disposableData.createTask(
      project.id,
      epic.id,
      "QA Details Task"
    );

    await page.goto(`/project/${project.id}/tasks`);

    // Click on the specific task card button
    const taskCard = page.getByRole("button", {
      name: task.title,
    });
    await expect(taskCard).toBeVisible();
    await taskCard.click();

    // Verify visible desktop modal composition
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    const desktopModal = modal.locator("div.hidden.lg\\:flex");
    await expect(desktopModal).toBeVisible();

    await expect(desktopModal.locator("#task-details-title")).toHaveValue(
      task.title
    );
    await expect(desktopModal.getByLabel("Task description")).toBeVisible();
  });

  test("CRUD-TASK-003: Task UI Update", async ({ page, disposableData }) => {
    const project = await disposableData.createProject("QA Parent Project");
    const epic = await disposableData.createEpic(project.id, "QA Parent Epic");
    const task = await disposableData.createTask(
      project.id,
      epic.id,
      "QA Update Task"
    );
    const updatedDescription = `Updated task description ${Date.now()}`;

    await page.goto(`/project/${project.id}/tasks`);

    // Open details modal
    const taskCard = page.getByRole("button", {
      name: task.title,
    });
    await expect(taskCard).toBeVisible();
    await taskCard.click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    const desktopModal = modal.locator("div.hidden.lg\\:flex");
    await expect(desktopModal).toBeVisible();

    // Update description and trigger blur to save
    const descArea = desktopModal.getByLabel("Task description");
    await descArea.fill(updatedDescription);
    await descArea.blur();

    // Close modal and reopen to verify persistence
    await desktopModal
      .getByRole("button", { name: "Close task details" })
      .click();
    await expect(modal).not.toBeVisible();

    await page.getByRole("button", { name: task.title }).click();
    const reopenedDesktopModal = page
      .getByRole("dialog")
      .locator("div.hidden.lg\\:flex");
    await expect(
      reopenedDesktopModal.getByLabel("Task description")
    ).toHaveValue(updatedDescription);
  });

  test("CRUD-TASK-004: Task UI Delete", async ({ page, disposableData }) => {
    const project = await disposableData.createProject("QA Parent Project");
    const epic = await disposableData.createEpic(project.id, "QA Parent Epic");
    const task = await disposableData.createTask(
      project.id,
      epic.id,
      "QA Delete Task"
    );

    await page.goto(`/project/${project.id}/tasks`);

    // Open Task Details Modal in Board view
    const taskCard = page.getByRole("button", {
      name: task.title,
    });
    await expect(taskCard).toBeVisible();
    await taskCard.click();

    const detailsModal = page.getByRole("dialog");
    await expect(detailsModal).toBeVisible();
    const desktopModal = detailsModal.locator("div.hidden.lg\\:flex");
    await expect(desktopModal).toBeVisible();

    // Click Delete Task inside Details Modal
    await desktopModal.getByRole("button", { name: "Delete Task" }).click();

    // Confirm in Delete Confirmation Modal
    const deleteModal = page.getByRole("dialog");
    await expect(deleteModal).toBeVisible();
    await expect(
      deleteModal.getByRole("heading", { name: "Delete Task?" })
    ).toBeVisible();

    await deleteModal.getByRole("button", { name: "Delete Task" }).click();

    // Verify task is no longer visible on board
    await expect(
      page.getByRole("button", {
        name: task.title,
      })
    ).toHaveCount(0);

    // Supplementary exact-ID verification: task absent in backend
    const exists = await disposableData.verifyTask(task.id);
    expect(exists).toBe(false);
  });
});

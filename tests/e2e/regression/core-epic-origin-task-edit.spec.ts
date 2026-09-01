import { test, expect } from "../fixtures/disposable-data.fixture";

test.describe("Core Epic Origin Task Edit Regression", () => {
  test("EPIC-TASK-EDIT-001: Task editing and epic reassignment from epics page", async ({
    page,
    disposableData,
  }) => {
    // 1. Create fixture-owned Project
    const project = await disposableData.createProject(
      "QA Epic Origin Task Project"
    );

    // 2. Create fixture-owned Epic A
    const epicA = await disposableData.createEpic(
      project.id,
      "QA Origin Epic A"
    );

    // 3. Create fixture-owned Task linked exactly to Epic A
    const task = await disposableData.createTask(
      project.id,
      epicA.id,
      "QA Linked Origin Task"
    );

    const updatedDescription = `Updated description from epics origin ${Date.now()}`;

    // 4. Navigate to /project/{projectId}/epics
    await page.goto(`/project/${project.id}/epics`);

    // 5. Open exact Epic A
    const epicCard = page
      .getByTestId("epic-card")
      .filter({ hasText: epicA.title });
    await expect(epicCard).toBeVisible();
    await epicCard.click();

    const epicModal = page.getByRole("dialog");
    await expect(epicModal).toBeVisible();
    await expect(
      epicModal.getByRole("heading", { name: "Epic Tasks" })
    ).toBeVisible();

    // 6. Click exact linked Task
    const taskItem = epicModal
      .locator("div.hidden.sm\\:block")
      .locator("div[role='button']")
      .filter({ hasText: task.title });
    await expect(taskItem).toBeVisible();
    await taskItem.click();

    // 7. Verify TaskDetailsModal opened (Epic modal automatically closed)
    const taskModal = page.getByRole("dialog");
    await expect(taskModal).toBeVisible();
    const desktopTaskModal = taskModal.locator("div.hidden.lg\\:flex");
    await expect(desktopTaskModal).toBeVisible();
    await expect(desktopTaskModal.getByLabel("Task title")).toHaveValue(
      task.title
    );

    // 8 & 9. Update description and trigger blur to save (matching CRUD-TASK-003)
    const descArea = desktopTaskModal.getByLabel("Task description");
    await descArea.fill(updatedDescription);
    await descArea.blur();
    await page.locator("body").click();

    // Stabilization wait to allow async network PATCH to complete before closing modal
    await page.waitForTimeout(1000);

    // 10. Close Task modal and reopen to verify persistence
    await desktopTaskModal
      .getByRole("button", { name: "Close task details" })
      .click();
    await expect(taskModal).not.toBeVisible();

    // 11. Reopen Epic A
    await epicCard.click();
    await expect(epicModal).toBeVisible();

    // 12. Reopen exact Task
    const reopenedTaskItem = epicModal
      .locator("div.hidden.sm\\:block")
      .locator("div[role='button']")
      .filter({ hasText: task.title });
    await expect(reopenedTaskItem).toBeVisible();
    await reopenedTaskItem.click();

    // 13. Verify persisted description
    await expect(taskModal).toBeVisible();
    const currentDesktopModal = taskModal.locator("div.hidden.lg\\:flex");
    await expect(
      currentDesktopModal.getByLabel("Task description")
    ).toHaveValue(updatedDescription);

    // 14. Change Epic to No Epic Link
    const epicDropdownButton = currentDesktopModal
      .locator("button")
      .filter({ hasText: epicA.title });
    await expect(epicDropdownButton).toBeVisible();
    await epicDropdownButton.click();

    const noEpicOption = currentDesktopModal
      .getByRole("option", { name: "No Epic Link (Unlinked)" });
    await expect(noEpicOption).toBeVisible();
    await noEpicOption.click();

    // Stabilization wait for async network PATCH to unlink task
    await page.waitForTimeout(500);

    // 15. Close Task modal
    await currentDesktopModal
      .getByRole("button", { name: "Close task details" })
      .click();
    await expect(taskModal).not.toBeVisible();

    // 16. Close Epic A modal if visible, or click Epic A card to reopen
    if (await epicModal.isVisible()) {
      await epicModal.getByRole("button", { name: "Close epic modal" }).click();
      await expect(epicModal).not.toBeVisible();
    }
    await epicCard.click();
    await expect(epicModal).toBeVisible();

    const unlinkedTaskItem = epicModal
      .locator("div.hidden.sm\\:block")
      .locator("div[role='button']")
      .filter({ hasText: task.title });
    await expect(unlinkedTaskItem).not.toBeVisible();
  });
});

import { test, expect } from "../fixtures/disposable-data.fixture";

test.describe("Advanced Tasks Regression — Mobile Sequential Status Stream (TM-22 & TM-25)", () => {
  test("MOBILE-001: Mobile Sequential Status Progression and Search Reset", async ({
    page,
    disposableData,
  }) => {
    const project = await disposableData.createProject(
      "QA Mobile Stream Project"
    );
    const epic = await disposableData.createEpic(
      project.id,
      "QA Mobile Stream Epic"
    );

    // Create 2 tasks in distinct canonical statuses
    const todoTask = await disposableData.createTask(
      project.id,
      epic.id,
      "QA Mobile Task In Todo"
    );

    const inProgressTasks = await disposableData.createOwnedTasks({
      count: 1,
      projectId: project.id,
      epicId: epic.id,
      status: "IN_PROGRESS",
      titlePrefix: "QA Mobile Task In Progress",
    });
    const inProgressTask = inProgressTasks[0];

    await page.goto(`/project/${project.id}/tasks`);

    // Verify initial mobile layout: first status chunk (TO_DO) loads
    await expect(page.getByText(todoTask.title)).toBeVisible();

    // Scroll to bottom to trigger mobile sentinel progression into IN_PROGRESS
    const firstTaskCard = page.getByText(todoTask.title);
    await firstTaskCard.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Next canonical status task (IN_PROGRESS) becomes available in the stream
    await expect(page.getByText(inProgressTask.title)).toBeVisible();

    // Verify mobile search filtering
    const searchInput = page
      .locator("div.flex.flex-col.gap-3.lg\\:hidden")
      .getByRole("textbox", { name: "Search tasks" });
    await expect(searchInput).toBeVisible();

    await searchInput.fill(todoTask.title);
    await expect(page.getByText(todoTask.title)).toBeVisible();
    await expect(page.getByText(inProgressTask.title)).not.toBeVisible();

    // Reset search query
    await searchInput.fill("");
    await expect(page.getByText(todoTask.title)).toBeVisible();
  });
});

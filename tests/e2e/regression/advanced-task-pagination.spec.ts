import { test, expect } from "../fixtures/disposable-data.fixture";

test.describe("Advanced Tasks Regression — Pagination & Chunk Loading (TM-23 & TM-25)", () => {
  test("PAGE-001: Desktop List View Numbered Pagination (11 Tasks)", async ({
    page,
    disposableData,
  }) => {
    const project = await disposableData.createProject("QA Pagination Project");
    const epic = await disposableData.createEpic(
      project.id,
      "QA Pagination Epic"
    );

    // Create 11 tasks (PAGE_SIZE = 10 -> Page 1 has 10, Page 2 has 1)
    const tasks = await disposableData.createOwnedTasks({
      count: 11,
      projectId: project.id,
      epicId: epic.id,
      status: "TO_DO",
      titlePrefix: "ListPagTask",
    });

    const ownedTitles = new Set(tasks.map((t) => t.title));
    expect(ownedTitles.size).toBe(11);

    await page.goto(`/project/${project.id}/tasks?view=list`);

    const listTable = page.getByRole("table");
    await expect(listTable).toBeVisible();

    // Verify initial pagination is at page 1
    const page1Btn = page.getByRole("button", { name: "1", exact: true });
    await expect(page1Btn).toHaveAttribute("aria-current", "page");

    // Page 1: Identify visible owned titles using list table row button filter
    const page1Titles = new Set<string>();
    for (const title of ownedTitles) {
      const taskRow = listTable.getByRole("button").filter({ hasText: title });
      if (await taskRow.isVisible()) {
        page1Titles.add(title);
      }
    }
    expect(page1Titles.size).toBe(10);

    // Verify pagination controls
    const nextBtn = page.getByRole("button", { name: "Next page" });
    const prevBtn = page.getByRole("button", { name: "Previous page" });
    await expect(nextBtn).toBeVisible();
    await expect(prevBtn).toBeVisible();
    await expect(prevBtn).toBeDisabled();

    // Navigate to page 2 via Next page button
    const page2Btn = page.getByRole("button", { name: "2", exact: true });
    await nextBtn.click();
    await expect(page2Btn).toHaveAttribute("aria-current", "page");

    // Page 2: Exactly 1 owned title visible, belonging to ownedTitles and NOT in page1Titles
    const page2Titles = new Set<string>();
    for (const title of ownedTitles) {
      const taskRow = listTable.getByRole("button").filter({ hasText: title });
      if (await taskRow.isVisible()) {
        page2Titles.add(title);
      }
    }
    expect(page2Titles.size).toBe(1);
    const [page2OnlyTitle] = Array.from(page2Titles);
    expect(ownedTitles.has(page2OnlyTitle)).toBe(true);
    expect(page1Titles.has(page2OnlyTitle)).toBe(false);

    await expect(nextBtn).toBeDisabled();
    await expect(prevBtn).toBeEnabled();

    // Navigate back to page 1 via Previous page button
    await prevBtn.click();
    await expect(page1Btn).toHaveAttribute("aria-current", "page");

    // Verify original page 1 set restored and page 2 title absent
    for (const title of page1Titles) {
      const taskRow = listTable.getByRole("button").filter({ hasText: title });
      await expect(taskRow).toBeVisible();
    }
    const page2Row = listTable
      .getByRole("button")
      .filter({ hasText: page2OnlyTitle });
    await expect(page2Row).not.toBeVisible();
  });

  test("PAGE-002: Desktop Board Chunk Loading with Sentinel (11 Tasks in TO_DO)", async ({
    page,
    disposableData,
  }) => {
    const project = await disposableData.createProject(
      "QA Board Chunk Project"
    );
    const epic = await disposableData.createEpic(
      project.id,
      "QA Board Chunk Epic"
    );

    // Create 11 tasks all in TO_DO status
    const tasks = await disposableData.createOwnedTasks({
      count: 11,
      projectId: project.id,
      epicId: epic.id,
      status: "TO_DO",
      titlePrefix: "BoardChunkTask",
    });

    const ownedTitles = new Set(tasks.map((t) => t.title));
    expect(ownedTitles.size).toBe(11);

    await page.goto(`/project/${project.id}/tasks?view=board`);

    const todoColumn = page
      .locator("div.flex.w-\\[284px\\]")
      .filter({ hasText: "TO DO" });
    await expect(todoColumn).toBeVisible();

    // Verify initial chunk: exactly 10 owned tasks visible on board in TO DO column
    const initialVisibleTitles = new Set<string>();
    let absentTitle = "";

    for (const title of ownedTitles) {
      const isVisible = await todoColumn
        .getByRole("button")
        .filter({ hasText: title })
        .isVisible();
      if (isVisible) {
        initialVisibleTitles.add(title);
      } else {
        absentTitle = title;
      }
    }

    expect(initialVisibleTitles.size).toBe(10);
    expect(absentTitle).not.toBe("");
    expect(ownedTitles.has(absentTitle)).toBe(true);

    // Scroll one of the visible tasks into view to trigger the IntersectionObserver sentinel
    const firstVisibleTitle = Array.from(initialVisibleTitles)[0];
    const taskCard = todoColumn
      .getByRole("button")
      .filter({ hasText: firstVisibleTitle });
    await taskCard.scrollIntoViewIfNeeded();

    // Also scroll the last visible task into view to ensure bottom sentinel intersection
    const lastVisibleTitle = Array.from(initialVisibleTitles)[9];
    const lastTaskCard = todoColumn
      .getByRole("button")
      .filter({ hasText: lastVisibleTitle });
    await lastTaskCard.scrollIntoViewIfNeeded();

    // The previously absent 11th task should load and become visible
    const newlyLoadedTask = todoColumn
      .getByRole("button")
      .filter({ hasText: absentTitle });
    await expect(newlyLoadedTask).toBeVisible();

    // Verify all 11 tasks are now visible without duplicates
    for (const title of ownedTitles) {
      await expect(
        todoColumn.getByRole("button").filter({ hasText: title })
      ).toHaveCount(1);
    }
  });
});

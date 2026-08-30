import { test, expect } from "../fixtures/disposable-data.fixture";

test.describe("Core Epics CRUD Regression", () => {
  test("CRUD-EPIC-001: Epic UI Create", async ({ page, disposableData }) => {
    const project = await disposableData.createProject("QA Parent Project");
    const uniqueEpicTitle = `QA E2E Epic ${Date.now()}`;
    const uniqueDescription = "Epic created via automated UI regression test.";

    await page.goto(`/project/${project.id}/epics/new`);

    await expect(
      page.getByRole("heading", { name: "Create New Epic" })
    ).toBeVisible();

    const desktopForm = page
      .locator("div.hidden.lg\\:block")
      .filter({ has: page.getByRole("button", { name: "Create Epic" }) });
    await expect(desktopForm).toBeVisible();

    await desktopForm.locator("#epic-title-desktop").fill(uniqueEpicTitle);
    await desktopForm
      .locator("#epic-description-desktop")
      .fill(uniqueDescription);

    // Install exact POST response waiter before submission
    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.request().method() === "POST" &&
        new URL(resp.url()).pathname === "/rest/v1/epics" &&
        resp.ok()
    );

    await desktopForm.getByRole("button", { name: "Create Epic" }).click();

    const response = await responsePromise;
    const registeredEpic = await disposableData.registerUiCreatedEpicResponse(
      response,
      project.id
    );
    expect(registeredEpic.id).toBeTruthy();

    // Verify navigation to epics list and presence of new epic card
    await expect(page).toHaveURL(new RegExp(`/project/${project.id}/epics`));
    await expect(page.getByText(uniqueEpicTitle)).toBeVisible();
  });

  test("CRUD-EPIC-002: Epic UI Details", async ({ page, disposableData }) => {
    const project = await disposableData.createProject("QA Parent Project");
    const epic = await disposableData.createEpic(project.id, "QA Details Epic");

    await page.goto(`/project/${project.id}/epics`);

    // Click on the specific epic card to open details modal
    const epicCard = page
      .getByTestId("epic-card")
      .filter({ hasText: epic.title });
    await expect(epicCard).toBeVisible();
    await epicCard.click();

    // Verify details modal is visible with epic title and description placeholder/input
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(modal.getByLabel("Epic title")).toHaveValue(epic.title);
    await expect(modal.getByLabel("Epic description")).toBeVisible();
  });

  test("CRUD-EPIC-003: Epic UI Update", async ({ page, disposableData }) => {
    const project = await disposableData.createProject("QA Parent Project");
    const epic = await disposableData.createEpic(project.id, "QA Update Epic");
    const updatedDescription = `Updated epic description ${Date.now()}`;

    await page.goto(`/project/${project.id}/epics`);

    // Open details modal
    const epicCard = page
      .getByTestId("epic-card")
      .filter({ hasText: epic.title });
    await expect(epicCard).toBeVisible();
    await epicCard.click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // Edit description and trigger blur to save
    const descArea = modal.getByLabel("Epic description");
    await descArea.fill(updatedDescription);
    await descArea.blur();

    // Close modal and reopen to verify persistence
    await modal.getByRole("button", { name: "Close epic details" }).click();
    await expect(modal).not.toBeVisible();

    await epicCard.click();
    await expect(
      page.getByRole("dialog").getByLabel("Epic description")
    ).toHaveValue(updatedDescription);
  });

  test("CRUD-EPIC-004: Epic UI Delete", async ({ page, disposableData }) => {
    const project = await disposableData.createProject("QA Parent Project");
    const epic = await disposableData.createEpic(project.id, "QA Delete Epic");

    await page.goto(`/project/${project.id}/epics`);

    const epicCard = page
      .getByTestId("epic-card")
      .filter({ hasText: epic.title });
    await expect(epicCard).toBeVisible();

    // Open context menu on epic card and click delete
    await epicCard.getByRole("button", { name: "More options" }).click();
    await page.getByRole("menuitem", { name: "Delete Epic" }).click();

    // Confirm deletion in modal
    const deleteModal = page.getByRole("dialog");
    await expect(deleteModal).toBeVisible();
    await expect(
      deleteModal.getByRole("heading", { name: "Delete Epic?" })
    ).toBeVisible();

    await deleteModal.getByRole("button", { name: "Delete Epic" }).click();

    // Verify epic card is no longer visible
    await expect(
      page.getByTestId("epic-card").filter({ hasText: epic.title })
    ).not.toBeVisible();

    // Supplementary exact-ID verification: epic absent in backend
    const exists = await disposableData.verifyEpic(epic.id);
    expect(exists).toBe(false);
  });
});

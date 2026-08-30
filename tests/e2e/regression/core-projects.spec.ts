import { test, expect } from "../fixtures/disposable-data.fixture";

test.describe("Core Projects CRUD Regression", () => {
  test("CRUD-PROJ-001: Project UI Create", async ({ page, disposableData }) => {
    const uniqueProjectName = `QA E2E Project ${Date.now()}`;
    const uniqueDescription =
      "Project created via automated UI regression test.";

    await page.goto("/project/add");

    await expect(
      page.getByRole("heading", { name: "Add New Project" })
    ).toBeVisible();

    const desktopForm = page.locator("div.hidden.lg\\:block").filter({
      has: page.getByRole("heading", { name: "Initialize New Project" }),
    });
    await expect(desktopForm).toBeVisible();

    await desktopForm.getByLabel("PROJECT TITLE *").fill(uniqueProjectName);
    await desktopForm.getByLabel("DESCRIPTION").fill(uniqueDescription);

    // Install exact POST response waiter before submission
    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.request().method() === "POST" &&
        new URL(resp.url()).pathname === "/rest/v1/projects" &&
        resp.ok()
    );

    await desktopForm.getByRole("button", { name: "Create Project" }).click();

    const response = await responsePromise;
    const registeredProject =
      await disposableData.registerUiCreatedProjectResponse(response);
    expect(registeredProject.id).toBeTruthy();

    // Verify visible UI success feedback
    await expect(page.getByText("Project created successfully")).toBeVisible();
  });

  test("CRUD-PROJ-002: Project UI Update", async ({ page, disposableData }) => {
    const project = await disposableData.createProject("QA Update Project");
    const updatedName = `QA Updated Project ${Date.now()}`;

    await page.goto(`/project/${project.id}/edit`);

    await expect(
      page.getByRole("heading", { name: "Edit Project" })
    ).toBeVisible();

    const desktopForm = page
      .locator("div.hidden.lg\\:block")
      .filter({ has: page.getByRole("heading", { name: "Project Details" }) });
    await expect(desktopForm).toBeVisible();

    // Fill new name and save
    const titleInput = desktopForm.getByLabel("PROJECT TITLE *");
    await expect(titleInput).toHaveValue(project.name);
    await titleInput.fill(updatedName);

    await desktopForm.getByRole("button", { name: "Save Changes" }).click();

    // Verify visible UI feedback scoped to desktop form
    await expect(
      desktopForm.getByText("Changes saved successfully.")
    ).toBeVisible();

    // Verify persistent state on reload
    await page.reload();
    const reloadedDesktopForm = page
      .locator("div.hidden.lg\\:block")
      .filter({ has: page.getByRole("heading", { name: "Project Details" }) });
    await expect(reloadedDesktopForm.getByLabel("PROJECT TITLE *")).toHaveValue(
      updatedName
    );
  });

  test("CRUD-PROJ-003: Project UI Delete", async ({ page, disposableData }) => {
    const project = await disposableData.createProject("QA Delete Project");

    await page.goto(`/project/${project.id}/edit`);

    await expect(
      page.getByRole("heading", { name: "Edit Project" })
    ).toBeVisible();

    // Click Delete Project button in Danger Zone
    await page.getByRole("button", { name: "Delete Project" }).click();

    // Confirmation modal should appear
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(
      modal.getByRole("heading", { name: "Delete Project?" })
    ).toBeVisible();

    // Confirm deletion inside modal
    await modal.getByRole("button", { name: "Delete Project" }).click();

    // Expect navigation away to /project
    await expect(page).toHaveURL(/\/project$/);

    // Supplementary exact-ID verification: project must be absent from backend
    const exists = await disposableData.verifyProject(project.id);
    expect(exists).toBe(false);
  });
});

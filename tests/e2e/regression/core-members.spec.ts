import { test, expect } from "../fixtures/disposable-data.fixture";

test.describe("Core Members Read-Only Regression", () => {
  test("CRUD-MEMB-001: Members Page Read-Only View", async ({
    page,
    disposableData,
  }) => {
    const project = await disposableData.createProject("QA Members Project");

    await page.goto(`/project/${project.id}/members`);

    // Verify main page heading and Invite Member CTA
    await expect(
      page.getByRole("heading", { name: "Project Members" })
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Invite Member" })
    ).toBeVisible();

    // Verify member table headers are present in desktop view
    await expect(
      page.getByRole("columnheader", { name: "MEMBER" })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "ROLE" })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "ACTIONS" })
    ).toBeVisible();

    // Verify owner row displays OWNER badge inside desktop table
    await expect(page.getByRole("table").getByText("OWNER")).toBeVisible();
  });
});

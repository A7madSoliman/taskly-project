import { test, expect } from "../fixtures/monitoring.fixture";

test.describe("SMOKE-001: Auth Boundary", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("unauthenticated access to /project redirects to /login", async ({
    monitoredPage: page,
  }) => {
    await page.goto("/project");
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Welcome Back" })
    ).toBeVisible();
  });
});

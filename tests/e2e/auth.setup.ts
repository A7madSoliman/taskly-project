import { test as setup, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const authDir = path.join(process.cwd(), "playwright/.auth");
const authFile = path.join(authDir, "user.json");

setup("authenticate as dedicated QA user", async ({ page }) => {
  const email = process.env.TASKLY_QA_EMAIL;
  const password = process.env.TASKLY_QA_PASSWORD;

  if (!email || !password) {
    throw new Error("TASKLY_QA_EMAIL is required for authenticated QA.");
  }

  // Ensure target auth directory exists
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  await page.goto("/login");

  // Fill credentials using actual accessible form inputs
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);

  // Explicitly enable Remember Me to persist session to localStorage for storageState
  const rememberMeCheckbox = page.getByRole("checkbox", {
    name: "Remember Me",
  });
  await rememberMeCheckbox.setChecked(true);
  await expect(rememberMeCheckbox).toBeChecked();

  // Submit form
  await page.getByRole("button", { name: "Log In" }).click();

  // Verify successful authentication landing
  await expect(page).toHaveURL(/\/project/);

  // Persistence proof: verify session survives a fresh navigation lifecycle
  await page.reload();
  await expect(page).toHaveURL(/\/project/);
  await expect(page.getByRole("link", { name: "Projects" })).toBeVisible();

  // Save storage state for authenticated projects
  await page.context().storageState({ path: authFile });
});

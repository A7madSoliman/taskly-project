import { test as base, expect, Page } from "@playwright/test";

export interface SanitizedDiagnosticError {
  testId: string;
  category: "pageerror" | "console.error" | "http-failure";
  status?: number;
  message: string;
}

export function attachMonitoring(page: Page, testId: string) {
  const errors: SanitizedDiagnosticError[] = [];

  page.on("pageerror", () => {
    errors.push({
      testId,
      category: "pageerror",
      message: "Uncaught page error occurred",
    });
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push({
        testId,
        category: "console.error",
        message: "Unexpected console.error occurred",
      });
    }
  });

  page.on("response", (response) => {
    const status = response.status();
    const url = response.url();
    if (
      status >= 400 &&
      url.includes("/rest/v1/") &&
      !url.includes("grant_type=refresh_token")
    ) {
      errors.push({
        testId,
        category: "http-failure",
        status,
        message: `HTTP ${status} on backend call`,
      });
    }
  });

  return {
    assertCleanRuntime: () => {
      const fatalErrors = errors.filter(
        (e) =>
          e.category === "pageerror" ||
          e.category === "console.error" ||
          (e.category === "http-failure" && e.status && e.status >= 500)
      );
      expect(
        fatalErrors,
        `Runtime monitoring detected fatal errors: ${JSON.stringify(fatalErrors)}`
      ).toHaveLength(0);
    },
  };
}

export const test = base.extend<{
  monitoredPage: Page;
}>({
  monitoredPage: async ({ page }, runTest, testInfo) => {
    const monitor = attachMonitoring(page, testInfo.title);
    await runTest(page);
    monitor.assertCleanRuntime();
  },
});

export { expect };

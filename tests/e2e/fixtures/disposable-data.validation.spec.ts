import { test, expect } from "./disposable-data.fixture";

test.describe("Phase B Disposable Fixture Lifecycle Validation", () => {
  test("exact-ID lifecycle creates, verifies existence, and cleans up with absence verification", async ({
    disposableData,
  }) => {
    // 1. Create exact Project
    const project = await disposableData.createProject(
      "QA Phase B Validation Project"
    );
    expect(project.id).toBeTruthy();
    expect(typeof project.id).toBe("string");

    // 2. Create exact Epic under owned Project
    const epic = await disposableData.createEpic(
      project.id,
      "QA Phase B Validation Epic"
    );
    expect(epic.id).toBeTruthy();
    expect(epic.projectId).toBe(project.id);

    // 3. Create exact Task under owned Project and Epic
    const task = await disposableData.createTask(
      project.id,
      epic.id,
      "QA Phase B Validation Task"
    );
    expect(task.id).toBeTruthy();
    expect(task.projectId).toBe(project.id);
    expect(task.epicId).toBe(epic.id);

    // 4. Exact-ID existence verification
    const projectExists = await disposableData.verifyProject(project.id);
    expect(projectExists).toBe(true);

    const epicExists = await disposableData.verifyEpic(epic.id);
    expect(epicExists).toBe(true);

    const taskExists = await disposableData.verifyTask(task.id);
    expect(taskExists).toBe(true);

    // 5. Explicit cleanup call (proves exact Task -> Epic -> Project deletion and absence verification)
    await disposableData.cleanup();

    // 6. Verify absence post-cleanup
    const projectAfterCleanup = await disposableData.verifyProject(project.id);
    expect(projectAfterCleanup).toBe(false);

    const epicAfterCleanup = await disposableData.verifyEpic(epic.id);
    expect(epicAfterCleanup).toBe(false);

    const taskAfterCleanup = await disposableData.verifyTask(task.id);
    expect(taskAfterCleanup).toBe(false);

    // 7. Idempotence test: second cleanup call must be a safe no-op
    await expect(disposableData.cleanup()).resolves.not.toThrow();
  });
});

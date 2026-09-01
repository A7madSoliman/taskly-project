export const TASK_STATUS_VALUES = [
  "TO_DO",
  "IN_PROGRESS",
  "BLOCKED",
  "IN_REVIEW",
  "READY_FOR_QA",
  "REOPENED",
  "READY_FOR_PRODUCTION",
  "DONE",
] as const;

export type TaskStatus = (typeof TASK_STATUS_VALUES)[number];

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "TO_DO", label: "TO DO" },
  { value: "IN_PROGRESS", label: "IN PROGRESS" },
  { value: "BLOCKED", label: "BLOCKED" },
  { value: "IN_REVIEW", label: "IN REVIEW" },
  { value: "READY_FOR_QA", label: "READY FOR QA" },
  { value: "REOPENED", label: "REOPENED" },
  { value: "READY_FOR_PRODUCTION", label: "READY FOR PRODUCTION" },
  { value: "DONE", label: "DONE" },
];

export const TASK_STATUS_SET: ReadonlySet<TaskStatus> = new Set<TaskStatus>(
  TASK_STATUS_VALUES
);

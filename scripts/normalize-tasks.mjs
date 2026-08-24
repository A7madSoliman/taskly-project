import fs from "node:fs";
import path from "node:path";

const SOURCE_DIR = path.resolve("project-spec/source/notion");
const TASKS_DIR = path.resolve("project-spec/tasks");
const INDEX_FILE = path.join(TASKS_DIR, "index.json");

if (!fs.existsSync(SOURCE_DIR)) {
  console.error(`Source directory not found: ${SOURCE_DIR}`);
  process.exit(1);
}

if (!fs.existsSync(TASKS_DIR)) {
  fs.mkdirSync(TASKS_DIR, { recursive: true });
}

// 1. Read all markdown files in source/notion (ignoring subdirectories)
const entries = fs.readdirSync(SOURCE_DIR, { withFileTypes: true });
const mdFiles = entries
  .filter((e) => e.isFile() && e.name.endsWith(".md"))
  .map((e) => e.name);

console.log(`Found ${mdFiles.length} raw Notion Markdown task files.`);

const taskMap = new Map();
const seenIds = new Set();

for (const fileName of mdFiles) {
  const filePath = path.join(SOURCE_DIR, fileName);
  const rawContent = fs.readFileSync(filePath, "utf-8");

  // Extract Title
  const titleMatch = rawContent.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Extract Task ID
  const idMatch = rawContent.match(/Task ID:\s*(TM-\d+)/i);
  if (!idMatch) {
    console.error(`ERROR: Missing Task ID in ${fileName}`);
    process.exit(1);
  }
  const taskId = idMatch[1].toUpperCase();

  // Validate format
  if (!/^TM-\d{2,}$/.test(taskId)) {
    console.error(`ERROR: Malformed Task ID "${taskId}" in ${fileName}`);
    process.exit(1);
  }

  // Reject duplicate IDs
  if (seenIds.has(taskId)) {
    console.error(`ERROR: Duplicate Task ID "${taskId}" found in ${fileName}`);
    process.exit(1);
  }
  seenIds.add(taskId);

  // Extract Status
  const statusMatch = rawContent.match(/Status:\s*([^\r\n]+)/i);
  const status = statusMatch ? statusMatch[1].trim() : "To Do";

  // Extract Clean Figma URL (without trailing markdown brackets or parentheses)
  const figmaUrlMatch = rawContent.match(/https:\/\/www\.figma\.com\/design\/[^\s\)\>\]]+/);
  const figmaUrl = figmaUrlMatch ? figmaUrlMatch[0] : null;

  // Extract Body by stripping the first `# Title`, `Status: ...`, and `Task ID: ...`
  const lines = rawContent.split(/\r?\n/);
  const bodyLines = [];
  let headerStripped = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!headerStripped) {
      if (
        line.startsWith("# ") ||
        line.match(/^Status:/i) ||
        line.match(/^Task ID:/i) ||
        line.trim() === ""
      ) {
        continue;
      }
      headerStripped = true;
    }
    bodyLines.push(line);
  }

  let rawBody = bodyLines.join("\n").trim();

  // Remove standalone Figma link block from rawBody if present
  if (figmaUrl) {
    rawBody = rawBody
      .replace(/(?:^|\n)(?:Figma Link:\s*)?(?:\[https:\/\/www\.figma\.com\/design\/[^\s\]]+\]\([^\)]+\)|https:\/\/www\.figma\.com\/design\/[^\s\)\>]+)/gi, "")
      .trim();
  }

  // Parse sections: Description, Acceptance Criteria, Requirements
  let description = "";
  let acceptanceCriteria = "";
  let requirements = "";

  // Split on explicit Acceptance Criteria header if present
  const acHeaderRegex = /(?:^|\n)(?:#{1,3}\s*(?:\d+\.\s*)?Acceptance Criteria|\*\*Acceptance Criteria:\*\*)/i;
  const acMatch = rawBody.match(acHeaderRegex);

  let preAC = rawBody;
  if (acMatch && acMatch.index !== undefined) {
    preAC = rawBody.slice(0, acMatch.index).trim();
    acceptanceCriteria = rawBody.slice(acMatch.index + acMatch[0].length).trim();
  }

  // Split preAC on Requirements header if present
  const reqHeaderRegex = /(?:^|\n)(?:#{1,3}\s*(?:\d+\.\s*)?Requirements|\*\*Requirements:\*\*)/i;
  const reqMatch = preAC.match(reqHeaderRegex);

  if (reqMatch && reqMatch.index !== undefined) {
    description = preAC.slice(0, reqMatch.index).trim();
    requirements = preAC.slice(reqMatch.index + reqMatch[0].length).trim();
  } else {
    // If no explicit Requirements header:
    // Check if preAC starts with **Description:** or Description header
    const descHeaderRegex = /(?:^|\n)(?:#{1,3}\s*Description|\*\*Description:\*\*)/i;
    const descMatch = preAC.match(descHeaderRegex);
    if (descMatch && descMatch.index !== undefined) {
      const afterDesc = preAC.slice(descMatch.index + descMatch[0].length).trim();
      description = afterDesc;
    } else {
      description = preAC;
    }
  }

  // Clean description of any leading/trailing Markdown bold tags if empty or leftover
  description = description.replace(/^\*\*Description:\*\*\s*/i, "").trim();

  taskMap.set(taskId, {
    taskId,
    title,
    status,
    description,
    acceptanceCriteria,
    requirements,
    figmaUrl,
    sourceFile: fileName,
  });
}

// Sort tasks by ID number
const sortedTasks = [...taskMap.values()].sort((a, b) => {
  const numA = parseInt(a.taskId.replace("TM-", ""), 10);
  const numB = parseInt(b.taskId.replace("TM-", ""), 10);
  return numA - numB;
});

// Generate normalized task markdown files
for (const t of sortedTasks) {
  const outPath = path.join(TASKS_DIR, `${t.taskId}.md`);

  const sections = [];
  sections.push(`# ${t.taskId} — ${t.title}\n`);
  sections.push(`## Metadata\n\n- Task ID: \`${t.taskId}\`\n- Status: \`${t.status}\`\n- Source: \`project-spec/source/notion/${t.sourceFile}\`\n`);

  if (t.description) {
    sections.push(`## Description\n\n${t.description}\n`);
  }

  if (t.requirements) {
    sections.push(`## Requirements\n\n${t.requirements}\n`);
  }

  if (t.acceptanceCriteria) {
    sections.push(`## Acceptance Criteria\n\n${t.acceptanceCriteria}\n`);
  }

  if (t.figmaUrl) {
    sections.push(`## Figma Reference\n\n- [Figma Frame / Node](${t.figmaUrl})\n`);
  }

  const normalizedMd = sections.join("\n").trim() + "\n";
  fs.writeFileSync(outPath, normalizedMd, "utf-8");
}

console.log(`Generated ${sortedTasks.length} normalized Task files in ${TASKS_DIR}`);

// Generate index.json
const indexData = sortedTasks.map((t) => ({
  id: t.taskId,
  title: t.title,
  status: t.status,
  file: `project-spec/tasks/${t.taskId}.md`,
  source: `project-spec/source/notion/${t.sourceFile}`,
  hasFigma: Boolean(t.figmaUrl),
  hasAcceptanceCriteria: Boolean(t.acceptanceCriteria),
}));

fs.writeFileSync(INDEX_FILE, JSON.stringify(indexData, null, 2) + "\n", "utf-8");
console.log(`Generated ${INDEX_FILE} with ${indexData.length} entries.`);

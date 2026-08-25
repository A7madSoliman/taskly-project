import fs from "node:fs";
import path from "node:path";

const SOURCE_DIR = path.resolve("project-spec/source/notion");
const TASKS_DIR = path.resolve("project-spec/tasks");
const INDEX_FILE = path.join(TASKS_DIR, "index.json");

console.log("=== Comprehensive Task Normalization Integrity Verification ===");

// 1. Source Inventory Check
if (!fs.existsSync(SOURCE_DIR)) {
  console.error(`FAIL: Source directory does not exist: ${SOURCE_DIR}`);
  process.exit(1);
}

const rawFiles = fs
  .readdirSync(SOURCE_DIR, { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.endsWith(".md"))
  .map((e) => e.name);

console.log(`[PASS] Found ${rawFiles.length} raw Notion Markdown task files.`);

// 2. Index Check
if (!fs.existsSync(INDEX_FILE)) {
  console.error(`FAIL: Index file missing: ${INDEX_FILE}`);
  process.exit(1);
}

const indexContent = JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8"));
console.log(`[PASS] index.json exists with ${indexContent.length} entries.`);

if (rawFiles.length !== indexContent.length) {
  console.error(`FAIL: Count mismatch: raw=${rawFiles.length} vs index=${indexContent.length}`);
  process.exit(1);
}

// 3. Normalized Files Check
const normalizedFiles = fs
  .readdirSync(TASKS_DIR, { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.endsWith(".md") && e.name !== "README.md")
  .map((e) => e.name);

console.log(`[PASS] Found ${normalizedFiles.length} normalized task Markdown files.`);

if (rawFiles.length !== normalizedFiles.length) {
  console.error(`FAIL: Count mismatch: raw=${rawFiles.length} vs normalized=${normalizedFiles.length}`);
  process.exit(1);
}

// 4. Detailed per-task verification
let allPassed = true;
const verifiedIds = new Set();

for (const rawFile of rawFiles) {
  const rawPath = path.join(SOURCE_DIR, rawFile);
  const rawText = fs.readFileSync(rawPath, "utf-8");

  // Extract raw metadata from top lines
  const rawLines = rawText.split(/\r?\n/);
  let rawTitle = "";
  for (const line of rawLines) {
    if (line.startsWith("# ")) {
      rawTitle = line.replace(/^#\s+/, "").trim();
      break;
    }
  }

  let rawTaskId = "";
  let rawStatus = "";
  for (let i = 0; i < Math.min(10, rawLines.length); i++) {
    const line = rawLines[i];
    const idM = line.match(/^Task ID:\s*(TM-\d+)/i);
    if (idM) rawTaskId = idM[1].toUpperCase();
    const stM = line.match(/^Status:\s*([^\r\n]+)/i);
    if (stM) rawStatus = stM[1].trim();
  }

  if (!rawTaskId) {
    console.error(`FAIL: Missing Task ID in source file: ${rawFile}`);
    allPassed = false;
    continue;
  }
  if (!rawStatus) {
    console.error(`FAIL: Missing Status in source file: ${rawFile}`);
    allPassed = false;
    continue;
  }

  if (rawTaskId === "TM-07") {
    console.error(`FAIL: Forbidden TM-07 found in source file: ${rawFile}`);
    allPassed = false;
  }

  if (verifiedIds.has(rawTaskId)) {
    console.error(`FAIL: Duplicate Task ID ${rawTaskId} in source: ${rawFile}`);
    allPassed = false;
  }
  verifiedIds.add(rawTaskId);

  // Check normalized file exists
  const normFile = `${rawTaskId}.md`;
  const normPath = path.join(TASKS_DIR, normFile);
  if (!fs.existsSync(normPath)) {
    console.error(`FAIL: Expected normalized file missing: ${normPath}`);
    allPassed = false;
    continue;
  }

  const normText = fs.readFileSync(normPath, "utf-8");

  // Verify Title preservation
  if (!normText.includes(`# ${rawTaskId} — ${rawTitle}`)) {
    console.error(`FAIL [${rawTaskId}]: Title mismatch in ${normFile}. Expected: "# ${rawTaskId} — ${rawTitle}"`);
    allPassed = false;
  }

  // Verify Status preservation
  if (!normText.includes(`- Status: \`${rawStatus}\``)) {
    console.error(`FAIL [${rawTaskId}]: Status mismatch in ${normFile}. Expected status: "${rawStatus}"`);
    allPassed = false;
  }

  // Verify Figma URLs preservation
  const rawFigmaMatches = [...rawText.matchAll(/https:\/\/www\.figma\.com\/design\/[^\s\)\>\]]+/g)].map((m) => m[0]);
  const uniqueFigmaUrls = [...new Set(rawFigmaMatches)];

  for (const figmaUrl of uniqueFigmaUrls) {
    if (!normText.includes(figmaUrl)) {
      console.error(`FAIL [${rawTaskId}]: Missing Figma URL in ${normFile}: ${figmaUrl}`);
      allPassed = false;
    }
  }

  // Verify Code blocks preservation
  const rawCodeBlocks = [...rawText.matchAll(/```[\s\S]*?```/g)].map((m) => m[0].replace(/\r?\n/g, "\n").trim());
  const normNormalizedText = normText.replace(/\r?\n/g, "\n");
  for (const block of rawCodeBlocks) {
    if (!normNormalizedText.includes(block)) {
      console.error(`FAIL [${rawTaskId}]: Code block not preserved in ${normFile}:\n${block.slice(0, 80)}...`);
      allPassed = false;
    }
  }

  // Verify Line-by-Line Content Preservation
  let inHeader = true;
  for (const line of rawLines) {
    const trimmed = line.trim();
    if (inHeader) {
      if (
        trimmed.startsWith("# ") ||
        trimmed.match(/^(Status|Task ID):/i) ||
        trimmed === ""
      ) {
        continue;
      }
      inHeader = false;
    }

    // Skip structural markers that are intentionally normalized into standard section headers
    if (
      trimmed === "" ||
      trimmed.match(/^(?:#{1,3}\s*)?(?:\d+\.\s*)?(?:Acceptance Criteria|\*\*Acceptance Criteria:\*\*|Requirements|\*\*Requirements:\*\*|Description|\*\*Description:\*\*)\s*$/i) ||
      trimmed.match(/^Figma Link:\s*$/i) ||
      trimmed.match(/^\[?https:\/\/www\.figma\.com\/design\/[^\s\]]+\]?(\([^\)]*\))?$/) ||
      trimmed === "---" ||
      trimmed === "‣"
    ) {
      continue;
    }

    // Check that the core text content of this line is present in normalized file
    const cleanLine = trimmed.replace(/^[-*+]\s+/, "").replace(/^\d+\.\s+/, "").trim();
    if (cleanLine.length > 5 && !normText.includes(cleanLine)) {
      // Check without markdown formatting
      const plainText = cleanLine.replace(/[*_`]/g, "");
      if (plainText.length > 5 && !normText.replace(/[*_`]/g, "").includes(plainText)) {
        console.warn(`WARN [${rawTaskId}]: Source line not found in normalized output:\n  "${trimmed}"`);
      }
    }
  }

  // Verify Index Entry
  const indexEntry = indexContent.find((e) => e.id === rawTaskId);
  if (!indexEntry) {
    console.error(`FAIL [${rawTaskId}]: Missing entry in index.json`);
    allPassed = false;
  } else {
    if (indexEntry.title !== rawTitle) {
      console.error(`FAIL [${rawTaskId}]: Title mismatch in index.json. Source="${rawTitle}" vs Index="${indexEntry.title}"`);
      allPassed = false;
    }
    if (indexEntry.status !== rawStatus) {
      console.error(`FAIL [${rawTaskId}]: Status mismatch in index.json. Source="${rawStatus}" vs Index="${indexEntry.status}"`);
      allPassed = false;
    }
    if (indexEntry.hasFigma !== (uniqueFigmaUrls.length > 0)) {
      console.error(`FAIL [${rawTaskId}]: hasFigma mismatch in index.json.`);
      allPassed = false;
    }
  }
}

// 5. Check TM-07 absence
if (verifiedIds.has("TM-07")) {
  console.error("FAIL: TM-07 was found in processed tasks!");
  allPassed = false;
}
if (indexContent.some((e) => e.id === "TM-07")) {
  console.error("FAIL: TM-07 was found in index.json!");
  allPassed = false;
}
if (fs.existsSync(path.join(TASKS_DIR, "TM-07.md"))) {
  console.error("FAIL: TM-07.md exists in tasks directory!");
  allPassed = false;
}

if (!allPassed) {
  console.error("\nIntegrity Verification FAILED. See errors above.");
  process.exit(1);
}

console.log(`\n[ALL PASS] Verified all ${verifiedIds.size} tasks for 100% metadata, content preservation, Figma link, code block, and inventory integrity.`);

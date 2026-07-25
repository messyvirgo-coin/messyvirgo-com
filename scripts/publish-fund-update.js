#!/usr/bin/env node
/**
 * Build / publish a weekly Messy Fund / Signal update.
 *
 * Usage:
 *   npm run fund-update:draft -- --date 2026-07-25
 *   npm run fund-update:publish -- --date 2026-07-25
 *   npm run fund-update:publish -- --date 2026-07-25 --promote
 *   node scripts/publish-fund-update.js --date 2026-07-25 --draft
 *   node scripts/publish-fund-update.js --no-cli
 */

const fs = require("fs");
const path = require("path");
const { fetchFundUpdateData } = require("./lib/fetch-fund-update-data");

const ROOT = path.join(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "_blog", "_posts");
const SNAPSHOTS_DIR = path.join(ROOT, "_blog", "_snapshots");
const DRAFTS_DIR = path.join(ROOT, "_drafts");

function parseArgs(argv) {
  const args = { useCli: true, date: null, draft: false, promote: false, help: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--no-cli") args.useCli = false;
    else if (argv[i] === "--draft") args.draft = true;
    else if (argv[i] === "--promote") args.promote = true;
    else if (argv[i] === "--help" || argv[i] === "-h") args.help = true;
    else if (argv[i] === "--date" && argv[i + 1]) {
      args.date = argv[++i];
    }
  }
  return args;
}

function printHelp() {
  console.log(`Usage:
  node scripts/publish-fund-update.js --date YYYY-MM-DD [--draft | --promote] [--no-cli]

  --draft     Write preview under _drafts/ → /drafts/fund-update-week-of-DATE/
  --promote   Promote an existing _drafts/ snapshot+stub into /updates/
  --no-cli    Skip Messy CLI (public API only; archived macro/narratives may be empty)

npm scripts:
  npm run fund-update:draft -- --date YYYY-MM-DD
  npm run fund-update:publish -- --date YYYY-MM-DD
  npm run fund-update:publish -- --date YYYY-MM-DD --promote`);
}

function isoDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function permalinkFor(dateStr, { draft = false } = {}) {
  if (draft) {
    return `/drafts/fund-update-week-of-${dateStr}/index.html`;
  }
  const [y, m] = dateStr.split("-");
  return `/updates/${y}/${m}/messy-fund-update-week-of-${dateStr}/index.html`;
}

function assertUpdatesPermalink(permalink) {
  if (!permalink.startsWith("/updates/")) {
    throw new Error(
      `Fund update permalink must be under /updates/, not /blog/: ${permalink}`
    );
  }
  if (permalink.includes("/blog/")) {
    throw new Error(`Fund update permalink must not contain /blog/: ${permalink}`);
  }
}

function postFilename(dateStr) {
  return `${dateStr}-messy-fund-update-week-of-${dateStr}.md`;
}

function draftPostFilename(dateStr) {
  return `fund-update-draft-${dateStr}.md`;
}

function snapshotFilename(dateStr) {
  return `${dateStr}-messy-fund-update.snapshot.json`;
}

function formatSnapshotDate(dateStr) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function draftSnapshotPath(dateStr) {
  return path.join(DRAFTS_DIR, snapshotFilename(dateStr));
}

function publishedSnapshotPath(dateStr) {
  return path.join(SNAPSHOTS_DIR, snapshotFilename(dateStr));
}

function writeDraftPostStub(dateStr) {
  fs.mkdirSync(DRAFTS_DIR, { recursive: true });
  const filename = draftPostFilename(dateStr);
  const filePath = path.join(DRAFTS_DIR, filename);
  const permalink = permalinkFor(dateStr, { draft: true });

  const frontmatter = `---
title: "Messy Fund Update (draft)"
date: ${dateStr}
description: "DRAFT — weekly fund update preview. Not published to /updates/."
tags: [fund-update-draft]
layout: fund-update-post.njk
fundUpdateSnapshot: "${dateStr}"
fundUpdateDraft: true
eleventyExcludeFromCollections: true
permalink: ${permalink}
---

<!-- DRAFT preview only. Snapshot lives in _drafts/. Promote with: npm run fund-update:publish -- --date ${dateStr} --promote -->
`;

  fs.writeFileSync(filePath, frontmatter, "utf8");
  return { filePath, permalink, filename };
}

function writePostStub(dateStr) {
  const filename = postFilename(dateStr);
  const filePath = path.join(POSTS_DIR, filename);
  const permalink = permalinkFor(dateStr);

  assertUpdatesPermalink(permalink);

  const frontmatter = `---
title: "Messy Fund Update"
date: ${dateStr}
description: "What Messy Virgo's Guru Lotus Funds on Base showed this week: macro regime, narrative leaders, screening aggregates, and council context — read-only, with links to inspect the same workflow in the app."
tags: [fund-update, signal-brief, guru-lotus, base, macro, messy-virgo]
layout: fund-update-post.njk
fundUpdateSnapshot: "${dateStr}"
permalink: ${permalink}
---

<!-- NOT a blog article: excluded from collections.blog; listed only under collections.fundUpdates and /updates/ URLs. -->
<!-- Body rendered from _blog/_snapshots/${dateStr}-messy-fund-update.snapshot.json via fund-update-post.njk -->
`;

  fs.writeFileSync(filePath, frontmatter, "utf8");
  return { filePath, permalink, filename };
}

function writeSnapshot(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
  return filePath;
}

function summarizeCoverage(data) {
  const funds = data.funds || [];
  const lines = [
    `funds: ${funds.length}`,
    `macroUnavailable: ${Boolean(data.macroUnavailable)}`,
    `narrativesUnavailable: ${Boolean(data.narrativesUnavailable)}`,
  ];
  if (data.macro) {
    lines.push(`macro: ${data.macro.score} ${data.macro.regime}`);
  }
  lines.push(`narratives: ${(data.narratives || []).length}`);
  for (const fund of funds) {
    const week = fund.councilWeek;
    if (!week) continue;
    lines.push(
      `${fund.name}: ${week.totalSessions || 0} sessions · ${week.executedRotations || 0} exec · ${week.holdSessions || 0} hold`
    );
  }
  return lines;
}

function promoteDraft(dateStr) {
  const fromSnap = draftSnapshotPath(dateStr);
  if (!fs.existsSync(fromSnap)) {
    throw new Error(`No draft snapshot at ${path.relative(ROOT, fromSnap)}`);
  }
  const data = JSON.parse(fs.readFileSync(fromSnap, "utf8"));
  const toSnap = writeSnapshot(publishedSnapshotPath(dateStr), data);
  const { filePath, permalink } = writePostStub(dateStr);

  const draftPost = path.join(DRAFTS_DIR, draftPostFilename(dateStr));
  if (fs.existsSync(draftPost)) fs.unlinkSync(draftPost);
  // Keep draft snapshot until explicit cleanup so promote is auditable; remove if present after copy.
  fs.unlinkSync(fromSnap);

  return { toSnap, filePath, permalink, data };
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }
  if (args.draft && args.promote) {
    console.error("Use either --draft or --promote, not both.");
    process.exit(1);
  }

  const dateStr = args.date || isoDate();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    console.error("Invalid --date; use YYYY-MM-DD");
    process.exit(1);
  }

  if (args.promote) {
    console.log(`[fund-update:promote] Promoting draft for ${dateStr}…`);
    const { toSnap, filePath, permalink, data } = promoteDraft(dateStr);
    console.log(`  snapshot → ${path.relative(ROOT, toSnap)}`);
    console.log(`  post     → ${path.relative(ROOT, filePath)}`);
    console.log(`  url      → ${permalink.replace(/\/index\.html$/, "/")}`);
    for (const line of summarizeCoverage(data)) console.log(`  ${line}`);
    console.log("\nNext: npm run build   then commit snapshot + post");
    return;
  }

  const mode = args.draft ? "draft" : "publish";
  console.log(`[fund-update:${mode}] Fetching data for ${dateStr}…`);
  const data = await fetchFundUpdateData({
    useCli: args.useCli,
    snapshotDate: formatSnapshotDate(dateStr),
    asOfDate: dateStr,
  });

  if (args.draft) {
    const snapPath = writeSnapshot(draftSnapshotPath(dateStr), data);
    const { filePath, permalink } = writeDraftPostStub(dateStr);
    console.log(`  snapshot → ${path.relative(ROOT, snapPath)}`);
    console.log(`  post     → ${path.relative(ROOT, filePath)}`);
    console.log(`  url      → ${permalink.replace(/\/index\.html$/, "/")}`);
    for (const line of summarizeCoverage(data)) console.log(`  ${line}`);
    console.log("\nDraft only — not under /updates/. Promote with:");
    console.log(`  npm run fund-update:publish -- --date ${dateStr} --promote`);
    return;
  }

  const snapPath = writeSnapshot(publishedSnapshotPath(dateStr), data);
  const { filePath, permalink } = writePostStub(dateStr);

  console.log(`  snapshot → ${path.relative(ROOT, snapPath)}`);
  console.log(`  post     → ${path.relative(ROOT, filePath)}`);
  console.log(`  url      → ${permalink.replace(/\/index\.html$/, "/")}`);
  console.log("  blog     → excluded (collections.blog filters fund-update posts)");
  for (const line of summarizeCoverage(data)) console.log(`  ${line}`);
  console.log("\nDo not add blog/... redirect stubs for new weeks.");
  console.log("Next: npm run build   then commit snapshot + post");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

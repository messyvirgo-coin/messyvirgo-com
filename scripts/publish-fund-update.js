#!/usr/bin/env node
/**
 * Publish a weekly Messy Fund / Signal update.
 *
 * Usage:
 *   node scripts/publish-fund-update.js
 *   node scripts/publish-fund-update.js --date 2026-05-22
 *   node scripts/publish-fund-update.js --no-cli
 */

const fs = require("fs");
const path = require("path");
const { fetchFundUpdateData } = require("./lib/fetch-fund-update-data");

const ROOT = path.join(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "_blog", "_posts");
const SNAPSHOTS_DIR = path.join(ROOT, "_blog", "_snapshots");

function parseArgs(argv) {
  const args = { useCli: true, date: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--no-cli") args.useCli = false;
    else if (argv[i] === "--date" && argv[i + 1]) {
      args.date = argv[++i];
    }
  }
  return args;
}

function isoDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function permalinkFor(dateStr) {
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

function writeSnapshot(dateStr, data) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  const filePath = path.join(SNAPSHOTS_DIR, snapshotFilename(dateStr));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
  return filePath;
}

async function main() {
  const args = parseArgs(process.argv);
  const dateStr = args.date || isoDate();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    console.error("Invalid --date; use YYYY-MM-DD");
    process.exit(1);
  }

  console.log(`[fund-update:publish] Fetching data for ${dateStr}…`);
  const data = await fetchFundUpdateData({
    useCli: args.useCli,
    snapshotDate: formatSnapshotDate(dateStr),
    asOfDate: dateStr,
  });

  const snapPath = writeSnapshot(dateStr, data);
  const { filePath, permalink } = writePostStub(dateStr);

  console.log(`  snapshot → ${path.relative(ROOT, snapPath)}`);
  console.log(`  post     → ${path.relative(ROOT, filePath)}`);
  console.log(`  url      → ${permalink.replace(/\/index\.html$/, "/")}`);
  console.log("  blog     → excluded (collections.blog filters fund-update posts)");
  console.log("\nDo not add blog/... redirect stubs for new weeks.");
  console.log("Next: npm run build   then commit snapshot + post");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

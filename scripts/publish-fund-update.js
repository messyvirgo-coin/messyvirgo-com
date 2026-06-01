#!/usr/bin/env node
/**
 * Publish a weekly Messy Fund / Signal update.
 *
 * Usage:
 *   node scripts/publish-fund-update.js
 *   node scripts/publish-fund-update.js --date 2026-05-22
 *   node scripts/publish-fund-update.js --date 2026-05-22 --update-nav
 *   node scripts/publish-fund-update.js --no-cli
 */

const fs = require("fs");
const path = require("path");
const { fetchFundUpdateData } = require("./lib/fetch-fund-update-data");

const ROOT = path.join(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "_blog", "_posts");
const SNAPSHOTS_DIR = path.join(ROOT, "_blog", "_snapshots");

function parseArgs(argv) {
  const args = { updateNav: false, useCli: true, date: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--update-nav") args.updateNav = true;
    else if (argv[i] === "--no-cli") args.useCli = false;
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
  return `/blog/${y}/${m}/messy-fund-update-week-of-${dateStr}/index.html`;
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

  const frontmatter = `---
title: "Messy Fund Update"
date: ${dateStr}
description: "What Messy Virgo's Guru Lotus Funds on Base showed this week: macro regime, narrative leaders, screening aggregates, and council context — read-only, with links to inspect the same workflow in the app."
tags: [fund-update, signal-brief, guru-lotus, base, macro, messy-virgo]
layout: fund-update-post.njk
fundUpdateSnapshot: "${dateStr}"
permalink: ${permalink}
---

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

function patchNavLinks(permalink) {
  const files = [
    path.join(ROOT, "_includes", "partials", "nav.njk"),
    path.join(ROOT, "index.html"),
    path.join(ROOT, "_includes", "partials", "home-funds-first.njk"),
  ];
  const url = permalink.replace(/\/index\.html$/, "/");
  const oldPattern = /\/blog\/\d{4}\/\d{2}\/messy-fund-update-week-of-\d{4}-\d{2}-\d{2}\//g;

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, "utf8");
    const next = src.replace(oldPattern, url);
    if (next !== src) {
      fs.writeFileSync(file, next, "utf8");
      console.log(`  updated ${path.relative(ROOT, file)}`);
    }
  }
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
  });

  const snapPath = writeSnapshot(dateStr, data);
  const { filePath, permalink, filename } = writePostStub(dateStr);

  console.log(`  snapshot → ${path.relative(ROOT, snapPath)}`);
  console.log(`  post     → ${path.relative(ROOT, filePath)}`);
  console.log(`  url      → ${permalink.replace(/\/index\.html$/, "/")}`);

  if (args.updateNav) {
    console.log("[fund-update:publish] Updating nav links…");
    patchNavLinks(permalink);
  } else {
    console.log("  (skip nav — pass --update-nav to point Latest links at this post)");
  }

  console.log("\nNext: npm run build   then commit snapshot + post" + (args.updateNav ? " + nav" : ""));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

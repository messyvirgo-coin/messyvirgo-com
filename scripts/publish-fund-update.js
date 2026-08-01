#!/usr/bin/env node
/**
 * Build / publish a weekly Messy Fund Report (Fund / Signal update).
 *
 * Report shape (vnext-2026-07-24):
 *   - Week rollup highlights + optional cross-fund debate digest
 *   - Week regime (shared only): Mon–Thu regime path, closing macro brief, tape motif
 *     — do NOT put a single fund’s cash/base % here (funds differ; use per-fund blocks)
 *   - Per fund: week strip, week-net posture, Closing session Chair notes + that fund’s move
 *   - Full book bar (cash + base + high-beta) and top-3 aggregate candidates
 *
 * Usage:
 *   npm run fund-update:draft -- --date 2026-07-23
 *   npm run fund-update:publish -- --date 2026-07-23
 *   npm run fund-update:publish -- --date 2026-07-23 --promote
 *   npm run fund-update:publish -- --no-cli
 *
 * Or directly:
 *   node scripts/publish-fund-update.js --date 2026-07-23 --draft
 *   node scripts/publish-fund-update.js --date 2026-07-23
 */

const fs = require("fs");
const path = require("path");
const {
  fetchFundUpdateData,
  REPORT_VERSION,
} = require("./lib/fetch-fund-update-data");

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
  console.log(`Build / publish a weekly Messy Fund Report (${REPORT_VERSION})

Usage:
  npm run fund-update:draft -- --date YYYY-MM-DD
  npm run fund-update:publish -- --date YYYY-MM-DD
  npm run fund-update:publish -- --date YYYY-MM-DD --promote
  npm run fund-update:publish -- --date YYYY-MM-DD --no-cli

Flags:
  --date YYYY-MM-DD   Week end / publication date (default: today UTC)
  --draft             Write preview under _drafts/ (not /updates/)
  --promote           Publish from existing draft snapshot (no re-fetch)
  --no-cli            API-only (degraded week-story; no Chair notes / regime path)
  --help              Show this help

Week regime is shared context only (path / macro / tape).
Per-fund cash·base·high-beta lives under week-net + Closing session — never as a single week-level posture %.
`);
}

function isoDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function permalinkFor(dateStr) {
  const [y, m] = dateStr.split("-");
  return `/updates/${y}/${m}/messy-fund-update-week-of-${dateStr}/index.html`;
}

function draftPermalinkFor(dateStr) {
  return `/drafts/fund-update-week-of-${dateStr}/index.html`;
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

function draftPostFilename(dateStr) {
  return `fund-update-draft-${dateStr}.md`;
}

function formatSnapshotDate(dateStr) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function writePostStub(dateStr, { draft = false } = {}) {
  if (draft) {
    const filename = draftPostFilename(dateStr);
    const filePath = path.join(DRAFTS_DIR, filename);
    const permalink = draftPermalinkFor(dateStr);
    const frontmatter = `---
title: "Messy Fund Update (draft)"
date: ${dateStr}
description: "DRAFT — week-story Fund Report (${REPORT_VERSION}). Not published to /updates/."
tags: [fund-update-draft]
layout: fund-update-post.njk
fundUpdateSnapshot: "${dateStr}"
fundUpdateDraft: true
eleventyExcludeFromCollections: true
permalink: ${permalink}
---

<!-- DRAFT preview only. Snapshot lives in _drafts/. Promote with: npm run fund-update:publish -- --date ${dateStr} --promote -->
`;
    fs.mkdirSync(DRAFTS_DIR, { recursive: true });
    fs.writeFileSync(filePath, frontmatter, "utf8");
    return { filePath, permalink, filename };
  }

  const filename = postFilename(dateStr);
  const filePath = path.join(POSTS_DIR, filename);
  const permalink = permalinkFor(dateStr);

  assertUpdatesPermalink(permalink);

  const frontmatter = `---
title: "Messy Fund Update"
date: ${dateStr}
description: "Weekly Fund Report for Guru micro test funds on Base: week regime path, council strips, Chair notes, book posture, and screening — with links to inspect the same workflow in the app."
tags: [fund-update, signal-brief, guru-lotus, base, macro, messy-virgo]
layout: fund-update-post.njk
fundUpdateSnapshot: "${dateStr}"
permalink: ${permalink}
---

<!-- NOT a blog article: excluded from collections.blog; listed only under collections.fundUpdates and /updates/ URLs. -->
<!-- Body rendered from _blog/_snapshots/${dateStr}-messy-fund-update.snapshot.json via fund-update-post.njk (${REPORT_VERSION}) -->
`;

  fs.writeFileSync(filePath, frontmatter, "utf8");
  return { filePath, permalink, filename };
}

function writeSnapshot(dateStr, data, { draft = false } = {}) {
  const dir = draft ? DRAFTS_DIR : SNAPSHOTS_DIR;
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, snapshotFilename(dateStr));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
  return filePath;
}

function readDraftSnapshot(dateStr) {
  const filePath = path.join(DRAFTS_DIR, snapshotFilename(dateStr));
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `No draft snapshot at ${path.relative(ROOT, filePath)}. Run: npm run fund-update:draft -- --date ${dateStr}`
    );
  }
  return {
    filePath,
    data: JSON.parse(fs.readFileSync(filePath, "utf8")),
  };
}

function sanitizeSnapshot(data) {
  if (!data || typeof data !== "object") return data;
  // Week-level single-fund bucket % is obsolete (funds differ).
  if (data.sessionContext && "postureIntent" in data.sessionContext) {
    delete data.sessionContext.postureIntent;
  }
  if (!data.reportVersion) data.reportVersion = REPORT_VERSION;
  return data;
}

function summarizeSnapshot(data, { useCli }) {
  const funds = (data.funds || []).filter(
    (f) => f.group === "guru-micro" || f.group === "micro"
  );
  const withChair = funds.filter((f) => f.chairInsight?.notes?.length).length;
  const withStrip = funds.filter((f) => f.weekTimeline?.days?.length).length;
  const withNet = funds.filter((f) => f.weekStory?.netPosture?.line).length;
  const sessions = funds.reduce(
    (sum, f) => sum + (f.councilWeek?.totalSessions || f.weekTimeline?.sessionCount || 0),
    0
  );

  return {
    reportVersion: data.reportVersion || "(missing)",
    funds: funds.length,
    sessions,
    weekPath: data.sessionContext?.weekPath?.label || null,
    tapeMotif: data.sessionContext?.tapeMotif?.label || null,
    debateBullets: data.weekDebateDigest?.bullets?.length || 0,
    chairFunds: withChair,
    stripFunds: withStrip,
    netFunds: withNet,
    cliDegraded: !useCli,
  };
}

function validateSnapshot(data, { useCli, draft }) {
  const warnings = [];
  const errors = [];

  if (!data || typeof data !== "object") {
    errors.push("Snapshot payload is empty or invalid.");
    return { warnings, errors };
  }

  if (data.reportVersion !== REPORT_VERSION) {
    warnings.push(
      `reportVersion is ${JSON.stringify(data.reportVersion)}; expected ${REPORT_VERSION}.`
    );
  }

  const micro = (data.funds || []).filter(
    (f) => f.group === "guru-micro" || f.group === "micro"
  );
  if (!micro.length) {
    errors.push("No guru-micro funds in snapshot.");
  }

  if (data.sessionContext?.postureIntent) {
    warnings.push(
      "Obsolete sessionContext.postureIntent present — week regime must not show one fund’s cash/base %; will be stripped on write."
    );
  }

  if (useCli) {
    if (data.sessionContext?.unavailable) {
      warnings.push(
        `sessionContext unavailable (${data.sessionContext.reason || "unknown"}) — week regime / Chair notes may be thin.`
      );
    } else {
      if (!data.sessionContext?.weekPath?.points?.length) {
        warnings.push("Missing weekPath points — regime strip will be thin.");
      }
      if (!micro.some((f) => f.weekTimeline?.days?.length)) {
        warnings.push("No per-fund weekTimeline — week strips missing.");
      }
      if (!micro.some((f) => f.weekStory?.netPosture?.line)) {
        warnings.push("No per-fund week-net posture — bucket moves missing at fund level.");
      }
      if (!micro.some((f) => f.chairInsight)) {
        warnings.push("No Chair insights attached — closing notes missing.");
      }
    }
  } else {
    warnings.push(
      "--no-cli: week regime path, Chair notes, and week strips require CLI auth; publish will be API-thin."
    );
  }

  if (!draft && !data.weeklyHighlights?.length) {
    warnings.push("weeklyHighlights empty.");
  }

  return { warnings, errors };
}

function logSummary(summary) {
  console.log(`  version  → ${summary.reportVersion}`);
  console.log(
    `  coverage → ${summary.funds} funds · ${summary.sessions} week sessions · Chair notes ${summary.chairFunds}/${summary.funds} · strips ${summary.stripFunds}/${summary.funds} · net posture ${summary.netFunds}/${summary.funds}`
  );
  if (summary.weekPath) console.log(`  regime   → ${summary.weekPath} (shared; no week-level bucket %)`);
  if (summary.tapeMotif) console.log(`  tape     → ${summary.tapeMotif}`);
  if (summary.debateBullets) {
    console.log(`  digest   → ${summary.debateBullets} cross-fund theme bullet(s)`);
  }
  if (summary.cliDegraded) {
    console.log("  note     → CLI disabled; week-story fields may be incomplete");
  }
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

  const mode = args.draft ? "draft" : args.promote ? "promote" : "publish";
  let data;
  let promotedFrom = null;

  if (args.promote) {
    console.log(`[fund-update:${mode}] Promoting draft snapshot for ${dateStr}…`);
    const draft = readDraftSnapshot(dateStr);
    data = draft.data;
    promotedFrom = draft.filePath;
    if (!data.reportVersion) data.reportVersion = REPORT_VERSION;
  } else {
    console.log(
      `[fund-update:${mode}] Fetching ${REPORT_VERSION} data for ${dateStr}${args.useCli ? "" : " (API only)"}…`
    );
    data = await fetchFundUpdateData({
      useCli: args.useCli,
      snapshotDate: formatSnapshotDate(dateStr),
      asOfDate: dateStr,
    });
  }

  const { warnings, errors } = validateSnapshot(data, {
    useCli: args.promote ? true : args.useCli,
    draft: args.draft,
  });
  for (const warning of warnings) {
    console.warn(`  warn     → ${warning}`);
  }
  if (errors.length) {
    for (const error of errors) console.error(`  error    → ${error}`);
    process.exit(1);
  }

  data = sanitizeSnapshot(data);

  const snapPath = writeSnapshot(dateStr, data, { draft: args.draft });
  const { filePath, permalink } = writePostStub(dateStr, { draft: args.draft });
  const summary = summarizeSnapshot(data, {
    useCli: args.promote ? Boolean(data.sessionContext && !data.sessionContext.unavailable) : args.useCli,
  });

  console.log(`  snapshot → ${path.relative(ROOT, snapPath)}`);
  console.log(`  post     → ${path.relative(ROOT, filePath)}`);
  console.log(`  url      → ${permalink.replace(/\/index\.html$/, "/")}`);
  if (promotedFrom) {
    console.log(`  from     → ${path.relative(ROOT, promotedFrom)}`);
  }
  logSummary(summary);

  if (args.draft) {
    console.log("  status   → DRAFT (excluded from collections; not under /updates/)");
    console.log("\nPreview: npm run dev → open the draft URL");
    console.log(
      `Promote:  npm run fund-update:publish -- --date ${dateStr} --promote`
    );
  } else {
    console.log("  blog     → excluded (collections.blog filters fund-update posts)");
    console.log("\nDo not add blog/... redirect stubs for new weeks.");
    console.log("Next: npm run build   then commit snapshot + post (after approval)");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

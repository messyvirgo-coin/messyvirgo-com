/**
 * Fetch and shape Fund / Signal update data from Messy Virgo public API + CLI.
 * Used by Eleventy (_data/fundUpdate.js) and scripts/publish-fund-update.js.
 */

const { execSync } = require("child_process");

const API = "https://api.messyvirgo.com/api/v1/public";

/** Snapshot schema / layout generation for weekly Fund Reports. */
const REPORT_VERSION = "vnext-2026-07-24";

const FUNDS = [
  { id: "mvf-base01", name: "base01", sleeveId: "mvs-base01-1", group: "guru-micro" },
  { id: "mvf-base02", name: "base02", sleeveId: "mvs-base02-1", group: "guru-micro" },
  // Public workflow micro funds added 2026-07-10 (excluded from earlier archived weeks).
  { id: "mvf-base04", name: "base04", sleeveId: "mvs-base04-1", group: "guru-micro", since: "2026-07-10" },
  { id: "mvf-base05", name: "base05", sleeveId: "mvs-base05-1", group: "guru-micro", since: "2026-07-10" },
];

const BAR_COLOURS = [
  "#ff69b4", "#fbbf24", "#60a5fa", "#34d399",
  "#a78bfa", "#f87171", "#fb923c", "#e879f9",
];

/** End-user product notes from recent releases. Drop entries by showUntil / showFrom. */
const READER_NOTES = [
  {
    showUntil: "2026-08-31",
    text:
      "Fund pages in the app now include full council minutes — open any fund and tap Council to read what the portfolio committee debated, what the Chair decided, and whether trades were executed.",
    link: {
      href: "/blog/2026/06/messy-virgo-decision-pipeline-part-1-the-ai-investment-council/",
      label: "How the AI investment council works",
    },
  },
  {
    showUntil: "2026-07-09",
    text:
      "We publish two live workflow test funds (base01 and base02). Every change on those test funds goes through screening, council review, and signed execution — the same path future AI-managed funds will use.",
  },
  {
    showFrom: "2026-07-10",
    showUntil: "2026-08-31",
    text:
      "We publish four Guru micro test funds (base01, base02, base04, base05). base04 and base05 joined on 10 July with distinct token universes. Every change on those test funds goes through screening, council review, and signed execution — the same path future AI-managed funds will use.",
  },
];

function activeReaderNotes(asOfDate) {
  const today = asOfDate || new Date().toISOString().slice(0, 10);
  return READER_NOTES.filter((note) => {
    if (note.showUntil && note.showUntil < today) return false;
    if (note.showFrom && note.showFrom > today) return false;
    return true;
  });
}

function fundsForAsOf(asOfDate) {
  const today = asOfDate || new Date().toISOString().slice(0, 10);
  return FUNDS.filter((fund) => !fund.since || fund.since <= today);
}

function buildWeeklyHighlights({ funds, sessionContext, signalExample, weeklyRollup }) {
  const highlights = [];

  if (weeklyRollup && weeklyRollup.totalSessions > 0) {
    const parts = [
      `${weeklyRollup.totalSessions} council session${weeklyRollup.totalSessions === 1 ? "" : "s"} across ${weeklyRollup.fundsWithSessions} micro fund${weeklyRollup.fundsWithSessions === 1 ? "" : "s"}`,
    ];
    const bits = [];
    if (weeklyRollup.executed > 0) {
      bits.push(`${weeklyRollup.executed} executed`);
    }
    if (weeklyRollup.holds > 0) {
      bits.push(`${weeklyRollup.holds} hold${weeklyRollup.holds === 1 ? "" : "s"}`);
    }
    if (weeklyRollup.blocked > 0) {
      bits.push(`${weeklyRollup.blocked} blocked`);
    }
    if (bits.length) parts.push(bits.join(", "));
    highlights.push(`${parts.join(" — ")}.`);
  }

  if (sessionContext?.macro?.regimeLabel || sessionContext?.macro?.summary) {
    const pathLabel = sessionContext.weekPath?.label;
    const regime =
      pathLabel ||
      sessionContext.macro.regimeLabel ||
      sessionContext.macro.effectiveRegime ||
      sessionContext.macro.observedRegime;
    const lead = pathLabel
      ? `Week regime path: ${pathLabel}`
      : regime
        ? `Sessions this week ran under macro regime ${regime}`
        : "Sessions this week used a frozen macro allocation brief";
    const detail = sessionContext.macro.summary
      ? ` — ${firstSentence(sessionContext.macro.summary)}`
      : ".";
    highlights.push(`${lead}${detail.endsWith(".") ? detail : `${detail}.`}`);
  }

  if (sessionContext?.narrative?.summary) {
    const narrativeLead = firstSentence(sessionContext.narrative.summary);
    highlights.push(
      `Narrative tape (session-frozen): ${narrativeLead}${narrativeLead.endsWith(".") ? "" : "."}`
    );
  }

  const movers = (funds || [])
    .filter((f) => f.group === "guru-micro" || f.group === "micro")
    .filter((f) => f.ret7d && f.ret7d.value && f.ret7d.value !== "n/a")
    .slice()
    .sort((a, b) => Math.abs(parseFloat(b.ret7d.value)) - Math.abs(parseFloat(a.ret7d.value)));
  for (const fund of movers.slice(0, 2)) {
    if (!fund.ret7d?.value || fund.ret7d.value === "n/a") continue;
    const week = fund.councilWeek;
    const councilBit = week
      ? `, ${week.executedRotations || 0} exec / ${week.holdSessions || 0} hold`
      : "";
    highlights.push(
      `${fund.name} NAV ${fund.nav} (${fund.ret7d.value} 7d${councilBit}).`
    );
  }

  if (weeklyRollup?.blocked > 0) {
    highlights.push(
      `${weeklyRollup.blocked} session${weeklyRollup.blocked === 1 ? "" : "s"} blocked or pending review — see fund Council tabs for gates.`
    );
  }

  if (signalExample?.symbol) {
    highlights.push(
      `${signalExample.symbol} led aggregate screens this week — a candidate signal, not an automatic trade.`
    );
  }

  return highlights.slice(0, 6);
}

function buildWeeklyRollup(funds) {
  let totalSessions = 0;
  let executed = 0;
  let holds = 0;
  let blocked = 0;
  let fundsWithSessions = 0;
  let weekStart = null;
  let weekEnd = null;

  for (const fund of funds || []) {
    const week = fund.councilWeek;
    if (!week || !week.totalSessions) continue;
    fundsWithSessions += 1;
    totalSessions += week.totalSessions || 0;
    executed += week.executedRotations || 0;
    holds += week.holdSessions || 0;
    blocked += week.blockedSessions || 0;
    if (week.weekStart && (!weekStart || week.weekStart < weekStart)) weekStart = week.weekStart;
    if (week.weekEnd && (!weekEnd || week.weekEnd > weekEnd)) weekEnd = week.weekEnd;
  }

  if (totalSessions === 0) return null;
  return {
    weekStart,
    weekEnd,
    totalSessions,
    executed,
    holds,
    blocked,
    fundsWithSessions,
  };
}

function buildComparisonRows(funds) {
  return (funds || [])
    .filter((f) => f.group === "guru-micro" || f.group === "micro")
    .map((f) => ({
      name: f.name,
      id: f.id,
      nav: f.nav,
      ret7d: f.ret7d,
      sessions: f.councilWeek?.totalSessions || 0,
      executed: f.councilWeek?.executedRotations || 0,
      holds: f.councilWeek?.holdSessions || 0,
      blocked: f.councilWeek?.blockedSessions || 0,
      appUrl: f.appUrl,
      councilUrl: f.councilUrl,
    }));
}

function artifactUuidFromRef(ref) {
  if (!ref) return null;
  const parts = String(ref).split(":");
  return parts[parts.length - 1] || null;
}

function fetchCouncilCliGet(fundId, sessionId) {
  try {
    const raw = execSync(
      `npx -y @messyvirgo/cli@0.41.0 funds council get ${fundId} ${sessionId} --json --no-update-check`,
      { encoding: "utf8", timeout: 60000, stdio: ["pipe", "pipe", "pipe"] }
    );
    const start = raw.indexOf("{");
    if (start === -1) return null;
    return JSON.parse(raw.slice(start));
  } catch {
    return null;
  }
}

function fetchCouncilCliArtifact(fundId, artifactId) {
  if (!artifactId) return null;
  try {
    const raw = execSync(
      `npx -y @messyvirgo/cli@0.41.0 funds council artifact ${fundId} ${artifactId} --json --no-update-check`,
      { encoding: "utf8", timeout: 60000, stdio: ["pipe", "pipe", "pipe"] }
    );
    const start = raw.indexOf("{");
    if (start === -1) return null;
    return JSON.parse(raw.slice(start));
  } catch {
    return null;
  }
}

function pickLatestCliSessionInWeek(cliItems, asOfDate) {
  const inWeek = sessionsInWeek(cliItems, asOfDate);
  if (!inWeek.length) return null;
  return inWeek[inWeek.length - 1];
}

function pickEarliestCliSessionInWeek(cliItems, asOfDate) {
  const inWeek = sessionsInWeek(cliItems, asOfDate);
  return inWeek[0] || null;
}

function sessionsInWeek(cliItems, asOfDate) {
  if (!asOfDate || !cliItems?.length) return [];
  const { weekStart, weekEnd } = fundUpdateWeekRange(asOfDate);
  return (cliItems || [])
    .filter((session) => {
      const day = session.started_at && session.started_at.slice(0, 10);
      return day && day >= weekStart && day <= weekEnd;
    })
    .sort((a, b) => String(a.started_at).localeCompare(String(b.started_at)));
}

function outcomeBeat(session) {
  const kind = String(session?.outcome_kind || "");
  if (kind === "blocked") return "blocked";
  if (kind === "executed_reconciled" || session?.fund_mutated === true) return "exec";
  if (kind === "maintain_current") return "hold";
  if (kind === "target_change") return "target";
  return "other";
}

function beatLabel(beat) {
  return (
    {
      exec: "exec",
      hold: "hold",
      blocked: "blocked",
      target: "target",
      other: "session",
    }[beat] || "session"
  );
}

function weekdayShort(isoDay) {
  if (!isoDay) return "";
  return new Date(`${isoDay}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short" });
}

/**
 * Compact Mon–Thu strip from council list (no extra CLI gets).
 * Multiple sessions/day collapse to the most material beat.
 */
function buildWeekTimeline(cliItems, asOfDate) {
  const sessions = sessionsInWeek(cliItems, asOfDate);
  if (!sessions.length) return null;
  const { weekStart, weekEnd } = fundUpdateWeekRange(asOfDate);
  const priority = { blocked: 4, exec: 3, hold: 2, target: 1, other: 0 };
  const byDay = new Map();

  for (const session of sessions) {
    const day = session.started_at.slice(0, 10);
    const beat = outcomeBeat(session);
    const prev = byDay.get(day);
    if (!prev) {
      byDay.set(day, {
        day,
        weekday: weekdayShort(day),
        beat,
        label: beatLabel(beat),
        sessionId: session.session_id,
        sessionCount: 1,
      });
      continue;
    }
    prev.sessionCount += 1;
    if (priority[beat] > priority[prev.beat]) {
      prev.beat = beat;
      prev.label = beatLabel(beat);
      prev.sessionId = session.session_id;
    }
    byDay.set(day, prev);
  }

  const days = [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day));
  return {
    weekStart,
    weekEnd,
    days,
    label: days.map((d) => `${d.weekday} ${d.label}`).join(" · "),
    sessionCount: sessions.length,
    execDays: days.filter((d) => d.beat === "exec").length,
    holdDays: days.filter((d) => d.beat === "hold").length,
  };
}

function lockedPostureFromSession(sessionGet) {
  return (
    sessionGet?.bucket_sizing_outcome?.locked_fund_posture ||
    sessionGet?.target_finalization_summary?.locked_fund_posture ||
    null
  );
}

function regimeFromSessionGet(sessionGet) {
  const locked = lockedPostureFromSession(sessionGet);
  const fromLocked = locked?.macro_regime || null;
  const found = findMacroRegime(sessionGet);
  const observed =
    fromLocked?.observed_regime || found?.observed_regime || sessionGet?.macro_regime?.observed_regime;
  const effective =
    fromLocked?.effective_regime || found?.effective_regime || sessionGet?.macro_regime?.effective_regime;
  const code = String(effective || observed || "").trim();
  if (!code) return null;
  return {
    code,
    observed: observed || null,
    effective: effective || null,
    label: friendlyRegimeLabel(code),
  };
}

function friendlyRegimeLabel(code) {
  const regimeCode = String(code || "").trim();
  const regimeFriendly =
    {
      "R--": "Strong risk-off",
      "R-": "Risk-off",
      N: "Neutral",
      "R+": "Risk-on",
      "R++": "Strong risk-on",
    }[regimeCode] || null;
  return regimeFriendly ? `${regimeFriendly} (${regimeCode})` : regimeCode || null;
}

function formatNetPosture(startLocked, endLocked) {
  if (!startLocked || !endLocked) return null;
  const from = startLocked.current_bucket_weights || startLocked.ratified_bucket_weights;
  const to = endLocked.ratified_bucket_weights || endLocked.current_bucket_weights;
  if (!from || !to) return null;
  const line = formatBucketMove(from, to);
  if (!line) return null;
  const changed = line.includes("→");
  return {
    line: changed ? `Week net · ${line}` : `Week held · ${line}`,
    changed,
  };
}

function pickDayAnchorSessions(cliItems, asOfDate) {
  const timeline = buildWeekTimeline(cliItems, asOfDate);
  if (!timeline?.days?.length) return [];
  return timeline.days.map((d) => ({
    day: d.day,
    sessionId: d.sessionId,
    beat: d.beat,
  }));
}

function findMacroRegime(obj, depth = 0) {
  if (!obj || depth > 8) return null;
  if (typeof obj !== "object") return null;
  if (!Array.isArray(obj) && obj.effective_regime != null && obj.observed_regime != null) {
    return obj;
  }
  if (!Array.isArray(obj) && obj.macro_regime) return findMacroRegime(obj.macro_regime, depth + 1);
  const values = Array.isArray(obj) ? obj.slice(0, 12) : Object.values(obj);
  for (const value of values) {
    const hit = findMacroRegime(value, depth + 1);
    if (hit) return hit;
  }
  return null;
}

function summarizePrepFromSessionGet(sessionGet, fundId, fundName) {
  if (!sessionGet) return null;
  const lineage = sessionGet.preparation_lineage || {};
  const briefs = sessionGet.preparation_summary?.included_briefs || [];
  const macroBrief = briefs.find((b) => b.brief_type === "macro_allocation_brief");
  const narrativeBrief = briefs.find((b) => b.brief_type === "narrative_momentum_brief");
  const regime = findMacroRegime(sessionGet);
  return {
    fundId,
    fundName,
    sessionId: sessionGet.summary?.session_id || sessionGet.session_id || null,
    startedAt: sessionGet.summary?.started_at || null,
    macroRef: lineage.macro_allocation_brief_ref || null,
    narrativeRef: lineage.narrative_momentum_brief_ref || null,
    macroSummary: macroBrief?.summary || null,
    narrativeSummary: narrativeBrief?.summary || null,
    observedRegime: regime?.observed_regime || null,
    effectiveRegime: regime?.effective_regime || null,
  };
}

function pctFromWeight(weight) {
  if (weight == null || Number.isNaN(Number(weight))) return null;
  const n = Number(weight);
  // Ratios arrive as 0–1; already-percent values stay as-is.
  const pct = n <= 1.5 ? n * 100 : n;
  return roundPct(pct);
}

function formatBucketMove(currentWeights, ratifiedWeights) {
  if (!currentWeights || !ratifiedWeights) return null;
  const parts = [];
  for (const [key, label] of [
    ["cash", "Cash"],
    ["base", "Base"],
    ["high_beta", "High-beta"],
  ]) {
    const from = pctFromWeight(currentWeights[key]);
    const to = pctFromWeight(ratifiedWeights[key]);
    if (from == null || to == null) continue;
    if (Math.abs(to - from) < 0.05) {
      parts.push(`${label} ${from}%`);
    } else {
      parts.push(`${label} ${from}% → ${to}%`);
    }
  }
  return parts.length ? parts.join(" · ") : null;
}

function truncateInsight(text, maxLen = 220) {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .replace(/\s*\(\d{3,}\)/g, "") // drop internal token ids like (10364)
    .replace(/\bsleeve\s+mvs-[\w-]+/gi, "the sleeve")
    .trim();
  if (!clean) return null;
  if (clean.length <= maxLen) return clean;
  const cut = clean.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function noteThemeKey(text) {
  const t = String(text || "").toLowerCase();
  if (/negative.*(30d|thirty).*(momentum|tape)|soft tape|tape softness/.test(t)) return "soft_tape";
  if (/coverage death|no fresh or aggregate|absent from the aggregate|fallen off the fresh/.test(t)) {
    return "coverage_exit";
  }
  if (/partial step|cautious|conviction|third of the way|mixed alignment/.test(t)) {
    return "cautious_sizing";
  }
  if (/fresh-only|no aggregate track|zero aggregate/.test(t)) return "fresh_only_add";
  if (/rank fell|reconfirm|aggregate rank/.test(t)) return "rank_watch";
  return null;
}

function isOperationalNoise(text) {
  return /guru execution routes|beta-to-beta legs|solver-planned|unknown-token execution buffer|planner applied|no direct beta-to-beta/i.test(
    String(text || "")
  );
}

/**
 * Chair-facing insight block for one council session (posture + short notes).
 */
function extractChairInsight(sessionGet) {
  if (!sessionGet) return null;

  const locked =
    sessionGet.bucket_sizing_outcome?.locked_fund_posture ||
    sessionGet.target_finalization_summary?.locked_fund_posture ||
    null;

  const postureLine = formatBucketMove(
    locked?.current_bucket_weights,
    locked?.ratified_bucket_weights
  );
  const postureRationale = truncateInsight(locked?.rationale || locked?.decision_summary, 200);
  const actionSummary = locked?.action_summary || null;

  const softWarnings = [
    ...(sessionGet.resolution_summary?.soft_warnings || []),
    ...(sessionGet.certification_summary?.soft_warnings || []),
  ]
    .filter((w) => !isOperationalNoise(w))
    .map((w) => truncateInsight(w, 210))
    .filter(Boolean);

  const selectedRationales = (sessionGet.decision_trace?.options || [])
    .filter((o) => o.status === "selected" && o.rationale)
    .map((o) => truncateInsight(o.rationale, 210))
    .filter(Boolean);

  // Prefer Chair soft warnings; fill with selected-option rationale if thin.
  const notes = [];
  const seen = new Set();
  for (const note of [...softWarnings, ...selectedRationales]) {
    if (isOperationalNoise(note)) continue;
    const key = note.slice(0, 48).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    notes.push(note);
    if (notes.length >= 3) break;
  }

  const outcomeKind =
    sessionGet.summary?.outcome_kind ||
    sessionGet.summary?.business_outcome ||
    null;
  const isHold =
    outcomeKind === "maintain_current" ||
    /hold|maintain/i.test(String(outcomeKind || ""));

  if (!postureLine && !postureRationale && !notes.length) {
    if (isHold) {
      return {
        postureLine: null,
        postureRationale: null,
        actionSummary: null,
        notes: ["Chair held current posture; no material notes this session."],
        themes: [],
        hold: true,
      };
    }
    return null;
  }

  const themes = notes.map(noteThemeKey).filter(Boolean);
  if (postureRationale) {
    const theme = noteThemeKey(postureRationale);
    if (theme) themes.push(theme);
  }

  return {
    postureLine,
    postureRationale,
    actionSummary,
    notes: notes.slice(0, 3),
    themes: [...new Set(themes)],
    hold: Boolean(isHold && !notes.length),
  };
}

function buildWeekDebateDigest(funds) {
  const themeMeta = {
    soft_tape: {
      label: "soft tape",
      text: "Several Chairs flagged soft narrative tape — a large share of beta book value sat in narratives with negative 30d momentum vs TOTAL3ES.",
    },
    coverage_exit: {
      label: "coverage-death exits",
      text: "Coverage-death exits showed up across funds: names that lost fresh/aggregate screen coverage were treated as exits, not hold-and-wait.",
    },
    cautious_sizing: {
      label: "cautious sizing",
      text: "Posture moves stayed partial — Chairs sized with cautious conviction rather than jumping fully to target bucket midpoints.",
    },
    fresh_only_add: {
      label: "fresh-only adds",
      text: "Fresh-only candidates were added cautiously (small size, watch for aggregate confirmation) rather than as full slate replacements.",
    },
    rank_watch: {
      label: "rank watch",
      text: "Chairs called out rank/aggregate divergence to reconfirm before further sizing increases.",
    },
  };

  const counts = new Map();
  const fundHits = new Map();
  for (const fund of funds || []) {
    if (fund.group !== "guru-micro" && fund.group !== "micro") continue;
    const themes = fund.chairInsight?.themes || [];
    for (const theme of themes) {
      counts.set(theme, (counts.get(theme) || 0) + 1);
      const list = fundHits.get(theme) || [];
      if (!list.includes(fund.name)) list.push(fund.name);
      fundHits.set(theme, list);
    }
  }

  const shared = [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([theme, n]) => {
      const meta = themeMeta[theme];
      if (!meta) return null;
      const fundsLabel = (fundHits.get(theme) || []).join(", ");
      return {
        theme,
        funds: fundHits.get(theme) || [],
        text: `${meta.text} (${fundsLabel}; ${n} funds).`,
      };
    })
    .filter(Boolean);

  if (!shared.length) return null;
  return {
    title: "Across the councils",
    bullets: shared.map((s) => s.text),
  };
}

/**
 * Week-level session-frozen context: regime path across days, closing macro/narrative
 * briefs, per-fund Chair notes (closing session) + net posture (earliest→latest).
 */
function fetchSessionFrozenContext(funds, asOfDate, useCli) {
  if (!useCli || !asOfDate) {
    return {
      unavailable: true,
      reason: "cli_or_as_of_missing",
      macro: null,
      narrative: null,
      weekPath: null,
      chairByFundId: {},
      weekStoryByFundId: {},
    };
  }

  const candidates = [];
  const chairByFundId = {};
  const weekStoryByFundId = {};
  const sessionCache = new Map(); // `${fundId}:${sessionId}` -> sessionGet

  function getCached(fundId, sessionId) {
    if (!sessionId) return null;
    const key = `${fundId}:${sessionId}`;
    if (sessionCache.has(key)) return sessionCache.get(key);
    const sessionGet = fetchCouncilCliGet(fundId, sessionId);
    sessionCache.set(key, sessionGet);
    return sessionGet;
  }

  for (const fund of funds || []) {
    if (fund.group !== "guru-micro" && fund.group !== "micro") continue;

    const latestId = fund.latestWeekSessionId;
    const earliestId = fund.earliestWeekSessionId;
    if (!latestId) continue;

    const latestGet = getCached(fund.id, latestId);
    const summary = summarizePrepFromSessionGet(latestGet, fund.id, fund.name);
    const chairInsight = extractChairInsight(latestGet);
    if (chairInsight) {
      chairInsight.scope = "closing";
      chairInsight.scopeLabel = "Closing session";
      chairByFundId[fund.id] = chairInsight;
    }
    if (summary) candidates.push({ summary, sessionGet: latestGet });

    let earliestGet = null;
    if (earliestId && earliestId !== latestId) {
      earliestGet = getCached(fund.id, earliestId);
    } else {
      earliestGet = latestGet;
    }

    const startLocked = lockedPostureFromSession(earliestGet);
    const endLocked = lockedPostureFromSession(latestGet);
    const net = formatNetPosture(startLocked, endLocked);

    // Optional earlier material note from a mid-week session (not opening/closing).
    const earlierNotes = [];
    const timeline = fund.weekTimeline;
    if (timeline?.days?.length > 1) {
      const openingDay = timeline.days[0]?.day;
      const closingDay = timeline.days[timeline.days.length - 1]?.day;
      const midCandidates = timeline.days.filter(
        (d) => d.sessionId !== latestId && d.day !== openingDay && d.day !== closingDay
      );
      const sample =
        midCandidates.find((d) => d.beat === "hold" || d.beat === "blocked") ||
        midCandidates.find((d) => d.beat === "exec") ||
        timeline.days.find((d) => d.sessionId !== latestId && d.beat === "hold") ||
        timeline.days.find(
          (d) => d.sessionId !== latestId && d.sessionId !== earliestId && d.beat === "exec"
        );

      if (sample?.sessionId) {
        const midGet = getCached(fund.id, sample.sessionId);
        const midInsight = extractChairInsight(midGet);
        if (midInsight?.notes?.length) {
          const closingKeys = new Set(
            (chairInsight?.notes || []).map((n) => n.slice(0, 40).toLowerCase())
          );
          for (const note of midInsight.notes) {
            if (closingKeys.has(note.slice(0, 40).toLowerCase())) continue;
            earlierNotes.push({
              day: sample.day,
              weekday: sample.weekday,
              beat: sample.label,
              text: note,
            });
            if (earlierNotes.length >= 1) break;
          }
        }
      }
    }

    weekStoryByFundId[fund.id] = {
      timeline: timeline || null,
      netPosture: net,
      earlierNotes,
      closingSessionId: latestId,
      openingSessionId: earliestId || latestId,
    };
  }

  // Regime path: sample one session per calendar day from the densest fund's timeline.
  const densest = (funds || [])
    .filter((f) => f.group === "guru-micro" || f.group === "micro")
    .filter((f) => f.weekTimeline?.days?.length)
    .sort((a, b) => (b.weekTimeline.sessionCount || 0) - (a.weekTimeline.sessionCount || 0))[0];

  const weekPathPoints = [];
  if (densest?.weekTimeline?.days?.length) {
    for (const day of densest.weekTimeline.days) {
      const sessionGet = getCached(densest.id, day.sessionId);
      const regime = regimeFromSessionGet(sessionGet);
      if (!regime) continue;
      weekPathPoints.push({
        day: day.day,
        weekday: day.weekday,
        beat: day.label,
        regimeCode: regime.code,
        regimeLabel: regime.label,
        observed: regime.observed,
        effective: regime.effective,
        fundName: densest.name,
      });
    }
  }

  // Fill any missing days from other funds' closing sessions if densest was sparse.
  if (weekPathPoints.length < 2) {
    for (const fund of funds || []) {
      if (!fund.latestWeekSessionId) continue;
      const sessionGet = getCached(fund.id, fund.latestWeekSessionId);
      const regime = regimeFromSessionGet(sessionGet);
      const day = (sessionGet?.summary?.started_at || "").slice(0, 10);
      if (!regime || !day) continue;
      if (weekPathPoints.some((p) => p.day === day)) continue;
      weekPathPoints.push({
        day,
        weekday: weekdayShort(day),
        beat: "session",
        regimeCode: regime.code,
        regimeLabel: regime.label,
        observed: regime.observed,
        effective: regime.effective,
        fundName: fund.name,
      });
    }
  }

  weekPathPoints.sort((a, b) => a.day.localeCompare(b.day));

  let weekPath = null;
  if (weekPathPoints.length) {
    const codes = weekPathPoints.map((p) => p.regimeCode);
    const unique = [...new Set(codes)];
    const start = weekPathPoints[0];
    const end = weekPathPoints[weekPathPoints.length - 1];
    const changed = start.regimeCode !== end.regimeCode;
    weekPath = {
      points: weekPathPoints,
      label: changed
        ? `${start.regimeLabel} → ${end.regimeLabel}`
        : `${end.regimeLabel} all week`,
      changed,
      sourceFundName: densest?.name || end.fundName,
      uniqueCodes: unique,
    };
  }

  if (!candidates.length) {
    return {
      unavailable: true,
      reason: "no_in_week_sessions",
      macro: null,
      narrative: null,
      weekPath,
      chairByFundId,
      weekStoryByFundId,
    };
  }

  candidates.sort((a, b) =>
    String(b.summary.startedAt || "").localeCompare(String(a.summary.startedAt || ""))
  );
  const chosen = candidates[0];
  const { summary, sessionGet } = chosen;

  const macroUuid = artifactUuidFromRef(summary.macroRef);
  const narrativeUuid = artifactUuidFromRef(summary.narrativeRef);
  const macroArtifact = macroUuid ? fetchCouncilCliArtifact(summary.fundId, macroUuid) : null;
  const narrativeArtifact = narrativeUuid
    ? fetchCouncilCliArtifact(summary.fundId, narrativeUuid)
    : null;

  const macroContent = macroArtifact?.content || {};
  const narrativeContent = narrativeArtifact?.content || {};
  const regimeCode = String(
    macroContent.effective_regime ||
      summary.effectiveRegime ||
      macroContent.observed_regime ||
      summary.observedRegime ||
      ""
  ).trim();
  const regimeDisplay = friendlyRegimeLabel(regimeCode) || regimeCode || null;

  // Tape motif from closing narrative + Chair soft-tape themes across funds.
  const tapeSignals = [];
  for (const signal of narrativeContent.signals || []) {
    if (signal) tapeSignals.push(truncateInsight(signal, 180));
  }
  const softTapeFunds = (funds || [])
    .filter((f) => (chairByFundId[f.id]?.themes || []).includes("soft_tape"))
    .map((f) => f.name);
  let tapeMotif = null;
  if (softTapeFunds.length >= 2 || tapeSignals.length) {
    tapeMotif = {
      label: softTapeFunds.length ? "Soft narrative tape" : "Narrative tape",
      summary: truncateInsight(narrativeContent.summary || summary.narrativeSummary, 200),
      signals: tapeSignals.slice(0, 2),
      funds: softTapeFunds,
    };
  }

  // Closing posture intent omitted here: cash/base/beta targets differ per fund.
  // Per-fund Closing session + week-net posture carry those numbers.

  return {
    unavailable: false,
    reason: null,
    source: {
      fundId: summary.fundId,
      fundName: summary.fundName,
      sessionId: summary.sessionId,
      startedAt: summary.startedAt,
      asOf: macroContent.as_of || narrativeContent.as_of || asOfDate,
      scope: "week_closing_briefs",
    },
    weekPath,
    tapeMotif,
    macro: {
      summary: macroContent.summary || summary.macroSummary,
      asOf: macroContent.as_of || null,
      observedRegime: macroContent.observed_regime || summary.observedRegime,
      effectiveRegime: macroContent.effective_regime || summary.effectiveRegime,
      regimeLabel: regimeDisplay,
      regimeCode,
      regimeHoldState: macroContent.regime_hold_state || null,
    },
    narrative: {
      summary: narrativeContent.summary || summary.narrativeSummary,
      asOf: narrativeContent.as_of || null,
      signals: narrativeContent.signals || [],
    },
    chairByFundId,
    weekStoryByFundId,
    perFund: candidates.map((c) => ({
      fundId: c.summary.fundId,
      fundName: c.summary.fundName,
      sessionId: c.summary.sessionId,
      macroSummary: c.summary.macroSummary,
      narrativeSummary: c.summary.narrativeSummary,
      effectiveRegime: c.summary.effectiveRegime,
    })),
  };
}

async function safeFetch(url, { retries = 2, timeoutMs = 12000 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (!res.ok) {
        if (attempt < retries) continue;
        return null;
      }
      return await res.json();
    } catch {
      if (attempt === retries) return null;
    }
  }
  return null;
}

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function fmtShortDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function retClass(pct) {
  if (pct === null || pct === undefined) return "neu";
  return pct >= 0 ? "pos" : "neg";
}

function fmtPct(pct, decimals = 1) {
  if (pct === null || pct === undefined) return "n/a";
  const v = Number(pct).toFixed(decimals);
  return pct >= 0 ? `+${v}%` : `${v}%`;
}

function fmtNav(usd) {
  if (usd == null) return "n/a";
  const n = Number(usd);
  if (n >= 1000) return `$${Math.round(n / 1000 * 10) / 10}k`;
  return `$${Math.round(n * 100) / 100}`;
}

function roundPct(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Math.round(Number(value) * 10) / 10;
}

/**
 * Full-book composition: cash + base sleeves plus high-beta names.
 * Weights are fund NAV percentages so the bar reads as the whole posture.
 */
function buildBookComposition(positions, statusData = null) {
  const list = Array.isArray(positions) ? positions : [];
  const cashPos = list.filter((p) => p.position_type === "cash" && Number(p.weight_pct) > 0);
  const basePos = list.filter((p) => p.position_type === "base" && Number(p.weight_pct) > 0);
  const betaPos = list
    .filter((p) => p.position_type === "beta" && Number(p.weight_pct) > 0)
    .sort((a, b) => Number(b.weight_pct) - Number(a.weight_pct));

  let cashPct = cashPos.reduce((sum, p) => sum + Number(p.weight_pct || 0), 0);
  let basePct = basePos.reduce((sum, p) => sum + Number(p.weight_pct || 0), 0);
  let betaPct = betaPos.reduce((sum, p) => sum + Number(p.weight_pct || 0), 0);

  // Fallback when position rows are missing but sleeve USD totals exist.
  const nav = Number(statusData?.nav_usd);
  if ((!cashPct && !basePct && !betaPct) && nav > 0) {
    cashPct = (Number(statusData.cash_usd || 0) / nav) * 100;
    basePct = (Number(statusData.base_usd || 0) / nav) * 100;
    betaPct = (Number(statusData.high_beta_usd || 0) / nav) * 100;
  }

  const segments = [];
  if (cashPct > 0.05) {
    const cashSymbol = cashPos[0]?.symbol?.toUpperCase() || "USDC";
    segments.push({
      symbol: "CASH",
      detail: cashSymbol,
      weight: roundPct(cashPct).toFixed(1),
      pnl: null,
      color: "#64748b",
      warning: false,
      kind: "cash",
    });
  }
  if (basePct > 0.05) {
    const baseSymbol = basePos[0]?.symbol?.toUpperCase() || "WETH";
    segments.push({
      symbol: "BASE",
      detail: baseSymbol,
      weight: roundPct(basePct).toFixed(1),
      pnl: null,
      color: "#94a3b8",
      warning: false,
      kind: "base",
    });
  }
  betaPos.forEach((p, i) => {
    segments.push({
      symbol: p.symbol.toUpperCase(),
      detail: null,
      weight: Number(p.weight_pct).toFixed(1),
      pnl: p.unrealized_pnl_usd != null ? Number(p.unrealized_pnl_usd) : null,
      color: BAR_COLOURS[i % BAR_COLOURS.length],
      warning: p.unrealized_pnl_usd != null && p.unrealized_pnl_usd < -50,
      kind: "beta",
    });
  });

  if (!segments.length) {
    return { holdingsBar: [], bookPosture: null, hasHoldingsBar: false };
  }

  const posture = {
    cash: roundPct(cashPct),
    base: roundPct(basePct),
    beta: roundPct(betaPct),
    label: [
      cashPct > 0.05 ? `Cash ${roundPct(cashPct)}%` : null,
      basePct > 0.05 ? `Base ${roundPct(basePct)}%` : null,
      betaPct > 0.05 ? `High-beta ${roundPct(betaPct)}%` : null,
    ]
      .filter(Boolean)
      .join(" · "),
  };

  return {
    holdingsBar: segments,
    bookPosture: posture,
    hasHoldingsBar: true,
  };
}

/** @deprecated Prefer buildBookComposition; kept for callers that only need beta rows. */
function buildHoldingsBar(positions) {
  return buildBookComposition(positions).holdingsBar.filter((s) => s.kind === "beta");
}

function parseAppearances(reason) {
  const m = String(reason || "").match(/(\d+)\/(\d+)\s+source run/i);
  return m ? { hit: parseInt(m[1], 10), total: parseInt(m[2], 10) } : null;
}

function deriveSignals(funds) {
  const bySymbol = new Map();

  for (const fund of funds) {
    for (const c of fund.screening?.aggCandidates || []) {
      const sym = c.symbol.toUpperCase();
      const apps = parseAppearances(c.reason);
      const entry = bySymbol.get(sym) || {
        symbol: sym,
        name: c.name,
        funds: new Set(),
        reasons: [],
        maxHit: 0,
        maxTotal: 0,
      };
      entry.funds.add(fund.name);
      entry.reasons.push(c.reason);
      if (apps && apps.hit >= entry.maxHit) {
        entry.maxHit = apps.hit;
        entry.maxTotal = apps.total;
      }
      bySymbol.set(sym, entry);
    }
  }

  let signalExample = null;
  let bestScore = -1;
  for (const entry of bySymbol.values()) {
    const score = entry.maxHit * 10 + entry.funds.size;
    if (score > bestScore) {
      bestScore = score;
      const fundList = [...entry.funds].join(" and ");
      const persist =
        entry.maxTotal > 0
          ? `${entry.maxHit}/${entry.maxTotal} daily runs`
          : "multiple screening runs";
      signalExample = {
        symbol: entry.symbol,
        name: entry.name,
        body: `Appeared in <strong>${persist}</strong> across ${fundList} over the ${funds[0]?.screening?.aggLookback || 7}-day lookback. ${entry.reasons[0] || "Persistent cross-signal strength, not a one-day spike."}`,
        tags: [
          entry.maxTotal > 0 && entry.maxHit === entry.maxTotal ? `${entry.maxHit}/${entry.maxTotal} days` : `${entry.funds.size}-fund`,
          "aggregate",
        ].filter(Boolean),
      };
    }
  }

  let riskReject = null;
  for (const fund of funds) {
    if (!fund?.holdingsBar?.length) continue;
    const warned = fund.holdingsBar
      .filter((h) => h.warning && h.pnl != null)
      .sort((a, b) => a.pnl - b.pnl);
    if (!warned.length) continue;
    const w = warned[0];
    riskReject = {
      symbol: w.symbol,
      name: w.symbol,
      fundName: fund.name,
      body: `Held in book with unrealized ~$${w.pnl}. Flagged in council rotation — no longer passes aggregate screening discipline. Price alone does not override a failed screen.`,
      tags: ["not screened", `$${w.pnl} pnl`, "rotate out"],
    };
    break;
  }

  if (!riskReject) {
    for (const fund of funds) {
      if (!fund?.council?.riskNotes) continue;
      riskReject = {
        symbol: fund.name,
        name: fund.name,
        fundName: fund.name,
        body: fund.council.riskNotes.split(";")[0].trim(),
        tags: ["council reject", "rotate out"],
      };
      break;
    }
  }

  return { signalExample, riskReject };
}

function fundUpdateWeekRange(asOfDate) {
  const end = new Date(`${asOfDate}T12:00:00Z`);
  const day = end.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(end);
  monday.setUTCDate(end.getUTCDate() + mondayOffset);
  return {
    weekStart: monday.toISOString().slice(0, 10),
    weekEnd: asOfDate,
  };
}

function sessionDateIsoFromCouncilItem(item) {
  if (item.generated_at) return String(item.generated_at).slice(0, 10);
  const refs = item.source_artifact_refs || [];
  const dates = refs.map((r) => r.created_at).filter(Boolean).sort();
  if (dates.length) return dates[0].slice(0, 10);
  return null;
}

function targetFinalizationLooksBlocked(targetBody, outcome) {
  if (!targetBody) return outcome === "blocked";
  if (/requires review|\bblocked\b/i.test(targetBody)) return true;
  if (/requires override|override support|override requirement/i.test(targetBody)) return true;
  if (/no override requirements?/i.test(targetBody)) return false;
  return outcome === "blocked";
}

function classifyCouncilSession(parsed, cliItem) {
  const outcomeKind = cliItem?.outcome_kind || null;
  if (outcomeKind === "executed_reconciled") return "executed";
  if (outcomeKind === "maintain_current") return "hold";
  if (outcomeKind === "blocked") return "blocked";
  if (outcomeKind === "target_change") return "other";
  // Public meeting presentation outcomes (council/meetings)
  if (parsed.meetingOutcome === "traded" || parsed.outcome === "traded") return "executed";
  if (parsed.meetingOutcome === "held" || parsed.outcome === "held") return "hold";
  if (parsed.outcome === "executed_reconciled") return "executed";
  if (parsed.outcome === "maintain_current") return "hold";
  if (
    parsed.outcome === "target_change" &&
    /executed reconciled/i.test(parsed.outcomeLabel || "")
  ) {
    return "executed";
  }
  if (cliItem?.fund_mutated === true && cliItem?.execution_status === "resolved") return "executed";
  if (targetFinalizationLooksBlocked(parsed.targetFinalization, parsed.outcome)) return "blocked";
  return "other";
}

function summarizeCouncilWeek(publicItems, cliItems, asOfDate) {
  if (!asOfDate) return null;

  const { weekStart, weekEnd } = fundUpdateWeekRange(asOfDate);
  const cliBySession = new Map((cliItems || []).map((item) => [item.session_id, item]));

  const publicInWeek = (publicItems || []).filter((item) => {
    const sessionDate = sessionDateIsoFromCouncilItem(item);
    return sessionDate && sessionDate >= weekStart && sessionDate <= weekEnd;
  });

  const cliInWeek = (cliItems || []).filter((session) => {
    const day = session.started_at && session.started_at.slice(0, 10);
    return day && day >= weekStart && day <= weekEnd;
  });

  // Prefer CLI list for week coverage (includes target_change / non-meeting sessions).
  const sourceItems = cliInWeek.length > 0 ? cliInWeek : publicInWeek;
  if (!sourceItems.length) return null;

  let executedRotations = 0;
  let holdSessions = 0;
  let blockedSessions = 0;
  let targetSessions = 0;

  for (const item of sourceItems) {
    const isCliRow = Boolean(item.outcome_kind || item.started_at);
    const parsed = isCliRow
      ? {
          outcome: item.outcome_kind || null,
          outcomeLabel: item.outcome_kind || null,
          meetingOutcome: null,
          targetFinalization: null,
        }
      : parseCouncilItem(item);
    const cliItem = cliBySession.get(item.session_id) || (item.outcome_kind ? item : null);
    const kind = classifyCouncilSession(parsed, cliItem);
    if (kind === "executed") executedRotations += 1;
    else if (kind === "hold") holdSessions += 1;
    else if (kind === "blocked") blockedSessions += 1;
    else if (item.outcome_kind === "target_change" || parsed.outcome === "target_change") {
      targetSessions += 1;
    }
  }

  const classified = executedRotations + holdSessions + blockedSessions;
  const totalSessions = sourceItems.length;

  return {
    weekStart,
    weekEnd,
    totalSessions,
    executedRotations,
    holdSessions,
    blockedSessions,
    targetSessions,
    unclassifiedSessions: Math.max(0, totalSessions - classified - targetSessions),
  };
}

function fetchCouncilCliList(fundId, limit = 25) {
  try {
    const raw = execSync(
      `npx -y @messyvirgo/cli@0.41.0 funds council list ${fundId} --limit ${limit} --json`,
      { encoding: "utf8", timeout: 45000, stdio: ["pipe", "pipe", "pipe"] }
    );
    const start = raw.indexOf("{");
    if (start === -1) return [];
    const d = JSON.parse(raw.slice(start));
    return d.items || [];
  } catch {
    return [];
  }
}

function fetchCouncilCliLatest(fundId, asOfDate) {
  const items = fetchCouncilCliList(fundId, asOfDate ? 25 : 1);
  if (!items.length) return null;

  let item = items[0];
  if (asOfDate) {
    const eligible = items
      .filter((session) => session.started_at && session.started_at.slice(0, 10) <= asOfDate)
      .sort((a, b) => b.started_at.localeCompare(a.started_at));
    if (!eligible.length) return null;
    item = eligible[0];
  }

  return {
    outcome: item.outcome_kind || (item.execution_status === "running" ? "in_progress" : "unknown"),
    outcomeKind: item.outcome_kind || null,
    outcomeLabel: (item.outcome_kind || "in progress").replace(/_/g, " "),
    date: item.started_at ? fmtDate(item.started_at) : null,
    shortDate: item.started_at ? fmtShortDate(item.started_at) : null,
    headline: item.headline,
    executionStatus: item.execution_status,
    riskNotes: null,
  };
}

function councilContentSections(structuredContent) {
  if (!structuredContent || typeof structuredContent !== "object") return [];
  return structuredContent.sections || structuredContent.chapters || [];
}

function councilSectionBody(sections, ...headings) {
  for (const heading of headings) {
    const section = (sections || []).find((s) => s.heading === heading);
    if (section?.body?.trim()) return section.body.trim();
  }
  return null;
}

function inferCouncilOutcome({ decisions, title, summary, resolutionBody, executionBody }) {
  if (Array.isArray(decisions) && decisions[0] && decisions[0] !== "unknown") {
    return decisions[0];
  }

  const text = [title, summary, resolutionBody, executionBody].filter(Boolean).join(" ");
  if (/target[-\s]?change|ratified a target-change/i.test(text)) return "target_change";
  if (/maintain[_\s-]?current|maintained current|pure hold was (?:available but )?not chosen/i.test(text)) {
    return "maintain_current";
  }
  if (/executed[_\s-]?reconciled|rebalance executed and reconciled|fund was mutated/i.test(text)) {
    return "executed_reconciled";
  }
  if (/requires review|blocked|override/i.test(text)) return "blocked";
  return "unknown";
}

function buildCouncilOutcomeLabel(outcome, { summary, executionBody, cliOutcomeKind }) {
  const executed =
    cliOutcomeKind === "executed_reconciled" ||
    /executed and reconciled|executed_reconciled|fund was mutated/i.test(
      `${summary || ""} ${executionBody || ""}`
    );

  if (outcome === "target_change" && executed) return "target change · executed reconciled";
  if (cliOutcomeKind && cliOutcomeKind !== "unknown") return cliOutcomeKind.replace(/_/g, " ");
  return outcome.replace(/_/g, " ");
}

function firstSentence(text) {
  if (!text) return null;
  const sentence = text.split(/(?<=[.!?])\s+/)[0]?.trim();
  return sentence || text.trim();
}

function parseCertificationStatus(body) {
  if (!body) return { certified: null, label: null };
  if (/not recorded/i.test(body)) return { certified: false, label: "not certified" };
  if (/certified/i.test(body)) return { certified: true, label: "certified" };
  return { certified: null, label: body.split(/[.!]/)[0].trim() };
}

function parseCouncilMeetingItem(item) {
  const sessionDate = item.generated_at || null;
  const meetingOutcome = item.outcome || null;
  const summary = item.summary || null;
  const title = item.title || null;
  const traded = meetingOutcome === "traded" || (item.executed_leg_count || 0) > 0;
  const held = meetingOutcome === "held";
  const outcome = traded
    ? "executed_reconciled"
    : held
      ? "maintain_current"
      : "unknown";
  const outcomeLabel = traded
    ? "executed reconciled"
    : held
      ? "maintain current"
      : (meetingOutcome || "unknown").replace(/_/g, " ");

  return {
    outcome,
    meetingOutcome,
    outcomeLabel,
    date: fmtDate(sessionDate),
    shortDate: fmtShortDate(sessionDate),
    sessionDateIso: sessionDate ? String(sessionDate).slice(0, 10) : null,
    headline: firstSentence(summary || title),
    riskNotes: null,
    certified: null,
    certificationLabel: null,
    targetFinalization: null,
    targetFinalizationBlocked: false,
    actionItems: null,
    executionStatus: "resolved",
    executedLegCount: item.executed_leg_count ?? null,
  };
}

function parseCouncilItem(item) {
  // Prefer the compact public meeting presentation when present.
  if (item && (item.outcome === "traded" || item.outcome === "held") && !item.structured_content) {
    return parseCouncilMeetingItem(item);
  }

  const refs = item.source_artifact_refs || [];
  const dates = refs.map((r) => r.created_at).filter(Boolean).sort();
  const sessionDate = dates.length ? dates[0] : item.generated_at || null;
  const sc = item.structured_content || {};
  const sections = councilContentSections(sc);
  const decisions = sc.decisions || [];
  const summary = sc.summary || item.summary || null;
  const title = sc.title || item.title || null;
  const resolutionBody = councilSectionBody(sections, "Resolution & Decision");
  const executionBody = councilSectionBody(
    sections,
    "Preparation of Changes & Execution",
    "Changes & Execution"
  );
  const outcome = inferCouncilOutcome({
    decisions,
    title,
    summary,
    resolutionBody,
    executionBody,
  });
  const riskBody = councilSectionBody(
    sections,
    "Risk Notes",
    "Risk Notes & Evidence Limitations"
  );
  const certBody = councilSectionBody(sections, "Certification");
  const targetBody = councilSectionBody(
    sections,
    "Target Finalization",
    "Target Finalization & Certification"
  );
  const actionBody = councilSectionBody(
    sections,
    "Action Items",
    "Closing Notes & Action Items"
  );
  const { certified, label: certificationLabel } = parseCertificationStatus(
    [certBody, targetBody].filter(Boolean).join(" ") || null
  );
  const targetFinalizationBlocked = targetFinalizationLooksBlocked(targetBody, outcome);

  return {
    outcome,
    outcomeLabel: buildCouncilOutcomeLabel(outcome, { summary, executionBody }),
    date: fmtDate(sessionDate),
    shortDate: fmtShortDate(sessionDate),
    sessionDateIso: sessionDate ? String(sessionDate).slice(0, 10) : null,
    headline: firstSentence(summary || title),
    riskNotes: firstSentence(riskBody),
    certified,
    certificationLabel,
    targetFinalization: targetBody ? firstSentence(targetBody) : null,
    targetFinalizationBlocked,
    actionItems: actionBody ? firstSentence(actionBody) : null,
    executionStatus: "resolved",
  };
}

async function fetchCouncilPublic(fundId, asOfDate) {
  // Public list surface is council/meetings (compact presentation).
  // Legacy council/sessions list is no longer exposed publicly.
  const data = await safeFetch(`${API}/funds/${fundId}/council/meetings?limit=40`);
  if (!data?.items?.length) return { council: null, publicItems: [] };

  let item = data.items[0];
  if (asOfDate) {
    const eligible = data.items
      .map((session) => ({ session, council: parseCouncilItem(session) }))
      .filter(({ council }) => council.sessionDateIso && council.sessionDateIso <= asOfDate)
      .sort((a, b) => b.council.sessionDateIso.localeCompare(a.council.sessionDateIso));
    if (!eligible.length) return { council: null, publicItems: data.items };
    item = eligible[0].session;
  }

  const council = parseCouncilItem(item);
  delete council.sessionDateIso;
  return { council, publicItems: data.items };
}

async function fetchCouncil(fundId, useCli, asOfDate) {
  let council = useCli ? fetchCouncilCliLatest(fundId, asOfDate) : null;
  const cliItems = useCli ? fetchCouncilCliList(fundId, asOfDate ? 40 : 1) : [];
  const latestWeek = useCli ? pickLatestCliSessionInWeek(cliItems, asOfDate) : null;
  const earliestWeek = useCli ? pickEarliestCliSessionInWeek(cliItems, asOfDate) : null;
  const weekTimeline = useCli ? buildWeekTimeline(cliItems, asOfDate) : null;
  const { council: publicCouncil, publicItems } = await fetchCouncilPublic(fundId, asOfDate);
  const weekSummary = summarizeCouncilWeek(publicItems, cliItems, asOfDate);

  if (council && publicCouncil) {
    const cliOutcomeKnown =
      council.outcome && council.outcome !== "in_progress" && council.outcome !== "unknown";
    const publicOutcomeKnown =
      publicCouncil.outcome && publicCouncil.outcome !== "unknown";
    const outcome =
      publicCouncil.outcome === "target_change" || publicCouncil.outcome === "maintain_current"
        ? publicCouncil.outcome
        : cliOutcomeKnown
          ? council.outcome
          : publicOutcomeKnown
            ? publicCouncil.outcome
            : council.outcome;
    council = {
      ...publicCouncil,
      ...council,
      outcome,
      outcomeLabel:
        publicCouncil.outcomeLabel && publicCouncil.outcomeLabel !== "unknown"
          ? publicCouncil.outcomeLabel
          : buildCouncilOutcomeLabel(outcome, {
              summary: publicCouncil.headline,
              executionBody: null,
              cliOutcomeKind: council.outcomeKind || council.outcome,
            }),
      headline: publicCouncil.headline || council.headline,
      riskNotes: publicCouncil.riskNotes || council.headline,
      date: publicCouncil.date || council.date,
      shortDate: publicCouncil.shortDate || council.shortDate,
      targetFinalization: publicCouncil.targetFinalization,
      targetFinalizationBlocked: publicCouncil.targetFinalizationBlocked,
      actionItems: publicCouncil.actionItems,
      certified: publicCouncil.certified ?? council.certified,
      certificationLabel: publicCouncil.certificationLabel ?? council.certificationLabel,
    };
  } else {
    council = council || publicCouncil;
  }

  if (council?.executionStatus === "running" || council?.executionStatus === "queued") {
    council.outcomeLabel = `${council.executionStatus} — check app`;
    council.riskNotes = council.headline || "Council session still in progress.";
  }

  return { council, weekSummary, latestWeekSessionId: latestWeek?.session_id || null, earliestWeekSessionId: earliestWeek?.session_id || null, weekTimeline, cliItems };
}

async function fetchScreening(fundId, sleeveId, asOfDate) {
  const aggUrl = asOfDate
    ? `${API}/funds/${fundId}/sleeves/${sleeveId}/screen-aggregate-runs/latest?as_of_date=${asOfDate}`
    : `${API}/funds/${fundId}/sleeves/${sleeveId}/screen-aggregate-runs/latest`;
  const [runData, aggData] = await Promise.all([
    safeFetch(`${API}/funds/${fundId}/screen-runs?limit=30`),
    safeFetch(aggUrl),
  ]);

  const runItem = asOfDate
    ? (runData?.items || []).find((r) => r.run_date === asOfDate)
    : runData?.items?.[0];

  const aggCandidates =
    aggData?.candidates?.slice(0, 3).map((c) => ({
      rank: c.rank,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      reason: c.candidate_reason,
    })) || [];

  return {
    runDate: runItem?.run_date
      ? fmtDate(runItem.run_date + "T00:00:00Z")
      : null,
    aggDate: aggData?.as_of_date ? fmtDate(aggData.as_of_date + "T00:00:00Z") : null,
    aggLookback: aggData?.execution_trace?.lookback_days || 7,
    aggSourceRuns: aggData?.execution_trace?.source_run_ids?.length || 0,
    aggCandidates,
  };
}

function performancePointByDate(points, asOfDate) {
  return (points || []).find((p) => p.snapshot_date === asOfDate) || null;
}

function performancePointOnOrBefore(points, asOfDate) {
  const eligible = (points || []).filter((p) => p.snapshot_date <= asOfDate);
  return eligible.length ? eligible[eligible.length - 1] : null;
}

function computeTwrReturns(returnPoints, idx) {
  const cumAt = (i) => {
    const pt = returnPoints[i];
    if (!pt || i < 0 || pt.return_state === "unavailable") return null;
    const value = Number(pt.cumulative_return_pct);
    return Number.isFinite(value) ? value : null;
  };

  const periodReturn = (endIdx, startIdx) => {
    const cEnd = cumAt(endIdx);
    const cStart = cumAt(startIdx);
    if (cEnd == null || cStart == null || startIdx < 0) return null;
    return ((1 + cEnd / 100) / (1 + cStart / 100) - 1) * 100;
  };

  let ret30d = periodReturn(idx, idx - 30);
  let ret30dWindowDays = null;
  if (ret30d == null && idx >= 1) {
    ret30d = periodReturn(idx, 0);
    ret30dWindowDays = idx;
  }

  return {
    ret1d: periodReturn(idx, idx - 1),
    ret7d: periodReturn(idx, idx - 7),
    ret30d,
    ret30dWindowDays,
  };
}

function resolvePerformanceReturns({ points, returnPoints, effectiveDate }) {
  const idx = (points || []).findIndex((p) => p.snapshot_date === effectiveDate);
  if (idx === -1) return { ret1d: null, ret7d: null, ret30d: null, ret30dWindowDays: null };

  if (
    Array.isArray(returnPoints) &&
    returnPoints.length === points.length &&
    returnPoints.length > 0 &&
    returnPoints.some((pt) => pt.return_state === "available")
  ) {
    return computeTwrReturns(returnPoints, idx);
  }

  return computePerformanceReturns(points, effectiveDate);
}

function latestPerformanceSnapshotDate(points) {
  if (!Array.isArray(points) || !points.length) return null;
  return points[points.length - 1].snapshot_date || null;
}

function shouldUseLiveStatus(asOfDate, latestSnapshotDate) {
  if (!asOfDate || !latestSnapshotDate) return !asOfDate;
  return asOfDate >= latestSnapshotDate;
}

function computePerformanceReturns(points, asOfDate) {
  const idx = (points || []).findIndex((p) => p.snapshot_date === asOfDate);
  if (idx === -1) return { ret1d: null, ret7d: null, ret30d: null, ret30dWindowDays: null };

  const navAt = (i) => {
    const pt = points[i];
    return pt && i >= 0 ? Number(pt.nav_usd) : null;
  };
  const pct = (current, prior) =>
    prior != null && prior !== 0 ? ((current - prior) / prior) * 100 : null;

  const currentNav = navAt(idx);
  let ret30d = pct(currentNav, navAt(idx - 30));
  let ret30dWindowDays = null;
  if (ret30d == null && idx >= 1) {
    ret30d = pct(currentNav, navAt(0));
    ret30dWindowDays = idx;
  }

  return {
    ret1d: pct(currentNav, navAt(idx - 1)),
    ret7d: pct(currentNav, navAt(idx - 7)),
    ret30d,
    ret30dWindowDays,
  };
}

async function supplementPerformanceWindows(statusData, fundId) {
  if (!statusData || statusData.historical) return statusData;
  if (
    statusData.performance_1d_pct != null &&
    statusData.performance_7d_pct != null &&
    statusData.performance_30d_pct != null
  ) {
    return statusData;
  }

  const data = await safeFetch(`${API}/funds/${fundId}/performance`, {
    retries: 1,
    timeoutMs: 15000,
  });
  const points = data?.points || [];
  const returnPoints = data?.return_points || [];
  if (points.length < 2) return statusData;

  const idx = points.length - 1;
  const effectiveDate = points[idx].snapshot_date;
  const returns = resolvePerformanceReturns({ points, returnPoints, effectiveDate });

  if (statusData.performance_1d_pct == null) statusData.performance_1d_pct = returns.ret1d;
  if (statusData.performance_7d_pct == null) statusData.performance_7d_pct = returns.ret7d;
  if (statusData.performance_30d_pct == null) {
    statusData.performance_30d_pct = returns.ret30d;
    statusData.performance_30d_window_days = returns.ret30dWindowDays;
  }
  return statusData;
}

function retWindowLabel(statusData, window) {
  if (window !== "30d") return window;
  if (statusData?.performance_30d_window_days) {
    return `${statusData.performance_30d_window_days}d*`;
  }
  return "30d";
}

async function fetchFundStatusHistorical(fundId, asOfDate) {
  const data = await safeFetch(`${API}/funds/${fundId}/performance`, {
    retries: 2,
    timeoutMs: 20000,
  });
  const points = data?.points || [];
  const returnPoints = data?.return_points || [];
  const point =
    performancePointByDate(points, asOfDate) ||
    performancePointOnOrBefore(points, asOfDate);
  if (!point) return null;

  const effectiveDate = point.snapshot_date;
  const returns = resolvePerformanceReturns({ points, returnPoints, effectiveDate });
  const navUsd = Number(point.nav_usd);
  const baseUsd = Number(point.base_usd || 0);
  const basePositions =
    baseUsd > 0
      ? [{ symbol: "WETH", value: `$${Math.round(baseUsd)}`, pnl: null }]
      : [];

  return {
    nav_usd: navUsd,
    performance_1d_pct: returns.ret1d,
    performance_7d_pct: returns.ret7d,
    performance_30d_pct: returns.ret30d,
    performance_30d_window_days: returns.ret30dWindowDays,
    effectiveSnapshotDate: effectiveDate,
    positions: [],
    basePositions,
    price_as_of: point.provider_observed_at || point.snapshot_at || null,
    positionCount: 0,
    historical: true,
  };
}

async function fetchLatestPerformanceMeta(fundId) {
  const data = await safeFetch(`${API}/funds/${fundId}/performance`, {
    retries: 1,
    timeoutMs: 15000,
  });
  return {
    latestSnapshotDate: latestPerformanceSnapshotDate(data?.points || []),
  };
}

async function fetchFund({ id, name, sleeveId, group }, useCli, asOfDate) {
  const perfMeta = await fetchLatestPerformanceMeta(id);
  const latestSnapshotDate = perfMeta.latestSnapshotDate;
  const useLiveStatus = shouldUseLiveStatus(asOfDate, latestSnapshotDate);

  let statusData = null;
  if (asOfDate && !useLiveStatus) {
    statusData = await fetchFundStatusHistorical(id, asOfDate);
  }
  if (!statusData) {
    statusData = await safeFetch(`${API}/funds/${id}/status`, {
      retries: 2,
      timeoutMs: 20000,
    });
  } else if (useLiveStatus) {
    const liveStatus = await safeFetch(`${API}/funds/${id}/status`, {
      retries: 2,
      timeoutMs: 20000,
    });
    if (liveStatus) {
      statusData = {
        ...liveStatus,
        nav_usd: liveStatus.nav_usd ?? statusData.nav_usd,
        performance_1d_pct: liveStatus.performance_1d_pct ?? statusData.performance_1d_pct,
        performance_7d_pct: liveStatus.performance_7d_pct ?? statusData.performance_7d_pct,
        performance_30d_pct: liveStatus.performance_30d_pct ?? statusData.performance_30d_pct,
        performance_30d_window_days: statusData.performance_30d_window_days,
        historical: false,
      };
    }
  }
  if (statusData) {
    statusData = await supplementPerformanceWindows(statusData, id);
  }
  const councilAsOf = asOfDate || new Date().toISOString().slice(0, 10);
  const [councilResult, screening] = await Promise.all([
    fetchCouncil(id, useCli, councilAsOf),
    fetchScreening(id, sleeveId, asOfDate),
  ]);
  const council = councilResult?.council ?? null;
  const councilWeek = councilResult?.weekSummary ?? null;
  const latestWeekSessionId = councilResult?.latestWeekSessionId ?? null;
  const earliestWeekSessionId = councilResult?.earliestWeekSessionId ?? null;
  const weekTimeline = councilResult?.weekTimeline ?? null;

  if (!statusData) return { id, name, group, error: true };

  const nav = fmtNav(statusData.nav_usd);
  const ret1d = statusData.performance_1d_pct ?? null;
  const ret7d = statusData.performance_7d_pct ?? null;
  const ret30d = statusData.performance_30d_pct ?? null;

  const basePositions = statusData.basePositions
    || (statusData.positions || [])
      .filter((p) => p.position_type === "base" && p.current_value_usd > 0)
      .map((p) => ({
        symbol: p.symbol.toUpperCase(),
        value: `$${Math.round(p.current_value_usd).toLocaleString()}`,
        pnl:
          p.unrealized_pnl_usd != null
            ? `${p.unrealized_pnl_usd > 0 ? "+" : ""}$${Math.round(p.unrealized_pnl_usd)}`
            : null,
      }));

  const book = statusData.historical
    ? buildBookComposition([], statusData)
    : buildBookComposition(statusData.positions || [], statusData);

  return {
    id,
    name,
    group: group || "guru",
    appUrl: `https://app.messyvirgo.com/funds/${id}`,
    councilUrl: `https://app.messyvirgo.com/funds/${id}/council`,
    nav,
    ret1d: { value: fmtPct(ret1d), cls: retClass(ret1d) },
    ret7d: { value: fmtPct(ret7d), cls: retClass(ret7d) },
    ret30d: {
      value: fmtPct(ret30d),
      cls: retClass(ret30d),
      window: retWindowLabel(statusData, "30d"),
    },
    holdingsBar: book.holdingsBar,
    bookPosture: book.bookPosture,
    hasHoldingsBar: book.hasHoldingsBar,
    basePositions,
    council,
    councilWeek,
    weekTimeline,
    latestWeekSessionId,
    earliestWeekSessionId,
    screening,
    positionCount: statusData.historical
      ? 0
      : (statusData.positions || []).filter((p) => p.position_type === "beta").length,
    pricedAt: statusData.price_as_of || null,
  };
}

function extractIsoDate(value) {
  if (!value) return null;
  const match = String(value).match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function isArchivedContextStale(sourceDate, asOfDate) {
  return Boolean(asOfDate && sourceDate && sourceDate > asOfDate);
}

const REGIME_LABELS = {
  N: "Neutral",
  "R+": "Risk On",
  "R++": "Strong Risk On",
  "R-": "Risk Off",
  "R--": "Strong Risk Off",
};

function formatRegimeDisplay(raw) {
  const text = String(raw || "").trim();
  if (!text) return "Neutral";
  if (/—/.test(text)) return text;
  const name = REGIME_LABELS[text];
  return name ? `${text} — ${name}` : text;
}

function parseCliJson(raw) {
  const obj = raw.indexOf("{");
  const arr = raw.indexOf("[");
  let start = -1;
  if (obj >= 0 && arr >= 0) start = Math.min(obj, arr);
  else start = Math.max(obj, arr);
  if (start < 0) throw new Error("No JSON in CLI output");
  return JSON.parse(raw.slice(start));
}

function runCliJson(args, timeoutMs = 60000) {
  const raw = execSync(`npx -y @messyvirgo/cli@0.41.0 ${args}`, {
    encoding: "utf8",
    timeout: timeoutMs,
    stdio: ["pipe", "pipe", "pipe"],
    maxBuffer: 10 * 1024 * 1024,
  });
  return parseCliJson(raw);
}

function fetchMacroCli(asOfDate) {
  const asOfArg = asOfDate ? ` --as-of ${asOfDate}` : "";
  const data = runCliJson(`context macros get${asOfArg} --json`);
  const effective = data.effective || {};
  const observed = data.observed || {};
  const news = data.news_overlay || {};
  const score =
    effective.score != null
      ? Number(effective.score)
      : observed.score != null
        ? Number(observed.score)
        : null;
  if (score == null || Number.isNaN(score)) return null;

  const regime = formatRegimeDisplay(
    effective.regime_label || observed.regime_label || "N"
  );
  const scoreFixed = Number(score.toFixed(2));
  const parts = [`Effective Score: ${scoreFixed} (${regime}).`];
  if (news.status === "active") {
    const qa = news.news_qa_points ?? news.effective_qa_points;
    const label = news.news_label || "active";
    const obsScore = observed.score != null ? Number(observed.score).toFixed(1) : null;
    if (obsScore != null && Math.abs(Number(obsScore) - score) >= 0.05) {
      parts.push(
        `News overlay ${label}${qa != null ? ` (${qa} QA pts)` : ""} moved observed ${obsScore} → effective ${scoreFixed}.`
      );
    } else {
      parts.push(`News overlay ${label}${qa != null ? ` (${qa} QA pts)` : ""}.`);
    }
  } else if (news.status && news.status !== "active") {
    parts.push(`News overlay status: ${news.status}.`);
  }
  if (asOfDate && data.snapshot_date) {
    parts.push(`Context snapshot ${data.snapshot_date}.`);
  }

  return {
    score: scoreFixed,
    regime,
    summary: parts.join(" "),
    sourceDate: extractIsoDate(data.snapshot_date) || asOfDate || null,
  };
}

async function fetchMacroPublic(asOfDate) {
  const url = asOfDate
    ? `${API}/reports/macro/report/default?as_of_date=${asOfDate}`
    : `${API}/reports/macro/report/default`;
  const data = await safeFetch(url);
  if (!data) return null;

  const content = data.outputs?.find((o) => o.kind === "markdown")?.content || {};
  const md = content.body || "";
  const header = content.header || "";

  let score = null;
  let regime = null;

  const headerScoreMatch = header.match(/=\s*([\d.]+)\s*\(ES\)/);
  const headerRegimeMatch = header.match(/\*\*Effective Regime\*\*\s*\|\s*([^|\n]+)/);
  if (headerScoreMatch) score = parseFloat(headerScoreMatch[1]);
  if (headerRegimeMatch) regime = formatRegimeDisplay(headerRegimeMatch[1]);

  if (score == null) {
    const scoreMatch = md.match(/Effective Score:\s*([\d.]+)\s*\((\w+)\)/);
    if (scoreMatch) {
      score = parseFloat(scoreMatch[1]);
      regime = formatRegimeDisplay(scoreMatch[2]);
    }
  }

  if (score == null) {
    const tableMatch = md.match(
      /\|\s*[\d.]+\s*\|\s*[-\d.]+\s*\|\s*([\d.]+)\s*\|\s*([^|\n]+)\|/
    );
    if (tableMatch) {
      score = parseFloat(tableMatch[1]);
      regime = formatRegimeDisplay(tableMatch[2]);
    }
  }

  const summaryMatch = md.match(/^## Summary\s*\n+(.+?)(?:\n\n|\n##)/s);
  const summaryBody = summaryMatch ? summaryMatch[1].replace(/\n/g, " ").trim() : null;
  let summary = null;

  if (summaryBody && !/^Summary unavailable\.?$/i.test(summaryBody)) {
    summary = summaryBody.split(/(?<=[.!?])\s+/).slice(0, 3).join(" ");
  } else {
    const findings = extractMacroOverlayFindings(md);
    const scoreLabel = score != null ? score.toFixed(1) : "n/a";
    const regimeLabel = regime || "Neutral";
    const lead = `Effective Score: ${scoreLabel} (${regimeLabel}).`;
    summary = findings.length
      ? [lead, ...findings].join(" ").split(/(?<=[.!?])\s+/).slice(0, 3).join(" ")
      : lead;
  }

  const createdMatch = header.match(/\*\*Created\*\*\s*\|\s*([^|\n]+)/);
  const sourceDate =
    extractIsoDate(data.meta?.published_at)
    || extractIsoDate(createdMatch?.[1])
    || null;

  return { score, regime, summary, sourceDate };
}

async function fetchMacro(asOfDate, useCli = true) {
  if (useCli) {
    const attempts = asOfDate ? 3 : 1;
    let lastErr = null;
    for (let i = 0; i < attempts; i++) {
      try {
        const cliMacro = fetchMacroCli(asOfDate);
        if (cliMacro) return cliMacro;
      } catch (err) {
        lastErr = err;
        console.warn(
          `[fund-update] CLI context macros get attempt ${i + 1}/${attempts} failed (${err.message})`
        );
      }
    }
    if (asOfDate) {
      throw lastErr || new Error("CLI macros returned empty for as-of date");
    }
  }
  return fetchMacroPublic(asOfDate);
}

function normalizeMacroRegime(raw) {
  return formatRegimeDisplay(raw);
}

function extractMacroOverlayFindings(md) {
  const overlaySection = md.match(
    /## Current Events Overlay[\s\S]*?(?=\n## Effective Risk Regime|\n## [^#]|$)/
  );
  if (!overlaySection) return [];

  return overlaySection[0]
    .split("\n")
    .filter((line) => line.startsWith("|") && !/^\|\s*-/.test(line) && !/Finding \| Adjustment/.test(line))
    .slice(0, 2)
    .map((line) => line.split("|").map((part) => part.trim()).filter(Boolean)[0])
    .filter(Boolean)
    .map((finding) => finding.split(/\s*;\s*/)[0].trim());
}

function shapeNarrativeRows(rows) {
  const STABLE_IDS = new Set(["stablecoins"]);
  const HIGHLIGHT = new Set([
    "privacy-coins", "decentralized-science-desci", "ai-agents",
    "decentralized-finance-defi", "real-world-assets-rwa", "socialfi",
  ]);

  return (rows || [])
    .filter((n) => !STABLE_IDS.has(n.narrative_id) && HIGHLIGHT.has(n.narrative_id))
    .sort((a, b) => (b.change_pct_by_window?.["15"] || 0) - (a.change_pct_by_window?.["15"] || 0))
    .map((n) => {
      const c15 = n.change_pct_by_window?.["15"] ?? null;
      const c30 = n.change_pct_by_window?.["30"] ?? null;
      const c60 = n.change_pct_by_window?.["60"] ?? null;
      const vsBaseline = n.relative_pp_by_baseline || {};
      const vsBtc15 =
        vsBaseline.btc?.["15"] ??
        vsBaseline.BTC?.["15"] ??
        (typeof vsBaseline.BTC === "number" ? vsBaseline.BTC : null) ??
        (typeof vsBaseline.btc === "number" ? vsBaseline.btc : null) ??
        null;

      let pill = "watch";
      let pillLabel = "Watch";
      if (c15 !== null && c15 >= 20) {
        pill = "hot";
        pillLabel = "Leading";
      } else if (c30 !== null && c30 < 0) {
        pill = "fade";
        pillLabel = "Fading";
      } else if (c15 !== null && c15 >= 10) {
        pill = "hot";
        pillLabel = "Steady";
      }

      return {
        id: n.narrative_id,
        label: n.narrative_label,
        chg15: fmtPct(c15),
        chg30: fmtPct(c30),
        chg60: fmtPct(c60),
        vsBtc15: vsBtc15 !== null ? `${vsBtc15 >= 0 ? "+" : ""}${vsBtc15.toFixed(1)}pp` : "n/a",
        chg15Pos: c15 !== null && c15 >= 0,
        chg30Pos: c30 !== null && c30 >= 0,
        chg60Pos: c60 !== null && c60 >= 0,
        vsBtc15Pos: vsBtc15 !== null && vsBtc15 >= 0,
        pill,
        pillLabel,
        rawChg15: c15,
      };
    });
}

function fetchNarrativesCli(asOfDate) {
  const asOfArg = asOfDate ? ` --as-of ${asOfDate}` : "";
  const data = runCliJson(`context narratives list${asOfArg} --json`);
  const rows = data.rows || data.narratives || [];
  return {
    narratives: shapeNarrativeRows(rows),
    sourceDate: extractIsoDate(data.snapshot_date) || asOfDate || null,
  };
}

async function fetchNarrativesPublic(asOfDate) {
  const url = asOfDate
    ? `${API}/reports/narratives/trend?as_of_date=${asOfDate}`
    : `${API}/reports/narratives/trend`;
  const data = await safeFetch(url);
  if (!data) return { narratives: [], sourceDate: null };

  return {
    narratives: shapeNarrativeRows(data.narratives || []),
    sourceDate: extractIsoDate(data.snapshot_date),
  };
}

async function fetchNarratives(asOfDate, useCli = true) {
  if (useCli) {
    const attempts = asOfDate ? 3 : 1;
    let lastErr = null;
    for (let i = 0; i < attempts; i++) {
      try {
        const cliNarratives = fetchNarrativesCli(asOfDate);
        if (cliNarratives.narratives.length || cliNarratives.sourceDate) {
          return cliNarratives;
        }
      } catch (err) {
        lastErr = err;
        console.warn(
          `[fund-update] CLI context narratives list attempt ${i + 1}/${attempts} failed (${err.message})`
        );
      }
    }
    if (asOfDate) {
      throw lastErr || new Error("CLI narratives returned empty for as-of date");
    }
  }
  return fetchNarrativesPublic(asOfDate);
}

/**
 * @param {{ useCli?: boolean, snapshotDate?: string, asOfDate?: string }} options
 */
async function fetchFundUpdateData(options = {}) {
  const useCli = options.useCli !== false;
  const asOfDate = options.asOfDate || null;

  const funds = await Promise.all(fundsForAsOf(asOfDate).map((f) => fetchFund(f, useCli, asOfDate)));

  // Prefer session-frozen macro/narrative for the week; fall back to CLI --as-of / public reports.
  const sessionContext = fetchSessionFrozenContext(funds, asOfDate || new Date().toISOString().slice(0, 10), useCli);

  let macroResult = null;
  let narrativeResult = { narratives: [], sourceDate: null };
  if (sessionContext.unavailable) {
    try {
      macroResult = await fetchMacro(asOfDate, useCli);
    } catch (err) {
      console.warn(`[fund-update] macro fallback failed: ${err.message}`);
    }
    try {
      narrativeResult = await fetchNarratives(asOfDate, useCli);
    } catch (err) {
      console.warn(`[fund-update] narratives fallback failed: ${err.message}`);
    }
  }

  const macroStale = sessionContext.unavailable
    ? isArchivedContextStale(macroResult?.sourceDate, asOfDate)
    : false;
  const narrativesStale = sessionContext.unavailable
    ? isArchivedContextStale(narrativeResult.sourceDate, asOfDate)
    : false;
  const macro = macroStale ? null : macroResult;
  const narratives = narrativesStale ? [] : narrativeResult.narratives || [];
  const macroUnavailable = sessionContext.unavailable
    ? Boolean(asOfDate) && !macro
    : false;
  const narrativesUnavailable = sessionContext.unavailable
    ? Boolean(asOfDate) && narratives.length === 0
    : false;

  const snapshotDate =
    options.snapshotDate ||
    new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const { signalExample, riskReject } = deriveSignals(funds);

  const macroPayload = macro
    ? {
        score: macro.score,
        regime: macro.regime,
        summary: macro.summary,
        aiAgentsNote: narratives.find((n) => n.id === "ai-agents") || null,
      }
    : null;

  const weeklyRollup = buildWeeklyRollup(funds);
  const comparison = buildComparisonRows(funds);
  const chairByFundId = sessionContext.chairByFundId || {};
  const weekStoryByFundId = sessionContext.weekStoryByFundId || {};
  for (const fund of funds) {
    if (chairByFundId[fund.id]) {
      fund.chairInsight = chairByFundId[fund.id];
    }
    if (weekStoryByFundId[fund.id]) {
      fund.weekStory = weekStoryByFundId[fund.id];
    }
  }
  const weekDebateDigest = buildWeekDebateDigest(funds);
  const weeklyHighlights = buildWeeklyHighlights({
    funds,
    sessionContext,
    signalExample,
    weeklyRollup,
  });
  const readerNotes = activeReaderNotes(asOfDate);

  return {
    snapshotDate,
    asOfDate,
    reportVersion: REPORT_VERSION,
    macroUnavailable: sessionContext.unavailable ? macroUnavailable : false,
    narrativesUnavailable: sessionContext.unavailable ? narrativesUnavailable : false,
    publishedAt: new Date().toISOString(),
    funds,
    hasReadOnlyGuru: funds.some((f) => f.group === "guru"),
    weeklyRollup,
    comparison,
    weekDebateDigest,
    sessionContext,
    macro: macroPayload,
    narratives,
    signalExample,
    riskReject,
    weeklyHighlights,
    readerNotes,
  };
}

module.exports = {
  fetchFundUpdateData,
  FUNDS,
  REPORT_VERSION,
};

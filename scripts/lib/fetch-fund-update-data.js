/**
 * Fetch and shape Fund / Signal update data from Messy Virgo public API + CLI.
 * Used by Eleventy (_data/fundUpdate.js) and scripts/publish-fund-update.js.
 */

const { execSync } = require("child_process");

const API = "https://api.messyvirgo.com/api/v1/public";

const FUNDS = [
  { id: "mvf-guru-messybased", name: "messybased", sleeveId: "mvs-guru-messybased-1", group: "guru" },
  { id: "mvf-guru-messyinfra", name: "messyinfra", sleeveId: "mvs-guru-messyinfra-1", group: "guru" },
  { id: "mvf-base01", name: "base01", sleeveId: "mvs-base01-1", group: "guru-micro" },
  { id: "mvf-base02", name: "base02", sleeveId: "mvs-base02-1", group: "guru-micro" },
];

const BAR_COLOURS = [
  "#ff69b4", "#fbbf24", "#60a5fa", "#34d399",
  "#a78bfa", "#f87171", "#fb923c", "#e879f9",
];

/** End-user product notes from recent releases. Drop entries by showUntil. */
const READER_NOTES = [
  {
    showUntil: "2026-08-31",
    text:
      "Fund pages in the app now include full council minutes — open any fund and tap Council to read what the portfolio committee debated, voted on, and whether trades were executed.",
    link: {
      href: "/blog/2026/06/messy-virgo-decision-pipeline-part-1-the-ai-investment-council/",
      label: "How the AI investment council works",
    },
  },
  {
    showUntil: "2026-08-31",
    text:
      "We publish two live workflow test funds (base01 and base02) alongside the read-only Guru Lotus snapshots. Every change on those test funds goes through screening, council review, and signed execution — the same path future AI-managed funds will use.",
  },
];

function activeReaderNotes(asOfDate) {
  const today = asOfDate || new Date().toISOString().slice(0, 10);
  return READER_NOTES.filter((note) => !note.showUntil || note.showUntil >= today);
}

function buildWeeklyHighlights({ funds, macro, signalExample, narratives }) {
  const highlights = [];

  if (macro?.score != null && macro?.regime) {
    const regimeShort = String(macro.regime).replace(/\s*—.*/, "").trim();
    highlights.push(
      `Macro currently reads ${regimeShort} (${Number(macro.score).toFixed(1)}/100). The score updates daily; each council session uses the latest macro read available at meeting time.`
    );
  }

  for (const fund of funds) {
    const week = fund.councilWeek;
    if (!week || week.totalSessions === 0) continue;

    const sessions = week.totalSessions;
    const sessionsLabel = `${sessions} council session${sessions === 1 ? "" : "s"}`;
    const executed = week.executedRotations || 0;
    const holds = week.holdSessions || 0;
    const blocked = week.blockedSessions || 0;

    if (blocked > 0 && executed === 0 && holds === 0) {
      highlights.push(
        `${fund.name} held ${sessionsLabel} this week — ${blocked} blocked pending review; see the app for details.`
      );
    } else if (executed > 0 && holds > 0) {
      highlights.push(
        `${fund.name} held ${sessionsLabel} this week — ${executed} executed rotation${executed === 1 ? "" : "s"} on Base and ${holds} hold review${holds === 1 ? "" : "s"}.`
      );
    } else if (executed > 0) {
      highlights.push(
        `${fund.name} held ${sessionsLabel} this week — ${executed} signed and reconciled on Base.`
      );
    } else if (holds > 0) {
      highlights.push(
        `${fund.name} held ${sessionsLabel} this week — all ${holds} ended in hold; no trades executed.`
      );
    }
  }

  const leader = narratives.find((n) => n.pillLabel === "Leading" || n.pillLabel === "Steady");
  if (leader && leader.rawChg15 > 0) {
    highlights.push(
      `${leader.label} leads narrative momentum (${leader.chg15} over 15 days) — thematic heat, not a buy signal on its own.`
    );
  }

  if (signalExample?.symbol) {
    highlights.push(
      `${signalExample.symbol} showed up consistently across fund screens this week — a leading aggregate candidate, not an automatic trade.`
    );
  }

  return highlights.slice(0, 6);
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

function buildHoldingsBar(positions) {
  return positions
    .filter((p) => p.position_type === "beta" && p.weight_pct > 0)
    .sort((a, b) => b.weight_pct - a.weight_pct)
    .map((p, i) => ({
      symbol: p.symbol.toUpperCase(),
      weight: Number(p.weight_pct).toFixed(1),
      pnl: p.unrealized_pnl_usd != null ? Number(p.unrealized_pnl_usd) : null,
      color: BAR_COLOURS[i % BAR_COLOURS.length],
      warning: p.unrealized_pnl_usd != null && p.unrealized_pnl_usd < -50,
    }));
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
  const messy = funds.find((f) => f.id === "mvf-guru-messybased");
  if (messy?.holdingsBar?.length) {
    const warned = messy.holdingsBar
      .filter((h) => h.warning && h.pnl != null)
      .sort((a, b) => a.pnl - b.pnl);
    if (warned.length) {
      const w = warned[0];
      riskReject = {
        symbol: w.symbol,
        name: w.symbol,
        fundName: messy.name,
        body: `Held in book with unrealized ~$${w.pnl}. Flagged in council rotation — no longer passes aggregate screening discipline. Price alone does not override a failed screen.`,
        tags: ["not screened", `$${w.pnl} pnl`, "rotate out"],
      };
    }
  }

  if (!riskReject && messy?.council?.riskNotes) {
    const m = messy.council.riskNotes.match(/\b([a-z0-9]+)\b.*?(?:vpay|remove|rotate)/i);
    if (m) {
      riskReject = {
        symbol: "VPAY",
        name: "VPay",
        fundName: messy.name,
        body: messy.council.riskNotes.split(";")[0].trim(),
        tags: ["council reject", "rotate out"],
      };
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
  const refs = item.source_artifact_refs || [];
  const dates = refs.map((r) => r.created_at).filter(Boolean).sort();
  if (dates.length) return dates[0].slice(0, 10);
  if (item.generated_at) return String(item.generated_at).slice(0, 10);
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
  if (!asOfDate || !publicItems?.length) return null;

  const { weekStart, weekEnd } = fundUpdateWeekRange(asOfDate);
  const cliBySession = new Map((cliItems || []).map((item) => [item.session_id, item]));
  const inWeek = publicItems.filter((item) => {
    const sessionDate = sessionDateIsoFromCouncilItem(item);
    return sessionDate && sessionDate >= weekStart && sessionDate <= weekEnd;
  });

  let executedRotations = 0;
  let holdSessions = 0;
  let blockedSessions = 0;

  for (const item of inWeek) {
    const parsed = parseCouncilItem(item);
    const kind = classifyCouncilSession(parsed, cliBySession.get(item.session_id));
    if (kind === "executed") executedRotations += 1;
    else if (kind === "hold") holdSessions += 1;
    else if (kind === "blocked") blockedSessions += 1;
  }

  const totalSessions = executedRotations + holdSessions + blockedSessions;
  if (totalSessions === 0) return null;

  return {
    weekStart,
    weekEnd,
    totalSessions,
    executedRotations,
    holdSessions,
    blockedSessions,
  };
}

function fetchCouncilCliList(fundId, limit = 25) {
  try {
    const raw = execSync(
      `npx -y @messyvirgo/cli@0.31.0 funds council list ${fundId} --limit ${limit} --json`,
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

function parseCouncilItem(item) {
  const refs = item.source_artifact_refs || [];
  const dates = refs.map((r) => r.created_at).filter(Boolean).sort();
  const sessionDate = dates.length ? dates[0] : item.generated_at || null;
  const sc = item.structured_content || {};
  const sections = councilContentSections(sc);
  const decisions = sc.decisions || [];
  const summary = sc.summary || null;
  const title = sc.title || null;
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
  const data = await safeFetch(`${API}/funds/${fundId}/council/sessions?limit=25`);
  if (!data?.items?.length) return { council: null, weekSummary: null };

  let item = data.items[0];
  if (asOfDate) {
    const eligible = data.items
      .map((session) => ({ session, council: parseCouncilItem(session) }))
      .filter(({ council }) => council.sessionDateIso && council.sessionDateIso <= asOfDate)
      .sort((a, b) => b.council.sessionDateIso.localeCompare(a.council.sessionDateIso));
    if (!eligible.length) return { council: null, weekSummary: null };
    item = eligible[0].session;
  }

  const council = parseCouncilItem(item);
  delete council.sessionDateIso;
  return { council, publicItems: data.items };
}

async function fetchCouncil(fundId, useCli, asOfDate) {
  let council = useCli ? fetchCouncilCliLatest(fundId, asOfDate) : null;
  const cliItems = useCli ? fetchCouncilCliList(fundId, 25) : [];
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

  return { council, weekSummary };
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
    aggData?.candidates?.slice(0, 8).map((c) => ({
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

  return {
    id,
    name,
    group: group || "guru",
    appUrl: `https://app.messyvirgo.com/funds/${id}`,
    nav,
    ret1d: { value: fmtPct(ret1d), cls: retClass(ret1d) },
    ret7d: { value: fmtPct(ret7d), cls: retClass(ret7d) },
    ret30d: {
      value: fmtPct(ret30d),
      cls: retClass(ret30d),
      window: retWindowLabel(statusData, "30d"),
    },
    holdingsBar: statusData.historical ? [] : buildHoldingsBar(statusData.positions || []),
    basePositions,
    council,
    councilWeek,
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

async function fetchMacro(asOfDate) {
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
  if (headerRegimeMatch) regime = normalizeMacroRegime(headerRegimeMatch[1]);

  if (score == null) {
    const scoreMatch = md.match(/Effective Score:\s*([\d.]+)\s*\((\w+)\)/);
    if (scoreMatch) {
      score = parseFloat(scoreMatch[1]);
      regime = normalizeMacroRegime(scoreMatch[2]);
    }
  }

  if (score == null) {
    const tableMatch = md.match(
      /\|\s*[\d.]+\s*\|\s*[-\d.]+\s*\|\s*([\d.]+)\s*\|\s*([^|\n]+)\|/
    );
    if (tableMatch) {
      score = parseFloat(tableMatch[1]);
      regime = normalizeMacroRegime(tableMatch[2]);
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

function normalizeMacroRegime(raw) {
  const text = String(raw || "").trim();
  const labeled = text.match(/^[A-Z]\s*—\s*(.+)$/);
  if (labeled) return labeled[1].trim();
  if (text === "N") return "Neutral";
  return text;
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

async function fetchNarratives(asOfDate) {
  const url = asOfDate
    ? `${API}/reports/narratives/trend?as_of_date=${asOfDate}`
    : `${API}/reports/narratives/trend`;
  const data = await safeFetch(url);
  if (!data) return { narratives: [], sourceDate: null };

  const STABLE_IDS = new Set(["stablecoins"]);
  const HIGHLIGHT = new Set([
    "privacy-coins", "decentralized-science-desci", "ai-agents",
    "decentralized-finance-defi", "real-world-assets-rwa", "socialfi",
  ]);

  return {
    narratives: (data.narratives || [])
      .filter((n) => !STABLE_IDS.has(n.narrative_id) && HIGHLIGHT.has(n.narrative_id))
      .sort((a, b) => (b.change_pct_by_window["15"] || 0) - (a.change_pct_by_window["15"] || 0))
      .map((n) => {
      const c15 = n.change_pct_by_window["15"] ?? null;
      const c30 = n.change_pct_by_window["30"] ?? null;
      const c60 = n.change_pct_by_window["60"] ?? null;
      const vsBtc15 = n.relative_pp_by_baseline?.btc?.["15"] ?? null;

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
    }),
    sourceDate: extractIsoDate(data.snapshot_date),
  };
}

/**
 * @param {{ useCli?: boolean, snapshotDate?: string, asOfDate?: string }} options
 */
async function fetchFundUpdateData(options = {}) {
  const useCli = options.useCli !== false;
  const asOfDate = options.asOfDate || null;

  const [funds, macroResult, narrativeResult] = await Promise.all([
    Promise.all(FUNDS.map((f) => fetchFund(f, useCli, asOfDate))),
    fetchMacro(asOfDate),
    fetchNarratives(asOfDate),
  ]);

  const macroUnavailable = isArchivedContextStale(macroResult?.sourceDate, asOfDate);
  const narrativesUnavailable = isArchivedContextStale(narrativeResult.sourceDate, asOfDate);
  const macro = macroUnavailable ? null : macroResult;
  const narratives = narrativesUnavailable ? [] : narrativeResult.narratives;

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

  const weeklyHighlights = buildWeeklyHighlights({
    funds,
    macro: macroPayload,
    signalExample,
    narratives,
  });
  const readerNotes = activeReaderNotes(asOfDate);

  return {
    snapshotDate,
    asOfDate,
    macroUnavailable,
    narrativesUnavailable,
    publishedAt: new Date().toISOString(),
    funds,
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
};

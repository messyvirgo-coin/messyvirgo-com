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
  { id: "mvf-base03", name: "base03", sleeveId: "mvs-base03-1", group: "guru-micro" },
];

const BAR_COLOURS = [
  "#ff69b4", "#fbbf24", "#60a5fa", "#34d399",
  "#a78bfa", "#f87171", "#fb923c", "#e879f9",
];

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

function fetchCouncilCli(fundId) {
  try {
    const raw = execSync(
      `npx -y @messyvirgo/cli@latest funds council list ${fundId} --limit 1 --json`,
      { encoding: "utf8", timeout: 45000, stdio: ["pipe", "pipe", "pipe"] }
    );
    const start = raw.indexOf("{");
    if (start === -1) return null;
    const d = JSON.parse(raw.slice(start));
    const item = d.items?.[0];
    if (!item) return null;
    return {
      outcome: item.outcome_kind || (item.execution_status === "running" ? "in_progress" : "unknown"),
      outcomeLabel: (item.outcome_kind || "in progress").replace(/_/g, " "),
      date: item.started_at ? fmtDate(item.started_at) : null,
      shortDate: item.started_at ? fmtShortDate(item.started_at) : null,
      headline: item.headline,
      executionStatus: item.execution_status,
      riskNotes: null,
    };
  } catch {
    return null;
  }
}

function councilSectionBody(sections, heading) {
  const section = (sections || []).find((s) => s.heading === heading);
  return section?.body?.trim() || null;
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
  const sessionDate = dates.length ? dates[0] : null;
  const sc = item.structured_content || {};
  const sections = sc.sections || [];
  const decisions = sc.decisions || [];
  const outcome = decisions[0] || "unknown";
  const riskBody = councilSectionBody(sections, "Risk Notes");
  const certBody = councilSectionBody(sections, "Certification");
  const targetBody = councilSectionBody(sections, "Target Finalization");
  const actionBody = councilSectionBody(sections, "Action Items");
  const { certified, label: certificationLabel } = parseCertificationStatus(certBody);
  const targetFinalizationBlocked =
    targetBody != null && /requires review|blocked|override/i.test(targetBody);

  return {
    outcome,
    outcomeLabel: outcome.replace(/_/g, " "),
    date: fmtDate(sessionDate),
    shortDate: fmtShortDate(sessionDate),
    sessionDateIso: sessionDate ? sessionDate.slice(0, 10) : null,
    riskNotes: riskBody ? riskBody.split(";")[0].trim() : null,
    certified,
    certificationLabel,
    targetFinalization: targetBody,
    targetFinalizationBlocked,
    actionItems: actionBody,
    executionStatus: "resolved",
  };
}

async function fetchCouncilPublic(fundId, asOfDate) {
  const data = await safeFetch(`${API}/funds/${fundId}/council/sessions?limit=20`);
  if (!data?.items?.length) return null;

  let item = data.items[0];
  if (asOfDate) {
    const eligible = data.items
      .map((session) => ({ session, council: parseCouncilItem(session) }))
      .filter(({ council }) => council.sessionDateIso && council.sessionDateIso <= asOfDate)
      .sort((a, b) => b.council.sessionDateIso.localeCompare(a.council.sessionDateIso));
    if (!eligible.length) return null;
    item = eligible[0].session;
  }

  const council = parseCouncilItem(item);
  delete council.sessionDateIso;
  return council;
}

async function fetchCouncil(fundId, useCli, asOfDate) {
  let council = useCli && !asOfDate ? fetchCouncilCli(fundId) : null;
  const publicCouncil = await fetchCouncilPublic(fundId, asOfDate);

  if (council && publicCouncil) {
    council = {
      ...publicCouncil,
      ...council,
      riskNotes: publicCouncil.riskNotes || council.headline,
      outcome: council.outcome !== "in_progress" && council.outcome !== "unknown"
        ? council.outcome
        : publicCouncil.outcome,
      outcomeLabel: council.outcome !== "in_progress" && council.outcome !== "unknown"
        ? council.outcomeLabel
        : publicCouncil.outcomeLabel,
      date: council.date || publicCouncil.date,
    };
  } else {
    council = council || publicCouncil;
  }

  if (council?.executionStatus === "running" || council?.executionStatus === "queued") {
    council.outcomeLabel = `${council.executionStatus} — check app`;
    council.riskNotes = council.headline || "Council session still in progress.";
  }

  return council;
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

function computePerformanceReturns(points, asOfDate) {
  const idx = (points || []).findIndex((p) => p.snapshot_date === asOfDate);
  if (idx === -1) return { ret1d: null, ret7d: null, ret30d: null };

  const navAt = (i) => {
    const pt = points[i];
    return pt ? Number(pt.nav_usd) : null;
  };
  const pct = (current, prior) =>
    prior != null && prior !== 0 ? ((current - prior) / prior) * 100 : null;

  const currentNav = navAt(idx);
  return {
    ret1d: pct(currentNav, navAt(idx - 1)),
    ret7d: pct(currentNav, navAt(idx - 7)),
    ret30d: pct(currentNav, navAt(idx - 30)),
  };
}

async function fetchFundStatusHistorical(fundId, asOfDate) {
  const data = await safeFetch(`${API}/funds/${fundId}/performance`, {
    retries: 2,
    timeoutMs: 20000,
  });
  const points = data?.points || [];
  const point = performancePointByDate(points, asOfDate);
  if (!point) return null;

  const returns = computePerformanceReturns(points, asOfDate);
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
    positions: [],
    basePositions,
    price_as_of: point.provider_observed_at || point.snapshot_at || null,
    positionCount: 0,
    historical: true,
  };
}

async function fetchFund({ id, name, sleeveId, group }, useCli, asOfDate) {
  const statusData = asOfDate
    ? await fetchFundStatusHistorical(id, asOfDate)
    : await safeFetch(`${API}/funds/${id}/status`, {
        retries: 2,
        timeoutMs: 20000,
      });
  const [council, screening] = await Promise.all([
    fetchCouncil(id, useCli, asOfDate),
    fetchScreening(id, sleeveId, asOfDate),
  ]);

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
    ret30d: { value: fmtPct(ret30d), cls: retClass(ret30d) },
    holdingsBar: statusData.historical ? [] : buildHoldingsBar(statusData.positions || []),
    basePositions,
    council,
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
  };
}

module.exports = {
  fetchFundUpdateData,
  FUNDS,
};

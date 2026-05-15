/**
 * fundUpdate.js — Eleventy global data file
 *
 * Fetches live data from api.messyvirgo.com at build time and exposes it
 * as `fundUpdate` in every Eleventy template.
 *
 * Usage in a .njk template:  {{ fundUpdate.macro.score }}
 *
 * Node 20+ native fetch is used — no extra dependencies needed.
 * All fetches are non-throwing: if an endpoint is unreachable the
 * property falls back to null so the template can render gracefully.
 */

const API = "https://api.messyvirgo.com/api/v1/public";

const FUNDS = [
  { id: "mvf-messybased",  name: "messybased",             sleeveId: "mvs-messybased-1" },
  { id: "mvf-base-sub3m",  name: "Base Sub 3M",            sleeveId: "mvs-base-sub3m-1" },
  { id: "mvf-ccl-may05",   name: "Pre-Alpha Council Play",  sleeveId: "mvs-ccl-may05-1"  },
];

// Colour palette for holdings bar segments (index-matched to sorted positions)
const BAR_COLOURS = [
  "#ff69b4", "#fbbf24", "#60a5fa", "#34d399",
  "#a78bfa", "#f87171", "#fb923c", "#e879f9",
];

async function safeFetch(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Format ISO date string → "6 May 2026" */
function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

/** Format ISO date string → "6 May" (short) */
function fmtShortDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short",
  });
}

/** Signed percentage string → CSS class */
function retClass(pct) {
  if (pct === null || pct === undefined) return "neu";
  return pct >= 0 ? "pos" : "neg";
}

/** Round and sign a percentage for display */
function fmtPct(pct, decimals = 1) {
  if (pct === null || pct === undefined) return "n/a";
  const v = Number(pct).toFixed(decimals);
  return pct >= 0 ? `+${v}%` : `${v}%`;
}

/** Build a holdings bar array from positions */
function buildHoldingsBar(positions) {
  const beta = positions
    .filter(p => p.position_type === "beta" && p.weight_pct > 0)
    .sort((a, b) => b.weight_pct - a.weight_pct);

  return beta.map((p, i) => ({
    symbol: p.symbol.toUpperCase(),
    weight: Number(p.weight_pct).toFixed(1),
    pnl: p.unrealized_pnl_usd != null ? Number(p.unrealized_pnl_usd).toFixed(0) : null,
    color: BAR_COLOURS[i % BAR_COLOURS.length],
    warning: p.unrealized_pnl_usd != null && p.unrealized_pnl_usd < -50,
  }));
}

/** Pull the latest council session for a fund */
async function fetchCouncil(fundId) {
  const data = await safeFetch(`${API}/funds/${fundId}/council/sessions?limit=1`);
  if (!data || !data.items || !data.items.length) return null;

  const item = data.items[0];
  const refs = item.source_artifact_refs || [];
  const dates = refs.map(r => r.created_at).filter(Boolean).sort();
  const sessionDate = dates.length ? dates[0] : null;

  const sc = item.structured_content || {};
  const decisions = sc.decisions || [];
  const outcome = decisions[0] || "unknown";

  // Find the risk notes section for the summary body
  const riskSection = (sc.sections || []).find(s => s.heading === "Risk Notes");

  return {
    outcome,
    outcomeLabel: outcome.replace(/_/g, " "),
    date: fmtDate(sessionDate),
    shortDate: fmtShortDate(sessionDate),
    riskNotes: riskSection ? riskSection.body.split(";")[0].trim() : null,
    certified: (sc.sections || []).some(s =>
      s.heading === "Certification" && s.body.includes("certified")
    ),
  };
}

/** Pull latest screen run + 7-day aggregate candidates */
async function fetchScreening(fundId, sleeveId) {
  const [runData, aggData] = await Promise.all([
    safeFetch(`${API}/funds/${fundId}/screen-runs?limit=1`),
    safeFetch(`${API}/funds/${fundId}/sleeves/${sleeveId}/screen-aggregate-runs/latest`),
  ]);

  const todayCandidates = runData?.items?.[0]?.candidates?.slice(0, 5).map(c => ({
    rank: c.rank,
    symbol: c.symbol.toUpperCase(),
    name: c.name,
    reason: c.candidate_reason,
  })) || [];

  const aggCandidates = aggData?.candidates?.slice(0, 8).map(c => ({
    rank: c.rank,
    symbol: c.symbol.toUpperCase(),
    name: c.name,
    reason: c.candidate_reason,
  })) || [];

  const runDate = runData?.items?.[0]?.run_date || null;
  const aggDate = aggData?.as_of_date || null;

  return {
    runDate: runDate ? fmtDate(runDate + "T00:00:00Z") : null,
    aggDate: aggDate ? fmtDate(aggDate + "T00:00:00Z") : null,
    aggLookback: aggData?.execution_trace?.lookback_days || 7,
    aggSourceRuns: aggData?.execution_trace?.source_run_ids?.length || 0,
    todayCandidates,
    aggCandidates,
  };
}

/** Shape one fund's full data object */
async function fetchFund({ id, name, sleeveId }) {
  const [statusData, council, screening] = await Promise.all([
    safeFetch(`${API}/funds/${id}/status`),
    fetchCouncil(id),
    fetchScreening(id, sleeveId),
  ]);

  if (!statusData) return { id, name, error: true };

  const nav = statusData.nav_usd != null ? `$${Math.round(statusData.nav_usd / 1000 * 10) / 10}k` : "n/a";
  const ret1d  = statusData.performance_1d_pct  ?? null;
  const ret7d  = statusData.performance_7d_pct  ?? null;
  const ret30d = statusData.performance_30d_pct ?? null;

  const holdingsBar = buildHoldingsBar(statusData.positions || []);

  // Cash position for base funds (e.g. base-sub3m holding WETH as base)
  const basePositions = (statusData.positions || [])
    .filter(p => p.position_type === "base" && p.current_value_usd > 0)
    .map(p => ({
      symbol: p.symbol.toUpperCase(),
      value: `$${Math.round(p.current_value_usd).toLocaleString()}`,
      pnl: p.unrealized_pnl_usd != null ? `${p.unrealized_pnl_usd > 0 ? '+' : ''}$${Math.round(p.unrealized_pnl_usd)}` : null,
    }));

  return {
    id,
    name,
    appUrl: `https://app.messyvirgo.com/funds/${id}`,
    nav,
    ret1d:  { value: fmtPct(ret1d),  cls: retClass(ret1d)  },
    ret7d:  { value: fmtPct(ret7d),  cls: retClass(ret7d)  },
    ret30d: { value: fmtPct(ret30d), cls: retClass(ret30d) },
    holdingsBar,
    basePositions,
    council,
    screening,
    positionCount: (statusData.positions || []).filter(p => p.position_type === "beta").length,
    pricedAt: statusData.price_as_of || null,
  };
}

/** Macro report */
async function fetchMacro() {
  const data = await safeFetch(`${API}/reports/macro/report/default`);
  if (!data) return null;

  const md = data.outputs?.find(o => o.kind === "markdown")?.content?.body || "";

  // Extract effective score from the summary line
  const scoreMatch = md.match(/Effective Score:\s*([\d.]+)\s*\((\w+)\)/);
  const score = scoreMatch ? parseFloat(scoreMatch[1]) : null;
  const regime = scoreMatch ? scoreMatch[2] : null;

  // First two sentences of the summary paragraph
  const summaryMatch = md.match(/^## Summary\s*\n+(.+?)(?:\n\n|\n##)/s);
  const summaryFull = summaryMatch ? summaryMatch[1].replace(/\n/g, " ").trim() : null;
  const summarySentences = summaryFull
    ? summaryFull.split(/(?<=[.!?])\s+/).slice(0, 3).join(" ")
    : null;

  return { score, regime, summary: summarySentences, full: md };
}

/** Narrative trend */
async function fetchNarratives() {
  const data = await safeFetch(`${API}/reports/narratives/trend`);
  if (!data) return [];

  const STABLE_IDS = new Set(["stablecoins"]);
  const HIGHLIGHT = new Set([
    "privacy-coins", "decentralized-science-desci", "ai-agents",
    "decentralized-finance-defi", "real-world-assets-rwa", "socialfi",
  ]);

  return (data.narratives || [])
    .filter(n => !STABLE_IDS.has(n.narrative_id) && HIGHLIGHT.has(n.narrative_id))
    .sort((a, b) => (b.change_pct_by_window["15"] || 0) - (a.change_pct_by_window["15"] || 0))
    .map(n => {
      const c15 = n.change_pct_by_window["15"] ?? null;
      const c30 = n.change_pct_by_window["30"] ?? null;

      let pill = "watch";
      let pillLabel = "Watch";
      if (c15 !== null && c15 >= 20) { pill = "hot"; pillLabel = "Leading"; }
      else if (c30 !== null && c30 < 0) { pill = "fade"; pillLabel = "Fading"; }
      else if (c15 !== null && c15 >= 10) { pill = "hot"; pillLabel = "Steady"; }

      const c60 = n.change_pct_by_window["60"] ?? null;
      const vsBtc15 = n.relative_pp_by_baseline?.btc?.["15"] ?? null;

      return {
        id: n.narrative_id,
        label: n.narrative_label,
        chg15: fmtPct(c15),
        chg30: fmtPct(c30),
        chg60: fmtPct(c60),
        vsBtc15: vsBtc15 !== null ? `${vsBtc15 >= 0 ? '+' : ''}${vsBtc15.toFixed(1)}pp` : 'n/a',
        chg15Pos: c15 !== null && c15 >= 0,
        chg30Pos: c30 !== null && c30 >= 0,
        chg60Pos: c60 !== null && c60 >= 0,
        vsBtc15Pos: vsBtc15 !== null && vsBtc15 >= 0,
        pill,
        pillLabel,
      };
    });
}

module.exports = async function () {
  console.log("[fundUpdate] Fetching live data from api.messyvirgo.com…");

  const [funds, macro, narratives] = await Promise.all([
    Promise.all(FUNDS.map(fetchFund)),
    fetchMacro(),
    fetchNarratives(),
  ]);

  const snapshotDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  console.log(`[fundUpdate] Done. ${funds.length} funds, macro score ${macro?.score}, ${narratives.length} narratives.`);

  return {
    snapshotDate,
    funds,
    macro,
    narratives,
  };
};

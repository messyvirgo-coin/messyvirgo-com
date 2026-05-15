/**
 * Fetch and shape Fund / Signal update data from Messy Virgo public API + CLI.
 * Used by Eleventy (_data/fundUpdate.js) and scripts/publish-fund-update.js.
 */

const { execSync } = require("child_process");

const API = "https://api.messyvirgo.com/api/v1/public";

const FUNDS = [
  { id: "mvf-messybased", name: "messybased", sleeveId: "mvs-messybased-1" },
  { id: "mvf-base-sub3m", name: "Base Sub 3M", sleeveId: "mvs-base-sub3m-1" },
  { id: "mvf-ccl-may05", name: "Pre-Alpha Council Play", sleeveId: "mvs-ccl-may05-1" },
];

const BAR_COLOURS = [
  "#ff69b4", "#fbbf24", "#60a5fa", "#34d399",
  "#a78bfa", "#f87171", "#fb923c", "#e879f9",
];

async function safeFetch(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
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
  const messy = funds.find((f) => f.id === "mvf-messybased");
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

async function fetchCouncilPublic(fundId) {
  const data = await safeFetch(`${API}/funds/${fundId}/council/sessions?limit=1`);
  if (!data?.items?.length) return null;

  const item = data.items[0];
  const refs = item.source_artifact_refs || [];
  const dates = refs.map((r) => r.created_at).filter(Boolean).sort();
  const sessionDate = dates.length ? dates[0] : null;
  const sc = item.structured_content || {};
  const decisions = sc.decisions || [];
  const outcome = decisions[0] || "unknown";
  const riskSection = (sc.sections || []).find((s) => s.heading === "Risk Notes");

  return {
    outcome,
    outcomeLabel: outcome.replace(/_/g, " "),
    date: fmtDate(sessionDate),
    shortDate: fmtShortDate(sessionDate),
    riskNotes: riskSection ? riskSection.body.split(";")[0].trim() : null,
    certified: (sc.sections || []).some(
      (s) => s.heading === "Certification" && s.body.includes("certified")
    ),
    executionStatus: "resolved",
  };
}

async function fetchCouncil(fundId, useCli) {
  let council = useCli ? fetchCouncilCli(fundId) : null;
  const publicCouncil = await fetchCouncilPublic(fundId);

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

async function fetchScreening(fundId, sleeveId) {
  const [runData, aggData] = await Promise.all([
    safeFetch(`${API}/funds/${fundId}/screen-runs?limit=1`),
    safeFetch(`${API}/funds/${fundId}/sleeves/${sleeveId}/screen-aggregate-runs/latest`),
  ]);

  const aggCandidates =
    aggData?.candidates?.slice(0, 8).map((c) => ({
      rank: c.rank,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      reason: c.candidate_reason,
    })) || [];

  return {
    runDate: runData?.items?.[0]?.run_date
      ? fmtDate(runData.items[0].run_date + "T00:00:00Z")
      : null,
    aggDate: aggData?.as_of_date ? fmtDate(aggData.as_of_date + "T00:00:00Z") : null,
    aggLookback: aggData?.execution_trace?.lookback_days || 7,
    aggSourceRuns: aggData?.execution_trace?.source_run_ids?.length || 0,
    aggCandidates,
  };
}

async function fetchFund({ id, name, sleeveId }, useCli) {
  const [statusData, council, screening] = await Promise.all([
    safeFetch(`${API}/funds/${id}/status`),
    fetchCouncil(id, useCli),
    fetchScreening(id, sleeveId),
  ]);

  if (!statusData) return { id, name, error: true };

  const nav =
    statusData.nav_usd != null
      ? `$${Math.round(statusData.nav_usd / 1000 * 10) / 10}k`
      : "n/a";
  const ret1d = statusData.performance_1d_pct ?? null;
  const ret7d = statusData.performance_7d_pct ?? null;
  const ret30d = statusData.performance_30d_pct ?? null;

  const basePositions = (statusData.positions || [])
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
    appUrl: `https://app.messyvirgo.com/funds/${id}`,
    nav,
    ret1d: { value: fmtPct(ret1d), cls: retClass(ret1d) },
    ret7d: { value: fmtPct(ret7d), cls: retClass(ret7d) },
    ret30d: { value: fmtPct(ret30d), cls: retClass(ret30d) },
    holdingsBar: buildHoldingsBar(statusData.positions || []),
    basePositions,
    council,
    screening,
    positionCount: (statusData.positions || []).filter((p) => p.position_type === "beta").length,
    pricedAt: statusData.price_as_of || null,
  };
}

async function fetchMacro() {
  const data = await safeFetch(`${API}/reports/macro/report/default`);
  if (!data) return null;

  const md = data.outputs?.find((o) => o.kind === "markdown")?.content?.body || "";
  const scoreMatch = md.match(/Effective Score:\s*([\d.]+)\s*\((\w+)\)/);
  const score = scoreMatch ? parseFloat(scoreMatch[1]) : null;
  const regime = scoreMatch ? scoreMatch[2] : null;
  const summaryMatch = md.match(/^## Summary\s*\n+(.+?)(?:\n\n|\n##)/s);
  const summaryFull = summaryMatch ? summaryMatch[1].replace(/\n/g, " ").trim() : null;
  const summarySentences = summaryFull
    ? summaryFull.split(/(?<=[.!?])\s+/).slice(0, 3).join(" ")
    : null;

  return { score, regime, summary: summarySentences };
}

async function fetchNarratives() {
  const data = await safeFetch(`${API}/reports/narratives/trend`);
  if (!data) return [];

  const STABLE_IDS = new Set(["stablecoins"]);
  const HIGHLIGHT = new Set([
    "privacy-coins", "decentralized-science-desci", "ai-agents",
    "decentralized-finance-defi", "real-world-assets-rwa", "socialfi",
  ]);

  return (data.narratives || [])
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
    });
}

/**
 * @param {{ useCli?: boolean, snapshotDate?: string }} options
 */
async function fetchFundUpdateData(options = {}) {
  const useCli = options.useCli !== false;

  const [funds, macro, narratives] = await Promise.all([
    Promise.all(FUNDS.map((f) => fetchFund(f, useCli))),
    fetchMacro(),
    fetchNarratives(),
  ]);

  const snapshotDate =
    options.snapshotDate ||
    new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const { signalExample, riskReject } = deriveSignals(funds);

  if (macro) {
    macro.aiAgentsNote = narratives.find((n) => n.id === "ai-agents") || null;
  }

  return {
    snapshotDate,
    publishedAt: new Date().toISOString(),
    funds,
    macro,
    narratives,
    signalExample,
    riskReject,
  };
}

module.exports = {
  fetchFundUpdateData,
  FUNDS,
};

---
title: "Messy Fund Update"
date: 2026-05-15
description: "What three pre-live testing Funds observed this week: macro regime, narrative leaders, daily screening output, and council decisions — with links to inspect the same workflow in the app."
tags: [fund-update, signal-brief, pre-live-testing, macro, messy-virgo]
layout: post.njk
permalink: /blog/2026/05/messy-fund-update-week-of-2026-05-15/index.html
---

<style>
/* ── Fund Update post styles ── */
/* Hide the template-generated date line — the badge already shows it */
.blog-post-page header time,
.blog-post-page header .flex { display: none !important; }
.blog-post-page header { margin-bottom: 1.5rem !important; }
.fu-lead {
  font-size: 1.1rem;
  color: #9ca3af;
  line-height: 1.75;
  margin-bottom: 2.5rem;
  border-left: 3px solid rgba(255,105,180,0.4);
  padding-left: 1.25rem;
}
.fu-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(255,105,180,0.08);
  border: 1px solid rgba(255,105,180,0.22);
  border-radius: 9999px;
  padding: 0.3rem 0.85rem;
  font-size: 0.75rem;
  color: #ff69b4;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 2rem;
}
.fu-section-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ff69b4;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.fu-section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255,105,180,0.15);
}
.fu-divider {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.06);
  margin: 3rem 0;
}

/* Fund cards */
.fu-fund-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2.5rem;
}
@media (min-width: 640px) {
  .fu-fund-grid { grid-template-columns: repeat(3, 1fr); }
}
.fu-fund-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 1.25rem;
  transition: border-color 0.2s, background 0.2s;
  text-decoration: none;
  display: block;
}
.fu-fund-card:hover {
  border-color: rgba(255,105,180,0.3);
  background: rgba(255,105,180,0.04);
}
.fu-fund-card .fc-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #e5e7eb;
  margin-bottom: 0.25rem;
}
.fu-fund-card .fc-nav {
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.75rem;
}
.fu-fund-card .fc-returns {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 0.85rem;
}
.fc-ret {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.55rem;
  border-radius: 9999px;
}
.fc-ret.pos { background: rgba(74,222,128,0.12); color: #4ade80; }
.fc-ret.neg { background: rgba(248,113,113,0.12); color: #f87171; }
.fc-ret.neu { background: rgba(156,163,175,0.12); color: #9ca3af; }
.fu-fund-card .fc-desc {
  font-size: 0.75rem;
  color: #9ca3af;
  line-height: 1.5;
}
.fu-fund-card .fc-tag {
  display: inline-block;
  margin-top: 0.65rem;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  border: 1px solid rgba(255,255,255,0.1);
  color: #6b7280;
}

/* Holdings bar */
.fu-holdings {
  margin: 1.25rem 0 1.75rem;
}
.fu-holdings-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.fu-bar {
  display: flex;
  height: 10px;
  border-radius: 9999px;
  overflow: hidden;
  gap: 2px;
  margin-bottom: 0.65rem;
}
.fu-bar-seg {
  height: 100%;
  border-radius: 2px;
  transition: filter 0.2s;
}
.fu-bar-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}
.fu-leg {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  color: #9ca3af;
}
.fu-leg-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Council decision box */
.fu-council {
  background: rgba(255,215,0,0.04);
  border: 1px solid rgba(255,215,0,0.15);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin: 1.5rem 0;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.fu-council-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}
.fu-council-body { flex: 1; }
.fu-council-outcome {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #fbbf24;
  margin-bottom: 0.35rem;
}
.fu-council-body p {
  font-size: 0.85rem;
  color: #d1d5db;
  line-height: 1.6;
  margin: 0;
}

/* Macro score */
.fu-macro {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.75rem;
}
.fu-macro-score {
  text-align: center;
  min-width: 90px;
}
.fu-macro-score .ms-val {
  font-size: 2.5rem;
  font-weight: 800;
  color: #fbbf24;
  line-height: 1;
}
.fu-macro-score .ms-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
  margin-top: 0.25rem;
}
.fu-macro-bullets {
  flex: 1;
  min-width: 200px;
}
.fu-macro-bullets ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.fu-macro-bullets li {
  font-size: 0.83rem;
  color: #d1d5db;
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  line-height: 1.5;
}
.fu-macro-bullets li::before { content: ''; }
.fu-macro-bullet-icon { flex-shrink: 0; font-size: 0.85rem; }

/* Narrative table */
.fu-narr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;
  margin-bottom: 1.5rem;
}
.fu-narr-table th {
  text-align: left;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b7280;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.fu-narr-table td {
  padding: 0.65rem 0.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  color: #d1d5db;
  vertical-align: middle;
}
.fu-narr-table tr:last-child td { border-bottom: none; }
.fu-narr-table td:first-child { font-weight: 600; color: #e5e7eb; }
.narr-chg-pos { color: #4ade80; font-weight: 700; }
.narr-chg-neg { color: #f87171; font-weight: 700; }
.narr-pill {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
}
.narr-pill.hot { background: rgba(255,105,180,0.12); color: #ff69b4; }
.narr-pill.watch { background: rgba(251,191,36,0.1); color: #fbbf24; }
.narr-pill.fade { background: rgba(248,113,113,0.1); color: #f87171; }

/* Signal / reject cards */
.fu-signal-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}
@media (min-width: 600px) {
  .fu-signal-grid { grid-template-columns: 1fr 1fr; }
}
.fu-signal-card {
  border-radius: 10px;
  padding: 1.1rem 1.25rem;
}
.fu-signal-card.candidate {
  background: rgba(74,222,128,0.04);
  border: 1px solid rgba(74,222,128,0.15);
}
.fu-signal-card.reject {
  background: rgba(248,113,113,0.04);
  border: 1px solid rgba(248,113,113,0.15);
}
.fu-signal-eyebrow {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.4rem;
}
.candidate .fu-signal-eyebrow { color: #4ade80; }
.reject .fu-signal-eyebrow { color: #f87171; }
.fu-signal-token {
  font-size: 1.05rem;
  font-weight: 700;
  color: #e5e7eb;
  margin-bottom: 0.15rem;
}
.fu-signal-name {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
}
.fu-signal-body {
  font-size: 0.82rem;
  color: #d1d5db;
  line-height: 1.6;
}
.fu-signal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.75rem;
}
.fu-signal-tag {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.15rem 0.55rem;
  border-radius: 9999px;
  background: rgba(255,255,255,0.06);
  color: #9ca3af;
}

/* Agent learning box */
.fu-agent-box {
  background: linear-gradient(135deg, rgba(255,105,180,0.05), rgba(255,215,0,0.03));
  border: 1px solid rgba(255,105,180,0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}
.fu-agent-box h3 {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #ff69b4;
  margin: 0 0 1rem;
}
.fu-agent-patterns {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.fu-pattern {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}
.fu-pattern-num {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255,105,180,0.15);
  color: #ff69b4;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.1rem;
}
.fu-pattern-text {
  font-size: 0.85rem;
  color: #d1d5db;
  line-height: 1.6;
}
.fu-pattern-text strong { color: #e5e7eb; }

/* Links grid */
.fu-links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.65rem;
  margin-top: 1rem;
}
.fu-link-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 0.6rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 500;
  color: #9ca3af;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s;
}
.fu-link-pill:hover {
  border-color: rgba(255,105,180,0.35);
  color: #ff69b4;
  text-decoration: none;
}
.fu-link-icon { font-size: 0.85rem; }
</style>

<div class="fu-badge">📡 Fund / Signal update · 15 May 2026</div>

<p class="fu-lead">Each week: what changed in pre-live testing of Funds on Base, which research inputs drove decisions, what was passed on, and what the process teaches about the path toward AI-managed Funds. Paper trading only — human-reviewed, no automatic rotations based on council decisions, not live autonomous capital.</p>

<hr class="fu-divider">

<div class="fu-section-label">Three funds, live in the app</div>

<div class="fu-fund-grid">
  <a class="fu-fund-card" href="https://app.messyvirgo.com/funds/mvf-messybased" target="_blank" rel="noopener">
    <div class="fc-name">messybased</div>
    <div class="fc-nav">~$31.8k NAV</div>
    <div class="fc-returns">
      <span class="fc-ret pos">+8.2% 1d</span>
      <span class="fc-ret neg">−4.0% 7d</span>
      <span class="fc-ret pos">+33.0% 30d</span>
    </div>
    <div class="fc-desc">High-beta Base sleeve. MESSY-heavy book with active daily screening and council-certified rotation.</div>
    <span class="fc-tag">active rotation</span>
  </a>
  <a class="fu-fund-card" href="https://app.messyvirgo.com/funds/mvf-base-sub3m" target="_blank" rel="noopener">
    <div class="fc-name">Base Sub 3M</div>
    <div class="fc-nav">~$11.3k NAV</div>
    <div class="fc-returns">
      <span class="fc-ret neg">−0.1% 1d</span>
      <span class="fc-ret neg">−1.1% 7d</span>
      <span class="fc-ret neg">−3.2% 30d</span>
    </div>
    <div class="fc-desc">Core sleeve. 100% WETH base position — council certified candidate rotation admissible today.</div>
    <span class="fc-tag">target_change · 15 May</span>
  </a>
  <a class="fu-fund-card" href="https://app.messyvirgo.com/funds/mvf-ccl-may05" target="_blank" rel="noopener">
    <div class="fc-name">Pre-Alpha Council Play</div>
    <div class="fc-nav">~$9.6k NAV</div>
    <div class="fc-returns">
      <span class="fc-ret neg">−5.8% 1d</span>
      <span class="fc-ret neg">−0.4% 7d</span>
      <span class="fc-ret neu">n/a 30d</span>
    </div>
    <div class="fc-desc">12-name high-beta book stress-testing the full council pipeline: macro brief → narrative brief → rotation decision.</div>
    <span class="fc-tag">council stress-test</span>
  </a>
</div>

<hr class="fu-divider">

<div class="fu-section-label">messybased — book & decisions</div>

**Daily screen (15 May):** Top candidates ranked by cross-signal strength — RS, Performance, Social, Momentum.

<div class="fu-holdings">
  <div class="fu-holdings-label">Current book — high-beta sleeve</div>
  <div class="fu-bar">
    <div class="fu-bar-seg" style="width:64%;background:#ff69b4;opacity:0.85" title="MESSY 64%"></div>
    <div class="fu-bar-seg" style="width:14%;background:#fbbf24;opacity:0.8" title="ETHY 14%"></div>
    <div class="fu-bar-seg" style="width:7%;background:#60a5fa;opacity:0.8" title="FACY 7%"></div>
    <div class="fu-bar-seg" style="width:6%;background:#34d399;opacity:0.8" title="WIRE 6%"></div>
    <div class="fu-bar-seg" style="width:6%;background:#a78bfa;opacity:0.8" title="CAP 6%"></div>
    <div class="fu-bar-seg" style="width:4%;background:#f87171;opacity:0.75" title="VPAY 4%"></div>
  </div>
  <div class="fu-bar-legend">
    <span class="fu-leg"><span class="fu-leg-dot" style="background:#ff69b4"></span>MESSY 64%</span>
    <span class="fu-leg"><span class="fu-leg-dot" style="background:#fbbf24"></span>ETHY 14%</span>
    <span class="fu-leg"><span class="fu-leg-dot" style="background:#60a5fa"></span>FACY 7%</span>
    <span class="fu-leg"><span class="fu-leg-dot" style="background:#34d399"></span>WIRE 6%</span>
    <span class="fu-leg"><span class="fu-leg-dot" style="background:#a78bfa"></span>CAP 6%</span>
    <span class="fu-leg"><span class="fu-leg-dot" style="background:#f87171"></span>VPAY 4% ⚠️</span>
  </div>
</div>

**7-day aggregate (7/7 runs):** Persistent candidates that kept showing up across the week — not one-day noise: **mute** (7/7 days), **shekel** (6/7), **cred** (6/7), **heu** (6/7), **pr** (5/7).

<div class="fu-council">
  <div class="fu-council-icon">⚖️</div>
  <div class="fu-council-body">
    <div class="fu-council-outcome">Council certified · target_change · 15 May 2026</div>
    <p>Full candidate rotation within high-beta sleeve. Screening aggregates fresh (7-day, 7 runs) with persistent leaders: <strong>MUTE</strong> 7/7 days. No policy violations; all capabilities allowed. Macro Neutral (N regime) maintained — high-beta 100% allocation held per preparation brief. VPAY ~−$133 unrealized and not in screened set.</p>
  </div>
</div>

<div class="fu-section-label">Base Sub 3M — rotation now admissible</div>

Book is **100% WETH** (~$11.3k, +5.6% unrealized). The May 11 session held current. Today's council session (15 May) certified **`target_change`** — fresh evidence across all signals, target sleeve empty, candidate rotation now policy-admissible. Risk PM flagged speculative screen candidates lacking fundamentals.

<div class="fu-council">
  <div class="fu-council-icon">🔒</div>
  <div class="fu-council-body">
    <div class="fu-council-outcome">Council certified · target_change · 15 May 2026</div>
    <p>Fresh evidence across all signals. Fund concentrated 100% base (WETH, +5.6% unrealized). Target sleeve empty — candidate rotation now admissible. Risk PM flags speculative screen candidates (e.g., $bv7x, cred, fair) lacking deep fundamentals. Macro Neutral (N, 58%). No policy violations.</p>
  </div>
</div>

<div class="fu-section-label">Pre-Alpha Council Play — 90% turnover proposed</div>

10-position sleeve. Notable positions today: **SHEKEL** +$432 (top winner), **SEAM** −$403, **ANDY** −$187, **CRED** −$181 (bottom laggards). Council proposes exiting 9/10 positions.

<div class="fu-council">
  <div class="fu-council-icon">🔄</div>
  <div class="fu-council-body">
    <div class="fu-council-outcome">Council certified · target_change · 15 May 2026</div>
    <p>All evidence fresh. Proposed ~90% turnover (9/10 positions) — exit laggards (<strong>SEAM</strong> −$403, <strong>CRED</strong> −$181, <strong>ANDY</strong> −$187) for top-screened replacements. SHEKEL +$432 retained. High-beta sleeve (100%) still breaches 60% guardrail — macro PM directs maintain buckets per Neutral regime.</p>
  </div>
</div>

<hr class="fu-divider">

<div class="fu-section-label">Market regime — macro economics</div>

<div class="fu-macro">
  <div class="fu-macro-score">
    <div class="ms-val">57.8</div>
    <div class="ms-label">Neutral</div>
  </div>
  <div class="fu-macro-bullets">
    <ul>
      <li><span class="fu-macro-bullet-icon">📈</span> U.S. spot BTC ETFs — 7 consecutive weeks of inflows (~$3.4B). Institutional floor near $80.6k.</li>
      <li><span class="fu-macro-bullet-icon">⚠️</span> Reverse repo +2,380% in 20 days. Treasury General Account +11.6%. Cash leaving money markets — systemic tightening signal.</li>
      <li><span class="fu-macro-bullet-icon">🎯</span> Posture: hold 35–45% dry powder. Watch June FOMC (Warsh). Reduce beta 20–30% if "higher for longer" returns.</li>
    </ul>
  </div>
</div>

<hr class="fu-divider">

<div class="fu-section-label">Narrative momentum — 15 May snapshot</div>

<div style="overflow-x:auto;border:1px solid rgba(255,255,255,0.08);border-radius:10px;">
<table class="fu-narr-table" style="margin:0;width:100%">
  <thead>
    <tr>
      <th>Narrative</th>
      <th>15d</th>
      <th>30d</th>
      <th>60d</th>
      <th title="Percentage points above or below BTC over 15 days">vs BTC 15d</th>
      <th>Read</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Privacy Coins</td>
      <td class="narr-chg-pos">+32.9%</td>
      <td class="narr-chg-pos">+33.9%</td>
      <td class="narr-chg-pos">+55.4%</td>
      <td class="narr-chg-pos">+12.0pp</td>
      <td><span class="narr-pill hot">Leading</span></td>
    </tr>
    <tr>
      <td>DeSci</td>
      <td class="narr-chg-pos">+25.0%</td>
      <td class="narr-chg-pos">+74.1%</td>
      <td class="narr-chg-pos">+58.5%</td>
      <td class="narr-chg-pos">+21.8pp</td>
      <td><span class="narr-pill watch">High noise</span></td>
    </tr>
    <tr>
      <td>AI Agents</td>
      <td class="narr-chg-pos">+23.7%</td>
      <td class="narr-chg-pos">+26.4%</td>
      <td class="narr-chg-pos">+10.1%</td>
      <td class="narr-chg-neg">−16.0pp</td>
      <td><span class="narr-pill watch">Frothy</span></td>
    </tr>
    <tr>
      <td>DeFi</td>
      <td class="narr-chg-pos">+11.4%</td>
      <td class="narr-chg-pos">+13.1%</td>
      <td class="narr-chg-pos">+12.6%</td>
      <td class="narr-chg-neg">−3.9pp</td>
      <td><span class="narr-pill hot">Steady</span></td>
    </tr>
    <tr>
      <td>RWA</td>
      <td class="narr-chg-pos">+10.5%</td>
      <td class="narr-chg-pos">+16.4%</td>
      <td class="narr-chg-pos">+20.6%</td>
      <td class="narr-chg-pos">+4.1pp</td>
      <td><span class="narr-pill watch">Building</span></td>
    </tr>
    <tr>
      <td>SocialFi</td>
      <td class="narr-chg-pos">+3.8%</td>
      <td class="narr-chg-neg">−20.1%</td>
      <td class="narr-chg-neg">−24.1%</td>
      <td class="narr-chg-neg">−31.9pp</td>
      <td><span class="narr-pill fade">Fading</span></td>
    </tr>
  </tbody>
</table>
</div>

<p style="font-size:0.72rem;color:#4b5563;margin-top:0.5rem;margin-bottom:1.25rem">pp = percentage points above/below BTC over the same window. Positive = outperforming BTC; negative = underperforming.</p>

AI Agents looks strong in absolute terms (+23.7% 15d) but is −16pp vs BTC — it is winning less than Bitcoin is. That is the gap between a screener ranking and an allocation-worthy signal, and exactly why Council sessions flagged the narrative as frothy before approving new beta.

<hr class="fu-divider">

<div class="fu-section-label">Aggregate signal · Risk reject</div>

<div class="fu-signal-grid">
  <div class="fu-signal-card candidate">
    <div class="fu-signal-eyebrow">✅ Aggregate signal</div>
    <div class="fu-signal-token">MUTE</div>
    <div class="fu-signal-name">MUTE SWAP by Virtuals · Base</div>
    <div class="fu-signal-body">Appeared in <strong>7/7 daily runs</strong> in both messybased and Pre-Alpha Council Play over the past week — the only token with perfect persistence across the full lookback. Average rank 6.3 in messybased; best rank 4. Persistent social and RS strength, not a one-day spike.</div>
    <div class="fu-signal-meta">
      <span class="fu-signal-tag">7/7 days</span>
      <span class="fu-signal-tag">2-fund persistence</span>
      <span class="fu-signal-tag">social + RS</span>
    </div>
  </div>
  <div class="fu-signal-card reject">
    <div class="fu-signal-eyebrow">❌ Risk reject</div>
    <div class="fu-signal-token">VPAY</div>
    <div class="fu-signal-name">VPay · messybased</div>
    <div class="fu-signal-body">Held in book from earlier entry. No longer in the screened candidate set. Unrealized ~−$145. Council protocol explicitly listed VPAY for removal — price alone does not override a failed screen.</div>
    <div class="fu-signal-meta">
      <span class="fu-signal-tag">not screened</span>
      <span class="fu-signal-tag">−$145 pnl</span>
      <span class="fu-signal-tag">rotate out</span>
    </div>
  </div>
</div>

<hr class="fu-divider">

<div class="fu-agent-box">
  <h3>What this teaches the future Fund Agent</h3>
  <div class="fu-agent-patterns">
    <div class="fu-pattern">
      <div class="fu-pattern-num">1</div>
      <div class="fu-pattern-text"><strong>Macro gates gross exposure.</strong> Neutral (57.8) → Base Sub 3M stays in WETH; beta Funds rotate within the book, not expand it blindly.</div>
    </div>
    <div class="fu-pattern">
      <div class="fu-pattern-num">2</div>
      <div class="fu-pattern-text"><strong>Daily screen ≠ automatic trade.</strong> nook tops the day. mute/shekel/cred top the week. The agent needs both the daily signal and the 7-day persistence filter.</div>
    </div>
    <div class="fu-pattern">
      <div class="fu-pattern-num">3</div>
      <div class="fu-pattern-text"><strong>Council is the constraint layer.</strong> Certified outcomes encode PM conflict, guardrail breaches, and explicit rotate-out lists. This is training data for autonomous Funds — not marketing copy.</div>
    </div>
  </div>
</div>

<hr class="fu-divider">

<div class="fu-section-label">Run the same workflow</div>

<div class="fu-links-grid">
  <a class="fu-link-pill" href="https://app.messyvirgo.com/funds" target="_blank" rel="noopener"><span class="fu-link-icon">🏦</span> All Funds</a>
  <a class="fu-link-pill" href="https://app.messyvirgo.com/funds/mvf-messybased" target="_blank" rel="noopener"><span class="fu-link-icon">📊</span> messybased</a>
  <a class="fu-link-pill" href="https://app.messyvirgo.com/funds/mvf-base-sub3m" target="_blank" rel="noopener"><span class="fu-link-icon">📊</span> Base Sub 3M</a>
  <a class="fu-link-pill" href="https://app.messyvirgo.com/funds/mvf-ccl-may05" target="_blank" rel="noopener"><span class="fu-link-icon">📊</span> Pre-Alpha Council</a>
  <a class="fu-link-pill" href="https://app.messyvirgo.com/macro-economics" target="_blank" rel="noopener"><span class="fu-link-icon">🌐</span> Macro Economics</a>
  <a class="fu-link-pill" href="https://app.messyvirgo.com/narratives" target="_blank" rel="noopener"><span class="fu-link-icon">📈</span> Narrative Momentum</a>
  <a class="fu-link-pill" href="https://app.messyvirgo.com/due-diligence/performance" target="_blank" rel="noopener"><span class="fu-link-icon">⚡</span> Performance Signals</a>
  <a class="fu-link-pill" href="https://app.messyvirgo.com/due-diligence/social" target="_blank" rel="noopener"><span class="fu-link-icon">💬</span> Social Signals</a>
  <a class="fu-link-pill" href="https://app.messyvirgo.com/due-diligence/security" target="_blank" rel="noopener"><span class="fu-link-icon">🔒</span> Security Signals</a>
</div>

<p style="margin-top:2rem;font-size:0.82rem;color:#6b7280;text-align:center">Next update: week of 2026-05-22 &nbsp;·&nbsp; <a href="/blog/" style="color:#ff69b4">← Back to all updates</a></p>

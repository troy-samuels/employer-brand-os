#!/usr/bin/env npx tsx
/**
 * Seed OpenRole public_audits by hitting the local audit API
 * for the top 100 UK employers.
 *
 * Usage:  npx tsx scripts/seed-audits.ts
 */

const BASE_URL = "http://localhost:4000";

// Top 100 UK employers — mix of FTSE 100, large employers, tech, consulting, retail/hospitality
const COMPANIES: { name: string; domain: string }[] = [
  // ── FTSE 100 / Blue Chips ──
  { name: "Tesco", domain: "tesco.com" },
  { name: "BP", domain: "bp.com" },
  { name: "Shell", domain: "shell.co.uk" },
  { name: "Unilever", domain: "unilever.com" },
  { name: "GSK", domain: "gsk.com" },
  { name: "AstraZeneca", domain: "astrazeneca.com" },
  { name: "HSBC", domain: "hsbc.com" },
  { name: "Barclays", domain: "barclays.co.uk" },
  { name: "Lloyds Banking Group", domain: "lloydsbankinggroup.com" },
  { name: "NatWest Group", domain: "natwestgroup.com" },
  { name: "Standard Chartered", domain: "sc.com" },
  { name: "Rolls-Royce", domain: "rolls-royce.com" },
  { name: "BAE Systems", domain: "baesystems.com" },
  { name: "Rio Tinto", domain: "riotinto.com" },
  { name: "Anglo American", domain: "angloamerican.com" },
  { name: "Glencore", domain: "glencore.com" },
  { name: "Vodafone", domain: "vodafone.co.uk" },
  { name: "BT Group", domain: "bt.com" },
  { name: "Diageo", domain: "diageo.com" },
  { name: "Reckitt", domain: "reckitt.com" },
  { name: "Compass Group", domain: "compass-group.com" },
  { name: "Relx", domain: "relx.com" },
  { name: "London Stock Exchange Group", domain: "lseg.com" },
  { name: "Prudential", domain: "prudential.co.uk" },
  { name: "Legal & General", domain: "legalandgeneral.com" },
  { name: "Aviva", domain: "aviva.com" },
  { name: "WPP", domain: "wpp.com" },
  { name: "Experian", domain: "experian.co.uk" },
  { name: "Smith & Nephew", domain: "smith-nephew.com" },
  { name: "National Grid", domain: "nationalgrid.com" },
  { name: "SSE", domain: "sse.com" },
  { name: "Centrica", domain: "centrica.com" },
  { name: "Sage Group", domain: "sage.com" },
  { name: "Pearson", domain: "pearson.com" },
  { name: "InterContinental Hotels Group", domain: "ihg.com" },

  // ── Large UK employers by headcount ──
  { name: "NHS", domain: "nhs.uk" },
  { name: "Royal Mail", domain: "royalmail.com" },
  { name: "Sainsbury's", domain: "sainsburys.co.uk" },
  { name: "Asda", domain: "asda.com" },
  { name: "Morrisons", domain: "morrisons.com" },
  { name: "John Lewis Partnership", domain: "johnlewispartnership.co.uk" },
  { name: "Boots", domain: "boots.com" },
  { name: "Network Rail", domain: "networkrail.co.uk" },
  { name: "Serco", domain: "serco.com" },
  { name: "G4S", domain: "g4s.com" },
  { name: "Capita", domain: "capita.com" },
  { name: "Aldi UK", domain: "aldi.co.uk" },
  { name: "Lidl UK", domain: "lidl.co.uk" },
  { name: "Co-op", domain: "coop.co.uk" },
  { name: "Amazon UK", domain: "amazon.co.uk" },

  // ── UK Tech ──
  { name: "Arm", domain: "arm.com" },
  { name: "Darktrace", domain: "darktrace.com" },
  { name: "Revolut", domain: "revolut.com" },
  { name: "Monzo", domain: "monzo.com" },
  { name: "Wise", domain: "wise.com" },
  { name: "Deliveroo", domain: "deliveroo.co.uk" },
  { name: "Ocado", domain: "ocado.com" },
  { name: "Improbable", domain: "improbable.io" },
  { name: "Checkout.com", domain: "checkout.com" },
  { name: "GoCardless", domain: "gocardless.com" },
  { name: "Starling Bank", domain: "starlingbank.com" },
  { name: "Funding Circle", domain: "fundingcircle.com" },
  { name: "Cazoo", domain: "cazoo.co.uk" },
  { name: "Sky", domain: "sky.com" },

  // ── Big 4 + Consulting ──
  { name: "Deloitte", domain: "deloitte.co.uk" },
  { name: "PwC", domain: "pwc.co.uk" },
  { name: "EY", domain: "ey.com" },
  { name: "KPMG", domain: "kpmg.co.uk" },
  { name: "McKinsey", domain: "mckinsey.com" },
  { name: "Accenture", domain: "accenture.com" },
  { name: "BCG", domain: "bcg.com" },
  { name: "Bain & Company", domain: "bain.com" },
  { name: "Capgemini", domain: "capgemini.com" },
  { name: "IBM UK", domain: "ibm.com" },

  // ── Retail / Hospitality / Consumer ──
  { name: "Primark", domain: "primark.com" },
  { name: "Next", domain: "next.co.uk" },
  { name: "Marks & Spencer", domain: "marksandspencer.com" },
  { name: "JD Sports", domain: "jdsports.co.uk" },
  { name: "Greggs", domain: "greggs.co.uk" },
  { name: "Wetherspoons", domain: "jdwetherspoon.com" },
  { name: "Whitbread", domain: "whitbread.co.uk" },
  { name: "Pret A Manger", domain: "pret.co.uk" },
  { name: "Costa Coffee", domain: "costa.co.uk" },
  { name: "Nando's", domain: "nandos.co.uk" },
  { name: "Burberry", domain: "burberry.com" },
  { name: "ASOS", domain: "asos.com" },
  { name: "Boohoo", domain: "boohoo.com" },
  { name: "THG", domain: "thg.com" },

  // ── Engineering / Defence / Energy ──
  { name: "Jaguar Land Rover", domain: "jaguarlandrover.com" },
  { name: "Dyson", domain: "dyson.co.uk" },
  { name: "Babcock International", domain: "babcockinternational.com" },
  { name: "Balfour Beatty", domain: "balfourbeatty.com" },
  { name: "Taylor Wimpey", domain: "taylorwimpey.co.uk" },
  { name: "Persimmon", domain: "persimmonhomes.com" },

  // ── Financial Services ──
  { name: "Schroders", domain: "schroders.com" },
  { name: "Man Group", domain: "man.com" },
  { name: "Hargreaves Lansdown", domain: "hl.co.uk" },
  { name: "Admiral Group", domain: "admiralgroup.co.uk" },
  { name: "Direct Line Group", domain: "directlinegroup.co.uk" },

  // ── Media / Entertainment ──
  { name: "BBC", domain: "bbc.co.uk" },
  { name: "ITV", domain: "itv.com" },
  { name: "Channel 4", domain: "channel4.com" },
];

const TOTAL = COMPANIES.length;

// ── Helpers ──

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

interface AuditResult {
  company: string;
  domain: string;
  status: "success" | "error";
  score?: number;
  slug?: string;
  error?: string;
  durationMs: number;
}

async function runAudit(
  company: { name: string; domain: string },
  index: number
): Promise<AuditResult> {
  const tag = `[${index + 1}/${TOTAL}]`;
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000); // 2 min timeout

    const res = await fetch(`${BASE_URL}/api/audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:4000",
        Host: "localhost:4000",
      },
      body: JSON.stringify({ url: company.domain }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const durationMs = Date.now() - start;

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`${tag} ✗ ${company.name} (${company.domain}) — HTTP ${res.status}: ${text.slice(0, 200)}`);
      return { company: company.name, domain: company.domain, status: "error", error: `HTTP ${res.status}`, durationMs };
    }

    const json = await res.json();
    const score = json?.data?.score ?? json?.score ?? "?";
    const slug = json?.data?.slug ?? json?.slug ?? "?";
    console.log(`${tag} ✓ ${company.name} (${company.domain}) — Score: ${score}, Slug: ${slug} (${(durationMs / 1000).toFixed(1)}s)`);
    return { company: company.name, domain: company.domain, status: "success", score, slug, durationMs };
  } catch (err: any) {
    const durationMs = Date.now() - start;
    const msg = err?.name === "AbortError" ? "Timeout (120s)" : err?.message ?? String(err);
    console.error(`${tag} ✗ ${company.name} (${company.domain}) — ${msg}`);
    return { company: company.name, domain: company.domain, status: "error", error: msg, durationMs };
  }
}

// ── Main ──

async function main() {
  console.log(`\n🚀 OpenRole Seed Audit — ${TOTAL} UK employers\n`);
  console.log(`Target: ${BASE_URL}/api/audit\n`);

  // Quick health check
  try {
    const health = await fetch(`${BASE_URL}/api/health`);
    if (!health.ok) throw new Error(`HTTP ${health.status}`);
    console.log("✅ Dev server is healthy\n");
  } catch {
    console.error("❌ Dev server not reachable at " + BASE_URL);
    console.error("   Start it first: cd frontend && npx next dev --port 4000\n");
    process.exit(1);
  }

  const results: AuditResult[] = [];
  const startTime = Date.now();

  for (let i = 0; i < COMPANIES.length; i++) {
    const result = await runAudit(COMPANIES[i], i);
    results.push(result);

    // Wait 2-3s between requests (skip after last)
    if (i < COMPANIES.length - 1) {
      const delay = 2000 + Math.random() * 1000;
      await sleep(delay);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  const successes = results.filter((r) => r.status === "success");
  const failures = results.filter((r) => r.status === "error");

  console.log(`\n${"=".repeat(60)}`);
  console.log(`🏁 SEED COMPLETE — ${elapsed} minutes`);
  console.log(`${"=".repeat(60)}`);
  console.log(`✅ Succeeded: ${successes.length}/${TOTAL}`);
  console.log(`❌ Failed:    ${failures.length}/${TOTAL}`);

  if (successes.length > 0) {
    const avgScore = (successes.reduce((s, r) => s + (r.score ?? 0), 0) / successes.length).toFixed(1);
    console.log(`📊 Average score: ${avgScore}`);
  }

  if (failures.length > 0) {
    console.log(`\n❌ Failed companies:`);
    for (const f of failures) {
      console.log(`   - ${f.company} (${f.domain}): ${f.error}`);
    }
  }

  console.log("");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

/**
 * Runtime adapter test — runs the REAL frontend adapter code against the REAL
 * live backend, exactly as the browser would. Uses Vite's build API to bundle
 * src/api/adapters.ts into plain JS.
 *
 * Usage: node scripts/test-adapters.mjs
 */
import { rmSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, ".adapters-test");

// ---------------------------------------------------------------- build
rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const { build } = await import("vite");
await build({
  root: ROOT,
  configFile: false, // don't drag in the app config/plugins
  logLevel: "error",
  build: {
    outDir: OUT_DIR,
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: path.join(ROOT, "src/api/adapters.ts"),
      formats: ["es"],
      fileName: () => "adapters.mjs",
    },
  },
});

const adapters = await import(pathToFileURL(path.join(OUT_DIR, "adapters.mjs")).href);

// ---------------------------------------------------------------- api
const API = "http://localhost:5000/api";

async function api(path, token) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}: ${JSON.stringify(body).slice(0, 120)}`);
  return body.data !== undefined ? body.data : body;
}

let passed = 0;
let failed = 0;
const failures = [];

function check(name, cond, detail = "") {
  if (cond) {
    passed++;
    console.log(`  \u2713 ${name}`);
  } else {
    failed++;
    failures.push(name);
    console.log(`  \u2717 ${name}  ${detail}`);
  }
}

// ---------------------------------------------------------------- run
console.log("Logging in...");
const loginRes = await fetch(`${API}/v1/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "admin@company.com", password: "AdminPassword123!" }),
});
const loginBody = await loginRes.json();
const token = loginBody.data?.token;
if (!token) {
  console.error("LOGIN FAILED:", JSON.stringify(loginBody).slice(0, 300));
  process.exit(1);
}
console.log("Login OK.\n");

// --- Accounts ---
console.log("accounts");
{
  const accounts = adapters.adaptAccountTree(
    (await api("/accounts/tree", token)) ?? []
  );
  check("tree non-empty", accounts.length > 0, "got 0 roots");
  const first = accounts[0];
  check(
    "status normalized to Active/Inactive",
    first.status === "Active" || first.status === "Inactive" || first.status === undefined,
    `got ${first.status}`
  );
  const flat = adapters.adaptAccount(
    (await api("/accounts", token)).find((a) => !a.isGroup)
  );
  check("balance present on leaf", typeof flat.balance === "number", `got ${flat.balance}`);
}

// --- Customers / suppliers ---
console.log("customers & suppliers");
{
  const res = await fetch(`${API}/customers?page=1&limit=5`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  const page = body.data;
  const customers = page.customers.map(adapters.adaptCustomer);
  check("customers mapped", customers.length > 0, "0 rows");
  const c = customers[0];
  check("name mapped", typeof c.name === "string" && c.name.length > 0, JSON.stringify(c.name));
  check("gstin key exists (string|undefined)", "gstin" in c);
  check(
    "status preserved",
    c.status === "Active" || c.status === "Blocked" || c.status === "Inactive" || c.status === "Draft",
    `got ${c.status}`
  );

  const resS = await fetch(`${API}/suppliers?page=1&limit=5`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const sb = await resS.json();
  const suppliers = sb.data.suppliers.map(adapters.adaptSupplier);
  check("suppliers mapped", suppliers.length > 0);
  check("supplier name mapped", typeof suppliers[0].name === "string", JSON.stringify(suppliers[0].name));

  // round-trip: adapt then push back through partyToBackend — must survive
  const roundTrip = adapters.partyToBackend(
    { ...c, name: c.name, billingAddress: c.billingAddress ?? { line1: "a", city: "b" } },
    "customer"
  );
  check("partyToBackend produces customerName", roundTrip.customerName === c.name);
  check("partyToBackend keeps gstNumber", roundTrip.gstNumber === (c.gstNumber ?? undefined) || roundTrip.gstNumber === undefined);
  check("partyToBackend strips name/gstin", !("name" in roundTrip) && !("gstin" in roundTrip));
}

// --- Dashboard ---
console.log("dashboard");
{
  const series = await api("/dashboard/cash-flow-series?days=7", token);
  check("cash series is array of 7", Array.isArray(series) && series.length === 7);
  check(
    "series shape {date,inflow,outflow,net}",
    series.every((d) => "date" in d && "inflow" in d && "outflow" in d && "net" in d)
  );

  const acts = await api("/dashboard/recent-activities?limit=5", token);
  check("recent activities non-empty", acts.length > 0);
  check(
    "activity fields present",
    acts.every((a) => "action" in a && "entity" in a && "createdAt" in a),
    JSON.stringify(acts[0])
  );
}

// --- Reports ---
console.log("reports");
{
  const tb = adapters.adaptTrialBalance(await api("/reports/trial-balance", token));
  check("TB accounts present", tb.accounts.length > 0, "0 accounts");
  check("TB has debit/credit numbers", tb.accounts.every((a) => typeof a.debit === "number"));
  check("TB totals numbers", typeof tb.totalDebits === "number" && typeof tb.totalCredits === "number");

  const pl = adapters.adaptProfitLoss(await api("/reports/profit-loss", token));
  check("PL totalIncome number", typeof pl.totalIncome === "number", `${pl.totalIncome}`);
  check("PL netProfit number", typeof pl.netProfit === "number");
  check("PL incomeAccounts flattened", pl.incomeAccounts.every((a) => typeof a.balance === "number"));

  const bs = adapters.adaptBalanceSheet(await api("/reports/balance-sheet", token));
  check("BS totals flat", typeof bs.totalAssets === "number" && typeof bs.totalEquity === "number");

  const cf = adapters.adaptCashFlow(await api("/reports/cash-flow", token));
  check(
    "CF totals flat numbers",
    ["operatingActivities", "investingActivities", "financingActivities", "netCashFlow"].every((k) => typeof cf[k] === "number"),
    JSON.stringify(cf)
  );

  const gl = adapters.adaptGeneralLedger(await api(`/reports/general-ledger`, token));
  check("GL entries mapped", gl.entries.length > 0, "0 entries");
  check("GL runningBalance numbers", gl.entries.every((e) => typeof e.runningBalance === "number"));
  check("GL closingBalance derived", typeof gl.closingBalance === "number");

  const ar = adapters.adaptAging(await api(`/reports/ar-aging`, token));
  check("AR aging rows have partyName/current/days30/total", ar.every((r) => "partyName" in r && "current" in r && "days30" in r && "total" in r));

  const ap = adapters.adaptAging(await api(`/reports/ap-aging`, token));
  check("AP aging rows valid", ap.every((r) => typeof r.total === "number"));

  const g1 = adapters.adaptGstr(await api("/reports/gst/gstr-1", token));
  check("GSTR-1 rateWise mapped", g1.rateWise.length > 0, "0 slabs");
  check(
    "GSTR-1 slab fields",
    g1.rateWise.every((r) => "taxType" in r && "rate" in r && "taxableValue" in r && "taxAmount" in r)
  );

  const sr = adapters.adaptRegister(await api("/reports/sales-register?startDate=2024-04-01&endDate=2025-03-31", token));
  check("sales register rows have partyName", sr.every((r) => typeof r.partyName === "string" && r.partyName.length > 0), JSON.stringify(sr[0]?.partyName));
  check("sales register rows have grandTotal", sr.every((r) => typeof r.grandTotal === "number"));
}

// --- Journal entries ---
console.log("journal entries");
{
  const res = await fetch(`${API}/journal-entries`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  const payload = body.data;
  const list = Array.isArray(payload) ? payload : payload?.items ?? [];
  const jes = list.map(adapters.adaptJournalEntry);
  check("JE list mapped", jes.length > 0, "0 entries");
  const j = jes[0];
  check("JE entryNumber mapped", typeof j.entryNumber === "string", JSON.stringify(j.entryNumber));
  check("JE items have debit/credit numbers", j.items.every((li) => typeof li.debit === "number" && typeof li.credit === "number"));
}

// --- Budgets ---
console.log("budgets");
{
  const res = await fetch(`${API}/budgets`, { headers: { Authorization: `Bearer ${token}` } });
  const body = await res.json();
  const list = Array.isArray(body.data) ? body.data : body.data?.items ?? [];
  const budgets = list.map(adapters.adaptBudget);
  check("budget list mapped", budgets.length > 0, "0 budgets");
  const b = budgets[0];
  check("budgetAmount mapped", typeof b.budgetAmount === "number" && b.budgetAmount > 0, `${b.budgetAmount}`);
  check("actualAmount computed by backend", typeof b.actualAmount === "number", `${b.actualAmount}`);
  check("fiscalYear is a name string", typeof b.fiscalYear === "string", JSON.stringify(b.fiscalYear));

  const vsRaw = await api(`/budgets/${b._id}/vs-actual`, token);
  const vs = adapters.adaptBudgetVsActual(vsRaw);
  check("vsActual actual number", typeof vs.actual === "number");
  check("vsActual breakdown rows {month,budget,actual}", vs.breakdown.every((r) => "month" in r && "budget" in r && "actual" in r));
  check("vsActual utilizationPercentage", typeof vs.utilizationPercentage === "number");
}

// --- Settings & taxes ---
console.log("settings & taxes");
{
  const fys = (await api("/settings/fiscal-years", token)).map(adapters.adaptFiscalYear);
  check("fiscal years mapped", fys.length > 0 && typeof fys[0].name === "string", JSON.stringify(fys[0]?.name));
  check("isClosed boolean", fys.every((f) => typeof f.isClosed === "boolean"));

  const series = (await api("/settings/numbering-series", token)).map(adapters.adaptNumberingSeries);
  check("numbering series mapped", series.length > 0 && typeof series[0].padding === "number");

  const rates = (await api("/tax-rates", token)).map(adapters.adaptTaxRate);
  check("tax rates mapped", rates.length > 0 && typeof rates[0].name === "string" && typeof rates[0].code === "string");

  const groups = (await api("/tax-groups", token)).map(adapters.adaptTaxGroup);
  check("tax groups mapped", groups.length > 0 && typeof groups[0].name === "string");
  check("tax group totalRate computed > 0", groups.every((g) => typeof g.totalRate === "number" && g.totalRate > 0), JSON.stringify(groups.map((g) => g.totalRate)));
  check("tax group line rates resolved", groups.every((g) => g.taxes.every((t) => typeof t.rate === "number" && t.rate > 0)), JSON.stringify(groups[0]?.taxes));

  const cc = (await api("/cost-centers", token)).map(adapters.adaptCostCenter);
  check("cost centers mapped", cc.length > 0 && typeof cc[0].isActive === "boolean");
}

// --- Documents ---
console.log("documents");
{
  const res = await fetch(`${API}/sales-invoices`, { headers: { Authorization: `Bearer ${token}` } });
  const body = await res.json();
  const payload = body.data;
  const list = Array.isArray(payload) ? payload : payload?.items ?? [];
  const docs = list.map(adapters.adaptDocument);
  check("sales invoices mapped", docs.length > 0, "0 docs");
  const d = docs[0];
  check("doc invoiceNumber present", typeof d.invoiceNumber === "string", JSON.stringify(d.invoiceNumber));
  check("doc customer name mapped", d.customer?.name === undefined || typeof d.customer.name === "string", JSON.stringify(d.customer?.name));

  const crRaw = await fetch(`${API}/credit-notes`, { headers: { Authorization: `Bearer ${token}` } });
  const crBody = await crRaw.json();
  const crList = Array.isArray(crBody.data) ? crBody.data : crBody.data?.items ?? [];
  const cns = crList.map(adapters.adaptDocument);
  check("credit notes noteNumber mapped", cns.every((n) => typeof n.noteNumber === "string"), JSON.stringify(cns[0]?.noteNumber));
}

// ---------------------------------------------------------------- summary
console.log(`\n${"=".repeat(50)}`);
console.log(`PASSED: ${passed}   FAILED: ${failed}`);
rmSync(OUT_DIR, { recursive: true, force: true });
if (failed > 0) {
  console.log("Failures:", failures.join(" | "));
  process.exit(1);
}

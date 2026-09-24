import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ReportShell } from "@/components/report/ReportShell";
import { type ReportFilterState } from "@/components/report/ReportFilters";
import { EntityCombobox } from "@/components/fields/EntityCombobox";
import { accountService } from "@/api/services/accountService";
import { customerService } from "@/api/services/customerService";
import { supplierService } from "@/api/services/supplierService";
import { reportService } from "@/api/services/reportService";
import { queryKeys } from "@/api/queryKeys";
import { useActiveFiscalYear } from "@/hooks/useActiveFiscalYear";
import { REPORTS, chipsFor, type ReportKey } from "../reportConfig";
import {
  ChartCard,
  DonutChart,
  MoneyBarChart,
  TrendLineChart,
} from "@/components/charts";
import { formatMoney } from "@/lib/formatMoney";
import { formatDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";

const REPORT_FETCHERS: Record<ReportKey, (params: any) => Promise<any>> = {
  "general-ledger": reportService.getGeneralLedger,
  "trial-balance": reportService.getTrialBalance,
  "profit-loss": reportService.getProfitLoss,
  "balance-sheet": reportService.getBalanceSheet,
  "cash-flow": reportService.getCashFlow,
  "sales-register": reportService.getSalesRegister,
  "purchase-register": reportService.getPurchaseRegister,
  "customer-statement": reportService.getCustomerStatement,
  "vendor-statement": reportService.getVendorStatement,
  "ar-aging": reportService.getArAging,
  "ap-aging": reportService.getApAging,
  "gstr-1": reportService.getGstr1,
  "gstr-3b": reportService.getGstr3b,
};

export const ReportPage: React.FC<{ report: ReportKey }> = ({ report }) => {
  const cfg = REPORTS[report];
  const { activeFiscalYear } = useActiveFiscalYear();

  // URL-driven filters for shareable deep links (?accountId=, ?customerId=, ?supplierId=)
  const initial = useMemo<ReportFilterState>(() => {
    const sp = new URLSearchParams(window.location.search);
    return {
      startDate: sp.get("startDate") ?? activeFiscalYear?.startDate?.slice(0, 10) ?? "",
      endDate: sp.get("endDate") ?? activeFiscalYear?.endDate?.slice(0, 10) ?? "",
      asOfDate: sp.get("asOfDate") ?? new Date().toISOString().slice(0, 10),
      accountId: sp.get("accountId") ?? "",
      customerId: sp.get("customerId") ?? "",
      supplierId: sp.get("supplierId") ?? "",
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report]);

  const [filters, setFilters] = useState<ReportFilterState>(initial);
  const [applied, setApplied] = useState<ReportFilterState>(initial);

  const { data: accounts } = useQuery({ queryKey: queryKeys.accounts.list(), queryFn: accountService.getAccounts });
  const { data: customers } = useQuery({ queryKey: queryKeys.customers.list({ limit: 100 }), queryFn: () => customerService.getCustomers({ limit: 100 }) });
  const { data: suppliers } = useQuery({ queryKey: queryKeys.suppliers.list({ limit: 100 }), queryFn: () => supplierService.getSuppliers({ limit: 100 }) });

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["reports", report, applied],
    queryFn: () => REPORT_FETCHERS[report](applied),
    placeholderData: (prev) => prev,
  });

  const chips = chipsFor(report, data);
  const extraFilters = (
    <>
      {cfg.needsAccount && (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Account</label>
          <EntityCombobox
            options={(accounts ?? []).filter((a) => !a.isGroup).map((a) => ({ value: a._id, label: `${a.accountCode} — ${a.accountName}` }))}
            value={filters.accountId ?? ""}
            onChange={(v) => setFilters((f) => ({ ...f, accountId: v }))}
            placeholder="All accounts"
          />
        </div>
      )}
      {cfg.needsCustomer && (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Customer</label>
          <EntityCombobox
            options={(customers?.items ?? []).map((c) => ({ value: c._id, label: c.name }))}
            value={filters.customerId ?? ""}
            onChange={(v) => setFilters((f) => ({ ...f, customerId: v }))}
            placeholder="All customers"
          />
        </div>
      )}
      {cfg.needsSupplier && (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Supplier</label>
          <EntityCombobox
            options={(suppliers?.items ?? []).map((s) => ({ value: s._id, label: s.name }))}
            value={filters.supplierId ?? ""}
            onChange={(v) => setFilters((f) => ({ ...f, supplierId: v }))}
            placeholder="All suppliers"
          />
        </div>
      )}
    </>
  );

  return (
    <ReportShell
      title={cfg.title}
      description={cfg.description}
      reportType={report}
      filters={filters}
      onFilterChange={setFilters}
      onApplyFilters={() => setApplied(filters)}
      chips={chips}
      showAsOfDate={cfg.needsAsOf}
      extraFilters={extraFilters}
      isLoading={isLoading || isFetching}
      error={error as Error | null}
      onRetry={() => refetch()}
    >
      <ReportBody report={report} data={data} />
    </ReportShell>
  );
};

// ---------- Per-report bodies ----------

const ReportBody: React.FC<{ report: ReportKey; data: any }> = ({ report, data }) => {
  const navigate = useNavigate();
  if (!data) return null;

  switch (report) {
    case "trial-balance":
      return <TrialBalanceBody data={data} />;
    case "profit-loss":
      return <PLBody data={data} />;
    case "balance-sheet":
      return <BSBody data={data} />;
    case "cash-flow":
      return <CashFlowBody data={data} />;
    case "general-ledger":
      return <GLBody data={data} />;
    case "ar-aging":
    case "ap-aging":
      return <AgingBody data={data} />;
    case "gstr-1":
    case "gstr-3b":
      return <GstBody data={data} />;
    case "sales-register":
    case "purchase-register":
    case "customer-statement":
    case "vendor-statement":
      return <RegisterBody data={data} navigate={navigate} />;
    default:
      return <pre className="overflow-auto rounded-2xl bg-card p-4 text-xs">{JSON.stringify(data, null, 2)}</pre>;
  }
};

const Th: React.FC<{ children?: React.ReactNode; right?: boolean }> = ({ children, right }) => (
  <th className={cn("px-4 py-3", right && "text-right")}>{children}</th>
);
const Td: React.FC<{ children?: React.ReactNode; right?: boolean; className?: string }> = ({ children, right, className }) => (
  <td className={cn("px-4 py-3 text-xs", right && "text-right font-mono-numbers", className)}>{children}</td>
);

/** Drill-down helper: TB row → GL (spec 11.1). */
const TrialBalanceBody: React.FC<{ data: any }> = ({ data }) => {
  const accounts = data.accounts ?? [];
  const typeTotals = ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"].map((t) => ({
    Type: t.charAt(0) + t.slice(1).toLowerCase(),
    Balance: accounts
      .filter((a: any) => a.accountType === t)
      .reduce((s: number, a: any) => s + (a.balance ?? 0), 0),
  })).filter((d) => d.Balance > 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Balance by Account Type" subtitle="Aggregated totals" height={240}>
          <MoneyBarChart
            data={typeTotals}
            xKey="Type"
            series={[{ key: "Balance", label: "Balance", color: "hsl(161 94% 30%)" }]}
            height={240}
          />
        </ChartCard>
        <ChartCard title="Account Type Share" subtitle="Proportion of total balances" height={240}>
          <DonutChart data={typeTotals.map((d) => ({ name: d.Type, value: d.Balance }))} height={240} />
        </ChartCard>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <Th>Account</Th><Th>Type</Th><Th right>Debit</Th><Th right>Credit</Th><Th right>GL</Th>
            </tr>
          </thead>
      <tbody className="divide-y divide-border/60">
        {(data.accounts ?? []).map((a: any) => (
          <tr key={a._id} className="hover:bg-muted/40">
            <Td><span className="font-mono-numbers text-muted-foreground">{a.accountCode}</span> <span className="ml-1.5 font-medium">{a.accountName}</span></Td>
            <Td><span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold">{a.accountType}</span></Td>
            <Td right>{a.debit ? formatMoney(a.debit) : "—"}</Td>
            <Td right>{a.credit ? formatMoney(a.credit) : "—"}</Td>
            <Td right>
              <Link to={`/reports/general-ledger?accountId=${a._id}`} className="text-primary hover:underline">View</Link>
            </Td>
          </tr>
        ))}
        <tr className="bg-muted/30 font-bold">
          <Td>Totals</Td><Td />
          <Td right>{formatMoney(data.totalDebits)}</Td>
          <Td right>{formatMoney(data.totalCredits)}</Td>
          <Td />
        </tr>
      </tbody>
        </table>
      </div>
    </div>
  );
};

const PLBody: React.FC<{ data: any }> = ({ data }) => {
  const incomeVsExpense = [
    { name: "Income", Amount: data.totalIncome ?? 0 },
    { name: "Expense", Amount: data.totalExpense ?? 0 },
  ];
  const expenseMix = (data.expenseAccounts ?? [])
    .map((a: any) => ({ name: a.accountName, value: a.balance ?? 0 }))
    .filter((d: any) => d.value > 0)
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 8);
  const incomeMix = (data.incomeAccounts ?? [])
    .map((a: any) => ({ name: a.accountName, value: a.balance ?? 0 }))
    .filter((d: any) => d.value > 0)
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Income vs Expense" subtitle="Period totals" className="lg:col-span-2" height={240}>
          <MoneyBarChart
            data={incomeVsExpense}
            xKey="name"
            series={[{ key: "Amount", label: "Amount", color: "hsl(161 94% 30%)" }]}
            height={240}
          />
        </ChartCard>
        <ChartCard title="Net Result" subtitle="Where money landed" height={240}>
          <DonutChart
            data={[
              { name: "Income", value: data.totalIncome ?? 0 },
              { name: "Expense", value: data.totalExpense ?? 0 },
            ]}
            height={240}
          />
        </ChartCard>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Expense Composition" subtitle="Top accounts by balance" height={260}>
          <DonutChart data={expenseMix} height={260} />
        </ChartCard>
        <ChartCard title="Income Composition" subtitle="Top accounts by balance" height={260}>
          <DonutChart data={incomeMix} height={260} />
        </ChartCard>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AccountList title="Income Accounts" accounts={data.incomeAccounts ?? []} />
        <AccountList title="Expense Accounts" accounts={data.expenseAccounts ?? []} />
      </div>
    </div>
  );
};

const BSBody: React.FC<{ data: any }> = ({ data }) => {
  const composition = [
    { name: "Assets", value: data.totalAssets ?? 0 },
    { name: "Liabilities", value: data.totalLiabilities ?? 0 },
    { name: "Equity", value: data.totalEquity ?? 0 },
  ];
  const assetMix = (data.assetAccounts ?? [])
    .map((a: any) => ({ name: a.accountName, value: a.balance ?? 0 }))
    .filter((d: any) => d.value > 0)
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Composition" subtitle="Assets · liabilities · equity" height={260}>
          <DonutChart data={composition} height={260} />
        </ChartCard>
        <ChartCard title="Asset Breakdown" subtitle="Top asset accounts" height={260}>
          <MoneyBarChart
            data={assetMix.map((d: any) => ({ name: d.name, Balance: d.value }))}
            xKey="name"
            series={[{ key: "Balance", label: "Balance", color: "hsl(189 94% 43%)" }]}
            height={260}
          />
        </ChartCard>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AccountList title="Assets" accounts={data.assetAccounts ?? []} />
        <AccountList title="Liabilities" accounts={data.liabilityAccounts ?? []} />
        <AccountList title="Equity" accounts={data.equityAccounts ?? []} />
      </div>
    </div>
  );
};

const CashFlowBody: React.FC<{ data: any }> = ({ data }) => {
  const chartData = [
    { name: "Operating", Amount: data.operatingActivities ?? 0 },
    { name: "Investing", Amount: data.investingActivities ?? 0 },
    { name: "Financing", Amount: data.financingActivities ?? 0 },
    { name: "Net", Amount: data.netCashFlow ?? 0 },
  ];
  return (
    <ChartCard
      title="Cash Movements"
      subtitle="Green = inflow · Red = outflow"
      height={280}
    >
      <MoneyBarChart
        data={chartData}
        xKey="name"
        series={[{ key: "Amount", label: "Amount" }]}
        colorNegative
        height={280}
      />
    </ChartCard>
  );
};

const GLBody: React.FC<{ data: any }> = ({ data }) => {
  const balanceTrend = (data.entries ?? []).map((e: any) => ({
    date: formatDate(e.date),
    Balance: e.runningBalance ?? 0,
  }));

  return (
    <div className="space-y-4">
      {balanceTrend.length > 0 && (
        <ChartCard
          title="Running Balance Trend"
          subtitle={typeof data.account === "object" ? `${data.account?.accountCode} — ${data.account?.accountName}` : "Account ledger"}
          height={220}
        >
          <TrendLineChart
            data={balanceTrend}
            xKey="date"
            series={[{ key: "Balance", label: "Balance", color: "hsl(189 94% 43%)" }]}
            height={220}
          />
        </ChartCard>
      )}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <tr><Th>Date</Th><Th>Voucher</Th><Th>Description</Th><Th right>Debit</Th><Th right>Credit</Th><Th right>Balance</Th></tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {(data.entries ?? []).map((e: any, i: number) => (
              <tr key={i} className="hover:bg-muted/40">
                <Td>{formatDate(e.date)}</Td>
                <Td><span className="font-mono-numbers text-primary">{e.voucherNumber}</span> <span className="ml-1 text-muted-foreground">{e.voucherType}</span></Td>
                <Td>{e.description}</Td>
                <Td right>{e.debit ? formatMoney(e.debit) : "—"}</Td>
                <Td right>{e.credit ? formatMoney(e.credit) : "—"}</Td>
                <Td right className="font-semibold">{formatMoney(e.runningBalance)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AgingBody: React.FC<{ data: any }> = ({ data }) => {
  const rows = Array.isArray(data) ? data : [];
  const totals = rows.reduce(
    (acc: any, r: any) => ({
      current: acc.current + (r.current || 0),
      days30: acc.days30 + (r.days30 || 0),
      days60: acc.days60 + (r.days60 || 0),
      days90: acc.days90 + (r.days90 || 0),
    }),
    { current: 0, days30: 0, days60: 0, days90: 0 }
  );
  const chartData = [
    { bucket: "Current", Outstanding: totals.current },
    { bucket: "1–30", Outstanding: totals.days30 },
    { bucket: "31–60", Outstanding: totals.days60 },
    { bucket: "61–90", Outstanding: totals.days90 },
  ];
  const topParties = rows
    .slice()
    .sort((a: any, b: any) => (b.total || 0) - (a.total || 0))
    .slice(0, 8)
    .map((r: any) => ({ name: r.partyName, value: r.total || 0 }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Aging Buckets" subtitle="Outstanding by overdue age" height={240}>
          <MoneyBarChart
            data={chartData}
            xKey="bucket"
            series={[{ key: "Outstanding", label: "Outstanding", color: "hsl(38 92% 50%)" }]}
            height={240}
          />
        </ChartCard>
        <ChartCard title="Top Parties" subtitle="Highest outstanding balances" height={240}>
          <DonutChart data={topParties} height={240} />
        </ChartCard>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <tr><Th>Party</Th><Th right>Current</Th><Th right>1–30</Th><Th right>31–60</Th><Th right>61–90</Th><Th right>Total</Th></tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((r: any, i: number) => (
              <tr key={i} className="hover:bg-muted/40">
                <Td className="font-medium">{r.partyName}</Td>
                <Td right>{formatMoney(r.current)}</Td>
                <Td right>{formatMoney(r.days30)}</Td>
                <Td right>{formatMoney(r.days60)}</Td>
                <Td right>{formatMoney(r.days90)}</Td>
                <Td right className="font-semibold">{formatMoney(r.total)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const GstBody: React.FC<{ data: any }> = ({ data }) => {
  const rateWise = (data.rateWise ?? []).map((r: any) => ({
    rate: `${r.rate}%`,
    Taxable: r.taxableValue ?? 0,
    Tax: r.taxAmount ?? 0,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Taxable Value vs Tax" subtitle="Grouped by rate slab" height={240}>
          <MoneyBarChart
            data={rateWise}
            xKey="rate"
            series={[
              { key: "Taxable", label: "Taxable Value", color: "hsl(189 94% 43%)" },
              { key: "Tax", label: "Tax Amount", color: "hsl(161 94% 30%)" },
            ]}
            height={240}
          />
        </ChartCard>
        <ChartCard title="Tax Share by Rate" subtitle="Share of total tax collected" height={240}>
          <DonutChart
            data={(data.rateWise ?? []).map((r: any) => ({
              name: `${r.taxType ?? "GST"} @ ${r.rate}%`,
              value: r.taxAmount ?? 0,
            }))}
            height={240}
          />
        </ChartCard>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <tr><Th>Tax Type</Th><Th right>Rate %</Th><Th right>Taxable Value</Th><Th right>Tax Amount</Th><Th right>Invoices</Th></tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {(data.rateWise ?? []).map((r: any, i: number) => (
              <tr key={i} className="hover:bg-muted/40">
                <Td><span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{r.taxType}</span></Td>
                <Td right>{r.rate}%</Td>
                <Td right>{formatMoney(r.taxableValue)}</Td>
                <Td right className="font-semibold">{formatMoney(r.taxAmount)}</Td>
                <Td right>{r.invoiceCount}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RegisterBody: React.FC<{ data: any; navigate: (opts: { pathname: string; search: string }) => void }> = ({ data, navigate }) => {
  const rows = Array.isArray(data) ? data : (data.items ?? data.documents ?? []);

  // Group totals by party (or document type for statements) for the bar chart
  const byParty = new Map<string, { Taxable: number; Tax: number; Total: number }>();
  for (const r of rows) {
    const key =
      r.partyName ??
      (typeof (r.customer ?? r.supplier) === "object" ? (r.customer ?? r.supplier)?.name : undefined) ??
      "Other";
    const agg = byParty.get(key) ?? { Taxable: 0, Tax: 0, Total: 0 };
    agg.Taxable += r.subtotal ?? r.taxableValue ?? 0;
    agg.Tax += r.taxAmount ?? 0;
    agg.Total += r.grandTotal ?? r.total ?? 0;
    byParty.set(key, agg);
  }
  const topParties = Array.from(byParty.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.Total - a.Total)
    .slice(0, 8);
  const monthly = new Map<string, number>();
  for (const r of rows) {
    const d = r.invoiceDate || r.date;
    if (!d) continue;
    const key = String(d).slice(0, 7); // YYYY-MM
    monthly.set(key, (monthly.get(key) ?? 0) + (r.grandTotal ?? r.total ?? 0));
  }
  const monthlyData = Array.from(monthly.entries())
    .map(([month, Total]) => ({ month, Total }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="space-y-4">
      {topParties.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Top Parties by Total" subtitle="Grand total invoiced · click a bar to view their ledger" height={240}>
            <MoneyBarChart
              data={topParties}
              xKey="name"
              series={[{ key: "Total", label: "Total", color: "hsl(161 94% 30%)" }]}
              height={240}
              onBarClick={(row) => {
                const sp = new URLSearchParams(window.location.search);
                sp.set("q", row.name);
                navigate({ pathname: window.location.pathname, search: `?${sp.toString()}` });
              }}
            />
          </ChartCard>
          <ChartCard title="Monthly Totals" subtitle="Grand total by invoice month" height={240}>
            {monthlyData.length > 1 ? (
              <TrendLineChart
                data={monthlyData}
                xKey="month"
                series={[{ key: "Total", label: "Total", color: "hsl(189 94% 43%)" }]}
                height={240}
              />
            ) : (
              <DonutChart
                data={topParties.map((p) => ({ name: p.name, value: p.Total }))}
                height={240}
              />
            )}
          </ChartCard>
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <tr><Th>Document</Th><Th>Party</Th><Th>Date</Th><Th right>Taxable</Th><Th right>Tax</Th><Th right>Total</Th></tr>
          </thead>
        <tbody className="divide-y divide-border/60">
          {rows.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">No documents in this period.</td></tr>
          )}
          {rows.map((r: any, i: number) => (
            <tr key={r._id ?? i} className="hover:bg-muted/40">
              <Td><span className="font-mono-numbers text-primary">{r.invoiceNumber || r.number || "—"}</span></Td>
              <Td>{r.partyName ?? (typeof (r.customer ?? r.supplier) === "object" ? (r.customer ?? r.supplier)?.name : "—")}</Td>
              <Td>{formatDate(r.invoiceDate || r.date)}</Td>
              <Td right>{formatMoney(r.subtotal ?? r.taxableValue ?? 0)}</Td>
              <Td right>{formatMoney(r.taxAmount ?? 0)}</Td>
              <Td right className="font-semibold">{formatMoney(r.grandTotal ?? r.total ?? 0)}</Td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
};

const AccountList: React.FC<{ title: string; accounts: any[] }> = ({ title, accounts }) => (
  <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
    <h3 className="text-sm font-semibold font-display">{title}</h3>
    <div className="mt-3 space-y-1.5">
      {accounts.length === 0 && <p className="text-xs text-muted-foreground">No accounts.</p>}
      {accounts.map((a) => (
        <div key={a._id} className="flex items-center justify-between text-xs">
          <span className="truncate"><span className="font-mono-numbers text-muted-foreground">{a.accountCode}</span> {a.accountName}</span>
          <span className="ml-2 font-mono-numbers font-semibold">{formatMoney(a.balance ?? 0)}</span>
        </div>
      ))}
    </div>
  </div>
);

export default ReportPage;

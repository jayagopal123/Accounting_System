import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, Users, Building2, FileText, Plus, Receipt, CreditCard, ArrowRight,
  FilePlus2, Clock, AlertCircle,
} from "lucide-react";
import { dashboardService, type ActivityItem } from "@/api/services/dashboardService";
import { reportService } from "@/api/services/reportService";
import { budgetService } from "@/api/services/budgetService";
import { queryKeys } from "@/api/queryKeys";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePermission } from "@/lib/PermissionGate";
import { TiltCard } from "@/components/feedback/TiltCard";
import { CountUp } from "@/components/feedback/CountUp";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { PageHeader } from "@/components/feedback/PageHeader";
import { DashboardHeroScene } from "@/components/three/DashboardHeroScene";
import {
  ChartCard,
  DonutChart,
  MoneyBarChart,
  RadialGauge,
  RangeTabs,
  TrendAreaChart,
} from "@/components/charts";
import { formatMoney } from "@/lib/formatMoney";
import { formatRelativeTime } from "@/lib/formatDate";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const KPI_CARDS = [
  { key: "totalActiveLedgerAccounts", label: "Ledger Accounts", icon: BookOpen, to: "/accounts" },
  { key: "totalActiveReceivableAccounts", label: "Receivable Accounts", icon: Users, to: "/customers" },
  { key: "totalActivePayableAccounts", label: "Payable Accounts", icon: Building2, to: "/suppliers" },
  { key: "totalUnpostedJournalEntries", label: "Unposted Journal Entries", icon: FileText, to: "/journal-entries?status=Draft" },
] as const;

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Created: FilePlus2,
  Submitted: Receipt,
  Updated: FileText,
  Cancelled: AlertCircle,
  Deleted: AlertCircle,
  Activated: BookOpen,
  Blocked: AlertCircle,
};

const ENTITY_LIST: Record<string, string> = {
  SalesInvoice: "/sales-invoices",
  PurchaseInvoice: "/purchase-invoices",
  CreditNote: "/credit-notes",
  DebitNote: "/debit-notes",
  JournalEntry: "/journal-entries",
  Payment: "/payments",
  Customer: "/customers",
  Supplier: "/suppliers",
  Account: "/accounts",
};

const DashboardPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const canSI = usePermission("sales_invoices:create");
  const canJE = usePermission("journal_entries:create");

  const { data: summary, isLoading } = useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: dashboardService.getSummary,
  });
  const { data: activities } = useQuery({
    queryKey: queryKeys.dashboard.activities(10),
    queryFn: () => dashboardService.getRecentActivities(10),
  });

  // --- Analytics data (charts) ---
  const asOf = new Date().toISOString().slice(0, 10);
  const { data: cashSeries } = useQuery({
    queryKey: queryKeys.dashboard.cashFlowSeries,
    queryFn: () => dashboardService.getCashFlowSeries(90),
  });
  const { data: arAging } = useQuery({
    queryKey: queryKeys.reports.arAging({ asOfDate: asOf }),
    queryFn: () => dashboardService.getArAging(),
  });
  const { data: apAging } = useQuery({
    queryKey: queryKeys.reports.apAging({ asOfDate: asOf }),
    queryFn: () => dashboardService.getApAging(),
  });
  const { data: pl } = useQuery({
    queryKey: queryKeys.reports.profitLoss(),
    queryFn: () => reportService.getProfitLoss(),
  });
  const { data: bs } = useQuery({
    queryKey: queryKeys.reports.balanceSheet(),
    queryFn: () => reportService.getBalanceSheet(),
  });
  const { data: budgetsPage } = useQuery({
    queryKey: queryKeys.budgets.list({ limit: 5 }),
    queryFn: () => budgetService.getBudgets({ limit: 5 }),
  });

  // --- Cash-flow pulse range (7D / 30D / 90D) ---
  const [cashRangeDays, setCashRangeDays] = React.useState(30);

  const cashSeriesData = React.useMemo(
    () =>
      (cashSeries ?? [])
        .slice(-cashRangeDays)
        .map((d) => ({
          date: d.date?.slice(5) ?? "",
          Inflow: d.inflow,
          Outflow: d.outflow,
          Net: d.net,
        })),
    [cashSeries, cashRangeDays]
  );

  const netForRange = React.useMemo(
    () => (cashSeries ?? []).slice(-cashRangeDays).reduce((s, d) => s + (d.net || 0), 0),
    [cashSeries, cashRangeDays]
  );

  const arTotals = React.useMemo(() => {
    const rows = arAging ?? [];
    const t = rows.reduce(
      (acc, r) => ({
        current: acc.current + (r.current || 0),
        days30: acc.days30 + (r.days30 || 0),
        days60: acc.days60 + (r.days60 || 0),
        days90: acc.days90 + (r.days90 || 0),
      }),
      { current: 0, days30: 0, days60: 0, days90: 0 }
    );
    return [
      { bucket: "Current", Receivable: t.current, Payable: 0 },
      { bucket: "1–30 d", Receivable: t.days30, Payable: 0 },
      { bucket: "31–60 d", Receivable: t.days60, Payable: 0 },
      { bucket: "61–90 d", Receivable: t.days90, Payable: 0 },
    ];
  }, [arAging]);

  const apTotals = React.useMemo(() => {
    const rows = apAging ?? [];
    const t = rows.reduce(
      (acc, r) => ({
        current: acc.current + (r.current || 0),
        days30: acc.days30 + (r.days30 || 0),
        days60: acc.days60 + (r.days60 || 0),
        days90: acc.days90 + (r.days90 || 0),
      }),
      { current: 0, days30: 0, days60: 0, days90: 0 }
    );
    return [
      { bucket: "Current", Receivable: 0, Payable: t.current },
      { bucket: "1–30 d", Receivable: 0, Payable: t.days30 },
      { bucket: "31–60 d", Receivable: 0, Payable: t.days60 },
      { bucket: "61–90 d", Receivable: 0, Payable: t.days90 },
    ];
  }, [apAging]);

  // Merged AR vs AP aging comparison
  const agingCompare = React.useMemo(
    () =>
      arTotals.map((r, i) => ({
        bucket: r.bucket,
        Receivable: r.Receivable,
        Payable: apTotals[i]?.Payable ?? 0,
      })),
    [arTotals, apTotals]
  );

  const bsComposition = React.useMemo(
    () => [
      { name: "Assets", value: bs?.totalAssets ?? 0 },
      { name: "Liabilities", value: bs?.totalLiabilities ?? 0 },
      { name: "Equity", value: bs?.totalEquity ?? 0 },
    ],
    [bs]
  );

  const expenseComposition = React.useMemo(
    () =>
      (pl?.expenseAccounts ?? [])
        .map((a: any) => ({ name: a.accountName, value: a.balance ?? 0 }))
        .filter((d: any) => d.value > 0)
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 8),
    [pl]
  );

  const plTotals = React.useMemo(
    () => [
      { name: "Income", Income: pl?.totalIncome ?? 0, Expense: 0 },
      { name: "Expense", Income: 0, Expense: pl?.totalExpense ?? 0 },
      { name: "Net Profit", Income: Math.max(pl?.netProfit ?? 0, 0), Expense: Math.max(-(pl?.netProfit ?? 0), 0) },
    ],
    [pl]
  );

  // --- Budget utilisation gauges (top 3 budgets with data) ---
  const budgetGauges = React.useMemo(
    () =>
      (budgetsPage?.items ?? [])
        .filter((b) => b.budgetAmount > 0)
        .slice(0, 3)
        .map((b) => ({
          id: b._id,
          name: b.name,
          utilisation: (b.actualAmount ?? 0) > 0 ? ((b.actualAmount ?? 0) / b.budgetAmount) * 100 : 0,
          budgetAmount: b.budgetAmount,
          actualAmount: b.actualAmount ?? 0,
        })),
    [budgetsPage]
  );

  // "Needs attention": derived from real summary data, not hardcoded.
  const unposted = summary?.totalUnpostedJournalEntries ?? 0;

  return (
    <div className="space-y-6">
      {/* Hero strip with optional 3D scene */}
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
        <DashboardHeroScene />
        <div className="relative z-10">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 className="mt-1 text-2xl font-bold font-display tracking-tight">
            {greeting()}, {user?.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's moving in your ledger today.
          </p>
        </div>
      </div>

      {/* Bento KPI grid */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_CARDS.map((kpi, idx) => (
          <motion.div
            key={kpi.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.2 }}
          >
            <TiltCard tiltIntensity={6} onClick={() => navigate(kpi.to)} className="p-5">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {kpi.label}
                </span>
                <kpi.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-2 text-3xl font-bold font-mono-numbers text-foreground">
                {isLoading ? <span className="inline-block h-8 w-16 animate-pulse rounded bg-muted" /> : <CountUp value={summary?.[kpi.key] ?? 0} />}
              </div>
              <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                View <ArrowRight className="h-3 w-3" />
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* ---------- Analytics charts ---------- */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="Cash Flow Pulse"
          subtitle={`Daily inflows vs outflows · net ${formatMoney(netForRange)} for the selected range`}
          className="xl:col-span-2"
          height={260}
          actions={<RangeTabs value={cashRangeDays} onChange={setCashRangeDays} />}
        >
          <TrendAreaChart
            data={cashSeriesData}
            xKey="date"
            series={[
              { key: "Inflow", label: "Inflow", color: "hsl(161 94% 30%)" },
              { key: "Outflow", label: "Outflow", color: "hsl(38 92% 50%)" },
              { key: "Net", label: "Net", color: "hsl(189 94% 43%)" },
            ]}
            height={260}
          />
        </ChartCard>

        <ChartCard title="Balance Sheet Mix" subtitle="Click a slice to open the Balance Sheet" height={260}>
          <DonutChart
            data={bsComposition}
            centerLabel="Composition"
            height={260}
            onSliceClick={() => navigate("/reports/balance-sheet")}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard title="AR vs AP Aging" subtitle="Click a bar to open the aging report" className="xl:col-span-2" height={240}>
          <MoneyBarChart
            data={agingCompare}
            xKey="bucket"
            series={[
              { key: "Receivable", label: "Receivable", color: "hsl(161 94% 30%)" },
              { key: "Payable", label: "Payable", color: "hsl(38 92% 50%)" },
            ]}
            height={240}
            onBarClick={(_row, seriesKey) => navigate(seriesKey === "Payable" ? "/reports/ap-aging" : "/reports/ar-aging")}
          />
        </ChartCard>

        <ChartCard title="Top Expense Accounts" subtitle="Click a slice for the P&L" height={240}>
          <DonutChart data={expenseComposition} height={240} onSliceClick={() => navigate("/reports/profit-loss")} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard title="Income vs Expense" subtitle="Click to open the P&L" className="xl:col-span-2" height={220}>
          <MoneyBarChart
            data={plTotals}
            xKey="name"
            series={[
              { key: "Income", label: "Income", color: "hsl(161 94% 30%)" },
              { key: "Expense", label: "Expense", color: "hsl(0 84% 60%)" },
            ]}
            height={220}
            onBarClick={() => navigate("/reports/profit-loss")}
          />
        </ChartCard>

        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold font-display">Key Figures</h3>
          <div className="mt-3 space-y-2">
            {[
              { label: "Total Income", value: pl?.totalIncome ?? 0, tone: "text-emerald-600 dark:text-emerald-400" },
              { label: "Total Expense", value: pl?.totalExpense ?? 0, tone: "text-red-600 dark:text-red-400" },
              { label: "Net Profit", value: pl?.netProfit ?? 0, tone: (pl?.netProfit ?? 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400" },
              { label: "Total Receivable (AR)", value: (arAging ?? []).reduce((s, r) => s + (r.total || 0), 0), tone: "text-foreground" },
              { label: "Total Payable (AP)", value: (apAging ?? []).reduce((s, r) => s + (r.total || 0), 0), tone: "text-foreground" },
            ].map((k) => (
              <div key={k.label} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                <span className="text-xs text-muted-foreground">{k.label}</span>
                <span className={`font-mono-numbers text-sm font-bold ${k.tone}`}>{formatMoney(k.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Budget utilisation gauges ---------- */}
      <ChartCard
        title="Budget Utilisation"
        subtitle="Spend against approved budgets · click a gauge for budget vs actual"
        height={180}
        actions={
          <Link to="/budgets" className="text-xs font-medium text-primary hover:underline">
            All budgets →
          </Link>
        }
      >
        {budgetGauges.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No budgets with spend data yet.
          </div>
        ) : (
          <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-3">
            {budgetGauges.map((b) => (
              <Link
                key={b.id}
                to={`/budgets/${b.id}/vs-actual`}
                className="flex flex-col items-center justify-center gap-1 rounded-xl p-2 transition-colors hover:bg-muted/50"
              >
                <RadialGauge value={b.utilisation} label="" size={110} />
                <span className="line-clamp-1 max-w-full text-center text-xs font-semibold" title={b.name}>
                  {b.name}
                </span>
                <span className="font-mono-numbers text-[10px] text-muted-foreground">
                  {formatMoney(b.actualAmount, { compact: true })} / {formatMoney(b.budgetAmount, { compact: true })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick actions */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold font-display">Quick actions</h3>
          <div className="mt-3 space-y-2">
            {canSI && (
              <button
                onClick={() => navigate("/sales-invoices/new")}
                className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-medium hover:bg-muted"
              >
                <Plus className="h-4 w-4 text-primary" /> New Sales Invoice
              </button>
            )}
            {canJE && (
              <button
                onClick={() => navigate("/journal-entries/new")}
                className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-medium hover:bg-muted"
              >
                <FileText className="h-4 w-4 text-primary" /> New Journal Entry
              </button>
            )}
            <button
              onClick={() => navigate("/payments/new?paymentType=Receipt")}
              className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-medium hover:bg-muted"
            >
              <CreditCard className="h-4 w-4 text-primary" /> Record Receipt
            </button>
            <button
              onClick={() => navigate("/payments/new?paymentType=Payment")}
              className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-medium hover:bg-muted"
            >
              <CreditCard className="h-4 w-4 text-primary" /> Record Payment
            </button>
          </div>

          {/* Needs attention — derived from real data */}
          {unposted > 0 && (
            <Link
              to="/journal-entries?status=Draft"
              className="mt-4 flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
            >
              <Clock className="h-4 w-4 shrink-0" />
              {unposted} draft journal {unposted === 1 ? "entry needs" : "entries need"} posting
            </Link>
          )}
        </div>

        {/* Recent activity timeline */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold font-display">Recent Activity</h3>
            <span className="text-xs text-muted-foreground">Latest ledger events</span>
          </div>
          <div className="mt-4 space-y-3">
            {(activities ?? []).length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">No activity recorded yet.</p>
            )}
            {(activities ?? []).map((a: ActivityItem, idx) => {
              const Icon = ACTION_ICONS[a.action] ?? FileText;
              const listRoute = ENTITY_LIST[a.entity];
              return (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Link
                    to={listRoute ? `${listRoute}?q=${encodeURIComponent(a.entityName)}` : "#"}
                    className="flex items-start gap-3 rounded-xl p-2 hover:bg-muted/50 transition-colors"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground">{a.action}</span>
                        <StatusBadge status={a.entity} className="!px-1.5 !py-0 !text-[10px]" />
                        <span className="font-mono-numbers text-xs font-medium text-primary">{a.entityName}</span>
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">{a.description}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[10px] text-muted-foreground">{formatRelativeTime(a.createdAt)}</span>
                      <span className="block text-[10px] font-medium text-muted-foreground">{a.performedByName}</span>
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <PageHeader title="" className="hidden" />
    </div>
  );
};

export default DashboardPage;

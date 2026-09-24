import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { budgetService } from "@/api/services/budgetService";
import { queryKeys } from "@/api/queryKeys";
import { PageHeader } from "@/components/feedback/PageHeader";
import { SummaryChips } from "@/components/report/SummaryChips";
import { RouteFallback } from "@/app/guards";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatMoney } from "@/lib/formatMoney";
import { cn } from "@/lib/utils";

export const BudgetVsActualPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    // Response structure is isolated in budgetService (⚠ VERIFY against backend)
    queryKey: queryKeys.budgets.vsActual(id ?? ""),
    queryFn: () => budgetService.getBudgetVsActual(id!),
    enabled: !!id,
  });

  if (isLoading) return <RouteFallback />;
  if (error || !data) {
    return <ErrorState title="Budget not found" message={(error as Error)?.message} onRetry={() => refetch()} />;
  }

  const utilisation = data.budget.budgetAmount > 0 ? (data.actual / data.budget.budgetAmount) * 100 : 0;
  const over = data.variance < 0;
  const ringR = 26;
  const ringC = 2 * Math.PI * ringR;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Budget vs Actual — ${data.budget.name}`}
        description={`${data.budget.fiscalYear} · ${typeof data.budget.account === "object" ? data.budget.account?.accountName : "—"}`}
        backButton={
          <button onClick={() => navigate("/budgets")} className="inline-flex items-center justify-center rounded-xl border border-border bg-card p-2 text-muted-foreground hover:bg-muted">
            ←
          </button>
        }
      />

      <SummaryChips
        chips={[
          { label: "Budget", value: data.budget.budgetAmount, isCurrency: true },
          { label: "Actual", value: data.actual, isCurrency: true },
          {
            label: "Variance",
            value: data.variance,
            isCurrency: true,
            variant: over ? "destructive" : "success",
            badge: (
              <span className={cn("rounded-lg px-2 py-0.5 text-[10px] font-bold", over ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600")}>
                {over ? "OVER" : "UNDER"}
              </span>
            ),
          },
          { label: "Utilisation", value: `${utilisation.toFixed(1)}%` },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Utilisation rings */}
        <div className="flex items-center justify-around rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          {[
            { label: "Used", pct: Math.min(utilisation, 999) / 100, color: over ? "#dc2626" : "#059669" },
          ].map((r) => (
            <div key={r.label} className="flex flex-col items-center gap-2">
              <svg width={72} height={72} className="-rotate-90">
                <circle cx={36} cy={36} r={ringR} fill="none" strokeWidth="7" className="stroke-muted" />
                <circle
                  cx={36} cy={36} r={ringR} fill="none" strokeWidth="7" stroke={r.color}
                  strokeDasharray={ringC} strokeDashoffset={ringC * (1 - Math.min(r.pct, 1))} strokeLinecap="round"
                />
              </svg>
              <span className="text-xs font-semibold">{r.label} {utilisation.toFixed(0)}%</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm lg:col-span-3">
          <h3 className="text-sm font-semibold font-display">Monthly Breakdown</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatMoney(v, { showSymbol: false, compact: true })} />
                <Tooltip formatter={(v) => formatMoney(Number(v))} contentStyle={{ borderRadius: 12, border: "1px solid hsl(214 32% 91%)" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="budget" name="Budget" fill="hsl(161 94% 30% / 0.35)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="actual" name="Actual" fill="hsl(161 94% 30%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Period table (source of truth) */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3 text-right">Budget</th>
              <th className="px-4 py-3 text-right">Actual</th>
              <th className="px-4 py-3 text-right">Variance</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {data.breakdown.map((p) => {
              const v = p.budget - p.actual;
              return (
                <tr key={p.month}>
                  <td className="px-4 py-3 text-xs font-medium">{p.month}</td>
                  <td className="px-4 py-3 text-right font-mono-numbers text-xs">{formatMoney(p.budget)}</td>
                  <td className="px-4 py-3 text-right font-mono-numbers text-xs">{formatMoney(p.actual)}</td>
                  <td className={cn("px-4 py-3 text-right font-mono-numbers text-xs font-semibold", v < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400")}>
                    {formatMoney(v)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn("rounded-lg px-2 py-0.5 text-[10px] font-bold", v < 0 ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600")}>
                      {v < 0 ? "OVER" : "UNDER"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Link to="/budgets" className="block text-center text-xs text-primary hover:underline">← Back to all budgets</Link>
    </div>
  );
};

export default BudgetVsActualPage;

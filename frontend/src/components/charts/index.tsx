import React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/formatMoney";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Shared palette & tooltip                                            */
/* ------------------------------------------------------------------ */

/** Categorical palette — derived from the app theme (emerald/cyan/amber/…). */
const CHART_COLORS = [
  "hsl(161 94% 30%)", // emerald (primary)
  "hsl(189 94% 43%)", // cyan
  "hsl(38 92% 50%)",  // amber
  "hsl(258 90% 66%)", // violet
  "hsl(0 84% 60%)",   // red
  "hsl(199 89% 48%)", // sky
  "hsl(42 92% 56%)",  // gold
  "hsl(330 80% 60%)", // pink
] as const;

export const CHART_GRID_STROKE = "hsl(214 32% 91%)";

/** Recharts can't resolve CSS vars; read computed colors so charts stay theme-aware (light/dark). */
const useThemeColors = (): string[] => {
  const readColors = React.useCallback((): string[] => {
    if (typeof window === "undefined") return [...CHART_COLORS];
    const cs = getComputedStyle(document.documentElement);
    const read = (v: string, fallback: string) => {
      const raw = cs.getPropertyValue(v).trim();
      return raw ? `hsl(${raw})` : fallback;
    };
    return [
      read("--primary", CHART_COLORS[0]),
      read("--accent-cyan", CHART_COLORS[1]),
      "hsl(38 92% 50%)",
      "hsl(258 90% 66%)",
      "hsl(0 84% 60%)",
      "hsl(199 89% 48%)",
      "hsl(42 92% 56%)",
      "hsl(330 80% 60%)",
    ];
  }, []);

  const [colors, setColors] = React.useState<string[]>(readColors);

  // Re-read on light ↔ dark switch (next-themes toggles .dark on <html>).
  React.useEffect(() => {
    const observer = new MutationObserver(() => setColors(readColors()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [readColors]);

  return colors;
};

export interface ChartCardProps {
  title?: string;
  subtitle?: string;
  height?: number;
  className?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

/** Standard bordered card wrapper with consistent title + height. */
export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  height = 260,
  className,
  children,
  actions,
}) => (
  <div className={cn("rounded-2xl border border-border/80 bg-card p-5 shadow-sm", className)}>
    {(title || actions) && (
      <div className="flex items-start justify-between gap-2">
        <div>
          {title && <h3 className="text-sm font-semibold font-display">{title}</h3>}
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {actions}
      </div>
    )}
    <div className="mt-3" style={{ height }}>
      {children}
    </div>
  </div>
);

const tooltipStyles = {
  borderRadius: 12,
  border: "1px solid hsl(214 32% 91%)",
  fontSize: 12,
  background: "hsl(0 0% 100%)",
  boxShadow: "0 8px 24px -8px rgb(0 0 0 / 0.15)",
};

const MoneyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyles} className="px-3 py-2">
      {label !== undefined && label !== "" && (
        <p className="mb-1 text-xs font-semibold">{label}</p>
      )}
      {payload.map((p: any, i: number) => (
        <p key={i} className="flex items-center gap-1.5 text-xs">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color ?? p.payload?.fill }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-mono-numbers font-semibold">
            {typeof p.value === "number" ? formatMoney(p.value) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

const compactMoney = (v: number) => formatMoney(v, { showSymbol: false, compact: true });

const EmptyChart: React.FC = () => (
  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
    No data to chart
  </div>
);

export interface NamedValue {
  name: string;
  value: number;
}

/* ------------------------------------------------------------------ */
/* Donut / Pie                                                         */
/* ------------------------------------------------------------------ */

export const DonutChart: React.FC<{
  data: NamedValue[];
  height?: number;
  /** Total shown in the donut hole; defaults to sum of values. */
  centerLabel?: string;
  innerRadiusPercent?: number;
  /** Drill-down: called with the full data entry (incl. extra fields like accountId). */
  onSliceClick?: (entry: any) => void;
}> = ({ data, height = 260, centerLabel, innerRadiusPercent = 0.62, onSliceClick }) => {
  const colors = useThemeColors();
  const filtered = data.filter((d) => d.value > 0);
  if (filtered.length === 0) return <ChartCard height={height}><EmptyChart /></ChartCard>;
  const total = filtered.reduce((s, d) => s + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={filtered}
          dataKey="value"
          nameKey="name"
          innerRadius={`${Math.round(innerRadiusPercent * 100)}%`}
          outerRadius="80%"
          paddingAngle={2}
          stroke="none"
          cursor={onSliceClick ? "pointer" : undefined}
          onClick={onSliceClick ? ((data: any) => onSliceClick(data?.payload ?? data)) : undefined}
        >
          {filtered.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<MoneyTooltip />} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11 }}
          formatter={(value) => {
            const d = filtered.find((x) => x.name === value);
            const pct = d && total > 0 ? ` (${((d.value / total) * 100).toFixed(0)}%)` : "";
            return `${value}${pct}`;
          }}
        />
        {centerLabel && (
          <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground" style={{ fontSize: 10 }}>
            {centerLabel}
          </text>
        )}
      </PieChart>
    </ResponsiveContainer>
  );
};

/* ------------------------------------------------------------------ */
/* Vertical bars — supports multi-series & per-bar color rules         */
/* ------------------------------------------------------------------ */

export interface BarSeries {
  key: string;
  label: string;
  color?: string;
}

export const MoneyBarChart: React.FC<{
  data: Record<string, any>[];
  xKey: string;
  series: BarSeries[];
  height?: number;
  stacked?: boolean;
  /** Colors bars red when the value is negative (e.g. cash movements). */
  colorNegative?: boolean;
  /** Drill-down: called with the row and the series key that was clicked. */
  onBarClick?: (row: Record<string, any>, seriesKey: string) => void;
}> = ({ data, xKey, series, height = 260, stacked, colorNegative, onBarClick }) => {
  const colors = useThemeColors();
  if (!data.length) return <ChartCard height={height}><EmptyChart /></ChartCard>;
  const hasMulti = series.length > 1;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={54} tickFormatter={compactMoney} />
        <Tooltip content={<MoneyTooltip />} cursor={{ fill: "hsl(214 32% 91% / 0.4)" }} />
        {hasMulti && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            stackId={stacked ? "a" : undefined}
            radius={stacked ? [0, 0, 0, 0] : [6, 6, 0, 0]}
            maxBarSize={48}
            fill={s.color ?? colors[i % colors.length]}
            cursor={onBarClick ? "pointer" : undefined}
            onClick={onBarClick ? ((data: any) => onBarClick(data?.payload ?? data, s.key)) : undefined}
          >
            {!hasMulti && colorNegative &&
              data.map((d, j) => (
                <Cell key={j} fill={(d[s.key] ?? 0) < 0 ? "hsl(0 84% 60%)" : s.color ?? colors[i % colors.length]} />
              ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

/* ------------------------------------------------------------------ */
/* Area — continuous trend (inflows/outflows/net over time)            */
/* ------------------------------------------------------------------ */

export const TrendAreaChart: React.FC<{
  data: Record<string, any>[];
  xKey: string;
  series: BarSeries[];
  height?: number;
  stacked?: boolean;
}> = ({ data, xKey, series, height = 260, stacked }) => {
  const colors = useThemeColors();
  if (!data.length) return <ChartCard height={height}><EmptyChart /></ChartCard>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color ?? colors[i % colors.length]} stopOpacity={0.35} />
              <stop offset="100%" stopColor={s.color ?? colors[i % colors.length]} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={54} tickFormatter={compactMoney} />
        <Tooltip content={<MoneyTooltip />} />
        {series.length > 1 && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />}
        {series.map((s, i) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stackId={stacked ? "a" : undefined}
            stroke={s.color ?? colors[i % colors.length]}
            strokeWidth={2}
            fill={`url(#grad-${s.key})`}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

/* ------------------------------------------------------------------ */
/* Line — balances / comparisons over time                             */
/* ------------------------------------------------------------------ */

export const TrendLineChart: React.FC<{
  data: Record<string, any>[];
  xKey: string;
  series: BarSeries[];
  height?: number;
}> = ({ data, xKey, series, height = 260 }) => {
  const colors = useThemeColors();
  if (!data.length) return <ChartCard height={height}><EmptyChart /></ChartCard>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={54} tickFormatter={compactMoney} />
        <Tooltip content={<MoneyTooltip />} />
        {series.length > 1 && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />}
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color ?? colors[i % colors.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

/* ------------------------------------------------------------------ */
/* Range tabs — small 7D/30D/90D switcher for time-series cards        */
/* ------------------------------------------------------------------ */

export interface RangeTabOption {
  label: string;
  value: number;
}

export const RangeTabs: React.FC<{
  value: number;
  onChange: (v: number) => void;
  options?: RangeTabOption[];
  className?: string;
}> = ({ value, onChange, options = [{ label: "7D", value: 7 }, { label: "30D", value: 30 }, { label: "90D", value: 90 }], className }) => (
  <div className={cn("flex items-center gap-1 rounded-xl bg-muted p-1", className)}>
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={cn(
          "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors",
          value === o.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {o.label}
      </button>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/* Radial progress — single KPI gauge (0–100%)                         */
/* ------------------------------------------------------------------ */

export const RadialGauge: React.FC<{
  value: number; // 0–100
  label: string;
  size?: number;
  color?: string;
  suffix?: string;
}> = ({ value, label, size = 120, color, suffix = "%" }) => {
  const colors = useThemeColors();
  const clamped = Math.max(0, Math.min(100, value));
  const data = [{ name: label, value: clamped, fill: color ?? (value > 100 ? "hsl(0 84% 60%)" : colors[0]) }];
  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ width: size, height: size }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={data}
            innerRadius="72%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            barSize={10}
          >
            <YAxis type="number" domain={[0, 100]} tick={false} axisLine={false} hide />
            <RadialBar dataKey="value" cornerRadius={999} background={{ fill: "hsl(214 32% 91% / 0.6)" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono-numbers text-lg font-bold">{value.toFixed(0)}{suffix}</span>
        </div>
      </div>
      <div className="text-center text-[10px] font-medium text-muted-foreground">{label}</div>
    </div>
  );
};

import React from "react";
import { Filter } from "lucide-react";
import { useActiveFiscalYear } from "@/hooks/useActiveFiscalYear";
import { toInputDate } from "@/lib/formatDate";

export interface ReportFilterState {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  customerId?: string;
  supplierId?: string;
  asOfDate?: string;
}

interface ReportFiltersProps {
  filters: ReportFilterState;
  onChange: (updated: ReportFilterState) => void;
  onApply: () => void;
  showAccountSelect?: boolean;
  showCustomerSelect?: boolean;
  showSupplierSelect?: boolean;
  showAsOfDate?: boolean;
  extraFilters?: React.ReactNode;
  isLoading?: boolean;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onChange,
  onApply,
  showAsOfDate = false,
  extraFilters,
  isLoading = false,
}) => {
  const { activeFiscalYear } = useActiveFiscalYear();

  const handlePreset = (preset: "thisFY" | "lastFY" | "thisQuarter" | "lastMonth") => {
    const today = new Date();
    const fyStart = activeFiscalYear ? new Date(activeFiscalYear.startDate) : new Date(today.getFullYear(), 3, 1);
    const fyEnd = activeFiscalYear ? new Date(activeFiscalYear.endDate) : new Date(today.getFullYear() + 1, 2, 31);

    if (preset === "thisFY") {
      onChange({
        ...filters,
        startDate: toInputDate(fyStart),
        endDate: toInputDate(fyEnd),
      });
    } else if (preset === "lastFY") {
      const lastStart = new Date(fyStart);
      lastStart.setFullYear(lastStart.getFullYear() - 1);
      const lastEnd = new Date(fyEnd);
      lastEnd.setFullYear(lastEnd.getFullYear() - 1);
      onChange({
        ...filters,
        startDate: toInputDate(lastStart),
        endDate: toInputDate(lastEnd),
      });
    } else if (preset === "thisQuarter") {
      // Indian fiscal year quarters (FY starts in April): Q1 Apr-Jun, Q2 Jul-Sep, Q3 Oct-Dec, Q4 Jan-Mar.
      const month = today.getMonth();
      const fiscalMonthIndex = (month - 3 + 12) % 12; // Apr -> 0
      const qIndex = Math.floor(fiscalMonthIndex / 3); // 0..3
      const qStartMonth = (3 + qIndex * 3) % 12; // Apr=3, Jul=6, Oct=9, Jan=0
      const qStartYear = month >= 3 ? today.getFullYear() : today.getFullYear() - 1;
      const startYear = qStartMonth >= 3 ? qStartYear : qStartYear + (qIndex === 3 ? 1 : 0);
      const qStart = new Date(startYear, qStartMonth, 1);
      const qEnd = new Date(startYear + (qStartMonth === 0 ? 1 : 0), qStartMonth + 3, 0);
      onChange({
        ...filters,
        startDate: toInputDate(qStart),
        endDate: toInputDate(qEnd),
      });
    } else if (preset === "lastMonth") {
      const mStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const mEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      onChange({
        ...filters,
        startDate: toInputDate(mStart),
        endDate: toInputDate(mEnd),
      });
    }
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm space-y-4 dark:bg-card/90">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Date presets */}
        {!showAsOfDate && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
              Presets:
            </span>
            <button
              type="button"
              onClick={() => handlePreset("thisFY")}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
            >
              This FY
            </button>
            <button
              type="button"
              onClick={() => handlePreset("lastFY")}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
            >
              Last FY
            </button>
            <button
              type="button"
              onClick={() => handlePreset("thisQuarter")}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
            >
              This Quarter
            </button>
            <button
              type="button"
              onClick={() => handlePreset("lastMonth")}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
            >
              Last Month
            </button>
          </div>
        )}

        <div className="ml-auto">
          <button
            type="button"
            disabled={isLoading}
            onClick={onApply}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all glow-primary disabled:opacity-50"
          >
            <Filter className="h-3.5 w-3.5" />
            Apply Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border/60">
        {!showAsOfDate ? (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Aging As Of Date
            </label>
            <input
              type="date"
              value={filters.asOfDate || ""}
              onChange={(e) => onChange({ ...filters, asOfDate: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        {extraFilters}
      </div>
    </div>
  );
};

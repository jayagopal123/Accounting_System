import React from "react";
import { PageHeader } from "../feedback/PageHeader";
import { ExportMenu } from "./ExportMenu";
import { ReportFilters, type ReportFilterState } from "./ReportFilters";
import { SummaryChips, type SummaryChipItem } from "./SummaryChips";
import { ErrorState } from "../feedback/ErrorState";

interface ReportShellProps {
  title: string;
  description?: string;
  reportType: string;
  filters: ReportFilterState;
  onFilterChange: (filters: ReportFilterState) => void;
  onApplyFilters: () => void;
  chips?: SummaryChipItem[];
  showAsOfDate?: boolean;
  extraFilters?: React.ReactNode;
  headerBadge?: React.ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  children: React.ReactNode;
}

export const ReportShell: React.FC<ReportShellProps> = ({
  title,
  description,
  reportType,
  filters,
  onFilterChange,
  onApplyFilters,
  chips,
  showAsOfDate = false,
  extraFilters,
  headerBadge,
  isLoading = false,
  error = null,
  onRetry,
  children,
}) => {
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title={title} description={description} />
        <ErrorState
          title="Report Generation Failed"
          message={error.message}
          onRetry={onRetry}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        badge={headerBadge}
        actions={<ExportMenu reportType={reportType} filters={filters} />}
      />

      <ReportFilters
        filters={filters}
        onChange={onFilterChange}
        onApply={onApplyFilters}
        showAsOfDate={showAsOfDate}
        extraFilters={extraFilters}
        isLoading={isLoading}
      />

      {chips && chips.length > 0 && <SummaryChips chips={chips} />}

      <div className="space-y-6">{children}</div>
    </div>
  );
};

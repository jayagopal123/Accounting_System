import React, { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { reportService } from "@/api/services/reportService";

interface ExportMenuProps {
  reportType: string;
  filters?: Record<string, any>;
  className?: string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  reportType,
  filters,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async (format: "xlsx" | "pdf") => {
    setIsExporting(true);
    setOpen(false);
    try {
      const { blob, filename } = await reportService.exportReport(reportType, format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Exported ${filename} successfully.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to export report.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        disabled={isExporting}
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl border border-border bg-card hover:bg-muted text-foreground shadow-sm transition-colors disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {isExporting ? "Exporting..." : "Export"}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-44 rounded-2xl border border-border bg-popover shadow-xl p-1 animate-in fade-in-0 zoom-in-95">
          <button
            type="button"
            onClick={() => handleDownload("xlsx")}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted text-foreground transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Excel (.xlsx)
          </button>
          <button
            type="button"
            onClick={() => handleDownload("pdf")}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted text-foreground transition-colors"
          >
            <FileText className="h-4 w-4 text-rose-600" />
            PDF Document
          </button>
        </div>
      )}
    </div>
  );
};

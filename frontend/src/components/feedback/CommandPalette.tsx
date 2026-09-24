import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  Building2,
  Receipt,
  CreditCard,
  Landmark,
  Shield,
  Layers,
  Plus,
  Percent,
  TrendingUp,
  FileBarChart,
  Search,
} from "lucide-react";
import { useUiStore } from "@/stores/useUiStore";
import { usePermission } from "@/lib/PermissionGate";

export const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUiStore();
  const [search, setSearch] = useState("");

  const canCreateSI = usePermission("sales_invoices:create");
  const canCreatePI = usePermission("purchase_invoices:create");
  const canCreateJE = usePermission("journal_entries:create");
  const canViewLogs = usePermission("audit_logs:view");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const runCommand = (command: () => void) => {
    setCommandPaletteOpen(false);
    command();
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-0">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl animate-in zoom-in-95">
        <Command label="Global Command Menu" className="w-full">
          <div className="flex items-center border-b border-border/80 px-4 py-3 gap-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Command.Input
              autoFocus
              value={search}
              onValueChange={setSearch}
              placeholder="Search pages, masters, or quick actions (⌘K)..."
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1">
            <Command.Empty className="py-6 text-center text-xs text-muted-foreground">
              No matching pages or actions found.
            </Command.Empty>

            {/* Quick Actions */}
            <Command.Group heading="Quick Actions" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5">
              {canCreateSI && (
                <Command.Item
                  onSelect={() => runCommand(() => navigate("/sales-invoices/new"))}
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
                >
                  <Plus className="h-4 w-4 text-primary" />
                  <span>New Sales Invoice</span>
                </Command.Item>
              )}
              {canCreatePI && (
                <Command.Item
                  onSelect={() => runCommand(() => navigate("/purchase-invoices/new"))}
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
                >
                  <Plus className="h-4 w-4 text-primary" />
                  <span>New Purchase Bill</span>
                </Command.Item>
              )}
              {canCreateJE && (
                <Command.Item
                  onSelect={() => runCommand(() => navigate("/journal-entries/new"))}
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
                >
                  <Plus className="h-4 w-4 text-primary" />
                  <span>New Journal Voucher</span>
                </Command.Item>
              )}
              <Command.Item
                onSelect={() => runCommand(() => navigate("/payments/new?paymentType=Receipt"))}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
              >
                <Plus className="h-4 w-4 text-primary" />
                <span>Record Customer Receipt</span>
              </Command.Item>
            </Command.Group>

            {/* Navigation */}
            <Command.Group heading="Navigation" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5 mt-2">
              <Command.Item
                onSelect={() => runCommand(() => navigate("/"))}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
              >
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                <span>Dashboard Overview</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate("/accounts"))}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
              >
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>Chart of Accounts</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate("/journal-entries"))}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Journal Entries</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate("/customers"))}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
              >
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Customers</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate("/suppliers"))}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
              >
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>Suppliers</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate("/sales-invoices"))}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
              >
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <span>Sales Invoices</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate("/payments"))}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
              >
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>Payments &amp; Receipts</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate("/bank-accounts"))}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
              >
                <Landmark className="h-4 w-4 text-muted-foreground" />
                <span>Bank Accounts &amp; Reconciliation</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate("/assets"))}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
              >
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span>Fixed Assets</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate("/budgets"))}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
              >
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>Budgets vs Actual</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate("/tax-groups"))}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
              >
                <Percent className="h-4 w-4 text-muted-foreground" />
                <span>Tax Rates &amp; Tax Groups</span>
              </Command.Item>
            </Command.Group>

            {/* Reports */}
            <Command.Group heading="Financial Reports" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5 mt-2">
              <Command.Item
                onSelect={() => runCommand(() => navigate("/reports/trial-balance"))}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
              >
                <FileBarChart className="h-4 w-4 text-muted-foreground" />
                <span>Trial Balance</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate("/reports/profit-loss"))}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
              >
                <FileBarChart className="h-4 w-4 text-muted-foreground" />
                <span>Profit &amp; Loss Statement</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate("/reports/balance-sheet"))}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
              >
                <FileBarChart className="h-4 w-4 text-muted-foreground" />
                <span>Balance Sheet</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate("/reports/general-ledger"))}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
              >
                <FileBarChart className="h-4 w-4 text-muted-foreground" />
                <span>General Ledger (GL)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate("/reports/gstr-1"))}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
              >
                <FileBarChart className="h-4 w-4 text-muted-foreground" />
                <span>GSTR-1 Sales Return</span>
              </Command.Item>
            </Command.Group>

            {/* System */}
            {canViewLogs && (
              <Command.Group heading="System" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5 mt-2">
                <Command.Item
                  onSelect={() => runCommand(() => navigate("/system-logs"))}
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-muted text-foreground"
                >
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>Audit Logs</span>
                </Command.Item>
              </Command.Group>
            )}
          </Command.List>

          <div className="flex items-center justify-between border-t border-border/80 px-4 py-2 text-xs text-muted-foreground">
            <span>Use ↑↓ to navigate, ↵ to select</span>
            <span className="font-mono-numbers">Isaii Ledger</span>
          </div>
        </Command>
      </div>
    </div>
  );
};

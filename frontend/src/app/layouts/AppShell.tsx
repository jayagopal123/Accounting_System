import React, { useState } from "react";
import { Outlet, NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, BookOpen, FileText, Users, Building2, Receipt, CreditCard, Landmark,
  Settings, Plus, Percent, FileBarChart, Shield, Bell, Menu, X,
  ChevronDown, LogOut, Sun, Moon, Wallet, ArrowLeftRight, Calculator, Target, Boxes, Search,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUiStore } from "@/stores/useUiStore";
import { usePermission } from "@/lib/PermissionGate";
import { useActiveFiscalYear } from "@/hooks/useActiveFiscalYear";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/api/services/notificationService";
import { queryKeys } from "@/api/queryKeys";
import { formatRelativeTime } from "@/lib/formatDate";
import { BRAND } from "@/config/brand";
import { CommandPalette } from "@/components/feedback/CommandPalette";
import { authService } from "@/api/services/authService";
import { routeMeta } from "@/app/routes";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ---- Nav config ----
interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  perm?: string;
  badge?: "unread";
  end?: boolean;
}
interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/notifications", label: "Notifications", icon: Bell, badge: "unread" },
    ],
  },
  {
    label: "Accounting",
    items: [
      { to: "/accounts", label: "Chart of Accounts", icon: BookOpen },
      { to: "/journal-entries", label: "Journal Entries", icon: FileText },
    ],
  },
  {
    label: "Sales",
    items: [
      { to: "/customers", label: "Customers", icon: Users },
      { to: "/sales-invoices", label: "Sales Invoices", icon: Receipt },
      { to: "/credit-notes", label: "Credit Notes", icon: Receipt },
      { to: "/payments?paymentType=Receipt", label: "Receipts", icon: CreditCard },
    ],
  },
  {
    label: "Purchases",
    items: [
      { to: "/suppliers", label: "Suppliers", icon: Building2 },
      { to: "/purchase-invoices", label: "Purchase Invoices", icon: Receipt },
      { to: "/debit-notes", label: "Debit Notes", icon: Receipt },
      { to: "/payments?paymentType=Payment", label: "Payments", icon: CreditCard },
    ],
  },
  {
    label: "Banking",
    items: [
      { to: "/bank-accounts", label: "Bank Accounts", icon: Landmark },
      { to: "/bank-transactions", label: "Bank Transactions", icon: ArrowLeftRight },
      { to: "/bank-reconciliation", label: "Reconciliation", icon: Wallet },
    ],
  },
  {
    label: "Assets & Budgets",
    items: [
      { to: "/assets", label: "Fixed Assets", icon: Boxes },
      { to: "/budgets", label: "Budgets", icon: Target },
    ],
  },
  {
    label: "Tax",
    items: [
      { to: "/tax-rates", label: "Tax Rates", icon: Percent },
      { to: "/tax-groups", label: "Tax Groups", icon: Calculator },
    ],
  },
  {
    label: "Reports",
    items: [
      { to: "/reports/general-ledger", label: "General Ledger", icon: FileBarChart },
      { to: "/reports/trial-balance", label: "Trial Balance", icon: FileBarChart },
      { to: "/reports/profit-loss", label: "Profit & Loss", icon: FileBarChart },
      { to: "/reports/balance-sheet", label: "Balance Sheet", icon: FileBarChart },
      { to: "/reports/cash-flow", label: "Cash Flow", icon: FileBarChart },
      { to: "/reports/ar-aging", label: "AR Aging", icon: FileBarChart },
      { to: "/reports/ap-aging", label: "AP Aging", icon: FileBarChart },
      { to: "/reports/gstr-1", label: "GSTR-1", icon: FileBarChart },
      { to: "/reports/gstr-3b", label: "GSTR-3B", icon: FileBarChart },
    ],
  },
  {
    label: "Settings",
    items: [
      { to: "/settings/fiscal-years", label: "Fiscal Years", icon: Settings },
      { to: "/settings/numbering-series", label: "Numbering Series", icon: Settings },
      { to: "/settings/cost-centers", label: "Cost Centers", icon: Settings },
      { to: "/settings/asset-categories", label: "Asset Categories", icon: Settings },
    ],
  },
  {
    label: "System",
    items: [{ to: "/system-logs", label: "System Logs", icon: Shield, perm: "audit_logs:view" }],
  },
];

const NEW_ACTIONS: { label: string; to: string; perm?: string }[] = [
  { label: "New Sales Invoice", to: "/sales-invoices/new", perm: "sales_invoices:create" },
  { label: "New Purchase Invoice", to: "/purchase-invoices/new", perm: "purchase_invoices:create" },
  { label: "New Journal Entry", to: "/journal-entries/new", perm: "journal_entries:create" },
  { label: "Record Receipt", to: "/payments/new?paymentType=Receipt", perm: undefined },
  { label: "Record Payment", to: "/payments/new?paymentType=Payment", perm: undefined },
];

// ---- Notification bell ----
const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: count } = useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 30_000, // pause when hidden is handled by browser throttling
    refetchIntervalInBackground: false,
  });
  const { data: unread } = useQuery({
    queryKey: queryKeys.notifications.unread,
    queryFn: notificationService.getUnread,
    enabled: open,
  });

  const markAll = async () => {
    await notificationService.markAllAsRead();
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Bell className="h-4.5 w-4.5" />
          {!!count && count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notifications</span>
          <button onClick={markAll} className="text-xs font-medium text-primary hover:underline">
            Mark all read
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {(unread ?? []).length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">You're all caught up.</p>
          )}
          {(unread ?? []).map((n) => (
            <DropdownMenuItem key={n._id} asChild>
              <Link
                to={n.link || "/notifications"}
                className="flex flex-col gap-0.5 rounded-xl px-3 py-2"
                onClick={() => notificationService.markAsRead(n._id)}
              >
                <span className="text-xs font-semibold text-foreground">{n.title}</span>
                <span className="line-clamp-2 text-xs text-muted-foreground">{n.message}</span>
                <span className="text-[10px] text-muted-foreground">{formatRelativeTime(n.createdAt)}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/notifications" className="justify-center text-xs text-primary">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ---- Sidebar ----
const SidebarContent: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const location = useLocation();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const user = useAuthStore((s) => s.user);
  const canViewLogs = usePermission("audit_logs:view");
  const canCreateSI = usePermission("sales_invoices:create");
  const canCreatePI = usePermission("purchase_invoices:create");
  const canCreate = canCreateSI || canCreatePI;

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 font-bold text-white shadow-lg shadow-emerald-500/20">
          IL
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="block truncate text-sm font-bold font-display text-white">{BRAND.name}</span>
            <span className="block text-[10px] text-emerald-400">Enterprise Edition</span>
          </div>
        )}
      </div>

      {/* New action */}
      {canCreate && (
        <div className="px-3 pt-3">
          <Link
            to="/sales-invoices/new"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:opacity-90"
            onClick={onNavigate}
          >
            <Plus className="h-4 w-4" /> New Sales Invoice
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
        {NAV.map((group) => {
          const items = group.items.filter((i) => i.perm !== "audit_logs:view" || canViewLogs);
          if (items.length === 0) return null;
          return (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map((item) => {
                  const base = item.to.split("?")[0];
                  const active = item.end ? location.pathname === base : location.pathname.startsWith(base);
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-white"
                          : "text-slate-400 hover:bg-sidebar-accent/60 hover:text-white"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      {!collapsed && user && (
        <div className="border-t border-sidebar-border px-4 py-3">
          <p className="truncate text-xs font-semibold text-white">{user.name}</p>
          <p className="truncate text-[10px] text-slate-500">{user.email}</p>
        </div>
      )}
    </div>
  );
};

// ---- Breadcrumbs from routeMeta ----
const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const crumbs: { label: string; to?: string }[] = [];
  let path = "";
  for (const seg of segments) {
    path += `/${seg}`;
    const meta = routeMeta[path];
    crumbs.push({ label: meta?.title ?? (seg === "new" ? "New" : seg === "edit" ? "Edit" : seg), to: path });
  }
  if (crumbs.length === 0) return null;
  return (
    <nav className="hidden items-center gap-1.5 text-xs text-muted-foreground lg:flex" aria-label="Breadcrumb">
      {crumbs.map((c, i) => (
        <React.Fragment key={c.to}>
          {i > 0 && <span className="opacity-50">/</span>}
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-foreground">{c.label}</span>
          ) : (
            <Link to={c.to!} className="hover:text-foreground">{c.label}</Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// ---- AppShell ----
export const AppShell: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar, mobileDrawerOpen, setMobileDrawerOpen } = useUiStore();
  const { activeFiscalYear } = useActiveFiscalYear();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { theme, setTheme } = useTheme();

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      /* ignore network errors on logout */
    }
    clearAuth();
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 68 : 248 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-40 hidden shrink-0 overflow-hidden md:block"
      >
        <div className={cn("h-full", sidebarCollapsed ? "w-[68px]" : "w-[248px]")}>
          <SidebarContent />
        </div>
      </motion.aside>

      {/* Mobile drawer */}
      <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <SheetContent side="left" className="w-72 border-0 p-0">
          <SidebarContent onNavigate={() => setMobileDrawerOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className={cn("flex min-h-screen w-full flex-col transition-all", sidebarCollapsed ? "md:pl-[68px]" : "md:pl-[248px]")}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl lg:px-6">
          <button
            type="button"
            className="rounded-xl p-2 hover:bg-muted md:hidden"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="hidden rounded-xl p-2 hover:bg-muted md:block"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>

          <Breadcrumbs />

          {/* FY chip */}
          <Link
            to="/settings/fiscal-years"
            className="ml-auto hidden items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted sm:flex"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {activeFiscalYear?.name ?? "FY —"}
          </Link>

          {/* New dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 sm:flex">
                <Plus className="h-4 w-4" /> New <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl">
              {NEW_ACTIONS.map((a) => (
                <DropdownMenuItemWithPerm key={a.to} label={a.label} to={a.to} perm={a.perm} />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Command palette trigger */}
          <button
            type="button"
            onClick={() => useUiStore.getState().setCommandPaletteOpen(true)}
            className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted md:flex"
          >
            <Search className="h-3.5 w-3.5" />
            Search…
            <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">⌘K</kbd>
          </button>

          <NotificationBell />

          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Toggle theme"
          >
            <Sun className="h-4.5 w-4.5 dark:hidden" />
            <Moon className="hidden h-4.5 w-4.5 dark:block" />
          </button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl border border-border bg-card py-1.5 pl-1.5 pr-2.5 hover:bg-muted">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 text-xs font-bold text-white">
                  {user?.name?.split(" ").map((p) => p[0]).slice(0, 2).join("") || "U"}
                </span>
                <span className="hidden max-w-28 truncate text-xs font-medium sm:block">{user?.name}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl">
              <DropdownMenuLabel className="text-xs">
                {user?.name}
                <span className="block font-normal text-muted-foreground">{user?.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Outlet with route transition */}
        <main className="flex-1 px-4 py-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={useLocation().pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {children ?? <Outlet />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette />
    </div>
  );
};

/** New-menu item filtered by permission. */
const DropdownMenuItemWithPerm: React.FC<{ label: string; to: string; perm?: string }> = ({ label, to, perm }) => {
  const allowed = usePermission(perm);
  const navigate = useNavigate();
  if (!allowed) return null;
  return (
    <DropdownMenuItem onClick={() => navigate(to)} className="text-xs">
      {label}
    </DropdownMenuItem>
  );
};

export default AppShell;

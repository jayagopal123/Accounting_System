export type StatusVariant =
  | "amber"
  | "blue"
  | "emerald"
  | "red"
  | "slate"
  | "grey"
  | "indigo"
  | "violet";

export interface StatusMeta {
  label: string;
  variant: StatusVariant;
  badgeClass: string;
  dotClass: string;
}

export const STATUS_META_MAP: Record<string, StatusMeta> = {
  // Amber / Warning
  Draft: {
    label: "Draft",
    variant: "amber",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    dotClass: "bg-amber-500",
  },
  Pending: {
    label: "Pending",
    variant: "amber",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    dotClass: "bg-amber-500",
  },

  // Blue / Info
  Submitted: {
    label: "Submitted",
    variant: "blue",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    dotClass: "bg-blue-500",
  },
  Completed: {
    label: "Completed",
    variant: "blue",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    dotClass: "bg-blue-500",
  },

  // Emerald / Success
  Active: {
    label: "Active",
    variant: "emerald",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  Approved: {
    label: "Approved",
    variant: "emerald",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  Verified: {
    label: "Verified",
    variant: "emerald",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  Balanced: {
    label: "Balanced",
    variant: "emerald",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },

  // Red / Destructive
  Cancelled: {
    label: "Cancelled",
    variant: "red",
    badgeClass: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    dotClass: "bg-red-500",
  },
  WrittenOff: {
    label: "Written Off",
    variant: "red",
    badgeClass: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    dotClass: "bg-red-500",
  },
  Rejected: {
    label: "Rejected",
    variant: "red",
    badgeClass: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    dotClass: "bg-red-500",
  },

  // Slate
  Closed: {
    label: "Closed",
    variant: "slate",
    badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
    dotClass: "bg-slate-500",
  },

  // Grey / Inactive
  Blocked: {
    label: "Blocked",
    variant: "grey",
    badgeClass: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
    dotClass: "bg-gray-500",
  },
  Inactive: {
    label: "Inactive",
    variant: "grey",
    badgeClass: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
    dotClass: "bg-gray-500",
  },

  // Indigo
  Depreciated: {
    label: "Depreciated",
    variant: "indigo",
    badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    dotClass: "bg-indigo-500",
  },

  // Violet
  Disposed: {
    label: "Disposed",
    variant: "violet",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    dotClass: "bg-purple-500",
  },
  Sold: {
    label: "Sold",
    variant: "violet",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    dotClass: "bg-purple-500",
  },
};

export function getStatusMeta(status: string | null | undefined): StatusMeta {
  if (!status) {
    return {
      label: "Unknown",
      variant: "grey",
      badgeClass: "bg-gray-500/10 text-gray-700 border-gray-500/20",
      dotClass: "bg-gray-500",
    };
  }
  return (
    STATUS_META_MAP[status] || {
      label: status,
      variant: "grey",
      badgeClass: "bg-gray-500/10 text-gray-700 border-gray-500/20",
      dotClass: "bg-gray-500",
    }
  );
}

export type EntityLifecycleType =
  | "document" // SalesInvoice, PurchaseInvoice, CreditNote, DebitNote, JournalEntry
  | "payment"
  | "budget"
  | "fiscalYear"
  | "reconciliation"
  | "asset"
  | "master"; // Customer, Supplier, Account, BankAccount

export interface LifecycleAction {
  id: string;
  label: string;
  nextStatus: string;
  destructive?: boolean;
  consequenceText?: string;
  permission?: string;
}

export function getAvailableLifecycleActions(
  entityType: EntityLifecycleType,
  currentStatus: string
): LifecycleAction[] {
  switch (entityType) {
    case "document":
      if (currentStatus === "Draft") {
        return [
          {
            id: "submit",
            label: "Submit Voucher",
            nextStatus: "Submitted",
            consequenceText:
              "Submitting this voucher will post entries to the General Ledger and update accounts. This action is formal.",
          },
          {
            id: "cancel",
            label: "Cancel Document",
            nextStatus: "Cancelled",
            destructive: true,
            consequenceText:
              "Are you sure you want to cancel this draft? It will be marked Cancelled and cannot be submitted.",
          },
        ];
      }
      if (currentStatus === "Submitted") {
        return [
          {
            id: "cancel",
            label: "Cancel Voucher",
            nextStatus: "Cancelled",
            destructive: true,
            consequenceText:
              "Cancelling a submitted voucher will reverse all journal entries and restore balances. This action is irreversible.",
          },
        ];
      }
      return [];

    case "payment":
      if (currentStatus === "Draft") {
        return [
          {
            id: "submit",
            label: "Submit Payment",
            nextStatus: "Submitted",
            consequenceText: "Submitting this payment will adjust invoice balances and bank ledgers.",
          },
          {
            id: "cancel",
            label: "Cancel Payment",
            nextStatus: "Cancelled",
            destructive: true,
            consequenceText: "Are you sure you want to cancel this payment?",
          },
        ];
      }
      if (currentStatus === "Submitted") {
        return [
          {
            id: "cancel",
            label: "Cancel Payment",
            nextStatus: "Cancelled",
            destructive: true,
            consequenceText: "Cancelling will restore the invoice balance and reverse bank postings.",
          },
        ];
      }
      return [];

    case "budget":
      if (currentStatus === "Draft") {
        return [
          {
            id: "approve",
            label: "Approve Budget",
            nextStatus: "Approved",
            consequenceText: "Approving this budget locks the targets and activates budget tracking.",
          },
        ];
      }
      if (currentStatus === "Approved") {
        return [
          {
            id: "close",
            label: "Close Budget",
            nextStatus: "Closed",
            destructive: true,
            consequenceText: "Closing this budget ends tracking for this fiscal period.",
          },
        ];
      }
      return [];

    case "fiscalYear":
      if (currentStatus === "Active") {
        return [
          {
            id: "close",
            label: "Close Fiscal Year",
            nextStatus: "Closed",
            destructive: true,
            consequenceText:
              "Closing this fiscal year will lock all journal entries and prevent further postings in this period. Ensure all final audits and reconciliations are complete.",
          },
        ];
      }
      return [];

    case "reconciliation":
      if (currentStatus === "Draft") {
        return [
          {
            id: "complete",
            label: "Complete Reconciliation",
            nextStatus: "Completed",
            consequenceText: "Complete reconciliation once difference is ₹0.00.",
          },
        ];
      }
      if (currentStatus === "Completed") {
        return [
          {
            id: "verify",
            label: "Verify & Lock",
            nextStatus: "Verified",
            consequenceText: "Verifying will lock this reconciliation period permanently.",
          },
        ];
      }
      return [];

    case "asset":
      if (currentStatus === "Draft") {
        return [
          {
            id: "activate",
            label: "Capitalize / Activate",
            nextStatus: "Active",
            consequenceText:
              "Activating will capitalize the asset and post the initial capital journal entry.",
          },
        ];
      }
      if (currentStatus === "Active") {
        return [
          {
            id: "depreciate",
            label: "Run Depreciation",
            nextStatus: "Active",
            consequenceText: "Calculate and post monthly depreciation to the ledger.",
          },
          {
            id: "dispose",
            label: "Dispose Asset",
            nextStatus: "Disposed",
            destructive: true,
            consequenceText:
              "Disposing the asset will calculate profit/loss on disposal and write down book value to zero.",
          },
        ];
      }
      return [];

    case "master":
      if (currentStatus === "Active") {
        return [
          {
            id: "block",
            label: "Block / Deactivate",
            nextStatus: "Blocked",
            destructive: true,
            consequenceText: "Blocking this master record prevents selecting it on new transactions.",
          },
        ];
      }
      return [
        {
          id: "activate",
          label: "Activate",
          nextStatus: "Active",
          consequenceText: "Reactivating allows this entity to be used across all transactions.",
        },
      ];

    default:
      return [];
  }
}

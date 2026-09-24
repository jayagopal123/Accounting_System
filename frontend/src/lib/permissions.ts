export type KnownPermission =
  | "customers:create"
  | "customers:update"
  | "customers:delete"
  | "suppliers:create"
  | "suppliers:update"
  | "suppliers:delete"
  | "sales_invoices:create"
  | "sales_invoices:update"
  | "sales_invoices:submit"
  | "sales_invoices:cancel"
  | "purchase_invoices:create"
  | "purchase_invoices:update"
  | "purchase_invoices:submit"
  | "purchase_invoices:cancel"
  | "journal_entries:create"
  | "journal_entries:update"
  | "journal_entries:submit"
  | "journal_entries:cancel"
  | "tax_rates:create"
  | "tax_rates:update"
  | "tax_groups:create"
  | "tax_groups:update"
  | "audit_logs:view";

export type PermissionString = KnownPermission | string;

/**
 * Mapping table for permissions reuse.
 * Credit Notes reuse sales_invoices:*
 * Debit Notes reuse purchase_invoices:*
 */
export const PERMISSION_ALIASES: Record<string, string> = {
  "credit_notes:create": "sales_invoices:create",
  "credit_notes:update": "sales_invoices:update",
  "credit_notes:submit": "sales_invoices:submit",
  "credit_notes:cancel": "sales_invoices:cancel",
  "debit_notes:create": "purchase_invoices:create",
  "debit_notes:update": "purchase_invoices:update",
  "debit_notes:submit": "purchase_invoices:submit",
  "debit_notes:cancel": "purchase_invoices:cancel",
};

/**
 * Checks whether user has permission.
 * Modules with no known permission strings default to true in UI.
 */
export function hasPermission(
  userPermissions: string[] | undefined,
  permission: PermissionString | undefined
): boolean {
  if (!permission) return true;

  // Resolve alias if mapped
  const targetPermission = PERMISSION_ALIASES[permission] || permission;

  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  // Superadmin or wildcard access
  if (userPermissions.includes("*") || userPermissions.includes("admin")) {
    return true;
  }

  return userPermissions.includes(targetPermission);
}

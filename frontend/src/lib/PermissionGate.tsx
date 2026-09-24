import React from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { hasPermission, type PermissionString } from "./permissions";

/**
 * React hook to check permissions from current auth store
 */
export function usePermission(permission?: PermissionString): boolean {
  const permissions = useAuthStore((state) => state.permissions);
  return hasPermission(permissions, permission);
}

/**
 * Wrapper component to conditionally render children if permission is met
 */
export function PermissionGate({
  perm,
  children,
  fallback = null,
}: {
  perm?: PermissionString;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): React.ReactElement | null {
  const allowed = usePermission(perm);
  if (!allowed) {
    return fallback ? <>{fallback}</> : null;
  }
  return <>{children}</>;
}

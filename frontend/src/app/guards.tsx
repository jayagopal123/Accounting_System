import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { hasPermission } from "@/lib/permissions";
import { SceneFallback } from "@/components/three/SceneFallback";

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  return <>{children}</>;
};

export const RequirePermission: React.FC<{
  perm?: string;
  children: React.ReactNode;
}> = ({ perm, children }) => {
  const permissions = useAuthStore((s) => s.permissions);
  // Modules without a known permission string default to allowed (section 9).
  if (!hasPermission(permissions, perm) && perm) {
    return <Navigate to="/no-access" replace />;
  }
  return <>{children}</>;
};

export const GuestOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

/** Route-level suspense fallback that doesn't flash a white screen. */
export const RouteFallback: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-full max-w-3xl space-y-4 p-8">
      <div className="h-8 w-56 rounded-xl bg-muted/70 animate-pulse" />
      <div className="h-32 w-full rounded-2xl bg-muted/40 animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 rounded-2xl bg-muted/30 animate-pulse" />
        <div className="h-24 rounded-2xl bg-muted/30 animate-pulse" />
      </div>
    </div>
  </div>
);

export const FullPageFallback: React.FC = () => <SceneFallback variant="auth" />;

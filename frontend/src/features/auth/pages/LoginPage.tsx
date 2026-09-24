import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/api/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";
import { BRAND } from "@/config/brand";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const setAuth = useAuthStore((state) => state.setAuth);

  // Live backend seeded credentials (see backend/scripts/seed-erp-data.js)
  const [email, setEmail] = useState("admin@company.com");
  const [password, setPassword] = useState("AdminPassword123!");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await authService.login({ email, password });
      setAuth(res.token, res.user);
      toast.success(`Welcome back, ${res.user.name || "Administrator"}!`);
      navigate(decodeURIComponent(redirect), { replace: true });
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Mobile Branding */}
      <div className="md:hidden flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center font-bold text-white shadow-md">
          IL
        </div>
        <div>
          <span className="text-xl font-bold font-display tracking-tight text-foreground">
            {BRAND.name}
          </span>
          <span className="text-xs text-muted-foreground block">Accounting Suite</span>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground font-display">
          Sign In to Your Workspace
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your organization credentials to access the ledger.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-medium text-destructive leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground tracking-wide block">
            Email Address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground tracking-wide block">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all font-mono-numbers"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-all glow-primary disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Authenticating...
            </span>
          ) : (
            <>
              Sign In to Ledger
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="rounded-xl border border-border/70 bg-muted/40 p-4 text-xs text-muted-foreground leading-relaxed">
        <span className="font-semibold text-foreground block mb-0.5">Demo Credentials</span>
        Pre-populated with organization Administrator credentials. Click "Sign In to Ledger" to load the complete ledger dataset immediately.
      </div>
    </div>
  );
};

export default LoginPage;

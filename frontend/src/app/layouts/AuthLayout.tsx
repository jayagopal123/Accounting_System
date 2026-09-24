import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { BRAND } from "@/config/brand";
import { TiltCard } from "@/components/feedback/TiltCard";
import { ShieldCheck, Receipt, Landmark } from "lucide-react";
import { SceneFallback } from "@/components/three/SceneFallback";

// Lazy-load AuthScene
const AuthScene = React.lazy(() => import("@/components/three/AuthScene"));

export const AuthLayout: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row overflow-hidden bg-background text-foreground">
      {/* Left Hero Panel (3D Visuals & Value Props) */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-3/5 flex-col justify-between p-10 lg:p-14 overflow-hidden bg-slate-950 text-white">
        {/* Animated 3D Scene Background */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<SceneFallback variant="auth" />}>
            <AuthScene />
          </Suspense>
        </div>

        {/* Ambient Dark Emerald Aurora Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 pointer-events-none z-10" />

        {/* Top Branding */}
        <div className="relative z-20 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">
            IL
          </div>
          <div>
            <span className="text-xl font-bold font-display tracking-tight text-white block">
              {BRAND.name}
            </span>
            <span className="text-xs text-emerald-400 font-medium">Enterprise Edition</span>
          </div>
        </div>

        {/* Hero Pitch & 3 Bento Feature Highlights */}
        <div className="relative z-20 space-y-8 max-w-xl">
          <div className="space-y-3">
            <h1 className="text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-white leading-tight">
              Precision Double-Entry Ledger &amp; Indian GST Suite
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Designed for modern Indian enterprises, financial controllers, and audit teams requiring flawless General Ledger integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <TiltCard tiltIntensity={6} className="bg-slate-900/60 backdrop-blur-md border-white/10 p-4 rounded-2xl">
              <ShieldCheck className="h-5 w-5 text-emerald-400 mb-2" />
              <h4 className="text-xs font-semibold text-white">Double-Entry GL</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Strict debit/credit validation and real-time ledger postings.
              </p>
            </TiltCard>

            <TiltCard tiltIntensity={6} className="bg-slate-900/60 backdrop-blur-md border-white/10 p-4 rounded-2xl">
              <Receipt className="h-5 w-5 text-cyan-400 mb-2" />
              <h4 className="text-xs font-semibold text-white">GST Compliance</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Composite tax groups, GSTR-1, and GSTR-3B registers.
              </p>
            </TiltCard>

            <TiltCard tiltIntensity={6} className="bg-slate-900/60 backdrop-blur-md border-white/10 p-4 rounded-2xl">
              <Landmark className="h-5 w-5 text-amber-400 mb-2" />
              <h4 className="text-xs font-semibold text-white">Bank Matching</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Interactive workspace with live zero-difference verification.
              </p>
            </TiltCard>
          </div>
        </div>

        {/* Bottom Security Assurance */}
        <div className="relative z-20 text-xs text-slate-400 flex items-center justify-between border-t border-white/10 pt-4">
          <span>&copy; {new Date().getFullYear()} {BRAND.name}</span>
          <span className="font-mono-numbers">TLS 1.3 / ISO 27001 Compliant</span>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative bg-background">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

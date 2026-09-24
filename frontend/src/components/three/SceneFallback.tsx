import React from "react";
import { motion } from "framer-motion";

interface SceneFallbackProps {
  className?: string;
  variant?: "auth" | "dashboard" | "notFound";
}

export const SceneFallback: React.FC<SceneFallbackProps> = ({
  className = "",
  variant = "auth",
}) => {
  return (
    <div
      className={`relative w-full h-full overflow-hidden flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      {/* Ambient background glowing orbs */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-emerald-950/40 to-slate-900 pointer-events-none" />

      {/* Aurora glow blobs */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.55, 0.35],
          x: [0, 20, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-72 h-72 rounded-full bg-emerald-500/20 blur-[80px] pointer-events-none"
      />

      <motion.div
        animate={{
          scale: [1.1, 0.95, 1.1],
          opacity: [0.25, 0.45, 0.25],
          x: [0, -25, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-64 h-64 rounded-full bg-cyan-500/20 blur-[90px] pointer-events-none"
      />

      {/* Decorative SVG Geometric Ledger elements */}
      {variant === "auth" && (
        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          <motion.div
            animate={{ y: [-8, 8, -8], rotateZ: [-2, 2, -2] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-48 h-32 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl shadow-2xl p-4 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-16 bg-emerald-400/40 rounded-full" />
              <div className="h-4 w-4 rounded-full bg-emerald-400/50" />
            </div>
            <div className="space-y-1.5">
              <div className="h-2 w-28 bg-emerald-400/30 rounded-full" />
              <div className="h-2 w-20 bg-emerald-400/20 rounded-full" />
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [6, -6, 6], rotateZ: [3, -3, 3] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="w-44 h-28 -mt-10 ml-16 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-xl shadow-xl p-3 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="h-2.5 w-12 bg-cyan-400/40 rounded-full" />
              <div className="h-3 w-3 rounded-full bg-cyan-400/50" />
            </div>
            <div className="h-2 w-24 bg-cyan-400/30 rounded-full" />
          </motion.div>
        </div>
      )}

      {variant === "dashboard" && (
        <div className="absolute inset-0 flex items-center justify-around opacity-30 pointer-events-none">
          <div className="w-24 h-24 rounded-full border border-emerald-400/30 animate-pulse" />
          <div className="w-32 h-32 rounded-2xl border border-cyan-400/20 rotate-12" />
        </div>
      )}
    </div>
  );
};

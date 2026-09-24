import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  tiltIntensity?: number;
  glareEffect?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = "",
  tiltIntensity = 10,
  glareEffect = true,
  onClick,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [tiltIntensity, -tiltIntensity]), {
    stiffness: 250,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(x, [0, 1], [-tiltIntensity, tiltIntensity]), {
    stiffness: 250,
    damping: 25,
  });

  const glareX = useTransform(x, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(y, [0, 1], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const clientX = (e.clientX - rect.left) / rect.width;
    const clientY = (e.clientY - rect.top) / rect.height;
    x.set(clientX);
    y.set(clientY);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <div style={{ perspective: 1000 }} className="relative">
      <motion.div
        ref={cardRef}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        whileTap={{ scale: 0.985 }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-shadow duration-200 hover:shadow-lg dark:bg-card/90",
          onClick ? "cursor-pointer" : "",
          className
        )}
        {...(props as any)}
      >
        {glareEffect && isHovered && (
          <motion.div
            style={{
              left: glareX,
              top: glareY,
              transform: "translate(-50%, -50%)",
            }}
            className="pointer-events-none absolute h-64 w-64 rounded-full bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent blur-2xl"
          />
        )}
        <div className="relative z-10">{children}</div>
      </motion.div>
    </div>
  );
};

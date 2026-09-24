import React, { useEffect } from "react";
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";
import { formatMoney } from "@/lib/formatMoney";

interface CountUpProps {
  value: number;
  isCurrency?: boolean;
  compact?: boolean;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  isCurrency = false,
  compact = false,
  className = "",
}) => {
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    damping: 24,
    stiffness: 120,
  });

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  const display = useTransform(springVal, (current) => {
    if (isCurrency) {
      return formatMoney(Math.round(current), { compact });
    }
    return new Intl.NumberFormat("en-IN").format(Math.round(current));
  });

  return (
    <motion.span className={`font-mono-numbers tabular-nums inline-block ${className}`}>
      {display}
    </motion.span>
  );
};

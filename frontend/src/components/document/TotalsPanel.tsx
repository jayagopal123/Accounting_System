import React from "react";
import { type TaxGroupItem } from "@/api/services/taxService";
import { formatMoney } from "@/lib/formatMoney";
import { CountUp } from "../feedback/CountUp";

interface TotalsPanelProps {
  subtotal: number;
  taxGroup?: TaxGroupItem | null;
  className?: string;
}

export const TotalsPanel: React.FC<TotalsPanelProps> = ({
  subtotal,
  taxGroup,
  className = "",
}) => {
  const taxes = taxGroup?.taxes || [];
  const totalTaxRate = taxGroup?.totalRate || 0;
  const totalTaxAmount = Math.round(((subtotal * totalTaxRate) / 100) * 100) / 100;
  const grandTotal = subtotal + totalTaxAmount;

  return (
    <div className={`ml-auto w-full max-w-sm rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Subtotal</span>
        <span className="font-mono-numbers font-medium text-foreground">
          {formatMoney(subtotal)}
        </span>
      </div>

      {taxes.length > 0 && totalTaxRate > 0 ? (
        <div className="space-y-1.5 pt-1 border-t border-border/60">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tax Breakdown ({taxGroup?.name})
          </div>
          {taxes.map((t, idx) => {
            const taxName = typeof t.taxRate === "object" ? t.taxRate?.name : `Tax ${t.rate}%`;
            const lineTaxAmount = Math.round(((subtotal * t.rate) / 100) * 100) / 100;
            return (
              <div key={idx} className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {taxName} ({t.rate}%)
                </span>
                <span className="font-mono-numbers text-foreground">
                  {formatMoney(lineTaxAmount)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
          <span>Tax (Nil Rated)</span>
          <span className="font-mono-numbers text-foreground">₹0.00</span>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-base font-semibold text-foreground font-display">
          Grand Total
        </span>
        <span className="text-lg font-bold text-primary font-mono-numbers">
          <CountUp value={grandTotal} isCurrency />
        </span>
      </div>
    </div>
  );
};

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { type LineItem } from "@/api/services/documentService";
import { formatMoney } from "@/lib/formatMoney";

interface LineItemEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  disabled?: boolean;
}

export const LineItemEditor: React.FC<LineItemEditorProps> = ({
  items,
  onChange,
  disabled = false,
}) => {
  const handleItemChange = (index: number, field: keyof LineItem, val: string | number) => {
    const updated = [...items];
    const item = { ...updated[index] };

    if (field === "quantity" || field === "rate") {
      const num = typeof val === "number" ? val : parseFloat(val);
      item[field] = isNaN(num!) ? 0 : num!;
      // Auto-calculate line amount
      item.amount = Math.round(item.quantity * item.rate * 100) / 100;
    } else {
      (item as any)[field] = val;
    }

    updated[index] = item;
    onChange(updated);
  };

  const handleAddRow = () => {
    onChange([
      ...items,
      {
        itemName: "",
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) {
      // Clear line instead of removing last row
      onChange([{ itemName: "", description: "", quantity: 1, rate: 0, amount: 0 }]);
      return;
    }
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Line Items ({items.length})
        </label>
        {!disabled && (
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Row
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/40 border-b border-border text-xs uppercase font-semibold text-muted-foreground tracking-wider">
              <tr>
                <th className="px-4 py-3 w-10">#</th>
                <th className="px-4 py-3 min-w-[240px]">Item / Description</th>
                <th className="px-4 py-3 w-28 text-right">Qty</th>
                <th className="px-4 py-3 w-36 text-right">Rate (₹)</th>
                <th className="px-4 py-3 w-36 text-right">Amount (₹)</th>
                {!disabled && <th className="px-3 py-3 w-12 text-center" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((item, index) => (
                <tr key={item._id ?? `row-${index}`} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono-numbers">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 space-y-1">
                    <input
                      type="text"
                      disabled={disabled}
                      value={item.itemName}
                      onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                      placeholder="Item name or service description"
                      className="w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="text"
                      disabled={disabled}
                      value={item.description || ""}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      placeholder="Optional remarks / HSN code"
                      className="w-full bg-transparent px-3 py-0.5 text-xs text-muted-foreground focus:outline-none placeholder:text-muted-foreground/50"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      disabled={disabled}
                      value={item.quantity === 0 ? "" : item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.valueAsNumber)}
                      className="w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-right font-mono-numbers text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={disabled}
                      value={item.rate === 0 ? "" : item.rate}
                      onChange={(e) => handleItemChange(index, "rate", e.target.valueAsNumber)}
                      className="w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-right font-mono-numbers text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-mono-numbers font-medium text-foreground whitespace-nowrap">
                    {formatMoney(item.amount)}
                  </td>
                  {!disabled && (
                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Remove row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

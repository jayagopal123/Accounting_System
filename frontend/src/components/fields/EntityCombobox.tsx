import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  subtitle?: string;
  badge?: string;
}

interface EntityComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const EntityCombobox: React.FC<EntityComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  label,
  error,
  disabled = false,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(search.toLowerCase()))
  );

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full space-y-1.5", className)}>
      {label && (
        <label className="text-xs font-medium text-foreground tracking-wide block">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-destructive ring-1 ring-destructive" : ""
        )}
      >
        <span className={cn("truncate", !selectedOption ? "text-muted-foreground" : "")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
      </button>

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl border border-border bg-popover shadow-xl animate-in fade-in-0 zoom-in-95 overflow-hidden">
          <div className="p-2 border-b border-border/80 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>

          <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No matching options found.
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl text-left transition-colors",
                      isSelected
                        ? "bg-primary text-white"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="font-medium truncate">{opt.label}</span>
                      {opt.subtitle && (
                        <span
                          className={cn(
                            "text-xs truncate",
                            isSelected ? "text-white/80" : "text-muted-foreground"
                          )}
                        >
                          {opt.subtitle}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

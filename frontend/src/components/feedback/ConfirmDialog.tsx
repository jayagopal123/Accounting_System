import React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  /** Controlled mode */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Uncontrolled trigger mode: children become the trigger button */
  children?: React.ReactNode;
  title: string;
  description: string;
  consequenceText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  children,
  title,
  description,
  consequenceText,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  isLoading = false,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isOpen = open ?? uncontrolledOpen;
  const setOpen = (v: boolean) => (onOpenChange ? onOpenChange(v) : setUncontrolledOpen(v));
  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      /* keep open on error — toast shows the message */
    }
  };

  return (
    <AlertDialogPrimitive.Root open={isOpen} onOpenChange={setOpen}>
      {children && (
        <AlertDialogPrimitive.Trigger asChild>{children}</AlertDialogPrimitive.Trigger>
      )}
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                destructive ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
              )}
            >
              {destructive ? <AlertTriangle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
            </div>
            <div className="space-y-1.5 flex-1">
              <AlertDialogPrimitive.Title className="text-lg font-semibold tracking-tight text-foreground font-display">
                {title}
              </AlertDialogPrimitive.Title>
              <AlertDialogPrimitive.Description className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </AlertDialogPrimitive.Description>
            </div>
          </div>

          {consequenceText && (
            <div
              className={cn(
                "rounded-xl p-3.5 text-xs font-medium border leading-relaxed",
                destructive
                  ? "bg-destructive/10 border-destructive/20 text-destructive dark:text-red-400"
                  : "bg-muted border-border text-muted-foreground"
              )}
            >
              <span className="font-semibold uppercase tracking-wider block mb-1">
                {destructive ? "Irreversible Consequence" : "Ledger Note"}
              </span>
              {consequenceText}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-2">
            <AlertDialogPrimitive.Cancel asChild>
              <button
                type="button"
                disabled={isLoading}
                className="mt-2 sm:mt-0 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border border-border bg-background hover:bg-muted text-foreground transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className={cn(
                  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white transition-all shadow-sm disabled:opacity-50",
                  destructive
                    ? "bg-destructive hover:bg-destructive/90"
                    : "bg-primary hover:bg-primary/90 glow-primary"
                )}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </span>
                ) : (
                  confirmLabel
                )}
              </button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
};

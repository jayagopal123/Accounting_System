import React from "react";
import { useForm, FormProvider, type FieldValues, type UseFormReturn, type DefaultValues } from "react-hook-form";
import { PageHeader } from "../feedback/PageHeader";
import { Link, useBlocker } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Field } from "./Field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ResourceFormPageProps<T extends FieldValues> {
  title: string;
  description?: string;
  defaultValues: DefaultValues<T>;
  onSubmit: (values: T) => Promise<void>;
  isSubmitting?: boolean;
  isEdit?: boolean;
  backTo: string;
  children: (form: UseFormReturn<T>) => React.ReactNode;
  /** Extra buttons next to Save (e.g. Save & Submit). */
  extraActions?: (form: UseFormReturn<T>) => React.ReactNode;
  submitLabel?: string;
}

/**
 * Config-driven RHF form shell: header, sections, dirty-state guard,
 * sticky action bar, error summary, success toast + navigate.
 */
export function ResourceFormPage<T extends FieldValues>({
  title,
  description,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  isEdit = false,
  backTo,
  children,
  extraActions,
  submitLabel = "Save",
}: ResourceFormPageProps<T>) {
  const form = useForm<T>({ defaultValues, mode: "onTouched" });
  const dirty = form.formState.isDirty;
  const submitError = form.formState.errors?.root?.message as string | undefined;

  // Dirty-state navigation guard (spec: AlertDialog, never window.confirm)
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname);
  const [showLeaveDialog, setShowLeaveDialog] = React.useState(false);
  if (blocker.state === "blocked" && !showLeaveDialog) setShowLeaveDialog(true);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      form.reset(values);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save.");
    }
  });

  return (
    <FormProvider {...form}>
      <AlertDialog open={showLeaveDialog} onOpenChange={(open) => { if (!open) { setShowLeaveDialog(false); if (blocker.state === "blocked") blocker.reset(); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes on this form. If you continue, your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { setShowLeaveDialog(false); if (blocker.state === "blocked") blocker.proceed(); }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <form onSubmit={handleSubmit} className="space-y-6 pb-24">
        <PageHeader
          title={title}
          description={description}
          backButton={
            <Link
              to={backTo}
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card p-2 text-muted-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          }
        />

        {submitError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
            {submitError}
          </div>
        )}

        {children(form)}

        {/* Sticky action bar */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/90 px-4 py-3 backdrop-blur-xl md:pl-[264px]">
          <div className="mx-auto flex max-w-5xl items-center justify-end gap-2.5">
            <Link
              to={backTo}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancel
            </Link>
            {extraActions?.(form)}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {submitLabel}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

export default ResourceFormPage;

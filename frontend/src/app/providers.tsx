import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        const status = (error as any)?.status;
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});

export const AppProviders: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <MotionConfig reducedMotion="user">
          {children ?? <RouterProvider router={router} />}
          <Toaster richColors position="top-right" />
        </MotionConfig>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default AppProviders;

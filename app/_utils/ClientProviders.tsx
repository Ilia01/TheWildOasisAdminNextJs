"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { DarkModeProvider } from "../_context/DarkModeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 60 * 1000,
      staleTime: 0,
    },
  },
});

function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
      <QueryClientProvider client={queryClient}>
        <DarkModeProvider>
          {children}

          <Toaster
            position="top-center"
            gutter={12}
            containerStyle={{ margin: "8px" }}
            toastOptions={{
              success: {
                duration: 3 * 1000,
              },
              error: {
                duration: 5 * 1000,
              },
              style: {
                fontSize: "16px",
                maxWidth: "500px",
                padding: "16px 24px",
                backgroundColor: "var(--color-grey-0)",
                color: "var(--color-grey-700)",
              },
            }}
          />
        </DarkModeProvider>
      </QueryClientProvider>
  );
}

export default ClientProviders;

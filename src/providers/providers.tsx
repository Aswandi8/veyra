"use client";

import * as React from "react";

import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "@/providers/theme-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      {children}

      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
        }}
      />
    </ThemeProvider>
  );
}

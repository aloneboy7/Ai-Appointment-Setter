"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/components/ui/AuthProvider";
import { ThemeProvider } from "@/components/ui/ThemeToggle";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
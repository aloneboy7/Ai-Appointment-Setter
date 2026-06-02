"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Session } from "next-auth";

interface AuthContextType {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  status: "loading",
  refetch: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", {
        credentials: "include", // Ensure cookies are sent with the request
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          setSession(data);
          setStatus("authenticated");
        } else {
          setSession(null);
          setStatus("unauthenticated");
        }
      } else {
        setSession(null);
        setStatus("unauthenticated");
      }
    } catch (error) {
      console.error("[AuthProvider] Failed to fetch session:", error);
      setSession(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    fetchSession();

    // Poll session every 5 minutes to keep it fresh
    const interval = setInterval(fetchSession, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSession]);

  return (
    <AuthContext.Provider value={{ session, status, refetch: fetchSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
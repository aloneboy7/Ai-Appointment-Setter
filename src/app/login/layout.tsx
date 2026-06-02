import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — AI Appointment Setter",
  description: "Sign in to your AI Appointment Setter account.",
  alternates: { canonical: "/login" },
  openGraph: { title: "Sign In — AI Appointment Setter", url: "/login" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
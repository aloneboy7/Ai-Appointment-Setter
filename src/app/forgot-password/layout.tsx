import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Your Password — AI Appointment Setter",
  description: "Reset your AI Appointment Setter account password.",
  alternates: { canonical: "/forgot-password" },
  openGraph: { title: "Reset Your Password — AI Appointment Setter", url: "/forgot-password" },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
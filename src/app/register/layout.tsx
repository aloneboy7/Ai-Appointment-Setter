import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start Free Trial — AI Appointment Setter",
  description: "Create your free AI Appointment Setter account. 14-day trial, no credit card required.",
  alternates: { canonical: "/register" },
  openGraph: { title: "Start Free Trial — AI Appointment Setter", url: "/register" },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Live Demo — AI Appointment Setter",
  description: "Schedule a personalized demo of AI Appointment Setter. See how AI books meetings automatically.",
  alternates: { canonical: "/book-demo" },
  openGraph: { title: "Book a Live Demo — AI Appointment Setter", url: "/book-demo" },
};

export default function BookDemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
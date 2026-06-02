import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers — AI Appointment Setter",
  description: "Join the AI Appointment Setter team and help shape the future of AI-powered sales.",
  alternates: { canonical: "/careers" },
  openGraph: { title: "Careers — AI Appointment Setter", url: "/careers" },
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1020]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Careers</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-10">Join our team</p>

        <div className="glass-strong rounded-2xl p-8 md:p-12 text-center">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-primary/10 mb-6">
            <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">We&apos;re Hiring</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            We&apos;re building the future of AI-powered sales automation. Open positions will be posted here soon.
          </p>
          <a href="/" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white font-medium rounded-xl px-6 py-3 text-sm transition-colors">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — AI Appointment Setter",
  description: "Learn about AI Appointment Setter, our mission, and our team.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About — AI Appointment Setter", url: "/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1020]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">About AI Appointment Setter</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-10">Our mission and story</p>

        <div className="glass-strong rounded-2xl p-8 md:p-12 text-center">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-primary/10 mb-6">
            <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Coming Soon</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            We&apos;re building something special. Our full story, team, and mission details are on the way.
          </p>
          <a href="/" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white font-medium rounded-xl px-6 py-3 text-sm transition-colors">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
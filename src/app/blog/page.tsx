import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — AI Appointment Setter",
  description: "Insights on AI-powered lead generation, appointment setting, and sales automation.",
  alternates: { canonical: "/blog" },
  openGraph: { title: "Blog — AI Appointment Setter", url: "/blog" },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1020]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Blog</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-10">Insights on AI, sales automation, and growth</p>

        <div className="glass-strong rounded-2xl p-8 md:p-12 text-center">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-primary/10 mb-6">
            <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Coming Soon</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            We&apos;re working on articles about AI-powered sales, lead conversion strategies, and product updates. Stay tuned!
          </p>
          <a href="/" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white font-medium rounded-xl px-6 py-3 text-sm transition-colors">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
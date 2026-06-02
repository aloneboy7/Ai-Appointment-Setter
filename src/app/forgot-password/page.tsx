"use client";

import { useState } from "react";
import { Zap, Mail, ArrowLeft } from "lucide-react";
import { useTheme } from "@/components/ui/ThemeToggle";
import Button from "@/components/shared/Button";

export default function ForgotPasswordPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Always show the same message regardless of whether the email exists (security best practice)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? "bg-[#0B1020]" : "bg-gray-50"}`}>
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              AI <span className="gradient-text">Appointment</span> Setter
            </span>
          </a>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          {submitted ? (
            <div className="text-center">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Check your email</h1>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                If an account exists for <span className="font-medium text-gray-900 dark:text-white">{email}</span>, you&apos;ll receive a reset link shortly.
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Didn&apos;t receive the email? Check your spam folder or{" "}
                <button onClick={() => setSubmitted(false)} className="text-primary hover:underline">
                  try again
                </button>
              </p>
              <a href="/login">
                <Button variant="secondary" className="w-full group">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </a>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Reset your password</h1>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className={`w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-gray-400 ${
                        isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                <a href="/login" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" />
                  Back to Sign In
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
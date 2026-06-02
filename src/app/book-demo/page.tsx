"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, CheckCircle2, Building2, Mail, Phone, Clock, MessageSquare, Calendar, Globe } from "lucide-react";
import { useTheme } from "@/components/ui/ThemeToggle";
import Button from "@/components/shared/Button";

const INDUSTRIES = ["Real Estate", "Marketing Agency", "Consulting", "Healthcare / Clinics", "Legal", "Financial Services", "Technology", "Other"];
const TIME_SLOTS = ["Morning (9-12)", "Afternoon (12-5)", "Evening (5-7)", "Flexible"];

export default function BookDemoPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", industry: "", date: "", preferred_time: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(tz);
    } catch {
      setTimezone("UTC");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, timezone }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-gray-400 ${
    isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"
  }`;
  const plainInputCls = `w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-gray-400 ${
    isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"
  }`;

  // Min date = today
  const today = new Date().toISOString().split("T")[0];

  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? "bg-[#0B1020]" : "bg-gray-50"}`}>
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative w-full max-w-lg">
          <div className="glass-strong rounded-2xl p-8 md:p-12 text-center">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-green-500/10 dark:bg-green-500/20 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Thanks, {form.name.split(" ")[0] || "there"}!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-2">Your demo request is confirmed.</p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              We&apos;ll send a calendar invite to <span className="font-medium text-gray-900 dark:text-white">{form.email}</span> within 2 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" onClick={() => router.push("/")}>Back to Home</Button>
              <Button variant="secondary" onClick={() => router.push("/register")}>Start Free Trial</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${isDark ? "bg-[#0B1020]" : "bg-gray-50"}`}>
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />

      <div className="relative w-full max-w-2xl">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              AI <span className="gradient-text">Appointment</span> Setter
            </span>
          </a>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
            Book a <span className="gradient-text">Live Demo</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            See how our AI books meetings automatically. We&apos;ll walk you through a personalized demo in 30 minutes.
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Full name *</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input id="name" type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Smith" className={inputCls} />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Work email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" className={inputCls} />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Company</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input id="company" type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Inc." className={inputCls} />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" className={inputCls} />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Industry</label>
              <select id="industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className={`w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors appearance-none ${
                  isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"
                }`}>
                <option className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white" value="">Select industry</option>
                {INDUSTRIES.map((ind) => (
                  <option className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white" key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Preferred date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input id="date" type="date" required min={today} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className={`w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors ${
                      isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"
                    }`} />
                </div>
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Preferred time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select id="time" value={form.preferred_time} onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
                    className={`w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors appearance-none ${
                      isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"
                    }`}>
                    <option className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white" value="">Select time</option>
                    {TIME_SLOTS.map((slot) => (
                      <option className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white" key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {timezone && (
              <p className="flex items-center gap-1.5 text-xs text-gray-400">
                <Globe className="h-3.5 w-3.5" />
                Times shown in {timezone}
              </p>
            )}

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Anything else?</label>
              <textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} placeholder="Tell us about your needs..."
                className={`w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-gray-400 resize-none ${
                  isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"
                }`} />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">Request Demo <ArrowRight className="h-4 w-4" /></span>
              )}
            </Button>
          </form>

          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> 30-min call</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> No obligation</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Personalized</span>
          </div>
        </div>
      </div>
    </div>
  );
}
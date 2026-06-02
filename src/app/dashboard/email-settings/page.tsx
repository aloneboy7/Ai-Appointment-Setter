"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Shield,
  Settings2,
  Zap,
  Bot,
  Globe,
  MessageSquare,
  Save,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
  ToggleLeft,
  ToggleRight,
  Info,
} from "lucide-react";

interface EmailSettings {
  auto_reply_enabled: boolean;
  reply_mode: string;
  skip_marketing: boolean;
  skip_newsletters: boolean;
  skip_social: boolean;
  skip_transactional: boolean;
  skip_job_alerts: boolean;
  custom_skip_domains: string[];
  custom_allow_emails: string[];
  reply_tone: string;
  reply_language: string;
  max_replies_per_day: number;
  custom_instructions: string | null;
}

const DEFAULT_SETTINGS: EmailSettings = {
  auto_reply_enabled: true,
  reply_mode: "replies_and_inquiries",
  skip_marketing: true,
  skip_newsletters: true,
  skip_social: true,
  skip_transactional: true,
  skip_job_alerts: true,
  custom_skip_domains: [],
  custom_allow_emails: [],
  reply_tone: "professional",
  reply_language: "en",
  max_replies_per_day: 50,
  custom_instructions: null,
};

const REPLY_MODES = [
  {
    value: "replies_and_inquiries",
    label: "Smart Mode",
    desc: "Reply to direct replies + new emails that look like inquiries (Recommended)",
    icon: "🧠",
  },
  {
    value: "replies_only",
    label: "Replies Only",
    desc: "Only reply to direct replies to your sent emails",
    icon: "↩️",
  },
  {
    value: "all",
    label: "Reply to All",
    desc: "Reply to every incoming email (not recommended — may reply to spam)",
    icon: "📬",
  },
  {
    value: "allowlist_only",
    label: "Allowlist Only",
    desc: "Only reply to specific email addresses you've whitelisted",
    icon: "✅",
  },
];

const CATEGORIES = [
  {
    key: "skip_marketing" as const,
    label: "Marketing & Promotions",
    desc: "Amazon, HubSpot, Mailchimp, promotional offers",
    examples: "amazon.com, hubspot.com, mailchimp.com",
    icon: "📢",
  },
  {
    key: "skip_newsletters" as const,
    label: "Newsletters & Digests",
    desc: "Stack Overflow, Kaggle, educational digests",
    examples: "stackoverflow.email, kaggle.com, educative.io",
    icon: "📰",
  },
  {
    key: "skip_social" as const,
    label: "Social Media Notifications",
    desc: "LinkedIn, Facebook, Twitter/X, Instagram",
    examples: "linkedin.com, facebook.com, x.com",
    icon: "👥",
  },
  {
    key: "skip_transactional" as const,
    label: "Transactional & System",
    desc: "Payment receipts, system alerts, status pages",
    examples: "stripe.com, google.com, statuspage.io",
    icon: "🧾",
  },
  {
    key: "skip_job_alerts" as const,
    label: "Job Alerts & Career",
    desc: "Indeed, Naukri, AngelList, Glassdoor",
    examples: "indeed.com, naukri.com, angel.co",
    icon: "💼",
  },
];

const TONES = [
  { value: "professional", label: "Professional", icon: "👔" },
  { value: "friendly", label: "Friendly", icon: "😊" },
  { value: "casual", label: "Casual", icon: "🤙" },
  { value: "formal", label: "Formal", icon: "📜" },
];

export default function EmailSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<EmailSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [newSkipDomain, setNewSkipDomain] = useState("");
  const [newAllowEmail, setNewAllowEmail] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchSettings();
    }
  }, [status, router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/email-automation/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/email-automation/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save settings");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const addSkipDomain = () => {
    const d = newSkipDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (d && !settings.custom_skip_domains.includes(d)) {
      setSettings((s) => ({ ...s, custom_skip_domains: [...s.custom_skip_domains, d] }));
      setNewSkipDomain("");
    }
  };

  const removeSkipDomain = (d: string) => {
    setSettings((s) => ({ ...s, custom_skip_domains: s.custom_skip_domains.filter((x) => x !== d) }));
  };

  const addAllowEmail = () => {
    const e = newAllowEmail.trim().toLowerCase();
    if (e && e.includes("@") && !settings.custom_allow_emails.includes(e)) {
      setSettings((s) => ({ ...s, custom_allow_emails: [...s.custom_allow_emails, e] }));
      setNewAllowEmail("");
    }
  };

  const removeAllowEmail = (e: string) => {
    setSettings((s) => ({ ...s, custom_allow_emails: s.custom_allow_emails.filter((x) => x !== e) }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1020] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C63FF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1020] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Mail className="w-7 h-7 text-[#6C63FF]" />
              Email Automation Settings
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Control which emails get auto-replied and how the AI responds
            </p>
          </div>
        </div>

        {/* Save bar */}
        <div className="sticky top-0 z-10 bg-[#0B1020]/90 backdrop-blur-md py-3 mb-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            {saved && (
              <span className="flex items-center gap-1 text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" /> Settings saved
              </span>
            )}
            {error && (
              <span className="flex items-center gap-1 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" /> {error}
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#6C63FF] hover:bg-[#5B52EE] rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        <div className="space-y-6">
          {/* ── Section 1: Master Toggle ── */}
          <section className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#6C63FF]/20 rounded-lg">
                  <Zap className="w-5 h-5 text-[#6C63FF]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Auto-Reply Engine</h2>
                  <p className="text-gray-400 text-sm">
                    Automatically reply to incoming emails using AI
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setSettings((s) => ({
                    ...s,
                    auto_reply_enabled: !s.auto_reply_enabled,
                  }))
                }
                className="focus:outline-none"
              >
                {settings.auto_reply_enabled ? (
                  <ToggleRight className="w-12 h-12 text-[#6C63FF]" />
                ) : (
                  <ToggleLeft className="w-12 h-12 text-gray-500" />
                )}
              </button>
            </div>

            {!settings.auto_reply_enabled && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-300 text-sm">
                ⚠️ Auto-reply is disabled. The system will not respond to any incoming emails.
              </div>
            )}
          </section>

          {/* ── Section 2: Reply Mode ── */}
          <section className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-[#00D4FF]/20 rounded-lg">
                <Bot className="w-5 h-5 text-[#00D4FF]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Reply Mode</h2>
                <p className="text-gray-400 text-sm">
                  Choose which emails the AI should reply to
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REPLY_MODES.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() =>
                    setSettings((s) => ({ ...s, reply_mode: mode.value }))
                  }
                  className={`p-4 rounded-xl border text-left transition-all ${
                    settings.reply_mode === mode.value
                      ? "border-[#6C63FF] bg-[#6C63FF]/10 shadow-lg shadow-[#6C63FF]/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{mode.icon}</span>
                    <span className="font-semibold">{mode.label}</span>
                    {settings.reply_mode === mode.value && (
                      <CheckCircle2 className="w-4 h-4 text-[#6C63FF] ml-auto" />
                    )}
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">{mode.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* ── Section 3: Category Filters ── */}
          <section className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Category Filters</h2>
                <p className="text-gray-400 text-sm">
                  Choose which types of emails to skip (never auto-reply)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.key}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    settings[cat.key]
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-base">{cat.icon}</span>
                      <span className="font-medium">{cat.label}</span>
                    </div>
                    <p className="text-gray-400 text-xs">{cat.desc}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      e.g. {cat.examples}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setSettings((s) => ({
                        ...s,
                        [cat.key]: !s[cat.key],
                      }))
                    }
                    className="ml-4 focus:outline-none flex-shrink-0"
                  >
                    {settings[cat.key] ? (
                      <ToggleRight className="w-10 h-10 text-green-400" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-gray-500" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-[#6C63FF]/10 border border-[#6C63FF]/20 rounded-lg flex items-start gap-2">
              <Info className="w-4 h-4 text-[#6C63FF] mt-0.5 flex-shrink-0" />
              <p className="text-gray-300 text-xs leading-relaxed">
                <strong>Green = Skipping</strong>. These email types will be ignored by the auto-reply system. Enable a toggle to block that category. Disable it to allow replies to those emails.
              </p>
            </div>
          </section>

          {/* ── Section 4: Custom Domains to Skip ── */}
          <section className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-orange-500/20 rounded-lg">
                <Globe className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Custom Domains to Skip</h2>
                <p className="text-gray-400 text-sm">
                  Add specific domains you never want the AI to reply to
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {settings.custom_skip_domains.map((d) => (
                <span
                  key={d}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-sm"
                >
                  {d}
                  <button onClick={() => removeSkipDomain(d)} className="hover:text-red-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {settings.custom_skip_domains.length === 0 && (
                <span className="text-gray-500 text-sm">No custom domains blocked</span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkipDomain}
                onChange={(e) => setNewSkipDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkipDomain()}
                placeholder="e.g. spamdomain.com"
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6C63FF] text-sm"
              />
              <button
                onClick={addSkipDomain}
                className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* ── Section 5: Allowlist ── */}
          <section className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-green-500/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Priority Senders (Allowlist)</h2>
                <p className="text-gray-400 text-sm">
                  These email addresses will <strong>always</strong> get an auto-reply, bypassing all filters
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {settings.custom_allow_emails.map((e) => (
                <span
                  key={e}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-sm"
                >
                  {e}
                  <button onClick={() => removeAllowEmail(e)} className="hover:text-red-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {settings.custom_allow_emails.length === 0 && (
                <span className="text-gray-500 text-sm">No priority senders added</span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="email"
                value={newAllowEmail}
                onChange={(e) => setNewAllowEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAllowEmail()}
                placeholder="e.g. vip-client@company.com"
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6C63FF] text-sm"
              />
              <button
                onClick={addAllowEmail}
                className="px-4 py-2.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* ── Section 6: AI Reply Settings ── */}
          <section className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-500/20 rounded-lg">
                <MessageSquare className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">AI Reply Settings</h2>
                <p className="text-gray-400 text-sm">
                  Customize the tone and behavior of AI responses
                </p>
              </div>
            </div>

            {/* Tone */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reply Tone
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() =>
                      setSettings((s) => ({ ...s, reply_tone: t.value }))
                    }
                    className={`p-3 rounded-xl border text-center transition-all ${
                      settings.reply_tone === t.value
                        ? "border-[#6C63FF] bg-[#6C63FF]/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="text-xl mb-1">{t.icon}</div>
                    <div className="text-sm font-medium">{t.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Max replies per day */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Replies Per Day:{" "}
                <span className="text-[#6C63FF] font-bold">
                  {settings.max_replies_per_day}
                </span>
              </label>
              <input
                type="range"
                min="5"
                max="200"
                step="5"
                value={settings.max_replies_per_day}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    max_replies_per_day: parseInt(e.target.value),
                  }))
                }
                className="w-full accent-[#6C63FF]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5</span>
                <span>Conservative</span>
                <span>Aggressive</span>
                <span>200</span>
              </div>
            </div>

            {/* Custom instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Custom AI Instructions
              </label>
              <textarea
                value={settings.custom_instructions || ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    custom_instructions: e.target.value || null,
                  }))
                }
                rows={4}
                placeholder="e.g. Always mention our current 20% discount. Never discuss pricing in detail — redirect to a demo call. Mention that we serve the Indian market specifically."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6C63FF] text-sm resize-none"
              />
              <p className="text-gray-500 text-xs mt-1">
                These instructions will be included in the AI&apos;s system prompt when writing replies.
              </p>
            </div>
          </section>

          {/* ── Bottom Save Button ── */}
          <div className="flex justify-end pb-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-[#6C63FF] hover:bg-[#5B52EE] rounded-xl font-semibold transition-colors disabled:opacity-50 text-lg"
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save All Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
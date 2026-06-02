"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Mail, Shield, Settings2, Zap, Bot, Globe,
  Save, CheckCircle2, AlertTriangle, Plus, X, ToggleLeft,
  ToggleRight, Info, FileText, Upload, Send, Trash2, Copy,
  Edit3, Eye, Users, ChevronDown, ChevronRight, Download,
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

interface EmailTemplate {
  id?: number;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  is_default: boolean;
  category: string;
}

interface Contact {
  email: string;
  name: string;
  company?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: string | undefined;
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

const DEFAULT_TEMPLATE: EmailTemplate = {
  name: "",
  subject: "",
  body: "",
  variables: [],
  is_default: false,
  category: "general",
};

const REPLY_MODES = [
  { value: "replies_and_inquiries", label: "Smart Mode", desc: "Reply to direct replies + new emails that look like inquiries (Recommended)", icon: "🧠" },
  { value: "replies_only", label: "Replies Only", desc: "Only reply to direct replies to your sent emails", icon: "↩️" },
  { value: "all", label: "Reply to All", desc: "Reply to every incoming email (not recommended — may reply to spam)", icon: "📬" },
  { value: "allowlist_only", label: "Allowlist Only", desc: "Only reply to specific email addresses you've whitelisted", icon: "✅" },
];

const CATEGORIES = [
  { key: "skip_marketing" as const, label: "Marketing & Promotions", desc: "Amazon, HubSpot, Mailchimp, promotional offers", examples: "amazon.com, hubspot.com, mailchimp.com", icon: "📢" },
  { key: "skip_newsletters" as const, label: "Newsletters & Digests", desc: "Substack, Medium, weekly digests", examples: "substack.com, medium.com, brainhq.com", icon: "📰" },
  { key: "skip_social" as const, label: "Social Notifications", desc: "Facebook, LinkedIn, Twitter, Instagram", examples: "facebookmail.com, linkedin.com", icon: "👥" },
  { key: "skip_transactional" as const, label: "Transactional & Receipts", desc: "Stripe, Google, shipping confirmations", examples: "stripe.com, google.com, statuspage.io", icon: "🧾" },
  { key: "skip_job_alerts" as const, label: "Job Alerts & Career", desc: "Indeed, Naukri, AngelList, Glassdoor", examples: "indeed.com, naukri.com, angel.co", icon: "💼" },
];

const TONES = [
  { value: "professional", label: "Professional", icon: "👔" },
  { value: "friendly", label: "Friendly", icon: "😊" },
  { value: "casual", label: "Casual", icon: "🤙" },
  { value: "formal", label: "Formal", icon: "📜" },
];

const TEMPLATE_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "follow-up", label: "Follow-Up" },
  { value: "confirmation", label: "Confirmation" },
  { value: "pricing", label: "Pricing" },
  { value: "re-engagement", label: "Re-Engagement" },
  { value: "cold-outreach", label: "Cold Outreach" },
  { value: "custom", label: "Custom" },
];

const VARIABLE_HINTS: Record<string, string> = {
  name: "Recipient's full name",
  first_name: "Recipient's first name",
  last_name: "Recipient's last name",
  company: "Recipient's company",
  email: "Recipient's email",
  phone: "Recipient's phone",
  sender_name: "Your name",
  sender_email: "Your email",
  book_demo_url: "Link to book a demo",
  date: "Meeting/demo date",
  time: "Meeting/demo time",
};

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

  // Templates state
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateSaving, setTemplateSaving] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [previewContact, setPreviewContact] = useState<Contact>({ email: "john@example.com", name: "John Smith", company: "Acme Corp" });

  // Campaign state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number; errors?: string[] } | null>(null);
  const [activeSection, setActiveSection] = useState<"automation" | "templates" | "campaigns">("automation");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchSettings();
      fetchTemplates();
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

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/email-templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
        if (data.templates?.length > 0 && !selectedTemplateId) {
          setSelectedTemplateId(data.templates[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
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

  // Template handlers
  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    setTemplateSaving(true);
    try {
      const method = editingTemplate.id ? "PUT" : "POST";
      const res = await fetch("/api/email-templates", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTemplate),
      });
      if (res.ok) {
        setShowTemplateEditor(false);
        setEditingTemplate(null);
        fetchTemplates();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save template");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setTemplateSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm("Delete this template?")) return;
    try {
      await fetch(`/api/email-templates?id=${id}`, { method: "DELETE" });
      fetchTemplates();
      if (selectedTemplateId === id) setSelectedTemplateId(null);
    } catch {
      setError("Failed to delete template");
    }
  };

  const duplicateTemplate = (t: EmailTemplate) => {
    setEditingTemplate({ ...t, id: undefined, name: `${t.name} (Copy)`, is_default: false });
    setShowTemplateEditor(true);
  };

  const previewTemplate = (template: EmailTemplate) => {
    const replaceVars = (text: string) =>
      text.replace(/\{\{(\w+)\}\}/g, (_, v) => {
        if (previewContact[v]) return previewContact[v];
        if (v === "sender_name") return "Pawan";
        if (v === "sender_email") return "pawanputra779@gmail.com";
        if (v === "book_demo_url") return "https://example.com/book-demo";
        return `{{${v}}}`;
      });
    return { subject: replaceVars(template.subject), body: replaceVars(template.body) };
  };

  // Upload handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setSendResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/email-campaigns/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts);
        setUploadedFileName(file.name);
        if (data.skippedRows > 0) {
          setError(`Skipped ${data.skippedRows} rows without valid email addresses`);
        }
      } else {
        const data = await res.json();
        setError(data.error || "Failed to upload file");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeContact = (index: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  // Send campaign
  const handleSendCampaign = async () => {
    if (!selectedTemplateId || contacts.length === 0) return;
    setSending(true);
    setSendResult(null);
    setError("");
    try {
      const res = await fetch("/api/email-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          name: campaignName || `Campaign ${new Date().toLocaleDateString()}`,
          contacts,
          variableOverrides: {},
          sendNow: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSendResult({ sent: data.sent, failed: data.failed, errors: data.errors });
      } else {
        setError(data.error || "Failed to send campaign");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSending(false);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1020] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C63FF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1020] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push("/dashboard")} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Mail className="w-7 h-7 text-[#6C63FF]" />
              Email Settings & Templates
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Control auto-replies, create email templates, and send bulk campaigns
            </p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {([
            { key: "automation", label: "Auto-Reply Settings", icon: Zap },
            { key: "templates", label: "Email Templates", icon: FileText },
            { key: "campaigns", label: "Bulk Send", icon: Send },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeSection === tab.key
                  ? "bg-[#6C63FF] text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════ */}
        {/* SECTION 1: AUTO-REPLY SETTINGS            */}
        {/* ══════════════════════════════════════════ */}
        {activeSection === "automation" && (
          <div className="space-y-6">
            {/* Save bar */}
            <div className="sticky top-0 z-10 bg-[#0B1020]/90 backdrop-blur-md py-3 mb-4 flex items-center justify-between border-b border-white/5">
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
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-[#6C63FF] hover:bg-[#5B52EE] rounded-lg font-medium transition-colors disabled:opacity-50">
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>

            {/* Auto-Reply Toggle */}
            <section className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-[#6C63FF]/20 rounded-lg">
                  <Zap className="w-5 h-5 text-[#6C63FF]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Auto-Reply Engine</h2>
                  <p className="text-gray-400 text-sm">Enable or disable AI auto-replies to incoming emails</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                <div>
                  <p className="font-medium">Auto-Reply</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {settings.auto_reply_enabled ? "✅ Active — AI will reply to matching emails" : "⏸ Paused — No auto-replies will be sent"}
                  </p>
                </div>
                <button onClick={() => setSettings((s) => ({ ...s, auto_reply_enabled: !s.auto_reply_enabled }))} className="focus:outline-none">
                  {settings.auto_reply_enabled ? (
                    <ToggleRight className="w-12 h-12 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-gray-500" />
                  )}
                </button>
              </div>
              {!settings.auto_reply_enabled && (
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-300 text-xs">Auto-reply is disabled. No emails will receive AI responses until you enable it.</p>
                </div>
              )}
            </section>

            {/* Reply Mode */}
            <section className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-500/20 rounded-lg">
                  <Bot className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Reply Mode</h2>
                  <p className="text-gray-400 text-sm">Choose which emails the AI should reply to</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REPLY_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setSettings((s) => ({ ...s, reply_mode: mode.value }))}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      settings.reply_mode === mode.value
                        ? "border-[#6C63FF] bg-[#6C63FF]/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{mode.icon}</span>
                      <span className="font-medium text-sm">{mode.label}</span>
                    </div>
                    <p className="text-gray-400 text-xs">{mode.desc}</p>
                    {settings.reply_mode === mode.value && (
                      <div className="mt-2 text-[#6C63FF] text-xs font-medium">✓ Selected</div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Category Filters */}
            <section className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-green-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Category Filters</h2>
                  <p className="text-gray-400 text-sm">Skip auto-generated and bulk emails by category</p>
                </div>
              </div>
              <div className="space-y-3">
                {CATEGORIES.map((cat) => (
                  <div key={cat.key} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    settings[cat.key] ? "border-green-500/30 bg-green-500/5" : "border-white/10 bg-white/5"
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-base">{cat.icon}</span>
                        <span className="font-medium">{cat.label}</span>
                      </div>
                      <p className="text-gray-400 text-xs">{cat.desc}</p>
                      <p className="text-gray-500 text-xs mt-0.5">e.g. {cat.examples}</p>
                    </div>
                    <button onClick={() => setSettings((s) => ({ ...s, [cat.key]: !s[cat.key] }))} className="ml-4 focus:outline-none flex-shrink-0">
                      {settings[cat.key] ? <ToggleRight className="w-10 h-10 text-green-400" /> : <ToggleLeft className="w-10 h-10 text-gray-500" />}
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

            {/* Custom Domains + Allowlist */}
            <section className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-orange-500/20 rounded-lg">
                  <Globe className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Custom Domains to Skip</h2>
                  <p className="text-gray-400 text-sm">Add specific domains you never want the AI to reply to</p>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                <input value={newSkipDomain} onChange={(e) => setNewSkipDomain(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkipDomain()} placeholder="e.g. spam-domain.com" className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#6C63FF]" />
                <button onClick={addSkipDomain} className="px-3 py-2 bg-[#6C63FF] hover:bg-[#5B52EE] rounded-lg text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {settings.custom_skip_domains.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {settings.custom_skip_domains.map((d) => (
                    <span key={d} className="flex items-center gap-1 px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs">
                      {d}
                      <button onClick={() => removeSkipDomain(d)}><X className="w-3 h-3 text-orange-400 hover:text-orange-300" /></button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-xs">No custom skip domains added</p>
              )}

              <div className="mt-6 flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-[#6C63FF]/20 rounded-lg">
                  <Users className="w-5 h-5 text-[#6C63FF]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Priority Senders (Allowlist)</h2>
                  <p className="text-gray-400 text-sm">Always reply to these email addresses, regardless of filters</p>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                <input value={newAllowEmail} onChange={(e) => setNewAllowEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addAllowEmail()} placeholder="e.g. vip@client.com" className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#6C63FF]" />
                <button onClick={addAllowEmail} className="px-3 py-2 bg-[#6C63FF] hover:bg-[#5B52EE] rounded-lg text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {settings.custom_allow_emails.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {settings.custom_allow_emails.map((e) => (
                    <span key={e} className="flex items-center gap-1 px-2.5 py-1 bg-[#6C63FF]/10 border border-[#6C63FF]/20 rounded-full text-xs">
                      {e}
                      <button onClick={() => removeAllowEmail(e)}><X className="w-3 h-3 text-[#6C63FF] hover:text-[#5B52EE]" /></button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-xs">No priority senders added — all non-filtered emails will be processed</p>
              )}
            </section>

            {/* AI Reply Settings */}
            <section className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-purple-500/20 rounded-lg">
                  <Settings2 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">AI Reply Settings</h2>
                  <p className="text-gray-400 text-sm">Configure the AI&apos;s behavior when writing replies</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reply Tone</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TONES.map((tone) => (
                      <button
                        key={tone.value}
                        onClick={() => setSettings((s) => ({ ...s, reply_tone: tone.value }))}
                        className={`p-2.5 rounded-lg border text-sm font-medium transition-all ${
                          settings.reply_tone === tone.value ? "border-[#6C63FF] bg-[#6C63FF]/10 text-white" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        {tone.icon} {tone.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Replies Per Day: <span className="text-[#6C63FF]">{settings.max_replies_per_day}</span>
                  </label>
                  <input type="range" min="5" max="200" step="5" value={settings.max_replies_per_day} onChange={(e) => setSettings((s) => ({ ...s, max_replies_per_day: parseInt(e.target.value) }))} className="w-full accent-[#6C63FF]" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1"><span>5</span><span>Conservative</span><span>Aggressive</span><span>200</span></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Custom AI Instructions</label>
                  <textarea value={settings.custom_instructions || ""} onChange={(e) => setSettings((s) => ({ ...s, custom_instructions: e.target.value || null }))} rows={4} placeholder="e.g. Always mention our current 20% discount. Never discuss pricing in detail — redirect to a demo call." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6C63FF] text-sm resize-none" />
                  <p className="text-gray-500 text-xs mt-1">These instructions will be included in the AI&apos;s system prompt when writing replies.</p>
                </div>
              </div>
            </section>

            {/* Bottom Save */}
            <div className="flex justify-end pb-8">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-[#6C63FF] hover:bg-[#5B52EE] rounded-xl font-semibold transition-colors disabled:opacity-50 text-lg">
                <Save className="w-5 h-5" />
                {saving ? "Saving..." : "Save All Settings"}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* SECTION 2: EMAIL TEMPLATES                 */}
        {/* ══════════════════════════════════════════ */}
        {activeSection === "templates" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Create reusable email templates with {"{{variable}}"} placeholders for bulk sending</p>
              <button
                onClick={() => { setEditingTemplate({ ...DEFAULT_TEMPLATE }); setShowTemplateEditor(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#6C63FF] hover:bg-[#5B52EE] rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" /> New Template
              </button>
            </div>

            {/* Variable reference */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <h3 className="text-sm font-semibold text-blue-300 mb-2">📋 Available Variables</h3>
              <p className="text-gray-400 text-xs mb-2">Use <code className="bg-white/10 px-1 rounded text-blue-300">{"{{variable_name}}"}</code> in subject and body. They get replaced per contact when sending.</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(VARIABLE_HINTS).map(([key, hint]) => (
                  <span key={key} className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-300" title={hint}>
                    {`{{${key}}}`}
                  </span>
                ))}
              </div>
            </div>

            {/* Template list */}
            {templates.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No templates yet</p>
                <p className="text-gray-500 text-xs mt-1">Create your first email template to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => {
                  const preview = previewTemplate(template);
                  return (
                    <div key={template.id} className="bg-white/5 rounded-xl border border-white/10 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{template.name}</h3>
                            {template.is_default && <span className="px-2 py-0.5 bg-[#6C63FF]/20 border border-[#6C63FF]/30 rounded text-xs text-[#6C63FF]">Default</span>}
                            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-gray-400">{template.category}</span>
                          </div>
                          <p className="text-gray-400 text-sm mt-1">Subject: {preview.subject}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => duplicateTemplate(template)} title="Duplicate" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={() => { setEditingTemplate({ ...template }); setShowTemplateEditor(true); }} title="Edit" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Edit3 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={() => handleDeleteTemplate(template.id!)} title="Delete" className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 p-3 bg-black/20 rounded-lg">
                        <pre className="text-gray-300 text-xs whitespace-pre-wrap font-sans">{preview.body.substring(0, 300)}{preview.body.length > 300 ? "..." : ""}</pre>
                      </div>
                      {template.variables.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {template.variables.map((v) => (
                            <span key={v} className="px-1.5 py-0.5 bg-[#6C63FF]/10 rounded text-xs text-[#6C63FF]">{`{{${v}}}`}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Template Editor Modal */}
            {showTemplateEditor && editingTemplate && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowTemplateEditor(false)}>
                <div className="w-full max-w-2xl bg-[#0f1729] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between p-5 border-b border-white/10">
                    <h2 className="text-lg font-bold">{editingTemplate.id ? "Edit Template" : "New Template"}</h2>
                    <button onClick={() => setShowTemplateEditor(false)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Template Name</label>
                      <input value={editingTemplate.name} onChange={(e) => setEditingTemplate((t) => t ? { ...t, name: e.target.value } : t)} placeholder="e.g. Welcome Follow-Up" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#6C63FF]" />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                        <select value={editingTemplate.category} onChange={(e) => setEditingTemplate((t) => t ? { ...t, category: e.target.value } : t)} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#6C63FF]">
                          {TEMPLATE_CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button onClick={() => setEditingTemplate((t) => t ? { ...t, is_default: !t.is_default } : t)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          editingTemplate.is_default ? "border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF]" : "border-white/10 text-gray-400 hover:bg-white/10"
                        }`}>
                          {editingTemplate.is_default ? "★ Default" : "☆ Set as Default"}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Subject Line</label>
                      <input value={editingTemplate.subject} onChange={(e) => setEditingTemplate((t) => t ? { ...t, subject: e.target.value } : t)} placeholder="e.g. Great to meet you, {{name}}!" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#6C63FF]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Email Body</label>
                      <textarea value={editingTemplate.body} onChange={(e) => setEditingTemplate((t) => t ? { ...t, body: e.target.value } : t)} rows={10} placeholder={`Hi {{name}},\n\nIt was great connecting with you!\n\nOur platform helps businesses like {{company}} automate lead follow-ups.\n\nWould you be interested in a demo? Book here: {{book_demo_url}}\n\nBest regards,\n{{sender_name}}`} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#6C63FF] resize-none font-mono" />
                      <p className="text-gray-500 text-xs mt-1">Use <code className="text-[#6C63FF]">{"{{variable}}"}</code> placeholders — they&apos;ll be replaced with each contact&apos;s data when sending.</p>
                    </div>
                    {/* Live Preview */}
                    {editingTemplate.subject || editingTemplate.body ? (
                      <div className="p-4 bg-black/30 border border-white/10 rounded-lg">
                        <h4 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Live Preview</h4>
                        <p className="text-sm font-medium text-white mb-1">{previewTemplate(editingTemplate).subject}</p>
                        <pre className="text-gray-300 text-xs whitespace-pre-wrap font-sans">{previewTemplate(editingTemplate).body.substring(0, 500)}</pre>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex justify-end gap-3 p-5 border-t border-white/10">
                    <button onClick={() => setShowTemplateEditor(false)} className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:bg-white/10 text-sm">Cancel</button>
                    <button onClick={handleSaveTemplate} disabled={templateSaving || !editingTemplate.name || !editingTemplate.subject || !editingTemplate.body} className="px-6 py-2 bg-[#6C63FF] hover:bg-[#5B52EE] rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
                      {templateSaving ? "Saving..." : editingTemplate.id ? "Update Template" : "Create Template"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* SECTION 3: BULK SEND / CAMPAIGNS           */}
        {/* ══════════════════════════════════════════ */}
        {activeSection === "campaigns" && (
          <div className="space-y-6">
            <p className="text-gray-400 text-sm">Upload a contact list (Excel/CSV) and send personalized emails using your templates</p>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {sendResult && (
              <div className={`p-4 rounded-xl border ${sendResult.failed > 0 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-green-500/10 border-green-500/20"}`}>
                <h3 className="font-semibold mb-1">{sendResult.failed > 0 ? "⚠️ Campaign Sent (with errors)" : "✅ Campaign Sent Successfully!"}</h3>
                <p className="text-sm text-gray-300">{sendResult.sent} emails sent, {sendResult.failed} failed</p>
                {sendResult.errors && sendResult.errors.length > 0 && (
                  <div className="mt-2 text-xs text-gray-400">
                    {sendResult.errors.slice(0, 5).map((err, i) => (<p key={i}>{err}</p>))}
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Upload */}
            <section className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-green-500/20 rounded-lg"><Upload className="w-5 h-5 text-green-400" /></div>
                <div>
                  <h2 className="text-lg font-semibold">Step 1: Upload Contact List</h2>
                  <p className="text-gray-400 text-sm">Upload an Excel (.xlsx/.xls) or CSV file with your contacts</p>
                </div>
              </div>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-[#6C63FF]/30 transition-colors">
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                {uploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6C63FF] mx-auto" />
                ) : contacts.length > 0 ? (
                  <>
                    <p className="text-green-400 font-medium">✅ {contacts.length} contacts loaded from {uploadedFileName}</p>
                    <button onClick={() => fileInputRef.current?.click()} className="mt-2 text-[#6C63FF] text-sm hover:underline">Upload a different file</button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-400 mb-2">Drag & drop or click to upload</p>
                    <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-[#6C63FF] hover:bg-[#5B52EE] rounded-lg text-sm font-medium transition-colors">
                      Choose File
                    </button>
                    <p className="text-gray-500 text-xs mt-2">Supports .csv, .xlsx, .xls • Must have an email column</p>
                  </>
                )}
              </div>
              {contacts.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Contacts ({contacts.length})</h3>
                    <button onClick={() => setContacts([])} className="text-xs text-red-400 hover:text-red-300">Clear all</button>
                  </div>
                  <div className="max-h-60 overflow-y-auto rounded-lg border border-white/10">
                    <table className="w-full text-xs">
                      <thead className="bg-white/5 sticky top-0">
                        <tr>
                          <th className="text-left p-2 text-gray-400">Name</th>
                          <th className="text-left p-2 text-gray-400">Email</th>
                          <th className="text-left p-2 text-gray-400">Company</th>
                          <th className="p-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.slice(0, 50).map((c, i) => (
                          <tr key={i} className="border-t border-white/5 hover:bg-white/5">
                            <td className="p-2">{c.name || "—"}</td>
                            <td className="p-2 text-[#6C63FF]">{c.email}</td>
                            <td className="p-2 text-gray-400">{c.company || "—"}</td>
                            <td className="p-1">
                              <button onClick={() => removeContact(i)} className="p-1 hover:bg-red-500/10 rounded"><X className="w-3 h-3 text-gray-500" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {contacts.length > 50 && <p className="text-center text-gray-500 text-xs py-2">...and {contacts.length - 50} more</p>}
                  </div>
                </div>
              )}
            </section>

            {/* Step 2: Select Template */}
            <section className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-500/20 rounded-lg"><FileText className="w-5 h-5 text-blue-400" /></div>
                <div>
                  <h2 className="text-lg font-semibold">Step 2: Select Email Template</h2>
                  <p className="text-gray-400 text-sm">Choose a template — variables will be filled with each contact&apos;s data</p>
                </div>
              </div>
              {templates.length === 0 ? (
                <p className="text-gray-400 text-sm">No templates found. <button onClick={() => setActiveSection("templates")} className="text-[#6C63FF] hover:underline">Create one first</button></p>
              ) : (
                <div className="space-y-2">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplateId(t.id!)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        selectedTemplateId === t.id ? "border-[#6C63FF] bg-[#6C63FF]/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-sm">{t.name}</span>
                          {t.is_default && <span className="ml-2 px-1.5 py-0.5 bg-[#6C63FF]/20 rounded text-xs text-[#6C63FF]">Default</span>}
                        </div>
                        <span className="text-gray-400 text-xs">{t.category}</span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">Subject: {t.subject}</p>
                      {selectedTemplateId === t.id && t.variables.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="text-gray-500 text-xs">Variables:</span>
                          {t.variables.map((v) => (
                            <span key={v} className="px-1.5 py-0.5 bg-[#6C63FF]/10 rounded text-xs text-[#6C63FF]">{`{{${v}}}`}</span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {/* Preview */}
              {selectedTemplate && (
                <div className="mt-4 p-3 bg-black/20 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-400 mb-1">Preview (using first contact)</h4>
                  <p className="text-sm font-medium">{previewTemplate(selectedTemplate).subject}</p>
                  <pre className="text-gray-300 text-xs whitespace-pre-wrap font-sans mt-1">{previewTemplate(selectedTemplate).body.substring(0, 400)}{selectedTemplate.body.length > 400 ? "..." : ""}</pre>
                </div>
              )}
            </section>

            {/* Step 3: Send */}
            <section className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-[#6C63FF]/20 rounded-lg"><Send className="w-5 h-5 text-[#6C63FF]" /></div>
                <div>
                  <h2 className="text-lg font-semibold">Step 3: Send Campaign</h2>
                  <p className="text-gray-400 text-sm">Review and send personalized emails to all contacts</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Campaign Name</label>
                  <input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="e.g. January Outreach" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#6C63FF]" />
                </div>
                <div className="p-4 bg-black/20 rounded-xl space-y-2">
                  <h4 className="text-sm font-semibold">Campaign Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-400">Recipients:</div>
                    <div className="font-medium">{contacts.length} contacts</div>
                    <div className="text-gray-400">Template:</div>
                    <div className="font-medium">{selectedTemplate?.name || "Not selected"}</div>
                    <div className="text-gray-400">Personalization:</div>
                    <div className="font-medium">{selectedTemplate?.variables.length || 0} variables per email</div>
                  </div>
                </div>
                <button
                  onClick={handleSendCampaign}
                  disabled={sending || contacts.length === 0 || !selectedTemplateId}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#6C63FF] hover:bg-[#5B52EE] rounded-xl font-semibold text-lg transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  {sending ? `Sending... (this may take a while for ${contacts.length} contacts)` : `Send ${contacts.length} Personalized Emails`}
                </button>
                {contacts.length > 10 && (
                  <p className="text-gray-500 text-xs text-center">💡 Sending is rate-limited to ~1 email/second to avoid Gmail limits. A {contacts.length}-contact campaign takes ~{Math.ceil(contacts.length / 60)} minutes.</p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
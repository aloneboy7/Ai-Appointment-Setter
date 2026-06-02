"use client";

import { useState } from "react";
import { User, Mail, Phone, Building2, FileText } from "lucide-react";
import Modal from "./Modal";
import { useTheme } from "@/components/ui/ThemeToggle";

interface AddLeadModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const SOURCES = ["manual", "website", "referral", "linkedin", "google_ads", "facebook", "email_campaign", "other"];

export default function AddLeadModal({ open, onClose, onCreated }: AddLeadModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", source: "manual", notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create lead");
        return;
      }
      setForm({ name: "", email: "", phone: "", company: "", source: "manual", notes: "" });
      onCreated();
      onClose();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-gray-400 ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-gray-50 border border-gray-200 text-gray-900"}`;

  return (
    <Modal open={open} onClose={onClose} title="Add New Lead">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Full Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Smith" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Email *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@company.com" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 000-0000" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Company</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Acme Inc." className={inputCls} />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Source</label>
<select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
	            className={`w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-gray-50 border border-gray-200 text-gray-900"}`}>
	            {SOURCES.map((s) => <option key={s} value={s} className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white">{s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Notes</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              placeholder="Any additional details..." className={`${inputCls} resize-none pl-10`} />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-primary hover:bg-primary-600 text-white font-semibold rounded-xl py-3 text-sm transition-colors disabled:opacity-50">
          {loading ? "Adding..." : "Add Lead"}
        </button>
      </form>
    </Modal>
  );
}
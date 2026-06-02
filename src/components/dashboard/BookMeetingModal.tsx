"use client";

import { useState, useEffect } from "react";
import { Calendar, FileText, LinkIcon } from "lucide-react";
import Modal from "./Modal";
import { useTheme } from "@/components/ui/ThemeToggle";

interface BookMeetingModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const MEETING_TYPES = [
  { value: "video", label: "Video Call (Zoom/Meet)" },
  { value: "phone", label: "Phone Call" },
  { value: "in_person", label: "In-Person" },
];

export default function BookMeetingModal({ open, onClose, onCreated }: BookMeetingModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [leads, setLeads] = useState<{ id: number; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    leadId: "", title: "", description: "", meetingType: "video",
    meetingLink: "", scheduledAt: "", durationMinutes: 30,
  });

  useEffect(() => {
    if (open) {
      fetch("/api/leads?limit=100").then(r => r.json()).then(d => setLeads(d.leads || [])).catch(() => {});
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !form.scheduledAt) {
      setError("Title and scheduled time are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          leadId: form.leadId ? parseInt(form.leadId) : undefined,
          durationMinutes: parseInt(form.durationMinutes.toString()) || 30,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create meeting");
        return;
      }
      setForm({ leadId: "", title: "", description: "", meetingType: "video", meetingLink: "", scheduledAt: "", durationMinutes: 30 });
      onCreated();
      onClose();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-gray-400 ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-gray-50 border border-gray-200 text-gray-900"}`;
  const inputWithIcon = `w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-gray-400 ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-gray-50 border border-gray-200 text-gray-900"}`;

  return (
    <Modal open={open} onClose={onClose} title="Book a Meeting">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Meeting Title *</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Product Demo — Acme Corp" className={inputWithIcon} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">Date & Time *</label>
            <input type="datetime-local" required value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Duration (min)</label>
<select value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) })}
	              className={inputCls}>
	              {[15, 30, 45, 60, 90].map((d) => <option key={d} value={d} className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white">{d} min</option>)}
	            </select>
	          </div>
	        </div>
	        <div className="grid grid-cols-2 gap-3">
	          <div>
	            <label className="block text-sm font-medium mb-1.5">Link with Lead</label>
	            <select value={form.leadId} onChange={(e) => setForm({ ...form, leadId: e.target.value })}
	              className={inputCls}>
	              <option value="" className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white">— No lead —</option>
	              {leads.map((l) => <option key={l.id} value={l.id} className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white">{l.name} ({l.email})</option>)}
	            </select>
	          </div>
	          <div>
	            <label className="block text-sm font-medium mb-1.5">Meeting Type</label>
	            <select value={form.meetingType} onChange={(e) => setForm({ ...form, meetingType: e.target.value })}
	              className={inputCls}>
	              {MEETING_TYPES.map((t) => <option key={t.value} value={t.value} className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white">{t.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Meeting Link</label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="url" value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
              placeholder="https://zoom.us/j/..." className={inputWithIcon} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              placeholder="Meeting agenda or notes..." className={`${inputWithIcon} resize-none pl-10`} />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-primary hover:bg-primary-600 text-white font-semibold rounded-xl py-3 text-sm transition-colors disabled:opacity-50">
          {loading ? "Booking..." : "Book Meeting"}
        </button>
      </form>
    </Modal>
  );
}
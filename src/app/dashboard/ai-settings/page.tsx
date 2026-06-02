"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bot, Save, MessageSquare, Clock, Zap } from "lucide-react";
import { useTheme } from "@/components/ui/ThemeToggle";

export default function AISettingsPage() {
  const router = useRouter();
  const { status } = useSession();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    botName: "AI Appointment Setter",
    greeting: "Hi there! 👋 I'm your AI assistant. How can I help you today?",
    followUpDelay: "2",
    maxFollowUps: "3",
    tone: "professional",
    autoBook: true,
    sendSummary: true,
    workingHoursStart: "09:00",
    workingHoursEnd: "17:00",
    timezone: "America/New_York",
  });

  useState(() => { if (status === "unauthenticated") router.push("/login"); });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const cardCls = `rounded-xl p-5 border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-sm"}`;
  const inputCls = `w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors ${isDark ? "bg-white/5 border border-white/10 placeholder:text-gray-500" : "bg-gray-50 border border-gray-200"}`;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Chatbot Personality */}
      <div className={cardCls}>
        <div className="flex items-center gap-2 mb-4">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Chatbot Personality</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Bot Name</label>
            <input type="text" value={settings.botName} onChange={(e) => setSettings({ ...settings, botName: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Greeting Message</label>
            <textarea value={settings.greeting} onChange={(e) => setSettings({ ...settings, greeting: e.target.value })} rows={3} className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Tone</label>
            <select value={settings.tone} onChange={(e) => setSettings({ ...settings, tone: e.target.value })} className={inputCls}>
              <option className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white" value="professional">Professional</option>
              <option className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white" value="friendly">Friendly</option>
              <option className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white" value="casual">Casual</option>
              <option className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white" value="formal">Formal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Follow-up Settings */}
      <div className={cardCls}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Follow-up Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Follow-up Delay (hours)</label>
              <input type="number" value={settings.followUpDelay} onChange={(e) => setSettings({ ...settings, followUpDelay: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Max Follow-ups</label>
              <input type="number" value={settings.maxFollowUps} onChange={(e) => setSettings({ ...settings, maxFollowUps: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-book appointments</p>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Let AI book meetings directly on your calendar</p>
            </div>
            <button onClick={() => setSettings({ ...settings, autoBook: !settings.autoBook })}
              className={`w-11 h-6 rounded-full transition-colors ${settings.autoBook ? "bg-primary" : isDark ? "bg-white/20" : "bg-gray-300"}`}>
              <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${settings.autoBook ? "translate-x-5.5" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Send conversation summary</p>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Email you a summary after each conversation</p>
            </div>
            <button onClick={() => setSettings({ ...settings, sendSummary: !settings.sendSummary })}
              className={`w-11 h-6 rounded-full transition-colors ${settings.sendSummary ? "bg-primary" : isDark ? "bg-white/20" : "bg-gray-300"}`}>
              <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${settings.sendSummary ? "translate-x-5.5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className={cardCls}>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Working Hours</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">Start</label>
            <input type="time" value={settings.workingHoursStart} onChange={(e) => setSettings({ ...settings, workingHoursStart: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">End</label>
            <input type="time" value={settings.workingHoursEnd} onChange={(e) => setSettings({ ...settings, workingHoursEnd: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Timezone</label>
            <select value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className={inputCls}>
              <option className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white" value="America/New_York">EST</option>
              <option className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white" value="America/Chicago">CST</option>
              <option className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white" value="America/Denver">MST</option>
              <option className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white" value="America/Los_Angeles">PST</option>
              <option className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white" value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full bg-primary hover:bg-primary-600 text-white font-semibold rounded-xl py-3 text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Settings"}
      </button>
    </div>
  );
}
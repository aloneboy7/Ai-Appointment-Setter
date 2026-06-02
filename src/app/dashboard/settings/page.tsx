"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Settings, Save, User, Mail, Shield } from "lucide-react";
import { useTheme } from "@/components/ui/ThemeToggle";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  useState(() => { if (status === "unauthenticated") router.push("/login"); });

  const handleSaveProfile = async () => {
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
      {/* Profile */}
      <div className={cardCls}>
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Profile</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${inputCls} pl-10`} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${inputCls} pl-10`} />
            </div>
          </div>
          <button onClick={handleSaveProfile} disabled={saving}
            className="bg-primary hover:bg-primary-600 text-white font-semibold rounded-xl py-2.5 px-6 text-sm transition-colors disabled:opacity-50 flex items-center gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Password */}
      <div className={cardCls}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Change Password</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Current Password</label>
            <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className={inputCls} placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">New Password</label>
            <input type="password" value={passwords.newPass} onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} className={inputCls} placeholder="Min 8 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
            <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className={inputCls} placeholder="Repeat new password" />
          </div>
          <button onClick={handleSaveProfile} disabled={saving}
            className="bg-primary hover:bg-primary-600 text-white font-semibold rounded-xl py-2.5 px-6 text-sm transition-colors disabled:opacity-50">
            Update Password
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className={`${cardCls} border-red-500/20`}>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-red-400" />
          <h3 className="font-semibold text-red-400">Danger Zone</h3>
        </div>
        <p className={`text-sm mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-xl py-2.5 px-6 text-sm transition-colors border border-red-500/20">
          Delete Account
        </button>
      </div>
    </div>
  );
}
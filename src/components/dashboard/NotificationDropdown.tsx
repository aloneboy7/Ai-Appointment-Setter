"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Trash2, Inbox, Sparkles } from "lucide-react";
import { useTheme } from "@/components/ui/ThemeToggle";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
  lead: "👤",
  meeting: "📅",
  ai: "🤖",
  success: "🎉",
  warning: "⚠️",
  integration: "🔗",
  info: "ℹ️",
};

export default function NotificationDropdown() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleMarkRead = async (id: number) => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    fetchNotifications();
  };

  const handleSeedDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/seed", { method: "POST" });
      if (res.ok) {
        await fetchNotifications();
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) await handleMarkRead(n.id);
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors relative ${
          isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"
        }`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className={`absolute right-0 top-12 w-[380px] max-h-[500px] rounded-2xl border shadow-2xl overflow-hidden z-50 ${
          isDark ? "bg-[#111827] border-white/10" : "bg-white border-gray-200"
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
            <h3 className="text-sm font-bold">Notifications</h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
              {notifications.length === 0 && (
                <button
                  onClick={handleSeedDemo}
                  disabled={loading}
                  className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                >
                  <Sparkles className="h-3 w-3" />
                  {loading ? "Loading..." : "Load demo"}
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[420px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Inbox className={`h-10 w-10 mb-3 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
                <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  No notifications yet
                </p>
                <p className={`text-xs mt-1 mb-4 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                  Notifications appear when leads interact with your AI or meetings are booked.
                </p>
                <button
                  onClick={handleSeedDemo}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {loading ? "Loading..." : "Load demo notifications"}
                </button>
              </div>
            ) : (
              <div>
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full text-left px-4 py-3 flex gap-3 transition-colors border-b last:border-0 ${
                      isDark ? "border-white/5" : "border-gray-100"
                    } ${
                      !n.read
                        ? isDark ? "bg-primary/5 hover:bg-primary/10" : "bg-primary/5 hover:bg-primary/10"
                        : isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Emoji icon */}
                    <span className="text-lg shrink-0 mt-0.5">
                      {TYPE_ICONS[n.type] || "🔔"}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium leading-snug ${!n.read ? "" : isDark ? "text-gray-300" : "text-gray-600"}`}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 leading-relaxed line-clamp-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        {n.message}
                      </p>
                      <p className={`text-[10px] mt-1 ${isDark ? "text-gray-600" : "text-gray-300"}`}>
                        {formatTimeAgo(n.created_at)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Zap, LayoutDashboard, Users, Calendar, MessageSquare, BarChart3,
  Settings, LogOut, Menu, X, Bot, Plug
} from "lucide-react";
import { useTheme } from "@/components/ui/ThemeToggle";
import NotificationDropdown from "@/components/dashboard/NotificationDropdown";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Leads", href: "/dashboard/leads" },
  { icon: Calendar, label: "Calendar", href: "/dashboard/calendar" },
  { icon: MessageSquare, label: "Conversations", href: "/dashboard/conversations" },
  { icon: Plug, label: "Integrations", href: "/dashboard/integrations" },
  { icon: Bot, label: "AI Settings", href: "/dashboard/ai-settings" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSignOut = () => signOut({ callbackUrl: "/" });

  if (status === "loading") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#0B1020]" : "bg-gray-50"}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary animate-pulse">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-gray-400 text-sm">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className={`min-h-screen flex ${isDark ? "bg-[#0B1020]" : "bg-gray-50"}`}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-50 lg:z-auto inset-y-0 left-0 w-64
        transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        transition-transform duration-200 ease-in-out flex flex-col border-r p-4
        ${isDark ? "border-white/10 bg-[#111827]" : "border-gray-200 bg-white"}
      `}>
        <div className="flex items-center justify-between mb-8 px-2">
          <a href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm">AI Appointment Setter</span>
          </a>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <button
                key={item.label}
                onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : isDark
                      ? "text-gray-400 hover:bg-white/5 hover:text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className={`pt-4 border-t ${isDark ? "border-white/10" : "border-gray-200"}`}>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className={`sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b backdrop-blur-xl ${
          isDark ? "border-white/10 bg-[#0B1020]/80" : "border-gray-200 bg-white/80"
        }`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-white/5">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">
                {NAV_ITEMS.find((i) => i.href === pathname)?.label || "Dashboard"}
              </h1>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Welcome back, {session.user?.name || "User"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
              {session.user?.name?.[0] || "U"}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BarChart3, Users, Calendar, TrendingUp, MessageSquare } from "lucide-react";
import { useTheme } from "@/components/ui/ThemeToggle";

export default function AnalyticsPage() {
  const router = useRouter();
  const { status } = useSession();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/dashboard/stats").then(r => r.json()).then(d => setStats(d)).catch(() => {}).finally(() => setLoading(false));
    }
  }, [status]);
  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

  const cardCls = `rounded-xl p-5 border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-sm"}`;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>;
  }

  const metrics = [
    { label: "Total Leads", value: stats?.leadsCaptured || 0, icon: Users, color: "text-blue-400" },
    { label: "Meetings Booked", value: stats?.meetingsBooked || 0, icon: Calendar, color: "text-green-400" },
    { label: "Conversion Rate", value: `${stats?.conversionRate || 0}%`, icon: TrendingUp, color: "text-primary" },
    { label: "Active Conversations", value: stats?.activeConversations || 0, icon: MessageSquare, color: "text-cyan-400" },
  ];

  const byStatus = stats?.leadsByStatus || {};
  const statusEntries = Object.entries(byStatus);
  const maxStatus = Math.max(...statusEntries.map(([, v]) => v as number), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className={cardCls}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{m.label}</span>
              <m.icon className={`h-4 w-4 ${m.color}`} />
            </div>
            <p className="text-2xl font-bold">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Lead Status Breakdown */}
      <div className={cardCls}>
        <h3 className="font-semibold mb-4">Lead Status Breakdown</h3>
        {statusEntries.length === 0 ? (
          <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>No lead data yet. Add some leads to see analytics.</p>
        ) : (
          <div className="space-y-3">
            {statusEntries.map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="text-sm w-24 capitalize">{status}</span>
                <div className={`flex-1 h-6 rounded-full ${isDark ? "bg-white/5" : "bg-gray-100"} overflow-hidden`}>
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${((count as number) / maxStatus) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">{count as number}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Placeholder for future charts */}
      <div className={`${cardCls} text-center py-12`}>
        <BarChart3 className={`h-12 w-12 mx-auto mb-3 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
        <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          More analytics coming soon — response times, lead sources, AI performance metrics.
        </p>
      </div>
    </div>
  );
}
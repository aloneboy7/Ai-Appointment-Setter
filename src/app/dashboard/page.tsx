"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Users, Calendar, TrendingUp, MessageSquare, ArrowRight, Plus, Clock
} from "lucide-react";
import { useTheme } from "@/components/ui/ThemeToggle";
import Button from "@/components/shared/Button";
import AddLeadModal from "@/components/dashboard/AddLeadModal";
import BookMeetingModal from "@/components/dashboard/BookMeetingModal";

interface DashboardStats {
  leadsCaptured: number;
  meetingsBooked: number;
  conversionRate: number;
  activeConversations: number;
  recentLeads: { id: number; name: string; email: string; status: string; created_at: string }[];
  upcomingAppointments: {
    id: number; title: string; scheduled_at: string; meeting_type: string;
    lead_name?: string; status: string; duration_minutes: number;
  }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showBookMeeting, setShowBookMeeting] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchStats();
  }, [status, fetchStats]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!session || !stats) return null;

  const cardCls = `rounded-xl p-5 border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-sm"}`;

  const statCards = [
    { label: "Leads Captured", value: stats.leadsCaptured.toLocaleString(), icon: Users, color: "text-blue-400" },
    { label: "Meetings Booked", value: stats.meetingsBooked.toLocaleString(), icon: Calendar, color: "text-green-400" },
    { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: TrendingUp, color: "text-primary" },
    { label: "Active Conversations", value: stats.activeConversations.toString(), icon: MessageSquare, color: "text-cyan-400" },
  ];

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const formatMeetingTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const isToday = new Date().toDateString() === d.toDateString();
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    if (isToday) return `Today, ${time}`;
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + `, ${time}`;
  };

  return (
    <>
      <AddLeadModal open={showAddLead} onClose={() => setShowAddLead(false)} onCreated={fetchStats} />
      <BookMeetingModal open={showBookMeeting} onClose={() => setShowBookMeeting(false)} onCreated={fetchStats} />

      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <div key={i} className={cardCls}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</span>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <div className={cardCls}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Leads</h3>
              <button onClick={() => router.push("/dashboard/leads")} className="text-xs text-primary hover:underline">
                View All
              </button>
            </div>
            {stats.recentLeads.length === 0 ? (
              <div className="text-center py-8">
                <Users className={`h-10 w-10 mx-auto mb-3 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
                <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>No leads yet</p>
                <button onClick={() => setShowAddLead(true)}
                  className="mt-3 text-sm text-primary hover:underline flex items-center gap-1 mx-auto">
                  <Plus className="h-3.5 w-3.5" /> Add your first lead
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentLeads.map((lead) => (
                  <div key={lead.id} className={`flex items-center justify-between py-2 border-b last:border-0 ${
                    isDark ? "border-white/5" : "border-gray-100"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {lead.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{lead.name}</p>
                        <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{lead.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        lead.status === "qualified" ? "bg-blue-500/10 text-blue-400" :
                        lead.status === "contacted" ? "bg-yellow-500/10 text-yellow-400" :
                        lead.status === "converted" ? "bg-green-500/10 text-green-400" :
                        "bg-gray-500/10 text-gray-400"
                      }`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                      <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        {formatTimeAgo(lead.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Meetings */}
          <div className={cardCls}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Upcoming Meetings</h3>
              <button onClick={() => router.push("/dashboard/calendar")} className="text-xs text-primary hover:underline">
                View Calendar
              </button>
            </div>
            {stats.upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className={`h-10 w-10 mx-auto mb-3 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
                <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>No upcoming meetings</p>
                <button onClick={() => setShowBookMeeting(true)}
                  className="mt-3 text-sm text-primary hover:underline flex items-center gap-1 mx-auto">
                  <Plus className="h-3.5 w-3.5" /> Book your first meeting
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.upcomingAppointments.map((apt) => (
                  <div key={apt.id} className={`flex items-center justify-between py-2 border-b last:border-0 ${
                    isDark ? "border-white/5" : "border-gray-100"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{apt.title}</p>
                        <div className={`flex items-center gap-1 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          <Clock className="h-3 w-3" />
                          {formatMeetingTime(apt.scheduled_at)}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      {apt.meeting_type === "video" ? "Zoom" : apt.meeting_type === "phone" ? "Phone" : "In-person"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={cardCls}>
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <Button variant="primary" size="md" onClick={() => setShowBookMeeting(true)}>
              <Calendar className="mr-2 h-4 w-4" />
              Book a Meeting
            </Button>
            <Button variant="secondary" size="md" onClick={() => setShowAddLead(true)}>
              <Users className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
            <Button variant="secondary" size="md" onClick={() => router.push("/dashboard/analytics")}>
              <TrendingUp className="mr-2 h-4 w-4" />
              View Reports
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Plan Info */}
        <div className={`rounded-xl p-5 border border-primary/20 ${isDark ? "bg-white/5" : "bg-white shadow-sm"}`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Current Plan</p>
              <p className="text-lg font-bold gradient-text">Starter — Free Trial</p>
              <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>14 days remaining • 500 AI conversations included</p>
            </div>
            <Button variant="primary" size="md" onClick={() => router.push("/#pricing")}>
              Upgrade Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Calendar as CalendarIcon, Plus, Clock, Trash2, MapPin } from "lucide-react";
import { useTheme } from "@/components/ui/ThemeToggle";
import Button from "@/components/shared/Button";
import BookMeetingModal from "@/components/dashboard/BookMeetingModal";

interface Appointment {
  id: number; title: string; description: string; meeting_type: string; meeting_link: string;
  scheduled_at: string; duration_minutes: number; status: string;
  lead_id: number; lead_name: string; lead_email: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const { status } = useSession();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch("/api/appointments?limit=100");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (status === "authenticated") fetchAppointments(); }, [status, fetchAppointments]);
  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

  const handleDelete = async (id: number) => {
    if (!confirm("Cancel this meeting?")) return;
    await fetch(`/api/appointments?id=${id}`, { method: "DELETE" });
    fetchAppointments();
  };

  const handleMarkComplete = async (id: number) => {
    await fetch("/api/appointments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "completed" }),
    });
    fetchAppointments();
  };

  const now = new Date();
  const upcoming = appointments.filter((a) => new Date(a.scheduled_at) >= now && a.status === "scheduled")
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  const past = appointments.filter((a) => new Date(a.scheduled_at) < now || a.status !== "scheduled")
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
  const shown = tab === "upcoming" ? upcoming : past;

  const cardCls = `rounded-xl p-5 border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-sm"}`;

  const formatDateTime = (d: string) => {
    const date = new Date(d);
    const isToday = new Date().toDateString() === date.toDateString();
    const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    if (isToday) return `Today, ${time}`;
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + `, ${time}`;
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>;
  }

  return (
    <>
      <BookMeetingModal open={showBookModal} onClose={() => setShowBookModal(false)} onCreated={fetchAppointments} />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setTab("upcoming")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "upcoming" ? "bg-primary text-white" : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
              Upcoming ({upcoming.length})
            </button>
            <button onClick={() => setTab("past")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "past" ? "bg-primary text-white" : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
              Past ({past.length})
            </button>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowBookModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Book Meeting
          </Button>
        </div>

        {shown.length === 0 ? (
          <div className={`${cardCls} text-center py-12`}>
            <CalendarIcon className={`h-12 w-12 mx-auto mb-3 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
            <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              {tab === "upcoming" ? "No upcoming meetings. Book one now!" : "No past meetings yet."}
            </p>
            {tab === "upcoming" && (
              <button onClick={() => setShowBookModal(true)} className="mt-3 text-sm text-primary hover:underline">
                + Book Meeting
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {shown.map((apt) => (
              <div key={apt.id} className={`${cardCls} space-y-3`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm truncate">{apt.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        apt.status === "completed" ? "bg-green-500/10 text-green-400" :
                        apt.status === "cancelled" ? "bg-red-500/10 text-red-400" :
                        "bg-blue-500/10 text-blue-400"
                      }`}>{apt.status}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      <Clock className="h-3 w-3" />
                      {formatDateTime(apt.scheduled_at)} · {apt.duration_minutes}min
                      {apt.meeting_type === "video" ? " · Video" : apt.meeting_type === "phone" ? " · Phone" : " · In-person"}
                    </div>
                    {apt.lead_name && (
                      <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        Lead: {apt.lead_name} ({apt.lead_email})
                      </p>
                    )}
                    {apt.meeting_link && (
                      <a href={apt.meeting_link} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> Join Meeting
                      </a>
                    )}
                    {apt.description && (
                      <p className={`text-xs mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{apt.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {tab === "upcoming" && apt.status === "scheduled" && (
                      <button onClick={() => handleMarkComplete(apt.id)}
                        className="p-1.5 rounded-lg hover:bg-green-500/10 text-gray-500 hover:text-green-400 transition-colors text-xs font-medium">
                        ✓ Done
                      </button>
                    )}
                    <button onClick={() => handleDelete(apt.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
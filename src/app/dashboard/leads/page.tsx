"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Users, Plus, Search, Trash2, Edit3, Mail, Phone, Building2 } from "lucide-react";
import { useTheme } from "@/components/ui/ThemeToggle";
import Button from "@/components/shared/Button";
import AddLeadModal from "@/components/dashboard/AddLeadModal";

interface Lead {
  id: number; name: string; email: string; phone: string; company: string;
  source: string; status: string; notes: string; created_at: string; updated_at: string;
}

const STATUS_OPTIONS = ["new", "contacted", "qualified", "converted", "lost"];
const STATUS_COLORS: Record<string, string> = {
  new: "bg-gray-500/10 text-gray-400",
  contacted: "bg-yellow-500/10 text-yellow-400",
  qualified: "bg-blue-500/10 text-blue-400",
  converted: "bg-green-500/10 text-green-400",
  lost: "bg-red-500/10 text-red-400",
};

export default function LeadsPage() {
  const router = useRouter();
  const { status } = useSession();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/leads?limit=100");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (status === "authenticated") fetchLeads(); }, [status, fetchLeads]);
  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this lead?")) return;
    await fetch(`/api/leads?id=${id}`, { method: "DELETE" });
    fetchLeads();
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    await fetch("/api/leads", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    fetchLeads();
  };

  const filtered = leads.filter((l) => {
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) || (l.company || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const cardCls = `rounded-xl p-5 border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-sm"}`;
  const inputCls = `rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors ${isDark ? "bg-white/5 border border-white/10 placeholder:text-gray-500" : "bg-gray-50 border border-gray-200"}`;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>;
  }

  return (
    <>
      <AddLeadModal open={showAddModal} onClose={() => setShowAddModal(false)} onCreated={fetchLeads} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{leads.length} total leads</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Lead
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..." className={`${inputCls} pl-10 w-full`} />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={inputCls}>
            <option className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white" value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => <option className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white" key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>

        {/* Leads List */}
        {filtered.length === 0 ? (
          <div className={`${cardCls} text-center py-12`}>
            <Users className={`h-12 w-12 mx-auto mb-3 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
            <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              {leads.length === 0 ? "No leads yet. Add your first lead to get started!" : "No leads match your search."}
            </p>
            {leads.length === 0 && (
              <button onClick={() => setShowAddModal(true)} className="mt-3 text-sm text-primary hover:underline">
                + Add Lead
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((lead) => (
              <div key={lead.id} className={`${cardCls} flex items-center justify-between gap-4`}>
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {lead.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{lead.name}</p>
                    <div className={`flex items-center gap-3 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>
                      {lead.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>}
                      {lead.company && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{lead.company}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <select value={lead.status} onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    className={`text-xs rounded-lg px-2 py-1 ${STATUS_COLORS[lead.status] || "bg-gray-500/10 text-gray-400"} ${isDark ? "bg-transparent" : ""}`}>
                    {STATUS_OPTIONS.map((s) => <option className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white" key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                  <button onClick={() => handleDelete(lead.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
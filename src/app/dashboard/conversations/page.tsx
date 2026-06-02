"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MessageSquare, Send, Plus, Sparkles } from "lucide-react";
import { useTheme } from "@/components/ui/ThemeToggle";
import Button from "@/components/shared/Button";

interface Message {
  role: string;
  content: string;
  timestamp: string;
}

interface Conversation {
  id: number;
  channel: string;
  status: string;
  lead_name: string;
  lead_email: string;
  messages: Message[];
  last_message_at: string;
  created_at: string;
}

interface Lead {
  id: number;
  name: string;
  email: string;
}

export default function ConversationsPage() {
  const router = useRouter();
  const { status } = useSession();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewConv, setShowNewConv] = useState(false);
  const [newConvLeadId, setNewConvLeadId] = useState("");
  const [seeding, setSeeding] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Derive selected conversation from the array by ID — always in sync
  const selected = conversations.find((c) => c.id === selectedId) || null;

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/leads?limit=100");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (status === "authenticated") {
      fetchConversations();
      fetchLeads();
    }
  }, [status, fetchConversations, fetchLeads]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages?.length]);

  const handleSelect = (id: number) => {
    setSelectedId(id);
    setMessage("");
  };

  const handleSend = async () => {
    if (!message.trim() || !selected || sending) return;
    const convId = selected.id;
    const msgText = message;
    setSending(true);
    setMessage("");

    // Optimistically add user message to the conversations array
    const tempMsg: Message = { role: "user", content: msgText, timestamp: new Date().toISOString() };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId ? { ...c, messages: [...c.messages, tempMsg] } : c
      )
    );

    try {
      const res = await fetch(`/api/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: msgText, sender: "user" }),
      });
      if (res.ok) {
        const data = await res.json();
        // Add AI response to the conversations array
        if (data.aiMessage) {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId
                ? { ...c, messages: [...c.messages, data.aiMessage], last_message_at: new Date().toISOString() }
                : c
            )
          );
        }
      }
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: newConvLeadId ? parseInt(newConvLeadId) : undefined,
          channel: "manual",
        }),
      });
      if (res.ok) {
        setShowNewConv(false);
        setNewConvLeadId("");
        const data = await res.json();
        if (data.conversation) {
          // Add to local state immediately
          const newConv = {
            ...data.conversation,
            lead_name: leads.find((l) => l.id === parseInt(newConvLeadId))?.name || null,
            lead_email: leads.find((l) => l.id === parseInt(newConvLeadId))?.email || null,
          };
          setConversations((prev) => [newConv, ...prev]);
          setSelectedId(data.conversation.id);
        }
      }
    } catch {
      /* ignore */
    }
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/conversations/seed", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        await fetchConversations();
        await fetchLeads();
        alert(data.message);
      }
    } catch {
      /* ignore */
    } finally {
      setSeeding(false);
    }
  };

  const cardCls = `rounded-xl p-4 border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-sm"}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-[calc(100vh-10rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="primary" size="sm" onClick={() => setShowNewConv(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> New Chat
          </Button>
          {conversations.length === 0 && (
            <Button variant="secondary" size="sm" onClick={handleSeedDemo} disabled={seeding}>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              {seeding ? "Loading..." : "Load Demo Chats"}
            </Button>
          )}
        </div>
        <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* New Conversation Modal */}
      {showNewConv && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNewConv(false);
          }}
        >
          <div className={`w-full max-w-md rounded-2xl border p-6 ${isDark ? "bg-[#111827] border-white/10" : "bg-white border-gray-200 shadow-xl"}`}>
            <h3 className="text-lg font-bold mb-4">Start New Conversation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Link to Lead (optional)</label>
                <select
                  value={newConvLeadId}
                  onChange={(e) => setNewConvLeadId(e.target.value)}
                  className={`w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-gray-50 border border-gray-200 text-gray-900"}`}
                >
                  <option className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white" value="">— No lead —</option>
                  {leads.map((l) => (
<option key={l.id} value={l.id} className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white">
	                  {l.name} ({l.email})
	                </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewConv(false)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateConversation}
                  className="flex-1 bg-primary hover:bg-primary-600 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 grid lg:grid-cols-3 gap-4 min-h-0">
        {/* Conversation List */}
        <div className={`lg:col-span-1 overflow-y-auto ${cardCls}`}>
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className={`h-10 w-10 mx-auto mb-3 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
              <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                No conversations yet
              </p>
              <p className={`text-xs mt-1 mb-4 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                Conversations start when leads chat with your AI assistant.
              </p>
              <Button variant="primary" size="sm" onClick={handleSeedDemo} disabled={seeding}>
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                {seeding ? "Loading..." : "Load Demo Chats"}
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelect(conv.id)}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    selectedId === conv.id
                      ? "bg-primary/10 border border-primary/30"
                      : isDark
                        ? "hover:bg-white/5"
                        : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {conv.lead_name || "Unknown Lead"}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] uppercase font-medium px-1.5 py-0.5 rounded ${
                          conv.channel === "website_chat"
                            ? "bg-blue-500/10 text-blue-400"
                            : conv.channel === "whatsapp"
                              ? "bg-green-500/10 text-green-400"
                              : conv.channel === "email"
                                ? "bg-purple-500/10 text-purple-400"
                                : "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {conv.channel.replace("_", " ")}
                      </span>
                      <span className={`h-2 w-2 rounded-full ${conv.status === "active" ? "bg-green-400" : "bg-gray-500"}`} />
                    </div>
                  </div>
                  <p className={`text-xs truncate mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    {conv.messages?.[conv.messages.length - 1]?.content?.substring(0, 60) || "No messages"}...
                  </p>
                  <p className={`text-[10px] mt-1 ${isDark ? "text-gray-600" : "text-gray-300"}`}>
                    {conv.lead_email} · {new Date(conv.last_message_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className={`lg:col-span-2 flex flex-col ${cardCls} min-h-[400px]`}>
          {selected ? (
            <>
              {/* Chat Header */}
              <div className={`pb-3 mb-3 border-b flex items-center justify-between ${isDark ? "border-white/10" : "border-gray-200"}`}>
                <div>
                  <h3 className="font-semibold">{selected.lead_name || "Unknown Lead"}</h3>
                  <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    {selected.lead_email} · {selected.channel.replace("_", " ")}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">Active</span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
                {(selected.messages || []).map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "assistant"
                          ? "bg-primary text-white rounded-br-sm"
                          : isDark
                            ? "bg-white/10 rounded-bl-sm"
                            : "bg-gray-100 rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message as the lead..."
                  className={`flex-1 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 ${
                    isDark
                      ? "bg-white/5 border border-white/10 placeholder:text-gray-500"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  className="p-3 rounded-xl bg-primary text-white disabled:opacity-30 hover:bg-primary-600 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className={`h-12 w-12 mx-auto mb-3 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
                <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {conversations.length === 0 ? "No conversations yet" : "Select a conversation"}
                </p>
                <p className={`text-xs mt-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                  {conversations.length === 0
                    ? 'Click "Load Demo Chats" to see sample AI conversations'
                    : "Click a conversation on the left to view messages"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
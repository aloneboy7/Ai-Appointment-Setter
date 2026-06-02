"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: number;
  sender: "bot" | "user";
  text: string;
  quickReplies?: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1, sender: "bot", text: "👋 Hi! I'm the AI Appointment Setter assistant." },
  { id: 2, sender: "bot", text: "I can help you understand how our AI books meetings automatically. Ask me anything!", quickReplies: ["Pricing", "Features", "Book a Demo", "Integrations"] },
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Build the conversation history for the API
  const buildChatHistory = useCallback((): ChatMessage[] => {
    return messages
      .filter((m) => m.id > 2) // Skip initial greeting messages
      .map((m) => ({
        role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }));
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMsg: Message = { id: Date.now(), sender: "user", text };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput("");
      setIsTyping(true);

      // Cancel any in-flight request
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        // Build history from messages before this one
        const history = updatedMessages
          .filter((m) => m.id > 2)
          .map((m) => ({
            role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
            content: m.text,
          }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: abortRef.current.signal,
        });

        const data = await res.json();
        const botMsg: Message = {
          id: Date.now() + 1,
          sender: "bot",
          text: data.reply || "I'm here to help! Ask me about pricing, features, or how our AI works.",
          quickReplies: data.quickReplies || ["Pricing", "Features", "Book a Demo"],
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        // Fallback on error
        const botMsg: Message = {
          id: Date.now() + 1,
          sender: "bot",
          text: "I'd love to help! You can ask me about pricing, features, integrations, or how to get started. 😊",
          quickReplies: ["Pricing", "Features", "Book a Demo", "Integrations"],
        };
        setMessages((prev) => [...prev, botMsg]);
      } finally {
        setIsTyping(false);
        abortRef.current = null;
      }
    },
    [messages, isTyping]
  );

  const handleSend = () => sendMessage(input);
  const handleQuickReply = (reply: string) => sendMessage(reply);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-[380px] sm:w-[440px] max-h-[580px] bg-white dark:bg-[#0B1020] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-xl dark:shadow-none"
          >
            {/* Header */}
            <div className="bg-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">AI Assistant</p>
                  <p className="text-xs text-white/70">Online • Replies instantly</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 max-h-[380px] min-h-[260px] bg-white dark:bg-[#0B1020]">
              {messages.map((msg) => (
                <div key={msg.id}>
                  <div className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.sender === "bot" && (
                      <div className="h-7 w-7 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
<div
	                      className={`rounded-2xl px-4 py-3 max-w-[300px] text-[15px] leading-relaxed ${
	                        msg.sender === "user"
	                          ? "bg-primary text-white rounded-br-md"
	                          : "bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-100 dark:border-white/10"
					      }`}
					    >
                      {msg.text}
                    </div>
                    {msg.sender === "user" && (
                      <div className="h-7 w-7 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center shrink-0 mt-1">
                        <User className="h-3.5 w-3.5 text-accent" />
                      </div>
                    )}
                  </div>
                  {/* Quick Replies */}
                  {msg.quickReplies && msg.sender === "bot" && (
                    <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                      {msg.quickReplies.map((reply) => (
                        <button
                          key={reply}
                          onClick={() => handleQuickReply(reply)}
                          className="px-4 py-2 text-sm rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors font-medium"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-2 justify-start">
                  <div className="h-7 w-7 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 rounded-2xl rounded-bl-md px-4 py-2.5 border border-gray-100 dark:border-white/10">
                    <div className="flex items-center gap-1">
                      <span className="animate-bounce text-primary/50 text-xs" style={{ animationDelay: "0ms" }}>●</span>
                      <span className="animate-bounce text-primary/50 text-xs" style={{ animationDelay: "150ms" }}>●</span>
                      <span className="animate-bounce text-primary/50 text-xs" style={{ animationDelay: "300ms" }}>●</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1020]">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isTyping && handleSend()}
                  placeholder="Ask about features, pricing..."
                  disabled={isTyping}
                  className="flex-1 bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-3 text-[15px] outline-none border border-gray-200 dark:border-white/10 focus:border-primary/50 transition-colors placeholder:text-gray-400 text-gray-900 dark:text-white disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                  className="h-11 w-11 rounded-xl bg-primary hover:bg-primary-600 flex items-center justify-center transition-colors shrink-0 disabled:opacity-50"
                >
                  <Send className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center hover:shadow-primary/50 transition-shadow"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </motion.button>
    </div>
  );
}
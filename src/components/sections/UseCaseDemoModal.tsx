"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, CheckCircle2, Bot, User, Clock } from "lucide-react";
import { useTheme } from "@/components/ui/ThemeToggle";

interface IndustryDemo {
  tagline: string;
  steps: { title: string; description: string }[];
  chat: { role: "bot" | "lead"; message: string }[];
  results: string[];
}

const DEMOS: Record<string, IndustryDemo> = {
  "Real Estate": {
    tagline: "How AI Appointment Setter works for real estate agencies",
    steps: [
      { title: "Lead captures via your website", description: "A buyer fills out a property inquiry form on your website at 10 PM." },
      { title: "AI responds instantly", description: "Your AI chatbot greets the lead, asks about budget, location preference, and timeline." },
      { title: "Lead gets qualified automatically", description: "AI scores the lead based on responses — budget, readiness, and area match." },
      { title: "Property tour is booked", description: "Qualified leads get a calendar link to book a tour. Unqualified leads get a nurture sequence." },
      { title: "Follow-up is automated", description: "AI sends a reminder 24h before the tour, a follow-up after, and a nurture sequence if no response." },
    ],
    chat: [
      { role: "bot", message: "Hi Sarah! 👋 Thanks for your interest in the 3BR home on Oak Street. I'm the AI assistant for Premier Realty. What's your budget range?" },
      { role: "lead", message: "We're looking in the $400-500K range" },
      { role: "bot", message: "Great — that fits perfectly with this property! Are you looking to move soon, or just browsing for now?" },
      { role: "lead", message: "We want to move in the next 2 months" },
      { role: "bot", message: "Perfect timing! I have a tour slot available this Saturday at 10 AM or Sunday at 2 PM. Which works better for you?" },
      { role: "lead", message: "Saturday at 10 works!" },
      { role: "bot", message: "✅ Tour booked for Saturday at 10 AM! You'll get a confirmation email with the address and a reminder 24 hours before. Is there anything specific you'd like to know about the property?" },
    ],
    results: ["92% of leads responded to within 30 seconds", "Property tour bookings increased by 3x", "35% reduction in no-shows with automated reminders", "Agents save 8+ hours per week on follow-ups"],
  },
  "Agencies": {
    tagline: "How AI Appointment Setter works for marketing agencies",
    steps: [
      { title: "Prospect fills out a form", description: "A potential client submits a \"Get a Quote\" form on your agency website." },
      { title: "AI qualifies the lead", description: "AI asks about their business type, monthly ad spend, and goals to assess fit." },
      { title: "Discovery call is booked", description: "Qualified prospects are offered calendar slots for a discovery call with your team." },
      { title: "No-shows are reduced", description: "AI sends SMS + email reminders, and reschedules automatically if the prospect can't make it." },
      { title: "Lost leads are recovered", description: "Prospects who didn't book get an automated follow-up sequence over 7 days." },
    ],
    chat: [
      { role: "bot", message: "Hey Alex! 👋 Thanks for reaching out to GrowthStack Agency. To match you with the right specialist, what type of business do you run?" },
      { role: "lead", message: "We're an e-commerce brand doing about $50K/month in revenue" },
      { role: "bot", message: "Nice! And what's your current monthly ad spend? Under $5K, $5-15K, or $15K+?" },
      { role: "lead", message: "Around $8K/month on Meta and Google" },
      { role: "bot", message: "That's a sweet spot for our Growth plan! I'd love to set up a 30-min discovery call with our head of strategy. We have slots on Wednesday at 2 PM or Thursday at 11 AM — which works?" },
      { role: "lead", message: "Wednesday 2 PM sounds good" },
      { role: "bot", message: "✅ Locked in! Wednesday at 2 PM. You'll get a calendar invite + a Zoom link. We'll also send a quick pre-call questionnaire to make the most of our time. Talk soon! 🚀" },
    ],
    results: ["Discovery call bookings up 2.8x", "Lead qualification time reduced from 2 days to 5 minutes", "No-show rate dropped from 30% to 8%", "35% of lost leads recovered via automated follow-ups"],
  },
  "Consultants": {
    tagline: "How AI Appointment Setter works for consultants",
    steps: [
      { title: "Visitor lands on your site", description: "A potential client finds your consulting page via a blog post or referral link." },
      { title: "AI engages the visitor", description: "The chatbot greets them, asks about their biggest challenge, and gauges interest level." },
      { title: "Warm leads get booked", description: "Interested prospects are offered consultation slots directly on your calendar." },
      { title: "Nurture sequences run on autopilot", description: "Not-ready leads receive a 5-email nurture sequence with your best case studies." },
      { title: "You focus on delivering value", description: "While AI handles lead management, you spend your time on client work instead of prospecting." },
    ],
    chat: [
      { role: "bot", message: "Hi Jordan! 👋 Welcome! I'm the AI assistant for Meridian Consulting. Are you exploring ways to scale your business operations?" },
      { role: "lead", message: "Yes, we're growing fast but our processes are a mess" },
      { role: "bot", message: "That's actually the most common challenge we hear! Scaling without systems creates chaos. What's your team size right now?" },
      { role: "lead", message: "About 25 people, trying to get to 40 by end of year" },
      { role: "bot", message: "That's exactly where our Operational Scaling Framework helps. We've helped 50+ companies at this stage. Want a free 30-min consultation to see if it's a fit? I have Tuesday at 10 AM or Thursday at 3 PM." },
      { role: "lead", message: "Let's do Tuesday 10 AM" },
      { role: "bot", message: "✅ Booked! Tuesday at 10 AM. I'll send a calendar invite and a brief pre-session survey. Looking forward to helping you scale smoothly! 📈" },
    ],
    results: ["Consultation bookings increased 4x", "10+ hours saved per week on lead management", "Lead response time under 30 seconds (vs 24h before)", "Conversion from lead to client improved by 45%"],
  },
  "Clinics": {
    tagline: "How AI Appointment Setter works for clinics and healthcare practices",
    steps: [
      { title: "Patient visits your website", description: "A new or existing patient lands on your clinic's website looking to book an appointment." },
      { title: "AI handles the intake", description: "The chatbot asks about symptoms, insurance type, and preferred appointment times." },
      { title: "Appointment is auto-booked", description: "AI matches the patient with the right provider and available slot, then confirms the booking." },
      { title: "Reminders are sent automatically", description: "SMS + email reminders at 48h, 24h, and 2h before the appointment." },
      { title: "No-shows trigger rescheduling", description: "If a patient misses, AI automatically offers rescheduling options via text." },
    ],
    chat: [
      { role: "bot", message: "Hello! 😊 Welcome to BrightSmile Dental. How can I help you today? I can book an appointment, answer questions, or help with existing bookings." },
      { role: "lead", message: "I need to schedule a cleaning" },
      { role: "bot", message: "Of course! Is this your first visit with us, or are you an existing patient?" },
      { role: "lead", message: "First time" },
      { role: "bot", message: "Welcome! 🎉 For new patients, we have a special $99 new patient exam + cleaning package. I have availability this week:\n\n• Tuesday 2:00 PM\n• Wednesday 10:00 AM\n• Thursday 4:00 PM\n\nWhich works best?" },
      { role: "lead", message: "Wednesday at 10 please" },
      { role: "bot", message: "✅ All set! Your new patient exam + cleaning is booked for Wednesday at 10:00 AM at our Main Street location. You'll receive a confirmation text and a reminder the day before. Please arrive 15 min early for paperwork. See you then! 😁" },
    ],
    results: ["Patient booking rate increased by 3.2x", "No-show rate reduced by 35%", "Staff saved 12+ hours/week on phone scheduling", "Patient satisfaction score: 4.8/5"],
  },
};

interface UseCaseDemoModalProps {
  industry: string | null;
  onClose: () => void;
}

export default function UseCaseDemoModal({ industry, onClose }: UseCaseDemoModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [step, setStep] = useState(0);
  const [chatIndex, setChatIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const demo = industry ? DEMOS[industry] : null;

  useEffect(() => {
    setStep(0);
    setChatIndex(0);
  }, [industry]);

  // Auto-animate chat messages
  useEffect(() => {
    if (!demo) return;
    if (step === 1 && chatIndex < demo.chat.length) {
      intervalRef.current = setInterval(() => {
        setChatIndex((prev) => {
          if (prev >= demo.chat.length - 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return prev + 1;
          }
          return prev + 1;
        });
      }, 1800);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
  }, [step, demo]);

  if (!demo) return null;

  const cardCls = `rounded-xl p-4 border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6 sm:p-8 ${
            isDark ? "bg-[#0B1020] border-white/10" : "bg-white border-gray-200"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{industry}</h2>
              <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{demo.tagline}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Step Navigation */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {["5-Step Flow", "Live Demo", "Results"].map((label, i) => (
              <button key={i} onClick={() => { setStep(i); setChatIndex(0); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  step === i ? "bg-primary text-white" : isDark ? "bg-white/5 text-gray-400 hover:text-white" : "bg-gray-100 text-gray-500 hover:text-gray-900"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Step 1: 5-Step Flow */}
          {step === 0 && (
            <div className="space-y-4">
              {demo.steps.map((s, i) => (
                <div key={i} className={`${cardCls} flex gap-4 items-start`}>
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{s.title}</h4>
                    <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{s.description}</p>
                  </div>
                </div>
              ))}
              <button onClick={() => setStep(1)} className="w-full bg-primary hover:bg-primary-600 text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2">
                See the Live Demo <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Step 2: Live Chat Demo */}
          {step === 1 && (
            <div className="space-y-4">
              <div className={`${cardCls} min-h-[300px]`}>
                <div className={`text-xs font-medium mb-3 flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  <Bot className="h-3.5 w-3.5 text-primary" />
                  AI Chatbot Demo — Watch the conversation unfold
                </div>
                <div className="space-y-3">
                  {demo.chat.slice(0, chatIndex).map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "lead" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "bot"
                          ? "bg-primary text-white rounded-br-sm"
                          : isDark ? "bg-white/10 rounded-bl-sm" : "bg-gray-100 rounded-bl-sm"
                      }`}>
                        {msg.message}
                      </div>
                    </motion.div>
                  ))}
                  {chatIndex < demo.chat.length && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        <Bot className="h-4 w-4 text-primary" />
                      </motion.div>
                      <span>AI is typing...</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setChatIndex(0); }} className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"}`}>
                  Replay
                </button>
                <button onClick={() => setStep(2)} className="flex-1 bg-primary hover:bg-primary-600 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors flex items-center justify-center gap-2">
                  See Results <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 2 && (
            <div className="space-y-4">
              <div className={`${cardCls} text-center py-8`}>
                <h3 className="text-xl font-bold mb-6">Typical Results for {industry}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {demo.results.map((r, i) => (
                    <div key={i} className={`flex items-start gap-3 p-4 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                      <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                      <p className="text-sm font-medium">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={onClose} className={`flex-1 py-3 rounded-xl text-sm font-medium ${isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"}`}>
                  Close
                </button>
                <a href="/register" className="flex-1 bg-primary hover:bg-primary-600 text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
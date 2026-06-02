"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User } from "lucide-react";
import Link from "next/link";
import SectionWrapper from "@/components/shared/SectionWrapper";
import GlassCard from "@/components/ui/GlassCard";
import { WORKFLOW_STEPS } from "@/lib/constants";

/* Demo messages for the chat animation */
const DEMO_MESSAGES = [
  {
    sender: "lead" as const,
    text: "Hi, I'm interested in your services. Can I book a call?",
  },
  {
    sender: "ai" as const,
    text: "Hi! I'd love to help you book a call. Quick question — are you looking to book a demo or start a free trial? I can get that sorted for you right now \u{1F60A}",
  },
];

const DEMO_STATES = ["typing", "ai_reply", "quick_replies"] as const;
type DemoState = (typeof DEMO_STATES)[number];

export default function AIWorkflow() {
  const [phase, setPhase] = useState<DemoState>("typing");
  const [cycleKey, setCycleKey] = useState(0);

  const startCycle = useCallback(() => {
    setPhase("typing");
    setCycleKey((k) => k + 1);
  }, []);

  useEffect(() => {
    // Phase transitions within one cycle
    const t1 = setTimeout(() => setPhase("ai_reply"), 1500);
    const t2 = setTimeout(() => setPhase("quick_replies"), 3000);
    // Restart cycle every 8 seconds
    const t3 = setTimeout(startCycle, 8000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [cycleKey, startCycle]);

  const showAiReply = phase === "ai_reply" || phase === "quick_replies";
  const showQuickReplies = phase === "quick_replies";

  return (
    <SectionWrapper id="workflow">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-primary font-semibold text-sm uppercase tracking-wider mb-3"
        >
          How It Works
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white"
        >
          AI That Books Meetings on{" "}
          <span className="gradient-text">Autopilot</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          From first inquiry to booked meeting — our AI handles every step in real-time.
        </motion.p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Timeline */}
        <div className="relative">
          {WORKFLOW_STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative flex gap-4 mb-8 last:mb-0"
            >
              {/* Connector Line */}
              {i < WORKFLOW_STEPS.length - 1 && (
                <div className="absolute left-5 top-12 w-0.5 h-full bg-gradient-to-b from-primary/50 to-transparent" />
              )}

              {/* Step Number */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/50 text-primary font-bold text-sm z-10">
                {step.step}
              </div>

              {/* Content */}
              <div className="glass rounded-xl p-4 flex-1">
                <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">{step.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chat Demo */}
        <GlassCard hover={false} className="p-0 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-primary/5 dark:bg-primary/10 px-5 py-3 flex items-center gap-3 border-b border-gray-200 dark:border-white/10">
            <div className="h-8 w-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">AI Appointment Bot</p>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Active now
              </p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="p-5 space-y-4 min-h-[320px] flex flex-col">
            {/* Lead message — always visible */}
            <motion.div
              key={`lead-${cycleKey}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex gap-2 justify-end"
            >
              <div className="rounded-2xl px-4 py-2.5 max-w-[240px] text-sm leading-relaxed bg-primary/10 dark:bg-accent/20 text-primary dark:text-accent rounded-br-md">
                {DEMO_MESSAGES[0].text}
              </div>
              <div className="h-7 w-7 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center shrink-0 mt-1">
                <User className="h-3.5 w-3.5 text-accent" />
              </div>
            </motion.div>

            {/* Typing indicator — shown while AI is "thinking" */}
            <AnimatePresence>
              {!showAiReply && (
                <motion.div
                  key={`typing-${cycleKey}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-2 justify-start"
                >
                  <div className="h-7 w-7 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="rounded-2xl px-4 py-2.5 bg-gray-100 dark:bg-white/5 rounded-bl-md">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <span className="animate-pulse">●</span>
                      <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>●</span>
                      <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>●</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI reply — appears after typing */}
            <AnimatePresence>
              {showAiReply && (
                <motion.div
                  key={`ai-${cycleKey}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-2 justify-start"
                >
                  <div className="h-7 w-7 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="rounded-2xl px-4 py-2.5 max-w-[280px] text-sm leading-relaxed bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-white rounded-bl-md">
                    {DEMO_MESSAGES[1].text}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick reply buttons */}
            <AnimatePresence>
              {showQuickReplies && (
                <motion.div
                  key={`qr-${cycleKey}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.1 }}
                  className="flex gap-2 mt-1"
                >
                  <Link
                    href="/book-demo"
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary-600 transition-colors"
                  >
                    Book a Demo
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors border border-gray-200 dark:border-white/10"
                  >
                    Start Free Trial
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      </div>
    </SectionWrapper>
  );
}
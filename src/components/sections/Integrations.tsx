"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";
import SectionWrapper from "@/components/shared/SectionWrapper";
import { INTEGRATIONS } from "@/lib/constants";
import { Zap, ArrowRight, Shield, Clock, MousePointerClick, Bell, Code2, RefreshCw } from "lucide-react";

/* ───────────────── Animated Hub SVG ───────────────── */
function HubOrb({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer ring glow */}
      <circle cx="200" cy="200" r="160" stroke="url(#ring-grad)" strokeWidth="1.5" opacity="0.3">
        <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="30s" repeatCount="indefinite" />
      </circle>
      <circle cx="200" cy="200" r="120" stroke="url(#ring-grad)" strokeWidth="1" opacity="0.2">
        <animateTransform attributeName="transform" type="rotate" from="360 200 200" to="0 200 200" dur="25s" repeatCount="indefinite" />
      </circle>
      <circle cx="200" cy="200" r="80" stroke="url(#ring-grad)" strokeWidth="1" opacity="0.15">
        <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="20s" repeatCount="indefinite" />
      </circle>
      {/* Center pulse */}
      <circle cx="200" cy="200" r="24" fill="url(#center-grad)">
        <animate attributeName="r" values="22;28;22" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="200" cy="200" r="40" stroke="#6C63FF" strokeWidth="1" opacity="0.2">
        <animate attributeName="r" values="38;48;38" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;0.05;0.2" dur="3s" repeatCount="indefinite" />
      </circle>
      {/* Connection lines */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 200 + 30 * Math.cos(rad);
        const y1 = 200 + 30 * Math.sin(rad);
        const x2 = 200 + 155 * Math.cos(rad);
        const y2 = 200 + 155 * Math.sin(rad);
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6C63FF" strokeWidth="0.8" opacity="0.15">
            <animate attributeName="opacity" values="0.05;0.25;0.05" dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
          </line>
        );
      })}
      {/* Moving dots on lines */}
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const cx = 200 + 100 * Math.cos(rad);
        const cy = 200 + 100 * Math.sin(rad);
        return (
          <circle key={`dot-${i}`} r="3" fill="#00D4FF" opacity="0.6">
            <animateMotion
              path={`M${200 + 30 * Math.cos(rad)},${200 + 30 * Math.sin(rad)} L${200 + 155 * Math.cos(rad)},${200 + 155 * Math.sin(rad)}`}
              dur={`${2 + i * 0.5}s`}
              repeatCount="indefinite"
            />
          </circle>
        );
      })}
      <defs>
        <linearGradient id="ring-grad" x1="0" y1="0" x2="400" y2="400">
          <stop offset="0%" stopColor="#6C63FF" />
          <stop offset="50%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#6C63FF" />
        </linearGradient>
        <radialGradient id="center-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6C63FF" />
          <stop offset="100%" stopColor="#4F46E5" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ───────────────── Floating Integration Card ───────────────── */
function IntegrationCard({ integration, index }: { integration: (typeof INTEGRATIONS)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);

  function handleMouse(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ delay: index * 0.04, duration: 0.5, ease: "easeOut" }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className="group relative"
    >
      {/* Glow effect on hover */}
      <div
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500"
        style={{ background: `linear-gradient(135deg, ${integration.color}33, transparent)` }}
      />

      <div className="relative glass rounded-2xl p-4 flex flex-col items-center gap-2.5 cursor-default transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/5">
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${integration.color}12` }}
        >
          <img
            src={`/icons/${integration.icon}.svg`}
            alt={integration.name}
            className="h-6 w-6 dark:invert"
            loading="lazy"
          />
        </div>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 text-center leading-tight">
          {integration.name}
        </span>
      </div>
    </motion.div>
  );
}

/* ───────────────── Feature Badge ───────────────── */
function FeatureBadge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-gray-200 dark:border-white/10">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{label}</span>
    </div>
  );
}

/* ───────────────── Workflow Step ───────────────── */
function WorkflowStep({ step, title, desc, isLast }: { step: number; title: string; desc: string; isLast: boolean }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div className="h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-bold text-sm shrink-0">
          {step}
        </div>
        {!isLast && (
          <div className="w-0.5 h-12 bg-gradient-to-b from-primary/40 to-primary/0" />
        )}
      </div>
      <div className="pb-8">
        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ───────────────── Main Section ───────────────── */
export default function Integrations() {
  return (
    <SectionWrapper id="integrations" className="overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="relative">
        {/* ── Header ── */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-primary font-semibold text-sm uppercase tracking-wider mb-3"
          >
            Automation Integrations
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-5 text-gray-900 dark:text-white"
          >
            Connect Your{" "}
            <span className="gradient-text">Favorite Tools</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            Automate workflows seamlessly across the apps your team already uses. Fast setup, real-time syncing, and zero coding required.
          </motion.p>
        </div>

        {/* ── Feature Badges Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          <FeatureBadge icon={Zap} label="50+ Integrations" />
          <FeatureBadge icon={MousePointerClick} label="One-Click Setup" />
          <FeatureBadge icon={Shield} label="Secure API Connections" />
          <FeatureBadge icon={Code2} label="Custom Workflow Builder" />
          <FeatureBadge icon={Bell} label="Instant Notifications" />
        </motion.div>

        {/* ── Main Content: Hub + Grid ── */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left: Animated Hub */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex items-center justify-center"
          >
            <HubOrb className="w-full max-w-[420px] h-auto" />

            {/* Floating label badges around the hub */}
            <div className="absolute top-8 left-4 px-3 py-1.5 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 shadow-md text-xs font-medium text-gray-600 dark:text-gray-300 backdrop-blur-sm">
              <RefreshCw className="inline h-3 w-3 mr-1 text-green-500" />
              Auto Sync
            </div>
            <div className="absolute top-12 right-4 px-3 py-1.5 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 shadow-md text-xs font-medium text-gray-600 dark:text-gray-300 backdrop-blur-sm">
              <Clock className="inline h-3 w-3 mr-1 text-blue-500" />
              Real-time Updates
            </div>
            <div className="absolute bottom-16 left-8 px-3 py-1.5 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 shadow-md text-xs font-medium text-gray-600 dark:text-gray-300 backdrop-blur-sm">
              <Zap className="inline h-3 w-3 mr-1 text-yellow-500" />
              Trigger Actions
            </div>
            <div className="absolute bottom-20 right-6 px-3 py-1.5 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 shadow-md text-xs font-medium text-gray-600 dark:text-gray-300 backdrop-blur-sm">
              <Code2 className="inline h-3 w-3 mr-1 text-purple-500" />
              No-Code Automation
            </div>
          </motion.div>

          {/* Right: Integration Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-3">
            {INTEGRATIONS.map((integration, i) => (
              <IntegrationCard key={integration.name} integration={integration} index={i} />
            ))}
          </div>
        </div>

        {/* ── Workflow Steps ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto mb-16"
        >
          <h3 className="text-center text-xl font-bold text-gray-900 dark:text-white mb-2">
            How It Works
          </h3>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
            Set up automations in minutes, not days
          </p>

          <div className="flex justify-center">
            <div className="w-full max-w-xs">
              <WorkflowStep
                step={1}
                title="Connect Your Apps"
                desc="Authorize your tools with a single click — Google, Salesforce, Slack, and 50+ more."
                isLast={false}
              />
              <WorkflowStep
                step={2}
                title="Build Your Workflow"
                desc="Use our visual builder to set triggers, conditions, and actions. No code needed."
                isLast={false}
              />
              <WorkflowStep
                step={3}
                title="Watch It Run"
                desc="Leads get qualified, meetings get booked, and data syncs — all on autopilot."
                isLast={true}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span className="font-semibold text-gray-900 dark:text-white text-base">50+</span> integrations and counting
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-600 text-white font-semibold text-sm transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40"
            >
              Start Automating
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/book-demo"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              Book a Demo
            </a>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
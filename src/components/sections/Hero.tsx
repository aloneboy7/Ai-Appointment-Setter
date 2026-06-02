"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Calendar, MessageSquare, Clock, CheckCircle2, Bot } from "lucide-react";
import Button from "@/components/shared/Button";
import SectionWrapper from "@/components/shared/SectionWrapper";

const floatingCards = [
  { icon: Calendar, label: "Meeting Booked", color: "text-green-500 dark:text-green-400", bg: "bg-green-500/10 dark:bg-green-500/20" },
  { icon: MessageSquare, label: "Lead Replied", color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10 dark:bg-blue-500/20" },
  { icon: Clock, label: "Follow-up Sent", color: "text-yellow-500 dark:text-yellow-400", bg: "bg-yellow-500/10 dark:bg-yellow-500/20" },
  { icon: Bot, label: "AI Responded in 12s", color: "text-accent", bg: "bg-accent/10 dark:bg-accent/20" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Hero() {
  return (
    <SectionWrapper className="relative min-h-screen flex items-center pt-20 overflow-hidden" noPadding>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-grid-pattern" />

      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-[128px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 dark:bg-accent/10 rounded-full blur-[128px] animate-float-delayed" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Now with Next-Gen AI Conversations</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-gray-900 dark:text-white"
          >
            Never Lose Leads Again with{" "}
            <span className="gradient-text">AI-Powered</span>{" "}
            Appointment Setting
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AI chatbots, automated follow-ups, and smart scheduling that book meetings while you sleep. Turn every lead into an opportunity.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/book-demo">
              <Button variant="primary" size="lg" className="group">
                Book a Demo
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
            <a href="/register">
              <Button variant="secondary" size="lg" className="group">
                <Play className="mr-2 h-4 w-4" />
                Start Free Trial
              </Button>
            </a>
          </motion.div>

          {/* Social Proof */}
          <motion.div variants={itemVariants} className="mt-12 flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Setup in 5 minutes</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating Cards */}
        <div className="relative mt-16 max-w-5xl mx-auto">
          {/* Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="glass-strong rounded-2xl p-6 md:p-8"
          >
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Leads Captured", value: "2,847", change: "+12%" },
                { label: "Meetings Booked", value: "483", change: "+42%" },
                { label: "Conversion Rate", value: "17%", change: "+5.2%" },
              ].map((stat, i) => (
                <div key={i} className="glass rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">{stat.change}</p>
                </div>
              ))}
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Lead Pipeline</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 days</p>
              </div>
              <div className="flex items-end gap-1 h-24">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/10 dark:bg-primary/30 rounded-t-sm" style={{ height: `${h}%` }}>
                    <div
                      className="bg-primary rounded-t-sm w-full transition-all duration-500"
                      style={{ height: "100%" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Floating notification cards */}
          {floatingCards.map((card, i) => {
            const positions = [
              "top-4 -left-4 md:top-8 md:-left-8",
              "top-4 -right-4 md:top-8 md:-right-8",
              "bottom-4 -left-4 md:bottom-12 md:-left-8",
              "bottom-4 -right-4 md:bottom-12 md:-right-8",
            ];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.15 }}
                className={`absolute ${positions[i]} hidden md:block`}
              >
                <div className={`glass-strong rounded-xl px-4 py-3 flex items-center gap-3 animate-float`}
                  style={{ animationDelay: `${i * 0.5}s` }}>
                  <div className={`h-8 w-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap text-gray-700 dark:text-white">{card.label}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
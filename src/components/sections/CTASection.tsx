"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import SectionWrapper from "@/components/shared/SectionWrapper";
import Button from "@/components/shared/Button";

export default function CTASection() {
  return (
    <SectionWrapper>
      <div className="relative overflow-hidden rounded-3xl">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-cta opacity-90" />
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        
        {/* Orbs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />

        <div className="relative px-6 py-16 md:px-12 md:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Start your free trial today</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-3xl mx-auto leading-tight">
              Start Booking More Meetings Automatically
            </h2>

            <p className="text-lg text-white/80 max-w-xl mx-auto mb-10">
              Turn missed leads into paying customers with AI-powered automation. Setup takes just 5 minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/register">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 border-0 group"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <a href="/book-demo">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white border border-white/30 hover:bg-white/10"
                >
                  Schedule Demo
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
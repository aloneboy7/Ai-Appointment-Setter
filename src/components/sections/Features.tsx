"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/shared/SectionWrapper";
import GlassCard from "@/components/ui/GlassCard";
import { FEATURES } from "@/lib/constants";

export default function Features() {
  return (
    <SectionWrapper id="features">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-primary font-semibold text-sm uppercase tracking-wider mb-3"
        >
          Features
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white"
        >
          Everything You Need to{" "}
          <span className="gradient-text">Convert Leads</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          A complete AI-powered toolkit that handles every step of your lead conversion pipeline.
        </motion.p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className="h-full group cursor-default">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 dark:bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
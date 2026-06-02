"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import SectionWrapper from "@/components/shared/SectionWrapper";
import { PROBLEMS, SOLUTIONS } from "@/lib/constants";

export default function ProblemSolution() {
  return (
    <SectionWrapper id="problem-solution">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-primary font-semibold text-sm uppercase tracking-wider mb-3"
        >
          The Problem
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white"
        >
          Your Leads Are Slipping Away
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          Without AI automation, businesses lose up to 80% of potential customers to slow responses and missed follow-ups.
        </motion.p>
      </div>

      {/* Side by side comparison */}
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Problems */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Without AI</h3>
          </div>
          <div className="space-y-3">
            {PROBLEMS.map((problem, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-4 border-l-2 border-red-500/50"
              >
                <h4 className="font-semibold text-red-600 dark:text-red-300 mb-1">{problem.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{problem.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Solutions */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">With AI</h3>
          </div>
          <div className="space-y-3">
            {SOLUTIONS.map((solution, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-4 border-l-2 border-green-500/50"
              >
                <h4 className="font-semibold text-green-600 dark:text-green-300 mb-1">{solution.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{solution.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Arrow */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="hidden md:flex justify-center mt-8"
      >
        <div className="flex items-center gap-2 text-primary">
          <span className="text-sm font-medium">Stop losing leads</span>
          <ArrowRight className="h-4 w-4" />
          <span className="text-sm font-medium">Start automating</span>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
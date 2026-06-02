"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SectionWrapper from "@/components/shared/SectionWrapper";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/shared/Button";
import { USE_CASES } from "@/lib/constants";
import UseCaseDemoModal from "./UseCaseDemoModal";

export default function UseCases() {
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  return (
    <SectionWrapper id="use-cases">
<div className="text-center mb-16">
	        <motion.p
	          initial={{ opacity: 0 }}
	          whileInView={{ opacity: 1 }}
	          viewport={{ once: true }}
	          className="text-primary font-semibold text-sm uppercase tracking-wider mb-3"
	        >
	          Use Cases
	        </motion.p>
	        <motion.h2
	          initial={{ opacity: 0, y: 20 }}
	          whileInView={{ opacity: 1, y: 0 }}
	          viewport={{ once: true }}
	          className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white"
	        >
          Built for{" "}
          <span className="gradient-text">Every Industry</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          Whether you&apos;re in real estate, consulting, or healthcare — our AI adapts to your workflow.
        </motion.p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {USE_CASES.map((useCase, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="h-full flex flex-col">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/5 dark:bg-primary/10 mb-5">
                <useCase.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{useCase.industry}</h3>
<ul className="space-y-2 mb-6 flex-1">
	                {useCase.benefits.map((benefit, j) => (
	                  <li key={j} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="text-primary mt-0.5">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
              <Button
                variant="ghost"
                size="sm"
                className="group w-full"
                onClick={() => setSelectedIndustry(useCase.industry)}
              >
                {useCase.cta}
                <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Button>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <UseCaseDemoModal
        industry={selectedIndustry}
        onClose={() => setSelectedIndustry(null)}
      />
    </SectionWrapper>
  );
}
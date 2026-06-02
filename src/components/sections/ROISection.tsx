"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/shared/SectionWrapper";
import ROICalculator from "@/components/ui/ROICalculator";

export default function ROISection() {
  return (
    <SectionWrapper id="roi-calculator">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-primary font-semibold text-sm uppercase tracking-wider mb-3"
          >
            ROI Calculator
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            See Your{" "}
            <span className="gradient-text">Revenue Impact</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6"
          >
            Adjust the sliders to estimate how much additional revenue AI Appointment Setter can generate for your business. Most customers see 3-5x ROI in the first month.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {[
              "Instant responses capture leads before they go cold",
              "AI qualification increases conversion rates 3x",
              "Automated follow-ups recover 35% of lost leads",
              "Smart scheduling reduces no-shows by 35%",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-primary mt-0.5">✓</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <ROICalculator />
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
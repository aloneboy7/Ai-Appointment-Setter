"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/shared/SectionWrapper";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { TRUST_STATS } from "@/lib/constants";

export default function TrustBar() {
  return (
    <SectionWrapper className="border-y border-gray-200 dark:border-white/5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        {TRUST_STATS.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <p className="text-3xl md:text-4xl font-bold gradient-text">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Trusted by line — replaces fake logo ticker */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mt-10 text-sm text-gray-400 dark:text-gray-500"
      >
        Trusted by early customers in real estate, healthcare, consulting, and agencies
      </motion.p>
    </SectionWrapper>
  );
}
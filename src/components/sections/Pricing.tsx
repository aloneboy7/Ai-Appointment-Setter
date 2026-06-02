"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import SectionWrapper from "@/components/shared/SectionWrapper";
import Button from "@/components/shared/Button";
import { PRICING_TIERS } from "@/lib/constants";

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <SectionWrapper id="pricing">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-primary font-semibold text-sm uppercase tracking-wider mb-3"
        >
          Pricing
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white"
        >
          Simple, Transparent{" "}
          <span className="gradient-text">Pricing</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8"
        >
          Start free. Upgrade when you&apos;re ready. No hidden fees.
        </motion.p>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-3 glass rounded-full px-2 py-1"
        >
          <button
            onClick={() => setIsYearly(false)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !isYearly ? "bg-primary text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isYearly ? "bg-primary text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Yearly
            <span className="ml-1.5 text-xs text-green-600 dark:text-green-400">Save 20%</span>
          </button>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PRICING_TIERS.map((tier, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`relative glass rounded-2xl p-6 md:p-8 flex flex-col ${
              tier.highlighted ? "border-2 border-primary/50 shadow-lg shadow-primary/10" : ""
            }`}
          >
            {tier.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1 bg-primary px-3 py-1 rounded-full text-xs font-semibold text-white">
                  <Sparkles className="h-3 w-3" />
                  Most Popular
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">{tier.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{tier.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                ${isYearly ? tier.yearlyPrice : tier.monthlyPrice}
              </span>
              <span className="text-gray-500 dark:text-gray-400">/month</span>
              {isYearly && (
                <p className="text-xs text-gray-400 mt-1">
                  Billed annually (${tier.yearlyPrice * 12}/year)
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {tier.features.map((feature, j) => (
                <li key={j} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <a href={tier.cta === "Contact Sales" ? "/book-demo" : "/register"} className="block">
              <Button
                variant={tier.highlighted ? "primary" : "secondary"}
                size="md"
                className="w-full"
              >
                {tier.cta}
              </Button>
            </a>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
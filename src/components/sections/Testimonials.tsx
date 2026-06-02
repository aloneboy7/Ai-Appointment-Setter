"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, BadgeCheck } from "lucide-react";
import SectionWrapper from "@/components/shared/SectionWrapper";
import { TESTIMONIALS } from "@/lib/constants";

export default function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SectionWrapper id="testimonials">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-primary font-semibold text-sm uppercase tracking-wider mb-3"
        >
          Testimonials
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white"
        >
          Loved by{" "}
          <span className="gradient-text">Teams Everywhere</span>
        </motion.h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {TESTIMONIALS.map((testimonial, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`glass rounded-2xl p-6 transition-all ${
              active === i ? "ring-1 ring-primary/30" : ""
            }`}
          >
            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: testimonial.rating }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            {/* Quote */}
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              &ldquo;{testimonial.quote}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                {testimonial.avatar}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{testimonial.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {testimonial.role} at {testimonial.company}
                </p>
                <span className="inline-flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                  <BadgeCheck className="h-3 w-3 text-green-500" />
                  Verified customer
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all ${
              active === i ? "w-8 bg-primary" : "w-2 bg-gray-300 dark:bg-white/20 hover:bg-gray-400 dark:hover:bg-white/40"
            }`}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}
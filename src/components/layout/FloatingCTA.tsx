"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden p-4"
        >
          <div className="glass-strong rounded-2xl p-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium truncate text-gray-900 dark:text-white">Start booking meetings with AI</p>
            <div className="flex gap-2 shrink-0">
              <a href="/register" className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold">
                Start Free Trial
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
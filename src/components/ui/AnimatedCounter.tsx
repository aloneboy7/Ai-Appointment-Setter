"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({
  target,
  suffix = "",
  duration = 2000,
  className = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let cancelled = false;
    const delay = setTimeout(() => {
      if (cancelled) return;

      const steps = 60;
      const increment = target / steps;
      let current = 0;
      const stepTime = duration / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, stepTime);
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(delay);
    };
  }, [isVisible, target, duration]);

  const formatNum = (n: number) => {
    if (n >= 10000) return `${(n / 1000).toFixed(0)},000`;
    return n.toLocaleString();
  };

  return (
    <span ref={ref} className={className}>
      {formatNum(count)}
      {suffix}
    </span>
  );
}
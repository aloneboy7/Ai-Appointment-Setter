"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionWrapperProps {
  id?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  noPadding?: boolean;
}

export default function SectionWrapper({
  id,
  children,
  className,
  containerClassName,
  noPadding = false,
}: SectionWrapperProps) {
  return (
    <section id={id} className={cn("relative", !noPadding && "py-20 md:py-28", className)}>
      <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", containerClassName)}>
        {children}
      </div>
    </section>
  );
}
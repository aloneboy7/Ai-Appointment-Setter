"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useTheme } from "@/components/ui/ThemeToggle";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  const { theme } = useTheme();
  const overlayRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={`relative w-full max-w-lg rounded-2xl border p-6 ${
        isDark ? "bg-[#111827] border-white/10" : "bg-white border-gray-200 shadow-xl"
      }`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
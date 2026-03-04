"use client";

import { motion } from "motion/react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#080a0f] flex items-center justify-center px-4">
      {/* Fond décoratif — 4 blobs animés */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Ambre/or — top-left */}
        <motion.div
          className="absolute rounded-full"
          style={{
            top: "-15%",
            left: "-10%",
            width: 560,
            height: 560,
            background: "rgba(232,184,75,0.10)",
            filter: "blur(80px)",
            willChange: "transform",
          }}
          animate={{ x: [0, 18, -12, 0], y: [0, -14, 20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 0 }}
        />
        {/* Indigo — top-right */}
        <motion.div
          className="absolute rounded-full"
          style={{
            top: "5%",
            right: "-15%",
            width: 600,
            height: 600,
            background: "rgba(99,102,241,0.08)",
            filter: "blur(100px)",
            willChange: "transform",
          }}
          animate={{ x: [0, -18, 12, 0], y: [0, 14, -20, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        {/* Violet — bottom-center */}
        <motion.div
          className="absolute rounded-full"
          style={{
            bottom: "10%",
            left: "25%",
            width: 500,
            height: 500,
            background: "rgba(139,92,246,0.06)",
            filter: "blur(90px)",
            willChange: "transform",
          }}
          animate={{ x: [0, 12, -18, 0], y: [0, 20, -14, 0] }}
          transition={{ duration: 34, repeat: Infinity, ease: "easeInOut", delay: 8 }}
        />
        {/* Bleu — bottom-left */}
        <motion.div
          className="absolute rounded-full"
          style={{
            bottom: "-5%",
            left: "-5%",
            width: 480,
            height: 480,
            background: "rgba(59,130,246,0.05)",
            filter: "blur(70px)",
            willChange: "transform",
          }}
          animate={{ x: [0, 18, -12, 0], y: [0, -20, 14, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>
      {children}
    </div>
  );
}

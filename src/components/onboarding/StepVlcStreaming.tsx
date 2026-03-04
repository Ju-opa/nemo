"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, AlertTriangle, HardDrive } from "lucide-react";
import type { UserRole } from "@/hooks/use-profile";

interface StepVlcStreamingProps {
  role: UserRole;
  onNext: () => void;
}

type Platform = "ios" | "android" | "macos" | "windows" | "linux" | "unknown";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  if (/Macintosh|Mac OS X/.test(ua)) return "macos";
  if (/Windows/.test(ua)) return "windows";
  if (/Linux/.test(ua)) return "linux";
  return "unknown";
}

const VLC_LINKS: Record<Platform, { label: string; url: string; badge: string }[]> = {
  ios: [
    { label: "VLC pour iPhone & iPad", url: "https://apps.apple.com/fr/app/vlc-for-mobile/id650377962", badge: "App Store" },
  ],
  android: [
    { label: "VLC pour Android", url: "https://play.google.com/store/apps/details?id=org.videolan.vlc", badge: "Play Store" },
  ],
  macos: [
    { label: "VLC pour macOS", url: "https://www.videolan.org/vlc/download-macosx.html", badge: "videolan.org" },
  ],
  windows: [
    { label: "VLC pour Windows", url: "https://www.videolan.org/vlc/download-windows.html", badge: "videolan.org" },
  ],
  linux: [
    { label: "VLC pour Linux", url: "https://www.videolan.org/vlc/#download", badge: "videolan.org" },
  ],
  unknown: [
    { label: "iOS / iPhone", url: "https://apps.apple.com/fr/app/vlc-for-mobile/id650377962", badge: "App Store" },
    { label: "Android", url: "https://play.google.com/store/apps/details?id=org.videolan.vlc", badge: "Play Store" },
    { label: "macOS / Windows", url: "https://www.videolan.org/vlc/", badge: "videolan.org" },
  ],
};

// Logo VLC officiel (cône orange réaliste)
function VlcLogo({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="VLC media player"
    >
      {/* fond arrondi */}
      <rect width="512" height="512" rx="115" fill="#FF8800" />

      {/* ombre cône */}
      <ellipse cx="256" cy="340" rx="145" ry="18" fill="rgba(0,0,0,0.25)" />

      {/* cône blanc */}
      <path
        d="M256 72 L390 330 H122 Z"
        fill="white"
      />
      {/* ombre sur le cône */}
      <path
        d="M256 72 L390 330 H256 Z"
        fill="rgba(0,0,0,0.12)"
      />

      {/* bandes horizontales */}
      <rect x="108" y="338" width="296" height="36" rx="8" fill="white" />
      <rect x="130" y="384" width="252" height="28" rx="7" fill="white" opacity="0.7" />
      <rect x="155" y="422" width="202" height="22" rx="6" fill="white" opacity="0.45" />
    </svg>
  );
}

export default function StepVlcStreaming({ role, onNext }: StepVlcStreamingProps) {
  const [platform, setPlatform] = useState<Platform>("unknown");
  const isVip = role === "vip" || role === "admin";

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const links = VLC_LINKS[platform] ?? VLC_LINKS.unknown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      {/* Hero */}
      <div className="flex flex-col items-center pt-2 gap-3">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: "drop-shadow(0 0 28px rgba(255,136,0,0.5))" }}
        >
          <VlcLogo size={72} />
        </motion.div>

        <div className="text-center space-y-1">
          <h1 className="text-white font-black text-2xl sm:text-3xl leading-tight">
            Il te faut VLC
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">
            Le streaming passe par VLC — c&apos;est gratuit, léger, et ça marche sur tout.
            Tu dois l&apos;avoir installé sur ton appareil.
          </p>
        </div>
      </div>

      {/* Download links */}
      <div className="glass-tile rounded-2xl p-4 space-y-3">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">
          Télécharger VLC
        </p>
        {links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 group"
          >
            <span className="text-white/80 text-sm group-hover:text-white transition-colors">
              {link.label}
            </span>
            <span className="shrink-0 px-2.5 py-1 rounded-full bg-[#FF8800]/15 border border-[#FF8800]/25 text-[#FF8800] text-[11px] font-semibold">
              {link.badge}
            </span>
          </a>
        ))}
      </div>

      {/* VPN Warning */}
      <div className="flex gap-3 p-3.5 rounded-2xl bg-amber-500/8 border border-amber-500/20">
        <AlertTriangle className="size-4.5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-300 font-semibold text-sm">VPN conseillé</p>
          <p className="text-amber-400/70 text-xs mt-0.5 leading-relaxed">
            Pour préserver ta vie privée, utilise un VPN quand tu streames.
          </p>
        </div>
      </div>

      {/* Jellyfin section — VIP only */}
      {isVip && (
        <div className="flex gap-3 p-3.5 rounded-2xl bg-nemo-accent/8 border border-nemo-accent/20">
          <HardDrive className="size-4.5 text-nemo-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-nemo-accent font-semibold text-sm">Jellyfin inclus</p>
            <p className="text-nemo-accent/60 text-xs mt-0.5 leading-relaxed">
              Ton serveur Jellyfin est déjà configuré — tu peux aussi télécharger directement dans ta bibliothèque.
            </p>
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 bg-nemo-accent hover:bg-[#f0c85a] active:scale-95 text-black font-semibold py-4 rounded-2xl transition-all text-base"
      >
        C&apos;est noté !
        <ArrowRight className="size-5" />
      </button>
    </motion.div>
  );
}

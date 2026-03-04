"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  UserPlus,
  ArrowRight,
  Clapperboard,
  List,
  Eye,
  Star,
  ScrollText,
} from "lucide-react";
import { InviteModal } from "@/components/invite/InviteModal";
import type { UserRole } from "@/hooks/use-profile";

interface StepInviteFriendsProps {
  role: UserRole;
  onNext: () => void;
}

const FEATURES = [
  {
    icon: Clapperboard,
    title: "Streaming gratuit",
    desc: "Tous les films, zéro abonnement",
  },
  {
    icon: List,
    title: "Listes partagées",
    desc: "Faites des listes ensemble",
  },
  {
    icon: Eye,
    title: "Activité",
    desc: "Vois ce qu'ils regardent",
  },
  {
    icon: Star,
    title: "Avis & notes",
    desc: "Échangez vos critiques",
  },
  {
    icon: ScrollText,
    title: "Historique",
    desc: "Retrouve tous tes visionnages",
  },
];

export default function StepInviteFriends({ role, onNext }: StepInviteFriendsProps) {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <>
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
            className="size-18 rounded-full bg-nemo-accent/15 border-2 border-nemo-accent/30 flex items-center justify-center"
            style={{ boxShadow: "0 0 40px rgba(232,184,75,0.2)" }}
          >
            <UserPlus className="size-8 text-nemo-accent" />
          </motion.div>

          <div className="text-center space-y-1.5">
            <h1 className="text-white font-black text-2xl sm:text-3xl leading-tight">
              Partage avec tes amis !
            </h1>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">
              C&apos;est gratuit pour eux — ils accèdent à tous les films du monde. La fête !
            </p>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.06 }}
                className={`glass-tile p-3.5 rounded-2xl space-y-2 ${
                  i === FEATURES.length - 1 && FEATURES.length % 2 !== 0
                    ? "col-span-2 flex items-center gap-4 space-y-0"
                    : ""
                }`}
              >
                <div className="size-9 rounded-xl bg-nemo-accent/12 flex items-center justify-center">
                  <Icon className="size-4 text-nemo-accent" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-white/45 text-xs mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Boutons */}
        <div className="space-y-3">
          <button
            onClick={() => setInviteOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-nemo-accent hover:bg-[#f0c85a] active:scale-95 text-black font-semibold py-4 rounded-2xl transition-all text-base"
          >
            <UserPlus className="size-5" />
            Inviter un ami
          </button>

          <button
            onClick={onNext}
            className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-white/70 py-3 transition-colors text-sm"
          >
            Continuer
            <ArrowRight className="size-4" />
          </button>
        </div>
      </motion.div>

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        userRole={role}
      />
    </>
  );
}

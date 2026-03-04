"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Mail, UserPlus, Loader2, Star, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ─── Animation constants ───────────────────────────────────────────────────────

const EASE_CARD = [0.32, 0.72, 0, 1] as const;
const SPRING_BTN = { type: "spring", stiffness: 400, damping: 20 } as const;

function childVariants(n: number) {
  return {
    initial: { opacity: 0, y: 12 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, delay: 0.08 + n * 0.065, ease: EASE_CARD },
    },
  };
}

// ─── Badge d'invitation ───────────────────────────────────────────────────────

const ROLE_CONFIG = {
  vip: {
    label: "Accès VIP",
    description: "Téléchargement Jellyfin inclus · Tous les services activés",
    icon: Star,
    color: "text-[#e8b84b]",
    bg: "bg-[#e8b84b]/10 border-[#e8b84b]/30",
  },
  sources: {
    label: "Accès Sources",
    description: "Accès aux sources de streaming StreamFusion",
    icon: Zap,
    color: "text-violet-400",
    bg: "bg-violet-400/10 border-violet-400/30",
  },
  free: {
    label: "Compte standard",
    description: "Accès de base à la plateforme",
    icon: UserPlus,
    color: "text-white/60",
    bg: "bg-white/5 border-white/15",
  },
} as const;

// ─── SuccessScreen ─────────────────────────────────────────────────────────────

function SuccessScreen({
  email,
  emailConfirmationRequired,
  inviteRole,
  resendCooldown,
  resendLoading,
  onResend,
}: {
  email: string;
  emailConfirmationRequired: boolean;
  inviteRole: "free" | "sources" | "vip" | null;
  resendCooldown: number;
  resendLoading: boolean;
  onResend: () => void;
}) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -16 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="relative w-full max-w-md"
    >
      <div className="glass-strong rounded-3xl p-8 shadow-2xl text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
            className={cn(
              "flex items-center justify-center size-20 rounded-full",
              emailConfirmationRequired
                ? "bg-amber-500/20 text-amber-400"
                : "bg-green-500/20 text-green-400"
            )}
          >
            {emailConfirmationRequired ? (
              <Mail className="size-10 animate-pulse" />
            ) : (
              <UserPlus className="size-10" />
            )}
          </motion.div>
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.22 }}
          className="text-white text-2xl font-bold mb-3"
        >
          {emailConfirmationRequired ? "Vérifiez votre email" : "Compte créé !"}
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.28 }}
          className="text-white/60 text-sm leading-relaxed mb-8"
        >
          {emailConfirmationRequired ? (
            <>
              Un email de confirmation a été envoyé à{" "}
              <span className="text-white font-medium">{email}</span>. Cliquez sur le lien dans
              l&apos;email pour activer votre compte.
            </>
          ) : inviteRole === "vip" ? (
            "Bienvenue ! Votre accès VIP est activé. Redirection en cours…"
          ) : (
            "Votre compte a bien été créé. Redirection en cours…"
          )}
        </motion.p>

        {emailConfirmationRequired && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.34 }}
            className="space-y-3"
          >
            {/* Polling indicator */}
            <div className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white/6 border border-white/10 text-white/50 text-sm font-medium min-h-[44px]">
              <Loader2 className="size-4 animate-spin text-[#e8b84b]" />
              En attente de confirmation…
            </div>

            {/* Resend */}
            <motion.button
              onClick={onResend}
              disabled={resendCooldown > 0 || resendLoading}
              whileTap={{ scale: 0.96 }}
              transition={SPRING_BTN}
              className={cn(
                "w-full text-sm font-medium min-h-[44px] px-4 rounded-xl transition-all",
                "text-[#e8b84b] hover:text-[#f0c85a] border border-[#e8b84b]/20 hover:border-[#e8b84b]/40 bg-[#e8b84b]/5 hover:bg-[#e8b84b]/10",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {resendLoading
                ? "Envoi…"
                : resendCooldown > 0
                  ? `Renvoyer l'email (${resendCooldown}s)`
                  : "Renvoyer l'email"}
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Composant interne (accès aux searchParams via Suspense) ──────────────────

function InscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorKey, setErrorKey] = useState(0);
  const [success, setSuccess] = useState(false);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  // État du token d'invitation
  const [inviteStatus, setInviteStatus] = useState<"checking" | "valid" | "invalid" | "none">(
    inviteToken ? "checking" : "none"
  );
  const [inviteRole, setInviteRole] = useState<"free" | "sources" | "vip" | null>(null);

  // Valider le token d'invitation au chargement
  useEffect(() => {
    if (!inviteToken) return;

    void fetch(`/api/invite/validate?token=${encodeURIComponent(inviteToken)}`)
      .then((r) => r.json())
      .then((data: { valid: boolean; role?: "free" | "sources" | "vip" }) => {
        if (data.valid) {
          setInviteStatus("valid");
          setInviteRole(data.role ?? "vip");
        } else {
          setInviteStatus("invalid");
        }
      })
      .catch(() => setInviteStatus("invalid"));
  }, [inviteToken]);

  // Countdown pour le bouton resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Polling session après envoi de l'email de confirmation
  useEffect(() => {
    if (!success || !emailConfirmationRequired) return;
    const supabase = createClient();
    let cancelled = false;

    const poll = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session && !cancelled) {
        // Tenter redeem invite si présent
        if (inviteToken && inviteStatus === "valid") {
          try {
            await fetch("/api/invite/redeem", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: inviteToken }),
            });
          } catch {
            // silently ignore — invite redemption is best-effort
          }
        }
        router.push(inviteRole === "vip" ? "/" : "/onboarding");
        router.refresh();
      }
    };

    const interval = setInterval(() => void poll(), 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [success, emailConfirmationRequired, inviteToken, inviteStatus, inviteRole, router]);

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/connexion${inviteToken ? `?invite=${encodeURIComponent(inviteToken)}` : ""}`,
        },
      });
      setResendCooldown(60);
    } catch {
      // silently ignore
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setErrorKey((k) => k + 1);
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim() || email.split("@")[0],
          },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/connexion${inviteToken ? `?invite=${encodeURIComponent(inviteToken)}` : ""}`
              : undefined,
        },
      });

      if (authError) throw new Error(authError.message);

      // Activer le token si session active immédiatement
      if (authData.session && inviteToken && inviteStatus === "valid") {
        try {
          await fetch("/api/invite/redeem", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: inviteToken }),
          });
        } catch {
          console.warn("[inscription] Impossible d'activer le token d'invitation");
        }
      }

      const needsEmailConfirmation = !authData.session;
      setEmailConfirmationRequired(needsEmailConfirmation);
      setSuccess(true);

      if (!needsEmailConfirmation) {
        const destination = inviteRole === "vip" ? "/" : "/onboarding";
        setTimeout(() => {
          router.push(destination);
          router.refresh();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création du compte");
      setErrorKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {success ? (
        <SuccessScreen
          key="success"
          email={email}
          emailConfirmationRequired={emailConfirmationRequired}
          inviteRole={inviteRole}
          resendCooldown={resendCooldown}
          resendLoading={resendLoading}
          onResend={() => void handleResend()}
        />
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: EASE_CARD }}
          className="relative w-full max-w-md"
        >
          <div className="glass-strong rounded-3xl p-8 shadow-2xl">
            {/* Logo — n=0 */}
            <motion.div {...childVariants(0)}>
              <Link href="/" className="block text-center mb-8">
                <span className="text-nemo-accent font-black text-3xl tracking-widest">NEMO</span>
              </Link>
            </motion.div>

            {/* Heading — n=1 */}
            <motion.div {...childVariants(1)}>
              <h1 className="text-white text-2xl font-bold text-center mb-2 text-balance">
                Créer un compte
              </h1>
              <p className="text-white/50 text-sm text-center mb-6">
                Rejoignez Nemo pour accéder à votre bibliothèque personnelle
              </p>
            </motion.div>

            {/* Badge invitation — n=2 (conditionnel) */}
            {inviteToken && (
              <motion.div {...childVariants(2)} className="mb-6">
                {inviteStatus === "checking" && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                    <Loader2 className="size-4 text-white/40 animate-spin shrink-0" />
                    <p className="text-white/50 text-sm">Vérification de l'invitation…</p>
                  </div>
                )}

                {inviteStatus === "valid" &&
                  inviteRole &&
                  (() => {
                    const cfg = ROLE_CONFIG[inviteRole];
                    const Icon = cfg.icon;
                    return (
                      <div className={cn("flex items-start gap-3 px-4 py-3 rounded-xl border", cfg.bg)}>
                        <Icon className={cn("size-5 shrink-0 mt-0.5", cfg.color)} />
                        <div>
                          <p className={cn("text-sm font-semibold", cfg.color)}>{cfg.label}</p>
                          <p className="text-white/50 text-xs mt-0.5">{cfg.description}</p>
                        </div>
                      </div>
                    );
                  })()}

                {inviteStatus === "invalid" && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/25">
                    <p className="text-red-400 text-sm">Lien d'invitation invalide ou expiré</p>
                  </div>
                )}
              </motion.div>
            )}

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
              {/* Nom — n=3 */}
              <motion.div {...childVariants(3)}>
                <label htmlFor="display_name" className="block text-white/70 text-sm mb-1.5">
                  Nom affiché
                </label>
                <div
                  className={cn(
                    "rounded-xl transition-shadow duration-200",
                    nameFocused &&
                      "shadow-[0_0_0_2px_rgba(232,184,75,0.35),0_0_16px_rgba(232,184,75,0.15)]"
                  )}
                >
                  <input
                    id="display_name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    placeholder="Votre prénom ou pseudo"
                    autoComplete="name"
                    className="w-full glass px-4 py-3 rounded-xl text-white placeholder:text-white/30 text-sm outline-none border border-white/8 focus:border-nemo-accent/40 transition-colors min-h-[44px]"
                  />
                </div>
              </motion.div>

              {/* Email — n=4 */}
              <motion.div {...childVariants(4)}>
                <label htmlFor="email" className="block text-white/70 text-sm mb-1.5">
                  Adresse email
                </label>
                <div
                  className={cn(
                    "rounded-xl transition-shadow duration-200",
                    emailFocused &&
                      "shadow-[0_0_0_2px_rgba(232,184,75,0.35),0_0_16px_rgba(232,184,75,0.15)]"
                  )}
                >
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="vous@exemple.fr"
                    required
                    autoComplete="email"
                    className="w-full glass px-4 py-3 rounded-xl text-white placeholder:text-white/30 text-sm outline-none border border-white/8 focus:border-nemo-accent/40 transition-colors min-h-[44px]"
                  />
                </div>
              </motion.div>

              {/* Password — n=5 */}
              <motion.div {...childVariants(5)}>
                <label htmlFor="password" className="block text-white/70 text-sm mb-1.5">
                  Mot de passe
                  <span className="text-white/30 font-normal ml-1.5">(8 caractères minimum)</span>
                </label>
                <div
                  className={cn(
                    "rounded-xl transition-shadow duration-200",
                    passwordFocused &&
                      "shadow-[0_0_0_2px_rgba(232,184,75,0.35),0_0_16px_rgba(232,184,75,0.15)]"
                  )}
                >
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full glass px-4 py-3 pr-12 rounded-xl text-white placeholder:text-white/30 text-sm outline-none border border-white/8 focus:border-nemo-accent/40 transition-colors min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Error shake */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    key={errorKey}
                    role="alert"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, x: [0, -6, 6, -4, 4, -2, 2, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ opacity: { duration: 0.15 }, x: { duration: 0.4 } }}
                    className="text-[#e63946] text-sm px-1"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit — n=6 */}
              <motion.div {...childVariants(6)}>
                <motion.button
                  type="submit"
                  disabled={loading || !email || !password}
                  whileTap={{ scale: 0.96 }}
                  transition={SPRING_BTN}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all min-h-[44px]",
                    "bg-nemo-accent hover:bg-[#f0c85a] text-black",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {loading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <UserPlus className="size-5" />
                  )}
                  {loading ? "Création en cours..." : "Créer mon compte"}
                </motion.button>
              </motion.div>
            </form>

            {/* Lien connexion — n=7 */}
            <motion.div {...childVariants(7)}>
              <div className="mt-6 text-center text-sm text-white/50">
                Déjà un compte ?{" "}
                <Link
                  href="/connexion"
                  className="text-nemo-accent hover:text-[#f0c85a] font-medium transition-colors"
                >
                  Se connecter
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Page wrapper avec Suspense (useSearchParams requiert Suspense) ────────────

export default function InscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="relative w-full max-w-md">
          <div className="glass-strong rounded-3xl p-8 shadow-2xl flex items-center justify-center min-h-80">
            <Loader2 className="size-8 text-nemo-accent animate-spin" />
          </div>
        </div>
      }
    >
      <InscriptionContent />
    </Suspense>
  );
}

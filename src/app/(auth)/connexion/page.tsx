"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

const SPRING_BTN = { type: "spring", stiffness: 400, damping: 20 } as const;
const EASE_CARD = [0.32, 0.72, 0, 1] as const;

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

function ConnexionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const inviteToken = searchParams.get("invite");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorKey, setErrorKey] = useState(0);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Après confirmation email : user authentifié + invite dans l'URL → activer le token
  useEffect(() => {
    if (!user || !inviteToken) return;

    void (async () => {
      try {
        const res = await fetch("/api/invite/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: inviteToken }),
        });
        const data = (await res.json()) as { ok?: boolean; role?: string };
        const destination = data.role === "vip" ? "/" : "/onboarding";
        router.replace(destination);
        router.refresh();
      } catch {
        router.replace("/");
        router.refresh();
      }
    })();
  }, [user, inviteToken, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (
          authError.message.toLowerCase().includes("invalid") ||
          authError.message.toLowerCase().includes("email") ||
          authError.message.toLowerCase().includes("password")
        ) {
          throw new Error("Email ou mot de passe incorrect");
        }
        throw new Error(authError.message);
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
      setErrorKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_CARD }}
      className="relative w-full max-w-md"
    >
      <div className="glass-strong rounded-3xl p-8 shadow-2xl">
        {/* Logo — n=0 */}
        <motion.div {...childVariants(0)}>
          <Link href="/" className="block text-center mb-8">
            <span className="text-[#e8b84b] font-black text-3xl tracking-widest">NEMO</span>
          </Link>
        </motion.div>

        {/* Heading — n=1 */}
        <motion.div {...childVariants(1)}>
          <h1 className="text-white text-2xl font-bold text-center mb-2 text-balance">
            Bon retour !
          </h1>
          <p className="text-white/50 text-sm text-center mb-8">
            Connectez-vous à votre compte Nemo
          </p>
        </motion.div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
          {/* Email — n=2 */}
          <motion.div {...childVariants(2)}>
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
                className="w-full glass px-4 py-3 rounded-xl text-white placeholder:text-white/30 text-sm outline-none border border-white/8 focus:border-[#e8b84b]/40 transition-colors min-h-[44px]"
              />
            </div>
          </motion.div>

          {/* Password — n=3 */}
          <motion.div {...childVariants(3)}>
            <label htmlFor="password" className="block text-white/70 text-sm mb-1.5">
              Mot de passe
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
                  autoComplete="current-password"
                  className="w-full glass px-4 py-3 pr-12 rounded-xl text-white placeholder:text-white/30 text-sm outline-none border border-white/8 focus:border-[#e8b84b]/40 transition-colors min-h-[44px]"
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

          {/* Submit — n=4 */}
          <motion.div {...childVariants(4)}>
            <motion.button
              type="submit"
              disabled={loading || !email || !password}
              whileTap={{ scale: 0.96 }}
              transition={SPRING_BTN}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all min-h-[44px]",
                "bg-[#e8b84b] hover:bg-[#f0c85a] text-black",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <LogIn className="size-5" />
              )}
              {loading ? "Connexion..." : "Se connecter"}
            </motion.button>
          </motion.div>
        </form>

        {/* Lien inscription — n=5 */}
        <motion.div {...childVariants(5)}>
          <div className="mt-6 text-center text-sm text-white/50">
            Pas de compte ?{" "}
            <Link
              href="/inscription"
              className="text-[#e8b84b] hover:text-[#f0c85a] font-medium transition-colors"
            >
              Créer un compte
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense
      fallback={
        <div className="relative w-full max-w-md">
          <div className="glass-strong rounded-3xl p-8 shadow-2xl flex items-center justify-center min-h-80">
            <Loader2 className="size-8 text-[#e8b84b] animate-spin" />
          </div>
        </div>
      }
    >
      <ConnexionContent />
    </Suspense>
  );
}

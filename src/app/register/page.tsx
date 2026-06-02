"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Zap, Mail, Lock, User, ArrowRight, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/components/ui/ThemeToggle";
import Button from "@/components/shared/Button";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function getPasswordStrength(password: string): { label: string; color: string; width: string; score: number } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "w-1/3", score };
  if (score <= 3) return { label: "Fair", color: "bg-amber-500", width: "w-2/3", score };
  return { label: "Strong", color: "bg-green-500", width: "w-full", score };
}

export default function RegisterPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol = /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const result = await signIn("google", { callbackUrl: "/dashboard" });
      if (result?.error) {
        setError("Google sign-in failed. Please try again.");
        setGoogleLoading(false);
      }
    } catch {
      setError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!hasMinLength) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!hasNumberOrSymbol) {
      setError("Password must contain a number or symbol");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.ok) {
          router.push("/dashboard");
          router.refresh();
        } else {
          router.push("/login?registered=true");
        }
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-gray-400 ${
    isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"
  }`;

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? "bg-[#0B1020]" : "bg-gray-50"}`}>
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              AI <span className="gradient-text">Appointment</span> Setter
            </span>
          </a>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Create your account</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Start your free 14-day trial. No credit card required.</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 hover:bg-gray-50 font-medium rounded-xl px-4 py-3 text-sm transition-colors border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                <GoogleIcon className="h-5 w-5" />
                Sign up with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDark ? "border-white/10" : "border-gray-200"}`} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className={`px-3 ${isDark ? "bg-[#0B1020]" : "bg-gray-50"} text-gray-400`}>or sign up with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" required className={inputCls} />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Work email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required className={inputCls} />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className={`w-full rounded-xl pl-10 pr-10 py-3 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-gray-400 ${
                    isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password requirements */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs">
                    {hasMinLength ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
                    )}
                    <span className={hasMinLength ? "text-green-600 dark:text-green-400" : "text-gray-500"}>
                      Must be at least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    {hasNumberOrSymbol ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
                    )}
                    <span className={hasNumberOrSymbol ? "text-green-600 dark:text-green-400" : "text-gray-500"}>
                      Must contain a number or symbol
                    </span>
                  </div>
                  {/* Strength bar */}
                  <div className="pt-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${strength.color} ${strength.width} rounded-full transition-all duration-300`} />
                      </div>
                      <span className={`text-xs font-medium ${
                        strength.label === "Weak" ? "text-red-500" : strength.label === "Fair" ? "text-amber-500" : "text-green-500"
                      }`}>
                        {strength.label}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  minLength={8}
                  className={`w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-gray-400 ${
                    isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"
                  }`}
                />
              </div>
              {passwordsMatch && (
                <p className="mt-1.5 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match
                </p>
              )}
              {passwordsMismatch && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" /> Passwords do not match
                </p>
              )}
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            By signing up, you agree to our <a href="/terms" className="text-primary hover:underline">Terms</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { MessageSquare } from "lucide-react";

export default function SignupPage() {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6 inline-flex items-center gap-2">
            <MessageSquare className="h-7 w-7 text-indigo-500" />
            <span className="text-xl font-bold">ReviewPulse</span>
          </div>
          <div className="glow-card rounded-2xl p-8">
            <div className="mb-4 text-4xl">📧</div>
            <h2 className="mb-2 text-xl font-bold">Check your email</h2>
            <p className="text-sm text-gray-400">
              We&apos;ve sent you a confirmation link. Click it to activate your
              account and get started.
            </p>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            <Link href="/login" className="text-indigo-400 transition hover:text-indigo-300">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-2">
            <MessageSquare className="h-7 w-7 text-indigo-500" />
            <span className="text-xl font-bold">ReviewPulse</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-gray-400">
            Start managing reviews for free
          </p>
        </div>

        <div className="glow-card rounded-2xl p-8">
          <button
            onClick={handleGoogleSignup}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 py-3 text-sm font-medium transition hover:bg-white/5"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-500">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Business Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                placeholder="Acme Plumbing"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                placeholder="Min. 8 characters"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 transition hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

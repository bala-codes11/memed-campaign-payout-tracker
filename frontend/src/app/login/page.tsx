
"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type User = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

type LoginResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  user?: User;
  data?: {
    token?: string;
    user?: User;
  };
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const token = result.token ?? result.data?.token;
      const user = result.user ?? result.data?.user;

      if (!token || !user) {
        throw new Error(
          result.message || "Invalid login response from the server."
        );
      }

      if (user.role !== "brand" && user.role !== "creator") {
        throw new Error("Your account has an invalid role.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("memed_token", token);
      localStorage.setItem("memed_user", JSON.stringify(user));

      router.replace(
        user.role === "brand"
          ? "/dashboards/brand"
          : "/dashboards/creator"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-white text-[#181818] selection:bg-[#ed2929] selection:text-white">
      {/* Subtle background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(#181818 0.7px, transparent 0.7px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="pointer-events-none absolute -right-40 top-24 h-96 w-96 rounded-full bg-red-50/80 blur-[100px]" />

      {/* Navigation */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ed2929] text-xl font-black text-white">
            m.
          </span>

          <span className="text-2xl font-bold tracking-tight">
            meme&apos;d<span className="text-[#ed2929]">.</span>
          </span>
        </Link>

        <Link
          href="/signup"
          className="rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold transition hover:border-[#ed2929] hover:text-[#ed2929] sm:px-5"
        >
          New here? <span className="text-[#ed2929]">Sign up ↗</span>
        </Link>
      </header>

      {/* Main layout */}
      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[1fr_0.78fr] lg:gap-24">
          {/* Left: Brand message */}
          <div className="mx-auto w-full max-w-xl lg:mx-0">
            <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-red-100 bg-red-50/70 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-[#ed2929]" />
              <span className="text-xs font-semibold text-[#c92525]">
                Welcome back to Meme&apos;d
              </span>
            </div>

            <h1 className="text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
              Oh, you&apos;re
              <br />
              <span className="text-[#ed2929]">back!</span>
            </h1>

            <p className="mt-7 max-w-md text-base leading-7 text-gray-500 sm:text-lg sm:leading-8">
              Great content deserves great rewards. Sign in to manage your
              campaigns, connect with creators, and keep your next big idea
              moving.
            </p>

            {/* Simple brand signature */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white bg-[#ed2929] text-sm font-bold text-white">
                  B
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white bg-[#181818] text-sm font-bold text-white">
                  C
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white bg-red-100 text-lg text-[#ed2929]">
                  +
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold">Brands meet creators.</p>
                <p className="mt-1 text-xs text-gray-500">
                  One place to create, collaborate and earn.
                </p>
              </div>
            </div>

            {/* Understated visual accent */}
            <div className="mt-12 hidden max-w-md items-center gap-3 sm:flex">
              <div className="h-1 w-16 rounded-full bg-[#ed2929]" />
              <div className="h-1 w-8 rounded-full bg-red-200" />
              <div className="h-1 w-3 rounded-full bg-red-100" />
            </div>
          </div>

          {/* Right: Login form */}
          <div className="mx-auto w-full max-w-[430px] lg:ml-auto">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ed2929]">
                YOUR ACCOUNT
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Sign in
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Enter your details to continue to your workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2.5 block text-sm font-semibold text-[#252525]"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-[#fafafa] px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-[#ed2929] focus:bg-white focus:ring-4 focus:ring-red-50"
                />
              </div>

              <div>
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-[#252525]"
                  >
                    Password
                  </label>
                </div>

                <div className="flex rounded-xl border border-gray-200 bg-[#fafafa] transition hover:border-gray-300 focus-within:border-[#ed2929] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-gray-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="px-4 text-xs font-semibold text-gray-500 transition hover:text-[#ed2929]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-between gap-3 rounded-xl bg-[#ed2929] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#d92323] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>
                  {loading ? "Signing in..." : "Sign in to your account"}
                </span>

                <span className="text-lg transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[#ed2929] transition hover:text-[#b91c1c]"
              >
                Create one
              </Link>
            </p>

            <p className="mt-8 text-center text-xs leading-5 text-gray-400">
              By signing in, you agree to follow the applicable campaign terms.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-5 text-xs text-gray-400 sm:px-8 lg:px-12">
        <span>© 2026 Meme&apos;d</span>
        <Link href="/" className="transition hover:text-[#ed2929]">
          Back to home →
        </Link>
      </footer>
    </main>
  );
}

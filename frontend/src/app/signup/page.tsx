
"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type User = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

type SignupResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  user?: User;
  data?: {
    token?: string;
    user?: User;
  };
};

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"brand" | "creator">("creator");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedRole = params.get("role");

    if (requestedRole === "brand" || requestedRole === "creator") {
      setRole(requestedRole);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
      setError("Please enter a name with at least 2 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await apiRequest<SignupResponse>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: normalizedName,
          email: normalizedEmail,
          password,
          role,
        }),
      });

      const token = result.token ?? result.data?.token;
      const user = result.user ?? result.data?.user;

      if (!token || !user) {
        throw new Error(
          result.message ||
            "Account creation response is missing the token or user details."
        );
      }

      if (user.role !== "brand" && user.role !== "creator") {
        throw new Error("Your account was created with an invalid role.");
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
          : "Unable to create your account. Please try again."
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

      {/* Header */}
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
          href="/login"
          className="rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold transition hover:border-[#ed2929] hover:text-[#ed2929] sm:px-5"
        >
          Already a member?{" "}
          <span className="text-[#ed2929]">Sign in ↗</span>
        </Link>
      </header>

      {/* Main signup layout */}
      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="grid w-full items-start gap-12 lg:grid-cols-[0.85fr_1fr] lg:items-center lg:gap-24">
          {/* Left: Brand introduction */}
          <div className="mx-auto w-full max-w-lg lg:mx-0">
            <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-red-100 bg-red-50/70 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-[#ed2929]" />
              <span className="text-xs font-semibold text-[#c92525]">
                One account. More possibilities.
              </span>
            </div>

            <h1 className="text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
              Your next
              <br />
              big thing
              <br />
              starts <span className="text-[#ed2929]">here.</span>
            </h1>

            <p className="mt-7 max-w-md text-base leading-7 text-gray-500 sm:text-lg sm:leading-8">
              Join Meme&apos;d to launch campaigns, collaborate with creators,
              and turn great content into meaningful results.
            </p>

            {/* Role benefits */}
            <div className="mt-10 space-y-5">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-lg font-bold text-[#ed2929]">
                  ↗
                </span>

                <div>
                  <p className="text-sm font-semibold">For creators</p>
                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Discover campaigns, submit content, and track your
                    earnings.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-lg font-bold text-[#ed2929]">
                  ◈
                </span>

                <div>
                  <p className="text-sm font-semibold">For brands</p>
                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Create campaigns, manage budgets, and organize creator
                    collaborations.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 hidden items-center gap-3 sm:flex">
              <div className="h-1 w-16 rounded-full bg-[#ed2929]" />
              <div className="h-1 w-8 rounded-full bg-red-200" />
              <div className="h-1 w-3 rounded-full bg-red-100" />
            </div>
          </div>

          {/* Right: Signup form */}
          <div className="mx-auto w-full max-w-[500px] lg:ml-auto">
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ed2929]">
                GET STARTED
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Create your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                A few details and you&apos;re ready to go.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold"
                >
                  Full name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gray-200 bg-[#fafafa] px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-[#ed2929] focus:bg-white focus:ring-4 focus:ring-red-50"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold"
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

              {/* Role selector */}
              <fieldset>
                <legend className="mb-2.5 text-sm font-semibold">
                  I&apos;m joining as a
                </legend>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    aria-pressed={role === "creator"}
                    onClick={() => setRole("creator")}
                    className={`rounded-xl border p-4 text-left transition ${
                      role === "creator"
                        ? "border-[#ed2929] bg-red-50/70 ring-1 ring-[#ed2929]/20"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">Creator</span>
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          role === "creator"
                            ? "border-[#ed2929] bg-[#ed2929] text-[10px] text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {role === "creator" ? "✓" : ""}
                      </span>
                    </span>

                    <span className="mt-1.5 block text-xs leading-5 text-gray-500">
                      Create content and earn.
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={role === "brand"}
                    onClick={() => setRole("brand")}
                    className={`rounded-xl border p-4 text-left transition ${
                      role === "brand"
                        ? "border-[#ed2929] bg-red-50/70 ring-1 ring-[#ed2929]/20"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">Brand</span>
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          role === "brand"
                            ? "border-[#ed2929] bg-[#ed2929] text-[10px] text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {role === "brand" ? "✓" : ""}
                      </span>
                    </span>

                    <span className="mt-1.5 block text-xs leading-5 text-gray-500">
                      Launch campaigns and collaborate.
                    </span>
                  </button>
                </div>
              </fieldset>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold"
                >
                  Password
                </label>

                <div className="flex rounded-xl border border-gray-200 bg-[#fafafa] transition hover:border-gray-300 focus-within:border-[#ed2929] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
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

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold"
                >
                  Confirm password
                </label>

                <div className="flex rounded-xl border border-gray-200 bg-[#fafafa] transition hover:border-gray-300 focus-within:border-[#ed2929] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Re-enter your password"
                    className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-gray-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    className="px-4 text-xs font-semibold text-gray-500 transition hover:text-[#ed2929]"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
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
                  {loading
                    ? "Creating your account..."
                    : `Create ${role} account`}
                </span>

                <span className="text-lg transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#ed2929] transition hover:text-[#b91c1c]"
              >
                Sign in
              </Link>
            </p>

            <p className="mt-5 text-center text-xs leading-5 text-gray-400">
              Your selected role determines which workspace you can access.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-5 text-xs text-gray-400 sm:px-8 lg:px-12">
        <span>© 2026 Meme&apos;d</span>

        <Link
          href="/"
          className="transition hover:text-[#ed2929]"
        >
          Back to home →
        </Link>
      </footer>
    </main>
  );
}

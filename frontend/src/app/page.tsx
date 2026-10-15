
"use client";

import Link from "next/link";
import { useState } from "react";

const features = [
  {
    number: "01",
    icon: "◈",
    title: "Campaign management",
    description:
      "Create campaigns, define budgets, and manage creator collaborations from one place.",
  },
  {
    number: "02",
    icon: "↗",
    title: "Performance-based payouts",
    description:
      "Set view milestones and connect creator performance with transparent rewards.",
  },
  {
    number: "03",
    icon: "◎",
    title: "Transparent tracking",
    description:
      "Keep content submissions, views, earnings, and campaign spending organized.",
  },
  {
    number: "04",
    icon: "⌘",
    title: "Workspaces for everyone",
    description:
      "Give brands and creators dedicated workspaces designed around their needs.",
  },
];

const brandSteps = [
  {
    number: "01",
    title: "Create a campaign",
    description: "Choose a platform, set a budget, and define payout milestones.",
  },
  {
    number: "02",
    title: "Manage participation",
    description: "Keep creator submissions and campaign activity organized.",
  },
  {
    number: "03",
    title: "Track your spending",
    description: "Monitor payouts and understand your remaining campaign budget.",
  },
];

const creatorSteps = [
  {
    number: "01",
    title: "Discover campaigns",
    description: "Explore available campaigns and their payout milestones.",
  },
  {
    number: "02",
    title: "Share your content",
    description: "Submit your public content link to the campaign you choose.",
  },
  {
    number: "03",
    title: "Track your rewards",
    description: "Follow your submissions, views, and eligible earnings.",
  },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-white text-neutral-900 selection:bg-red-200 selection:text-red-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-xl">
        <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-xl font-black text-white shadow-lg shadow-red-600/20">
              M
            </span>
            <span className="text-xl font-extrabold tracking-tight">
              meme’d<span className="text-red-600">.</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-neutral-600 transition hover:text-red-600">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-neutral-600 transition hover:text-red-600">
              How it works
            </a>
            <a href="#for-everyone" className="text-sm font-medium text-neutral-600 transition hover:text-red-600">
              For brands & creators
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-red-50 hover:text-red-600"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/15 transition hover:bg-red-700"
            >
              Get started <span className="ml-1">↗</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-xl md:hidden"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-neutral-200 bg-white px-5 py-5 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-4">
              <a href="#features" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-neutral-700">
                Features
              </a>
              <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-neutral-700">
                How it works
              </a>
              <a href="#for-everyone" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-neutral-700">
                For brands & creators
              </a>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-xl border border-neutral-200 py-3 text-center text-sm font-semibold">
                Log in
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="rounded-xl bg-red-600 py-3 text-center text-sm font-semibold text-white">
                Get started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero: No dashboard preview */}
      <section className="relative">
        <div className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full bg-red-100/80 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-72 h-80 w-80 rounded-full bg-rose-50 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-32">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-red-600" />
              Built for the creator economy
            </div>

            <h1 className="mt-8 max-w-2xl text-5xl font-black leading-[1.08] tracking-[-0.055em] sm:text-6xl lg:text-[76px]">
              Turn viral
              <br />
              content into
              <br />
              <span className="text-red-600">real rewards.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-neutral-600 sm:text-lg">
              One simple platform for brands to manage campaign budgets and
              creators to submit content, track performance, and follow their
              earnings. Less guesswork. More transparency.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup?role=brand"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700"
              >
                Start a campaign <span>↗</span>
              </Link>
              <Link
                href="/signup?role=creator"
                className="inline-flex items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-6 py-4 text-sm font-bold text-neutral-800 transition hover:border-red-300 hover:bg-red-50"
              >
                Join as a creator <span>→</span>
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-neutral-600">
              <span><span className="mr-2 font-bold text-red-600">✓</span>Clear milestones</span>
              <span><span className="mr-2 font-bold text-red-600">✓</span>Budget visibility</span>
              <span><span className="mr-2 font-bold text-red-600">✓</span>Transparent rewards</span>
            </div>
          </div>

          {/* Creative illustration instead of a dashboard */}
          <div className="relative mx-auto w-full max-w-xl py-5 sm:py-10">
            <div className="absolute inset-8 rounded-full bg-red-100/80 blur-3xl" />

            <div className="relative rounded-[2rem] border border-red-100 bg-gradient-to-br from-red-50 via-white to-rose-50 p-5 shadow-xl shadow-red-950/5 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                    The big idea
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                    Create. Connect. Earn.
                  </h2>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-2xl text-white shadow-lg shadow-red-600/20">
                  ✳
                </span>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex min-h-40 flex-col justify-between rounded-2xl bg-red-600 p-5 text-white sm:min-h-48">
                  <span className="text-3xl">✦</span>
                  <div>
                    <p className="text-lg font-extrabold">Brands</p>
                    <p className="mt-1 text-sm leading-6 text-red-100">
                      Bring your next idea to life.
                    </p>
                  </div>
                </div>

                <div className="flex min-h-40 flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 sm:min-h-48">
                  <span className="text-3xl text-red-600">✳</span>
                  <div>
                    <p className="text-lg font-extrabold">Creators</p>
                    <p className="mt-1 text-sm leading-6 text-neutral-500">
                      Make content that connects.
                    </p>
                  </div>
                </div>
              </div>

              <div className="my-5 flex items-center justify-center gap-3">
                <span className="h-px flex-1 bg-red-200" />
                <span className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-600">
                  One collaboration
                </span>
                <span className="h-px flex-1 bg-red-200" />
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-2xl text-red-600">
                    ↗
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">Ideas deserve recognition.</p>
                    <p className="mt-1 text-sm leading-6 text-neutral-500">
                      Performance milestones. Clear rewards. Better partnerships.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["Campaigns", "Content", "Milestones", "Payouts"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-red-100 bg-white px-3 py-2 text-xs font-semibold text-neutral-600"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="absolute -right-1 top-0 hidden rotate-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-lg sm:block">
              <p className="text-xs font-medium text-neutral-500">Good content</p>
              <p className="mt-1 text-sm font-extrabold text-red-600">
                Deserves rewards ✦
              </p>
            </div>

            <div className="absolute -bottom-1 -left-1 hidden -rotate-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-lg sm:block">
              <p className="text-xs text-neutral-500">The goal</p>
              <p className="mt-1 text-sm font-extrabold">Better collaborations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value proposition strip */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:grid-cols-3 sm:px-8 lg:px-12">
          {[
            {
              title: "For brands",
              description: "Campaigns, budgets, and payouts",
            },
            {
              title: "For creators",
              description: "Submissions, views, and earnings",
            },
            {
              title: "For every collaboration",
              description: "Milestones and spending visibility",
            },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-4 sm:justify-center">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 font-bold text-red-600">
                ✓
              </span>
              <div>
                <p className="text-sm font-bold">{item.title}</p>
                <p className="mt-1 text-xs text-neutral-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-600">
            Built for collaboration
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Everything your campaign needs.
            <span className="text-neutral-400"> Nothing you don&apos;t.</span>
          </h2>
          <p className="mt-5 max-w-xl leading-7 text-neutral-600">
            From campaign creation to payout tracking, Meme’d brings the
            important details together so brands and creators can focus on
            great content.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="group rounded-2xl border border-neutral-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl hover:shadow-red-950/5"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-2xl text-red-600 transition group-hover:bg-red-600 group-hover:text-white">
                  {feature.icon}
                </span>
                <span className="text-xs font-semibold text-neutral-400">
                  {feature.number}
                </span>
              </div>
              <h3 className="mt-7 text-lg font-extrabold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-neutral-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Separate paths for each role */}
      <section id="for-everyone" className="scroll-mt-24 border-y border-neutral-200 bg-neutral-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-600">
              Two sides, one platform
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Your role. Your workspace.
            </h2>
            <p className="mt-5 leading-7 text-neutral-600">
              Whether you are running a campaign or creating content, your
              workspace is designed around what you need to do.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <article className="rounded-3xl border border-neutral-200 bg-white p-7 sm:p-10">
              <span className="inline-flex rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                BRAND WORKSPACE
              </span>
              <h3 className="mt-6 text-3xl font-black">
                Make every campaign count.
              </h3>
              <p className="mt-4 leading-7 text-neutral-600">
                Create campaigns, allocate budgets, define milestone rewards,
                and understand your spending without juggling spreadsheets.
              </p>
              <ul className="mt-7 space-y-4 text-sm text-neutral-700">
                {[
                  "Create and manage campaigns",
                  "Configure view-based payout milestones",
                  "Review creator submissions",
                  "Monitor spent and remaining budgets",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="font-bold text-red-600">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?role=brand"
                className="mt-9 inline-flex items-center gap-3 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Get started as a brand <span>→</span>
              </Link>
            </article>

            <article className="rounded-3xl border border-red-200 bg-red-50/60 p-7 sm:p-10">
              <span className="inline-flex rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-bold text-red-700">
                CREATOR WORKSPACE
              </span>
              <h3 className="mt-6 text-3xl font-black">
                Let your content work for you.
              </h3>
              <p className="mt-4 leading-7 text-neutral-600">
                Explore available campaigns, submit your content, and follow
                your views and payout progress from your own workspace.
              </p>
              <ul className="mt-7 space-y-4 text-sm text-neutral-700">
                {[
                  "Explore live campaigns",
                  "Submit content URLs",
                  "Track submissions and views",
                  "Follow eligible earnings",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="font-bold text-red-600">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?role=creator"
                className="mt-9 inline-flex items-center gap-3 rounded-xl border border-red-200 bg-white px-5 py-3.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
              >
                Get started as a creator <span>→</span>
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-600">
              Simple by design
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              From campaign setup to payout tracking.
            </h2>
            <p className="mt-5 leading-7 text-neutral-600">
              A straightforward workflow that keeps brands and creators on the
              same page, from the first campaign to performance-based rewards.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-red-600 transition hover:text-red-700"
            >
              Start your workspace <span>↗</span>
            </Link>
          </div>

          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <h3 className="mb-6 text-lg font-extrabold">For brands</h3>
              <div className="space-y-6">
                {brandSteps.map((step) => (
                  <div key={step.number} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xs font-bold text-red-600">
                      {step.number}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold">{step.title}</h4>
                      <p className="mt-2 text-sm leading-6 text-neutral-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-6 text-lg font-extrabold">For creators</h3>
              <div className="space-y-6">
                {creatorSteps.map((step) => (
                  <div key={step.number} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xs font-bold text-red-600">
                      {step.number}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold">{step.title}</h4>
                      <p className="mt-2 text-sm leading-6 text-neutral-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final call to action */}
      <section className="px-5 pb-20 sm:px-8 sm:pb-28 lg:px-12">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-red-600 px-6 py-16 text-center text-white sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[40px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-10 h-64 w-64 rounded-full bg-red-500" />
          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-100">
              Ready when you are
            </p>
            <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
              Better campaigns start with better visibility.
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-red-100">
              Bring campaigns, creator submissions, and payout progress
              together in one workspace.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-xl bg-white px-7 py-4 text-sm font-bold text-red-700 transition hover:bg-red-50"
              >
                Create your account <span className="ml-2">→</span>
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/30 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/10"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <Link href="/" className="flex w-fit items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 font-black text-white">
              M
            </span>
            <span className="text-lg font-extrabold">
              meme’d<span className="text-red-600">.</span>
            </span>
          </Link>

          <p className="text-sm text-neutral-500">
            Campaigns, creators, and payouts — all in one place.
          </p>

          <div className="flex items-center gap-5 text-sm text-neutral-500">
            <Link href="/login" className="transition hover:text-red-600">
              Log in
            </Link>
            <Link href="/signup" className="transition hover:text-red-600">
              Sign up
            </Link>
            <span className="text-xs text-neutral-400">© 2026 Meme’d</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

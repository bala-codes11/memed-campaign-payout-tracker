"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type Milestone = { views: number; payout: number };

type Campaign = {
  _id: string;
  name: string;
  platform: string;
  totalBudget: number;
  spentBudget?: number;
  remainingBudget?: number;
  isLive?: boolean;
  milestones?: Milestone[];
  createdAt?: string;
};

type CampaignResponse = {
  success?: boolean;
  message?: string;
  campaigns?: Campaign[];
  data?: Campaign[] | { campaigns?: Campaign[] };
};

type User = { name?: string; email?: string; role?: string };

const initialMilestones: Milestone[] = [
  { views: 1000, payout: 100 },
  { views: 5000, payout: 500 },
  { views: 10000, payout: 1000 },
];

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

function extractCampaigns(result: CampaignResponse): Campaign[] {
  if (Array.isArray(result.campaigns)) return result.campaigns;
  if (Array.isArray(result.data)) return result.data;

  if (result.data && !Array.isArray(result.data)) {
    return result.data.campaigns ?? [];
  }

  return [];
}

function spentAmount(c: Campaign) {
  return Number(
    c.spentBudget ??
      (Number(c.totalBudget || 0) -
        Number(c.remainingBudget ?? c.totalBudget ?? 0))
  );
}

function remainingAmount(c: Campaign) {
  return Number(
    c.remainingBudget ??
      (Number(c.totalBudget || 0) - spentAmount(c))
  );
}

const fieldClass =
  "w-full rounded-xl border border-[#e6e1da] bg-white px-3.5 py-3 text-sm text-[#252422] outline-none transition placeholder:text-[#aaa49d] focus:border-[#ed2929] focus:ring-2 focus:ring-[#ed2929]/10";

export default function BrandDashboardPage() {
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "live" | "paused">("all");

  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [budget, setBudget] = useState("10000");
  const [milestones, setMilestones] =
    useState<Milestone[]>(initialMilestones);

  const loadCampaigns = useCallback(async (authToken: string) => {
    try {
      setError("");

      const result = await apiRequest<CampaignResponse>(
        "/campaigns",
        { method: "GET" },
        authToken
      );

      setCampaigns(extractCampaigns(result));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load campaigns."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedToken =
      localStorage.getItem("memed_token") ||
      localStorage.getItem("token");

    const savedUser =
      localStorage.getItem("memed_user") ||
      localStorage.getItem("user");

    if (!savedToken) {
      router.replace("/login");
      return;
    }

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as User;
        setUser(parsed);

        if (parsed.role && parsed.role !== "brand") {
          router.replace("/dashboards/creator");
          return;
        }
      } catch {
        localStorage.removeItem("memed_user");
        localStorage.removeItem("user");
      }
    }

    setToken(savedToken);
    void loadCampaigns(savedToken);
  }, [loadCampaigns, router]);

  useEffect(() => {
    if (!showCreateForm) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !creating) {
        setShowCreateForm(false);
        setError("");
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showCreateForm, creating]);

  function logout() {
    ["token", "user", "memed_token", "memed_user"].forEach((key) =>
      localStorage.removeItem(key)
    );

    router.replace("/login");
  }

  function openCreateForm() {
    setError("");
    setSuccess("");
    setShowCreateForm(true);
  }

  async function handleCreateCampaign(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const parsedBudget = Number(budget);

    if (name.trim().length < 3) {
      setError("Campaign name must contain at least 3 characters.");
      return;
    }

    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      setError("Enter a valid campaign budget.");
      return;
    }

    if (
      milestones.some(
        (m) =>
          !Number.isFinite(m.views) ||
          !Number.isFinite(m.payout) ||
          m.views <= 0 ||
          m.payout <= 0
      )
    ) {
      setError("Every milestone needs positive views and payout values.");
      return;
    }

    setCreating(true);

    try {
      const result = await apiRequest<CampaignResponse>(
        "/campaigns",
        {
          method: "POST",
          body: JSON.stringify({
            name: name.trim(),
            platform,
            totalBudget: parsedBudget,
            milestones: milestones.map((m) => ({
              views: Number(m.views),
              payout: Number(m.payout),
            })),
          }),
        },
        token
      );

      setName("");
      setBudget("10000");
      setPlatform("Instagram");
      setMilestones(initialMilestones);
      setShowCreateForm(false);
      setSuccess(result.message || "Campaign created successfully.");

      await loadCampaigns(token);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create campaign."
      );
    } finally {
      setCreating(false);
    }
  }

  function updateMilestone(
    index: number,
    field: "views" | "payout",
    value: string
  ) {
    setMilestones((current) =>
      current.map((m, i) =>
        i === index
          ? { ...m, [field]: value === "" ? 0 : Number(value) }
          : m
      )
    );
  }

  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";
  const live = campaigns.filter((c) => c.isLive !== false);

  const totalBudget = campaigns.reduce(
    (sum, c) => sum + Number(c.totalBudget || 0),
    0
  );

  const totalSpent = campaigns.reduce(
    (sum, c) => sum + spentAmount(c),
    0
  );

  const totalRemaining = campaigns.reduce(
    (sum, c) => sum + remainingAmount(c),
    0
  );

  const utilization =
    totalBudget > 0
      ? Math.min(100, Math.max(0, (totalSpent / totalBudget) * 100))
      : 0;

  const filtered = campaigns.filter((c) => {
    const matches = `${c.name} ${c.platform}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const statusMatches =
      filter === "all" ||
      (filter === "live" && c.isLive !== false) ||
      (filter === "paused" && c.isLive === false);

    return matches && statusMatches;
  });

  return (
    <main className="min-h-screen bg-[#f7f6f3] font-sans text-[#242321]">
      {/* Compact header */}
      <header className="sticky top-0 z-30 border-b border-[#e9e5de] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[66px] max-w-[1380px] items-center justify-between px-4 sm:px-7">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ed2929] text-base font-black text-white">
              m.
            </span>

            <span className="text-lg font-extrabold tracking-[-.06em]">
              meme<span className="text-[#ed2929]">’d.</span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 text-xs text-[#817b73] sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Brand workspace
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg border border-[#e7e1d9] bg-white px-3 py-2 text-sm font-semibold transition hover:border-red-200 hover:bg-red-50 hover:text-[#d92121]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <path
                d="M10 17l5-5-5-5M15 12H3m9-8h7a2 2 0 012 2v12a2 2 0 01-2 2h-7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1380px] px-4 py-7 sm:px-7 sm:py-9">
        {/* Welcome heading */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold text-[#ed2929]">
              YOUR BRAND WORKSPACE
            </p>

            <h1 className="mt-2 text-4xl font-black leading-[1.08] tracking-[-0.055em] sm:text-5xl">
              Welcome back, {firstName}.
            </h1>

            <p className="mt-2 text-base leading-7 text-[#817b73] sm:text-lg sm:leading-8">
              Here's what's happening with your campaigns.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#ed2929] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#d92121] sm:self-auto"
          >
            <span className="text-lg leading-none">+</span>
            Create campaign
          </button>
        </section>

        {/* Compact statistics */}
        <section className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            {
              label: "Total campaigns",
              value: campaigns.length,
              note: `${live.length} currently live`,
              mark: "C",
            },
            {
              label: "Total budget",
              value: money(totalBudget),
              note: "Across all campaigns",
              mark: "₹",
            },
            {
              label: "Budget spent",
              value: money(totalSpent),
              note: `${Math.round(utilization)}% of allocation`,
              mark: "↗",
            },
            {
              label: "Budget remaining",
              value: money(totalRemaining),
              note: "Available allocation",
              mark: "○",
            },
          ].map((stat) => (
            <article
              key={stat.label}
              className="min-w-0 rounded-2xl border border-[#e9e5de] bg-white p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-[#817b73]">
                  {stat.label}
                </p>

                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#fff0ed] text-xs font-bold text-[#ed2929]">
                  {stat.mark}
                </span>
              </div>

              <p className="mt-4 break-words text-2xl font-bold tracking-[-0.055em]">
                {loading ? "—" : stat.value}
              </p>

              <p className="mt-1.5 text-xs text-[#938c82]">
                {loading ? "Loading..." : stat.note}
              </p>
            </article>
          ))}
        </section>

        {/* Budget overview */}
        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
          <article className="rounded-2xl border border-[#e9e5de] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold tracking-tight">
                  Budget overview
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#938c82]">
                  How your total campaign allocation is being used
                </p>
              </div>

              <span className="rounded-lg bg-[#f7f6f3] px-3 py-2 text-xs font-semibold">
                {loading ? "—" : `${Math.round(utilization)}% used`}
              </span>
            </div>

            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#efede8]">
              <div
                className="h-full rounded-full bg-[#ed2929] transition-all duration-500"
                style={{ width: `${utilization}%` }}
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-between gap-4 text-sm">
              <div>
                <span className="text-[#938c82]">Spent </span>
                <span className="font-bold">
                  {loading ? "—" : money(totalSpent)}
                </span>
              </div>

              <div>
                <span className="text-[#938c82]">Remaining </span>
                <span className="font-bold text-emerald-700">
                  {loading ? "—" : money(totalRemaining)}
                </span>
              </div>

              <div>
                <span className="text-[#938c82]">Total </span>
                <span className="font-bold">
                  {loading ? "—" : money(totalBudget)}
                </span>
              </div>
            </div>
          </article>

          <article className="flex items-center justify-between gap-4 rounded-2xl bg-[#252421] p-5 text-white">
            <div>
              <p className="text-sm text-white/60">Campaign activity</p>

              <p className="mt-2 text-2xl font-bold tracking-tight">
                {loading ? "—" : live.length}
                <span className="ml-1.5 text-sm font-medium text-white/50">
                  live
                </span>
              </p>

              <p className="mt-1 text-sm text-white/55">
                {loading
                  ? "Checking campaigns..."
                  : `${campaigns.length - live.length} paused`}
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ed2929] text-xl">
              ↗
            </div>
          </article>
        </section>

        {/* Error message */}
        {error && !showCreateForm && (
          <div
            role="alert"
            className="mt-5 flex justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
            <button
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div
            role="status"
            className="mt-5 flex justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            {success}
            <button
              onClick={() => setSuccess("")}
              aria-label="Dismiss success"
            >
              ×
            </button>
          </div>
        )}

        {/* Campaign list */}
        <section className="mt-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-black tracking-[-0.055em] sm:text-4xl">
                Your campaigns<span className="text-[#ed2929]">.</span>
              </h2>

              <p className="mt-2 text-base leading-7 text-[#817b73]">
                Track budgets, status, and creator payout targets.
              </p>
            </div>

            <label className="relative block sm:w-72">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#938c82]"
              >
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4.5 4.5" strokeLinecap="round" />
              </svg>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search campaigns..."
                className="w-full rounded-xl border border-[#e6e1da] bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#ed2929]"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {[
              { value: "all", label: "All" },
              { value: "live", label: "Live" },
              { value: "paused", label: "Paused" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value as typeof filter)}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                  filter === item.value
                    ? "bg-[#252421] text-white"
                    : "border border-[#e6e1da] bg-white text-[#716b63] hover:border-[#ed2929]/40"
                }`}
              >
                {item.label}
                {item.value === "all" &&
                  ` (${loading ? "—" : campaigns.length})`}
              </button>
            ))}

            <span className="ml-auto text-sm text-[#938c82]">
              {loading ? "Loading..." : `${filtered.length} results`}
            </span>
          </div>

          {loading ? (
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-56 animate-pulse rounded-2xl border border-[#e9e5de] bg-white"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-[#ddd7ce] bg-white px-5 py-12 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0ed] text-xl text-[#ed2929]">
                +
              </div>

              <h3 className="mt-4 text-lg font-bold tracking-tight">
                {campaigns.length
                  ? "No matching campaigns"
                  : "No campaigns yet"}
              </h3>

              <p className="mt-2 text-base leading-7 text-[#817b73]">
                {campaigns.length
                  ? "Try a different search or filter."
                  : "Create your first campaign to get started."}
              </p>

              {campaigns.length === 0 && (
                <button
                  onClick={openCreateForm}
                  className="mt-4 rounded-xl bg-[#ed2929] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d92121]"
                >
                  Create campaign
                </button>
              )}
            </div>
          ) : (
            <div className="mt-5 grid items-start gap-4 xl:grid-cols-2">
              {filtered.map((campaign) => {
                const spent = spentAmount(campaign);
                const remaining = remainingAmount(campaign);
                const total = Number(campaign.totalBudget || 0);

                const percent =
                  total > 0
                    ? Math.min(100, Math.max(0, (spent / total) * 100))
                    : 0;

                const isLive = campaign.isLive !== false;

                return (
                  <article
                    key={campaign._id}
                    className="rounded-2xl border border-[#e9e5de] bg-white p-5 transition hover:border-[#ed2929]/30 hover:shadow-[0_8px_28px_rgba(30,25,20,.045)] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-[.13em] text-[#ed2929]">
                            {campaign.platform || "Campaign"}
                          </span>

                          {campaign.createdAt && (
                            <span className="text-xs text-[#a19a90]">
                              {new Date(
                                campaign.createdAt
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-2 break-words text-lg font-bold tracking-tight">
                          {campaign.name}
                        </h3>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                          isLive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-[#f0efec] text-[#777169]"
                        }`}
                      >
                        <span className="mr-1">●</span>
                        {isLive ? "Live" : "Paused"}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-[#f7f6f3] p-3.5">
                        <p className="text-sm text-[#817b73]">
                          Remaining budget
                        </p>

                        <p className="mt-1.5 break-words text-xl font-bold tracking-tight">
                          {money(remaining)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#f7f6f3] p-3.5">
                        <p className="text-sm text-[#817b73]">
                          Total budget
                        </p>

                        <p className="mt-1.5 break-words text-xl font-bold tracking-tight">
                          {money(total)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between gap-3 text-sm">
                        <span className="text-[#817b73]">
                          Budget used · {money(spent)}
                        </span>

                        <span className="font-bold">
                          {Math.round(percent)}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#efede8]">
                        <div
                          className="h-full rounded-full bg-[#ed2929] transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 border-t border-[#efede8] pt-4">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-sm font-bold">
                          Payout milestones
                        </h4>

                        <span className="text-xs text-[#938c82]">
                          {campaign.milestones?.length || 0} targets
                        </span>
                      </div>

                      {campaign.milestones?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {campaign.milestones.map((m, index) => (
                            <div
                              key={`${campaign._id}-${index}`}
                              className="rounded-lg border border-[#eee9e2] px-3 py-2"
                            >
                              <p className="text-sm text-[#817b73]">
                                {Number(m.views).toLocaleString("en-IN")} views
                              </p>

                              <p className="mt-1 text-sm font-bold text-[#ed2929]">
                                {money(Number(m.payout))}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-[#938c82]">
                          No milestones configured.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="mt-10 border-t border-[#e6e1da] py-5 text-sm text-[#938c82]">
          <span className="font-bold text-[#ed2929]">meme’d.</span>{" "}
          Campaign Payout Tracker
        </footer>
      </div>

      {/* Create campaign popup */}
      {showCreateForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#191816]/55 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !creating) {
              setShowCreateForm(false);
              setError("");
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-title"
            className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-[#fffefa] shadow-2xl sm:rounded-[26px]"
          >
            {/* Fixed header */}
            <header className="shrink-0 border-b border-[#e9e5de] px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-[#ed2929]">
                    NEW CAMPAIGN
                  </p>

                  <h2
                    id="create-title"
                    className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl"
                  >
                    Create your campaign
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#817b73]">
                    Configure the campaign and creator payout targets.
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close popup"
                  disabled={creating}
                  onClick={() => {
                    setShowCreateForm(false);
                    setError("");
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e7e1d9] text-xl text-[#716b63] hover:bg-red-50 hover:text-[#ed2929] disabled:opacity-40"
                >
                  ×
                </button>
              </div>
            </header>

            {/* Independently scrolling content */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6 [scrollbar-color:#c9bfb4_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#c9bfb4] [&::-webkit-scrollbar-track]:bg-transparent">
              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <form
                id="create-campaign-form"
                onSubmit={handleCreateCampaign}
                className="space-y-6"
              >
                <section>
                  <h3 className="mb-3 text-base font-bold tracking-tight">
                    Campaign details
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="campaign-name"
                        className="mb-2 block text-sm font-semibold"
                      >
                        Campaign name
                      </label>

                      <input
                        id="campaign-name"
                        required
                        minLength={3}
                        maxLength={120}
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="e.g. Summer Meme Campaign"
                        className={fieldClass}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="campaign-platform"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Platform
                        </label>

                        <select
                          id="campaign-platform"
                          value={platform}
                          onChange={(event) =>
                            setPlatform(event.target.value)
                          }
                          className={fieldClass}
                        >
                          <option>Instagram</option>
                          <option>YouTube</option>
                          <option>TikTok</option>
                          <option>Facebook</option>
                          <option>X</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="campaign-budget"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Budget (₹)
                        </label>

                        <input
                          id="campaign-budget"
                          type="number"
                          min="1"
                          max="1000000000"
                          step="1"
                          required
                          value={budget}
                          onChange={(event) =>
                            setBudget(event.target.value)
                          }
                          className={fieldClass}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold tracking-tight">
                        Payout milestones
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[#817b73]">
                        Set view targets and their payouts.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={milestones.length >= 10 || creating}
                      onClick={() =>
                        setMilestones((current) => [
                          ...current,
                          {
                            views:
                              (current[current.length - 1]?.views || 0) +
                              5000,
                            payout:
                              (current[current.length - 1]?.payout || 0) +
                              500,
                          },
                        ])
                      }
                      className="shrink-0 rounded-lg border border-[#e6e1da] bg-white px-3 py-2 text-sm font-semibold hover:border-[#ed2929]/40 hover:text-[#ed2929] disabled:opacity-40"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="space-y-3">
                    {milestones.map((m, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-[#e9e5de] bg-[#f8f7f4] p-3.5"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-bold text-[#716b63]">
                            Milestone {index + 1}
                          </span>

                          <button
                            type="button"
                            disabled={milestones.length <= 1 || creating}
                            onClick={() =>
                              setMilestones((current) =>
                                current.filter((_, i) => i !== index)
                              )
                            }
                            aria-label={`Remove milestone ${index + 1}`}
                            className="rounded-md px-2 text-lg text-[#938c82] hover:bg-red-50 hover:text-[#ed2929] disabled:opacity-30"
                          >
                            ×
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="min-w-0">
                            <label
                              htmlFor={`views-${index}`}
                              className="mb-2 block text-sm font-semibold"
                            >
                              Views
                            </label>

                            <input
                              id={`views-${index}`}
                              type="number"
                              min="1"
                              required
                              value={m.views || ""}
                              onChange={(event) =>
                                updateMilestone(
                                  index,
                                  "views",
                                  event.target.value
                                )
                              }
                              className={fieldClass}
                            />
                          </div>

                          <div className="min-w-0">
                            <label
                              htmlFor={`payout-${index}`}
                              className="mb-2 block text-sm font-semibold"
                            >
                              Payout (₹)
                            </label>

                            <input
                              id={`payout-${index}`}
                              type="number"
                              min="1"
                              required
                              value={m.payout || ""}
                              onChange={(event) =>
                                updateMilestone(
                                  index,
                                  "payout",
                                  event.target.value
                                )
                              }
                              className={fieldClass}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="flex items-center justify-between rounded-xl bg-[#252421] px-4 py-4 text-white">
                  <div>
                    <p className="text-sm text-white/60">
                      Campaign budget
                    </p>

                    <p className="mt-1 text-lg font-bold tracking-tight">
                      {money(Number(budget) || 0)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-white/60">
                      Payout targets
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#ff817a]">
                      {milestones.length}
                    </p>
                  </div>
                </div>
              </form>
            </div>

            {/* Fixed footer */}
            <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#e9e5de] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
              <input
                type="button"
                disabled={creating}
                onClick={() => {
                  setShowCreateForm(false);
                  setError("");
                }}
                value="Cancel"
                className="rounded-xl border border-[#e6e1da] px-5 py-3 text-sm font-semibold hover:bg-[#f7f6f3] disabled:opacity-40"
              />

              <input
                type="submit"
                form="create-campaign-form"
                disabled={creating}
                value={creating ? "Creating..." : "Create campaign →"}
                className="rounded-xl bg-[#ed2929] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d92121] disabled:opacity-50"
              />
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
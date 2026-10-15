"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type Milestone = {
  views: number;
  payout: number;
};

type Campaign = {
  _id: string;
  name: string;
  platform: string;
  totalBudget: number;
  remainingBudget?: number;
  isLive?: boolean;
  milestones?: Milestone[];
};


type Submission = {
  _id: string;
  campaignId?: string | Campaign;
  campaign?: Campaign | string;
  postUrl?: string;
  contentUrl?: string;
  url?: string;
  views?: number;
  paidAmount?: number;
  status?: string;
  earnedAmount?: number;
  payout?: number;
  earnings?: number;
  createdAt?: string;
  updatedAt?: string;
};


type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T | { campaigns?: Campaign[]; submissions?: Submission[] };
  campaigns?: Campaign[];
  submissions?: Submission[];
};

type User = {
  name?: string;
  email?: string;
  role?: string;
};

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const numberFormat = (value: number) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

function getCampaigns(response: ApiResponse<Campaign[]>): Campaign[] {
  if (Array.isArray(response.campaigns)) return response.campaigns;
  if (Array.isArray(response.data)) return response.data;

  if (
    response.data &&
    !Array.isArray(response.data) &&
    Array.isArray(response.data.campaigns)
  ) {
    return response.data.campaigns;
  }

  return [];
}

function getSubmissions(response: ApiResponse<Submission[]>): Submission[] {
  if (Array.isArray(response.submissions)) return response.submissions;
  if (Array.isArray(response.data)) return response.data;

  if (
    response.data &&
    !Array.isArray(response.data) &&
    Array.isArray(response.data.submissions)
  ) {
    return response.data.submissions;
  }

  return [];
}

function getCampaignName(submission: Submission): string {
  const campaign = submission.campaign ?? submission.campaignId;

  if (typeof campaign === "object" && campaign !== null) {
    return campaign.name || "Campaign";
  }

  return "Campaign";
}


function getContentUrl(submission: Submission): string {
  return submission.postUrl || submission.contentUrl || submission.url || "";
}


function getSubmissionEarnings(submission: Submission): number {
  return Number(
    submission.paidAmount ??
      submission.earnedAmount ??
      submission.earnings ??
      submission.payout ??
      0
  );
}




function StatCard({
  icon,
  label,
  value,
  description,
  accent = false,
}: {
  icon: string;
  label: string;
  value: string;
  description: string;
  accent?: boolean;
}) {
  return (
    <div className="group rounded-2xl border border-[#e9e5de] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#ed2929]/40 hover:shadow-[0_12px_32px_rgba(36,35,33,0.05)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-[#817b73]">{label}</p>

        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
            accent
              ? "bg-[#ed2929] text-white"
              : "bg-[#fff0ee] text-[#ed2929]"
          }`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-5 text-3xl font-black tracking-[-0.055em] text-[#242321] sm:text-4xl">
        {value}
      </p>

      <p className="mt-2 text-sm text-[#938c82]">{description}</p>
    </div>
  );
}

export default function CreatorDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingViews, setUpdatingViews] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeTab, setActiveTab] = useState<"campaigns" | "submissions">(
    "campaigns"
  );
  const [search, setSearch] = useState("");
const [contentUrls, setContentUrls] = useState<Record<string, string>>({});
  const [viewDrafts, setViewDrafts] = useState<Record<string, string>>({});

  const loadDashboard = useCallback(async (authToken: string) => {
    setLoading(true);
    setError("");

    try {
      const [campaignResult, submissionResult] = await Promise.all([
        apiRequest<ApiResponse<Campaign[]>>(
          "/campaigns/live",
          { method: "GET" },
          authToken
        ),
        apiRequest<ApiResponse<Submission[]>>(
          "/submissions/mine",
          { method: "GET" },
          authToken
        ),
      ]);

      setCampaigns(getCampaigns(campaignResult));
      setSubmissions(getSubmissions(submissionResult));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your dashboard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedToken =
      localStorage.getItem("memed_token") || localStorage.getItem("token");
    const savedUser =
      localStorage.getItem("memed_user") || localStorage.getItem("user");

    if (!savedToken) {
      router.replace("/login");
      return;
    }

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        setUser(parsedUser);

        if (parsedUser.role && parsedUser.role !== "creator") {
          router.replace("/dashboards/brand");
          return;
        }
      } catch {
        localStorage.removeItem("memed_user");
        localStorage.removeItem("user");
      }
    }

    setToken(savedToken);
    void loadDashboard(savedToken);
  }, [loadDashboard, router]);

 
async function handleSubmitContent(
  event: FormEvent<HTMLFormElement>,
  campaignId: string
) {
  event.preventDefault();
  setError("");
  setSuccess("");

  const postUrl = (contentUrls[campaignId] || "").trim();

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(postUrl);
  } catch {
    setError("Enter a valid public content URL.");
    return;
  }

  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    setError("The content URL must start with http:// or https://.");
    return;
  }

  setSubmitting(true);

  try {
    const result = await apiRequest<ApiResponse<Submission>>(
      "/submissions",
      {
        method: "POST",
        body: JSON.stringify({
          campaignId,
          postUrl,
        }),
      },
      token
    );

    setContentUrls((previous) => ({
      ...previous,
      [campaignId]: "",
    }));

    setSuccess(
      result.message || "Your content was submitted successfully."
    );
    setActiveTab("submissions");

    await loadDashboard(token);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to submit content. Please try again."
    );
  } finally {
    setSubmitting(false);
  }
}


  async function handleUpdateViews(submission: Submission) {
    setError("");
    setSuccess("");

    const rawViews = viewDrafts[submission._id] ?? String(submission.views ?? "");
    const views = Number(rawViews);

    if (
      rawViews.trim() === "" ||
      !Number.isSafeInteger(views) ||
      views < 0
    ) {
      setError("Enter a valid whole-number view count (zero or more).");
      return;
    }

    setUpdatingViews(submission._id);

    try {
      const result = await apiRequest<ApiResponse<Submission>>(
        `/submissions/${submission._id}/views`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ views }),
        },
        token
      );

      setSuccess(result.message || "Views updated successfully.");
      await loadDashboard(token);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update views. Please try again."
      );
    } finally {
      setUpdatingViews(null);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("memed_token");
    localStorage.removeItem("memed_user");
    router.replace("/login");
  }

  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";

  const totalViews = useMemo(
    () =>
      submissions.reduce(
        (total, submission) => total + Number(submission.views || 0),
        0
      ),
    [submissions]
  );

  const totalEarnings = useMemo(
    () =>
      submissions.reduce(
        (total, submission) => total + getSubmissionEarnings(submission),
        0
      ),
    [submissions]
  );

  
const submissionsWithEarnings = useMemo(
  () =>
    submissions.filter(
      (submission) => getSubmissionEarnings(submission) > 0
    ).length,
  [submissions]
);
  
  

  const filteredCampaigns = useMemo(
    () =>
      campaigns.filter((campaign) =>
        `${campaign.name} ${campaign.platform}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [campaigns, search]
  );

  return (
    <main className="min-h-screen bg-[#f7f6f3] font-sans text-[#242321]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#e9e5de] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-[1380px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ed2929] text-lg font-black text-white">
              m
            </span>
            <span className="text-xl font-black tracking-[-0.06em]">
              meme<span className="text-[#ed2929]">’</span>d
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold">{user?.name || "Creator"}</p>
              <p className="text-xs text-[#938c82]">Creator account</p>
            </div>

            <button
              onClick={logout}
              className="rounded-xl border border-[#e9e5de] bg-white px-4 py-2.5 text-sm font-bold transition hover:border-[#ed2929] hover:text-[#ed2929]"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1380px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Page heading */}
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#ed2929]">
              Creator workspace
            </p>
            <h1 className="text-4xl font-black leading-[1.08] tracking-[-0.055em] sm:text-5xl">
              Your content.
              <br className="hidden sm:block" /> Your earnings.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#817b73] sm:text-lg">
              Welcome back, {firstName}. Track your campaigns, submissions, and
              performance in one place.
            </p>
          </div>

          <button
            onClick={() => void loadDashboard(token)}
            disabled={loading || !token}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#e9e5de] bg-white px-4 py-3 text-sm font-bold transition hover:border-[#ed2929] hover:text-[#ed2929] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className={loading ? "animate-spin" : ""}>↻</span>
            {loading ? "Refreshing..." : "Refresh dashboard"}
          </button>
        </section>

        {/* Messages */}
        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="shrink-0 font-bold"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-6 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
          >
            <span>{success}</span>
            <button
              onClick={() => setSuccess("")}
              className="shrink-0 font-bold"
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        )}

        {/* Stat boxes */}
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon="C"
            label="Live campaigns"
            value={numberFormat(campaigns.length)}
            description="Available to join"
            accent
          />
          <StatCard
            icon="▤"
            label="Total submissions"
            value={numberFormat(submissions.length)}
            description="Content submitted"
          />
          <StatCard
            icon="↗"
            label="Total views"
            value={numberFormat(totalViews)}
            description="Across your submissions"
          />
          <StatCard
            icon="₹"
            label="Total earnings"
            value={currency(totalEarnings)}
            description="Your recorded earnings"
          />
        </section>

        {/* Overview panel */}
        <section className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-[#e9e5de] bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#817b73]">
                  Submission overview
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.05em]">
                  Keep your momentum going.
                </h2>
              </div>
              <span className="rounded-xl bg-[#fff0ee] px-3 py-2 text-sm font-black text-[#ed2929]">
                {submissions.length
                  ? `${Math.round((submissionsWithEarnings / submissions.length) * 100)}%`
                  : "0%"}
              </span>
            </div>

            <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-[#f0ede7]">
              <div
                className="h-full rounded-full bg-[#ed2929] transition-all duration-500"
                
style={{
  width: `${
    submissions.length
      ? (submissionsWithEarnings / submissions.length) * 100
      : 0
  }%`,
}}

              />
            </div>

           
<div className="mt-3 flex items-center justify-between gap-3 text-sm">
  <span className="text-[#817b73]">Submissions with earnings</span>
  <span className="font-bold">
    {submissionsWithEarnings} of {submissions.length}
  </span>
</div>

          </div>

          <div className="flex flex-col justify-between gap-5 rounded-2xl bg-[#ed2929] p-5 text-white sm:p-6">
            <div>
              <p className="text-sm font-semibold text-white/75">
                Earnings snapshot
              </p>
              <p className="mt-3 text-3xl font-black tracking-[-0.055em]">
                {currency(totalEarnings)}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Total earnings recorded across your submitted content.
              </p>
            </div>

            <button
              onClick={() => setActiveTab("submissions")}
              className="w-fit rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#ed2929] transition hover:bg-[#fff0ee]"
            >
              View your submissions →
            </button>
          </div>
        </section>

        {/* Tabs */}
        <section className="mt-10">
          <div className="flex flex-col justify-between gap-4 border-b border-[#e3ded5] sm:flex-row sm:items-center">
            <div>
              <h2 className="text-3xl font-black tracking-[-0.055em] sm:text-4xl">
                Your workspace
              </h2>
              <p className="mt-2 pb-4 text-sm text-[#817b73]">
                Explore campaigns and manage your submitted content.
              </p>
            </div>

            <div className="flex gap-1 self-start rounded-xl border border-[#e9e5de] bg-white p-1 sm:self-auto">
              <button
                onClick={() => {
                  setActiveTab("campaigns");
                  setError("");
                  setSuccess("");
                }}
                className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                  activeTab === "campaigns"
                    ? "bg-[#ed2929] text-white"
                    : "text-[#817b73] hover:text-[#242321]"
                }`}
              >
                Live campaigns
                <span
                  className={`ml-2 rounded-md px-1.5 py-0.5 text-xs ${
                    activeTab === "campaigns"
                      ? "bg-white/20 text-white"
                      : "bg-[#f7f6f3] text-[#817b73]"
                  }`}
                >
                  {campaigns.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("submissions");
                  setError("");
                  setSuccess("");
                }}
                className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                  activeTab === "submissions"
                    ? "bg-[#ed2929] text-white"
                    : "text-[#817b73] hover:text-[#242321]"
                }`}
              >
                Your submissions
                <span
                  className={`ml-2 rounded-md px-1.5 py-0.5 text-xs ${
                    activeTab === "submissions"
                      ? "bg-white/20 text-white"
                      : "bg-[#f7f6f3] text-[#817b73]"
                  }`}
                >
                  {submissions.length}
                </span>
              </button>
            </div>
          </div>

          {/* Live campaigns tab */}
          {activeTab === "campaigns" && (
            <div className="pt-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-[-0.04em]">
                    Find your next campaign
                  </h3>
                  <p className="mt-1 text-sm text-[#817b73]">
                    Choose a campaign and submit your public post URL.
                  </p>
                </div>

                <div className="relative w-full sm:max-w-xs">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#938c82]">
                    ⌕
                  </span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search campaigns..."
                    className="w-full rounded-xl border border-[#e9e5de] bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#aaa398] focus:border-[#ed2929] focus:ring-2 focus:ring-[#ed2929]/10"
                  />
                </div>
              </div>

              {loading ? (
                <div className="rounded-2xl border border-[#e9e5de] bg-white p-12 text-center text-sm text-[#817b73]">
                  Loading live campaigns...
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#ded8cf] bg-white px-6 py-14 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ee] text-xl font-black text-[#ed2929]">
                    C
                  </div>
                  <h3 className="mt-4 text-lg font-black">
                    {search ? "No matching campaigns" : "No live campaigns yet"}
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#817b73]">
                    {search
                      ? "Try another campaign name or platform."
                      : "New opportunities will appear here when brands publish live campaigns."}
                  </p>
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="mt-4 text-sm font-bold text-[#ed2929] hover:underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {filteredCampaigns.map((campaign) => (
                    <article
                      key={campaign._id}
                      className="rounded-2xl border border-[#e9e5de] bg-white p-5 transition duration-200 hover:border-[#ed2929]/40 hover:shadow-[0_12px_32px_rgba(36,35,33,0.05)] sm:p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fff0ee] text-lg font-black text-[#ed2929]">
                            {(campaign.name || "C").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="break-words text-lg font-black tracking-[-0.04em]">
                              {campaign.name}
                            </h3>
                            <p className="mt-1 text-sm text-[#817b73]">
                              {campaign.platform}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          Live
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-[#f7f6f3] p-3.5">
                          <p className="text-xs font-semibold text-[#938c82]">
                            Total budget
                          </p>
                          <p className="mt-1.5 text-lg font-black tracking-[-0.04em]">
                            {currency(campaign.totalBudget)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-[#f7f6f3] p-3.5">
                          <p className="text-xs font-semibold text-[#938c82]">
                            Budget remaining
                          </p>
                          <p className="mt-1.5 text-lg font-black tracking-[-0.04em]">
                            {currency(
                              campaign.remainingBudget ?? campaign.totalBudget
                            )}
                          </p>
                        </div>
                      </div>

                      {campaign.milestones && campaign.milestones.length > 0 && (
                        <div className="mt-5">
                          <p className="mb-2.5 text-xs font-black uppercase tracking-[0.12em] text-[#938c82]">
                            Payout milestones
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {campaign.milestones.map((milestone, index) => (
                              <span
                                key={`${milestone.views}-${milestone.payout}-${index}`}
                                className="rounded-lg border border-[#e9e5de] px-3 py-2 text-xs font-semibold text-[#625d56]"
                              >
                                {numberFormat(milestone.views)} views
                                <span className="mx-1.5 text-[#c4bdb2]">·</span>
                                {currency(milestone.payout)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                     
<form
  onSubmit={(event) => handleSubmitContent(event, campaign._id)}
  className="mt-5 border-t border-[#f0ede7] pt-5"
>
  <label
    htmlFor={`post-url-${campaign._id}`}
    className="mb-2 block text-sm font-bold"
  >
    Submit your content
  </label>

  <p className="mb-3 text-sm text-[#817b73]">
    Campaign:{" "}
    <span className="font-semibold text-[#242321]">
      {campaign.name}
    </span>
  </p>

  <input
    id={`post-url-${campaign._id}`}
    type="url"
    value={contentUrls[campaign._id] || ""}
    onChange={(event) =>
      setContentUrls((previous) => ({
        ...previous,
        [campaign._id]: event.target.value,
      }))
    }
    placeholder="https://your-post-url.com"
    required
    className="w-full rounded-xl border border-[#e9e5de] bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-[#aaa398] focus:border-[#ed2929] focus:ring-2 focus:ring-[#ed2929]/10"
  />

  <button
    type="submit"
    disabled={submitting}
    className="mt-3 w-full rounded-xl bg-[#ed2929] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#d92121] disabled:cursor-not-allowed disabled:opacity-60"
  >
    {submitting ? "Submitting..." : "Submit content →"}
  </button>
</form>

                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Your submissions tab */}
          {activeTab === "submissions" && (
            <div className="pt-6">
              <div className="mb-5">
                <h3 className="text-xl font-black tracking-[-0.04em]">
                  Your submissions
                </h3>
                <p className="mt-1 text-sm text-[#817b73]">
                  Review your posts, update their view counts, and track
                  earnings.
                </p>
              </div>

              {loading ? (
                <div className="rounded-2xl border border-[#e9e5de] bg-white p-12 text-center text-sm text-[#817b73]">
                  Loading your submissions...
                </div>
              ) : submissions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#ded8cf] bg-white px-6 py-14 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ee] text-xl font-black text-[#ed2929]">
                    ↗
                  </div>
                  <h3 className="mt-4 text-lg font-black">
                    Nothing submitted yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#817b73]">
                    Your submitted posts will appear here. Join a live campaign
                    and submit your first post to get started.
                  </p>
                  <button
                    onClick={() => setActiveTab("campaigns")}
                    className="mt-5 rounded-xl bg-[#ed2929] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#d92121]"
                  >
                    Explore live campaigns →
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {submissions.map((submission) => {
                    const url = getContentUrl(submission);
                    const currentViews =
                      viewDrafts[submission._id] ??
                      String(submission.views ?? 0);

                    return (
                      <article
                        key={submission._id}
                        className="rounded-2xl border border-[#e9e5de] bg-white p-5 transition duration-200 hover:border-[#ed2929]/30 hover:shadow-[0_12px_32px_rgba(36,35,33,0.04)] sm:p-6"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff0ee] text-lg font-black text-[#ed2929]">
                              ↗
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#938c82]">
                                Campaign
                              </p>
                              <h4 className="mt-1 break-words text-lg font-black tracking-[-0.04em]">
                                {getCampaignName(submission)}
                              </h4>
                            </div>
                          </div>

                         
<span
  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${
    getSubmissionEarnings(submission) > 0
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-[#e9e5de] bg-[#f7f6f3] text-[#817b73]"
  }`}
>
  {getSubmissionEarnings(submission) > 0
    ? "Earning"
    : "Submitted"}
</span>

                        </div>

                        <div className="mt-5 rounded-xl border border-[#f0ede7] bg-[#faf9f7] p-3.5">
                          <p className="text-xs font-bold text-[#938c82]">
                            Submitted post
                          </p>
                          {url ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1.5 block break-all text-sm font-semibold text-[#ed2929] hover:underline"
                            >
                              {url}
                            </a>
                          ) : (
                            <p className="mt-1.5 text-sm text-[#938c82]">
                              No post URL available
                            </p>
                          )}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-[#f7f6f3] p-3.5">
                            <p className="text-xs font-semibold text-[#938c82]">
                              Current views
                            </p>
                            <p className="mt-1.5 text-xl font-black tracking-[-0.04em]">
                              {numberFormat(Number(submission.views || 0))}
                            </p>
                          </div>

                          <div className="rounded-xl bg-[#f7f6f3] p-3.5">
                            <p className="text-xs font-semibold text-[#938c82]">
                              Earnings
                            </p>
                            <p className="mt-1.5 text-xl font-black tracking-[-0.04em]">
                              {currency(getSubmissionEarnings(submission))}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 border-t border-[#f0ede7] pt-5">
                          <label
                            htmlFor={`views-${submission._id}`}
                            className="mb-2 block text-sm font-bold"
                          >
                            Update view count
                          </label>

                          <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                              id={`views-${submission._id}`}
                              type="number"
                              min="0"
                              step="1"
                              inputMode="numeric"
                              value={currentViews}
                              onChange={(event) =>
                                setViewDrafts((previous) => ({
                                  ...previous,
                                  [submission._id]: event.target.value,
                                }))
                              }
                              className="min-w-0 flex-1 rounded-xl border border-[#e9e5de] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#ed2929] focus:ring-2 focus:ring-[#ed2929]/10"
                            />

                            <button
                              type="button"
                              onClick={() => void handleUpdateViews(submission)}
                              disabled={updatingViews === submission._id}
                              className="rounded-xl bg-[#ed2929] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#d92121] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {updatingViews === submission._id
                                ? "Updating..."
                                : "Save views"}
                            </button>
                          </div>

                          <p className="mt-2 text-xs leading-5 text-[#938c82]">
                            Enter the current view count for this post. Your
                            backend will process the payout calculation.
                          </p>
                        </div>

                        {submission.createdAt && (
                          <p className="mt-4 text-xs text-[#938c82]">
                            Submitted{" "}
                            {new Date(submission.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        <footer className="mt-12 border-t border-[#e3ded5] py-6 text-center text-xs text-[#938c82]">
          © 2026 Meme’d. All rights reserved.
        </footer>
      </div>
    </main>
  );
}

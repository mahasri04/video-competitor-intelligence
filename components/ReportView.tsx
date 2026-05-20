"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Trophy,
  Users,
  Video,
  TrendingUp,
  Target,
  Lightbulb,
  Award,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import type { CompetitorReport } from "@/lib/types";
import { formatNumber, formatDate } from "@/lib/format";

interface ReportViewProps {
  report: CompetitorReport;
}

const CHART_COLORS = ["#4f46e5", "#f97316", "#14b8a6", "#f43f5e", "#8b5cf6"];

export default function ReportView({ report }: ReportViewProps) {
  const subscriberData = report.channels
    .filter((c) => c.channelId)
    .map((c) => ({
      name: c.companyName.length > 12 ? c.companyName.slice(0, 12) + "…" : c.companyName,
      subscribers: c.subscriberCount,
      videos: c.videoCount,
      uploadsPerMonth: c.uploadsPerMonth,
    }));

  const engagementData = report.channels
    .filter((c) => c.channelId)
    .map((c) => ({
      name: c.companyName.length > 12 ? c.companyName.slice(0, 12) + "…" : c.companyName,
      avgViews: c.avgViewsPerVideo,
      avgLikes: c.avgLikesPerVideo,
      engagement: c.avgEngagementRate,
    }));

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-800 to-brand-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-brand-200 text-sm font-medium mb-1">
              Competitive Intelligence Report
            </p>
            <h2 className="text-2xl md:text-3xl font-display font-bold">
              {report.yourCompany} vs{" "}
              {report.competitors.join(", ")}
            </h2>
            <p className="text-brand-200 text-sm mt-2">
              Generated {formatDate(report.generatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-5 py-3 backdrop-blur">
            <Trophy className="w-8 h-8 text-amber-300" />
            <div>
              <p className="text-xs text-brand-200">Market Leader</p>
              <p className="text-lg font-bold">{report.leader.company}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <Section title="Executive Summary" icon={<TrendingUp className="w-5 h-5" />}>
        <p className="text-slate-600 leading-relaxed">{report.executiveSummary}</p>
        <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <p className="text-sm font-medium text-amber-800">
            Why {report.leader.company} leads
          </p>
          <p className="text-sm text-amber-700 mt-1">{report.leader.reason}</p>
        </div>
      </Section>

      {/* Channel Overview */}
      <Section title="Channel Overview" icon={<Users className="w-5 h-5" />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Subscriber Count">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subscriberData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatNumber(v)} />
                <Tooltip formatter={(v: number) => formatNumber(v)} />
                <Bar dataKey="subscribers" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Upload Frequency (per month)">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subscriberData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="uploadsPerMonth" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {report.channels
            .filter((c) => c.channelId)
            .map((channel, i) => (
              <ChannelCard key={channel.companyName} channel={channel} colorIndex={i} />
            ))}
        </div>
      </Section>

      {/* Content Performance */}
      <Section title="Content Performance" icon={<Video className="w-5 h-5" />}>
        <div className="space-y-4">
          {report.channels
            .filter((c) => c.videos.length > 0)
            .map((channel) => {
              const top = channel.videos.slice(0, 3);
              return (
                <div
                  key={channel.companyName}
                  className="border border-slate-200 rounded-xl overflow-hidden"
                >
                  <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
                    <h4 className="font-semibold text-slate-800">
                      {channel.companyName}
                    </h4>
                    {channel.channelUrl && (
                      <a
                        href={channel.channelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:text-brand-700 text-sm flex items-center gap-1"
                      >
                        View channel <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100">
                    {top.map((video, vi) => (
                      <div key={video.id} className="px-4 py-3 flex gap-3">
                        <span className="text-xs font-bold text-slate-400 w-5 pt-1">
                          #{vi + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {video.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatNumber(video.viewCount)} views •{" "}
                            {formatNumber(video.likeCount)} likes •{" "}
                            {video.engagementRate}% engagement
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </Section>

      {/* Topics & Themes */}
      <Section title="Content Topics & Themes" icon={<Target className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.channels
            .filter((c) => c.channelId)
            .map((channel) => (
              <div
                key={channel.companyName}
                className="p-4 border border-slate-200 rounded-xl"
              >
                <h4 className="font-semibold text-slate-800 mb-2">
                  {channel.companyName}
                </h4>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {channel.topTopics.length > 0 ? (
                    channel.topTopics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-0.5 bg-brand-50 text-brand-700 text-xs rounded-full"
                      >
                        {topic}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No topics identified</span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  <span className="font-medium">Themes:</span>{" "}
                  {channel.contentThemes.join(", ") || "General brand content"}
                </p>
              </div>
            ))}
        </div>
        {report.comparativeInsights.industryTopics.length > 0 && (
          <p className="mt-4 text-sm text-slate-600">
            <span className="font-medium">Industry-wide topics:</span>{" "}
            {report.comparativeInsights.industryTopics.join(", ")}
          </p>
        )}
      </Section>

      {/* Engagement */}
      <Section title="Engagement Analysis" icon={<TrendingUp className="w-5 h-5" />}>
        <ChartCard title="Average Views & Likes per Video">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatNumber(v)} />
              <Tooltip formatter={(v: number) => formatNumber(v)} />
              <Legend />
              <Bar dataKey="avgViews" name="Avg Views" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgLikes" name="Avg Likes" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 font-medium text-slate-600">Company</th>
                <th className="text-right py-2 px-3 font-medium text-slate-600">Avg Views</th>
                <th className="text-right py-2 px-3 font-medium text-slate-600">Avg Likes</th>
                <th className="text-right py-2 px-3 font-medium text-slate-600">Avg Comments</th>
                <th className="text-right py-2 px-3 font-medium text-slate-600">Eng. Rate</th>
              </tr>
            </thead>
            <tbody>
              {report.channels
                .filter((c) => c.channelId)
                .map((c) => (
                  <tr key={c.companyName} className="border-b border-slate-100">
                    <td className="py-2 px-3 font-medium">{c.companyName}</td>
                    <td className="py-2 px-3 text-right">{formatNumber(c.avgViewsPerVideo)}</td>
                    <td className="py-2 px-3 text-right">{formatNumber(c.avgLikesPerVideo)}</td>
                    <td className="py-2 px-3 text-right">{formatNumber(c.avgCommentsPerVideo)}</td>
                    <td className="py-2 px-3 text-right">{c.avgEngagementRate}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Gap Analysis */}
      <Section title="Gap Analysis" icon={<AlertCircle className="w-5 h-5" />}>
        <div className="space-y-4">
          {report.gapAnalysis.map((gap) => (
            <div
              key={gap.company}
              className="p-4 border border-slate-200 rounded-xl"
            >
              <h4 className="font-semibold text-slate-800 mb-2">{gap.company}</h4>
              {gap.missingTopics.length > 0 && (
                <p className="text-sm text-slate-600 mb-1">
                  <span className="font-medium text-red-600">Missing topics:</span>{" "}
                  {gap.missingTopics.join(", ")}
                </p>
              )}
              {gap.underusedFormats.length > 0 && (
                <p className="text-sm text-slate-600 mb-1">
                  <span className="font-medium text-amber-600">Underused formats:</span>{" "}
                  {gap.underusedFormats.join(", ")}
                </p>
              )}
              {gap.opportunities.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {gap.opportunities.map((opp, i) => (
                    <li key={i} className="text-sm text-brand-700 flex items-start gap-2">
                      <span className="text-brand-400 mt-0.5">→</span>
                      {opp}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Recommendations */}
      <Section title="Recommendations" icon={<Lightbulb className="w-5 h-5" />}>
        <div className="space-y-3">
          {report.recommendations.map((rec, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border-l-4 ${
                rec.priority === "high"
                  ? "border-l-orange-500 bg-orange-50"
                  : rec.priority === "medium"
                    ? "border-l-brand-500 bg-brand-50"
                    : "border-l-slate-300 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                    rec.priority === "high"
                      ? "bg-orange-200 text-orange-800"
                      : rec.priority === "medium"
                        ? "bg-brand-200 text-brand-800"
                        : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {rec.priority}
                </span>
                <h4 className="font-semibold text-slate-800">{rec.title}</h4>
              </div>
              <p className="text-sm text-slate-600">{rec.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Rankings */}
      <Section title="Competitive Scorecard" icon={<Award className="w-5 h-5" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-600 text-white">
                <th className="text-left py-3 px-4 rounded-tl-lg">Rank</th>
                <th className="text-left py-3 px-4">Company</th>
                <th className="text-center py-3 px-4">Score</th>
                <th className="text-center py-3 px-4">Subs</th>
                <th className="text-center py-3 px-4">Engagement</th>
                <th className="text-center py-3 px-4">Consistency</th>
                <th className="text-left py-3 px-4 rounded-tr-lg">Strengths</th>
              </tr>
            </thead>
            <tbody>
              {report.rankings.map((r, i) => (
                <tr
                  key={r.company}
                  className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="py-3 px-4 font-bold text-brand-600">#{i + 1}</td>
                  <td className="py-3 px-4 font-medium">{r.company}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-12 h-8 rounded-lg bg-brand-100 text-brand-700 font-bold">
                      {r.overallScore}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600">
                    #{r.subscriberRank}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600">
                    #{r.engagementRank}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600">
                    #{r.consistencyRank}
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-xs">
                    {r.strengths.join(", ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-brand-600">{icon}</span>
        <h3 className="text-lg font-display font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-slate-100 rounded-xl p-4">
      <h4 className="text-sm font-medium text-slate-600 mb-3">{title}</h4>
      {children}
    </div>
  );
}

function ChannelCard({
  channel,
  colorIndex,
}: {
  channel: import("@/lib/types").ChannelData;
  colorIndex: number;
}) {
  const color = CHART_COLORS[colorIndex % CHART_COLORS.length];
  const consistencyColors = {
    high: "text-green-600 bg-green-50",
    medium: "text-amber-600 bg-amber-50",
    low: "text-red-600 bg-red-50",
  };

  return (
    <div className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        {channel.thumbnailUrl ? (
          <img
            src={channel.thumbnailUrl}
            alt={channel.channelTitle}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: color }}
          >
            {channel.companyName[0]}
          </div>
        )}
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">{channel.companyName}</h4>
          <p className="text-xs text-slate-500 truncate max-w-[180px]">
            {channel.channelTitle}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="bg-slate-50 rounded-lg p-2">
          <p className="text-lg font-bold text-slate-800">
            {formatNumber(channel.subscriberCount)}
          </p>
          <p className="text-xs text-slate-500">Subscribers</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <p className="text-lg font-bold text-slate-800">{channel.videoCount}</p>
          <p className="text-xs text-slate-500">Videos</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <p className="text-lg font-bold text-slate-800">{channel.uploadsPerMonth}</p>
          <p className="text-xs text-slate-500">Uploads/mo</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${consistencyColors[channel.postingConsistency]}`}
          >
            {channel.postingConsistency}
          </span>
          <p className="text-xs text-slate-500 mt-1">Consistency</p>
        </div>
      </div>
    </div>
  );
}

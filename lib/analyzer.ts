import type {
  ChannelData,
  CompetitorReport,
  GapAnalysis,
  Recommendation,
  CompanyRanking,
} from "./types";

export function analyzeCompetitors(
  yourCompany: string,
  competitors: string[],
  channels: ChannelData[]
): CompetitorReport {
  const validChannels = channels.filter((c) => c.channelId !== "");
  const leader = determineLeader(validChannels.length > 0 ? validChannels : channels);
  const executiveSummary = buildExecutiveSummary(
    yourCompany,
    channels,
    leader
  );
  const gapAnalysis = buildGapAnalysis(channels);
  const recommendations = buildRecommendations(yourCompany, channels, gapAnalysis);
  const rankings = buildRankings(channels);
  const comparativeInsights = buildComparativeInsights(channels);

  return {
    generatedAt: new Date().toISOString(),
    yourCompany,
    competitors,
    channels,
    leader,
    executiveSummary,
    gapAnalysis,
    recommendations,
    rankings,
    comparativeInsights,
  };
}

function determineLeader(channels: ChannelData[]): {
  company: string;
  reason: string;
} {
  if (channels.length === 0) {
    return { company: "N/A", reason: "No channel data available." };
  }

  const scores = channels.map((c) => {
    const subScore = normalize(c.subscriberCount, channels, "subscriberCount") * 30;
    const engScore =
      normalize(c.avgEngagementRate, channels, "avgEngagementRate") * 25;
    const viewScore =
      normalize(c.avgViewsPerVideo, channels, "avgViewsPerVideo") * 25;
    const consistScore =
      (c.postingConsistency === "high"
        ? 1
        : c.postingConsistency === "medium"
          ? 0.6
          : 0.2) * 20;
    return {
      company: c.companyName,
      score: subScore + engScore + viewScore + consistScore,
    };
  });

  scores.sort((a, b) => b.score - a.score);
  const winner = scores[0];
  const winnerChannel = channels.find((c) => c.companyName === winner.company)!;

  const reasons: string[] = [];
  if (
    winnerChannel.subscriberCount ===
    Math.max(...channels.map((c) => c.subscriberCount))
  ) {
    reasons.push("largest subscriber base");
  }
  if (
    winnerChannel.avgEngagementRate >=
    Math.max(...channels.map((c) => c.avgEngagementRate)) * 0.95
  ) {
    reasons.push("strong audience engagement");
  }
  if (winnerChannel.postingConsistency === "high") {
    reasons.push("consistent upload schedule");
  }
  if (winnerChannel.avgViewsPerVideo >= Math.max(...channels.map((c) => c.avgViewsPerVideo)) * 0.9) {
    reasons.push("high average video performance");
  }

  const reasonText =
    reasons.length > 0
      ? `${winner.company} leads video marketing with ${reasons.join(", ")}. Their content strategy combines reach with meaningful audience interaction.`
      : `${winner.company} shows the strongest overall video marketing performance across subscribers, engagement, and content consistency.`;

  return { company: winner.company, reason: reasonText };
}

function normalize(
  value: number,
  channels: ChannelData[],
  field: keyof ChannelData
): number {
  const values = channels.map((c) => c[field] as number);
  const max = Math.max(...values, 1);
  return value / max;
}

function buildExecutiveSummary(
  yourCompany: string,
  channels: ChannelData[],
  leader: { company: string; reason: string }
): string {
  const valid = channels.filter((c) => c.channelId);
  if (valid.length === 0) {
    return "Unable to retrieve sufficient YouTube data for the entered companies. Try using exact brand names as they appear on YouTube.";
  }

  const totalSubs = valid.reduce((s, c) => s + c.subscriberCount, 0);
  const avgUploads =
    valid.reduce((s, c) => s + c.uploadsPerMonth, 0) / valid.length;
  const yourChannel = channels.find((c) => c.companyName === yourCompany);

  let summary = `This competitive intelligence report analyzes ${valid.length} YouTube channel(s) across ${channels.map((c) => c.companyName).join(", ")}. `;
  summary += `${leader.company} currently leads in overall video marketing performance. ${leader.reason} `;
  summary += `The competitive set has a combined audience of ${formatNumber(totalSubs)} subscribers, with an average upload cadence of ${avgUploads.toFixed(1)} videos per month. `;

  if (yourChannel && yourChannel.channelId) {
    const yourRank =
      [...channels]
        .sort((a, b) => b.subscriberCount - a.subscriberCount)
        .findIndex((c) => c.companyName === yourCompany) + 1;
    summary += `${yourCompany} ranks #${yourRank} by subscribers`;
    if (yourChannel.avgEngagementRate > 0) {
      const engLeader = [...channels].sort(
        (a, b) => b.avgEngagementRate - a.avgEngagementRate
      )[0];
      if (engLeader.companyName === yourCompany) {
        summary += " and leads in engagement rate — a key strength to leverage";
      } else {
        summary += ` with ${yourChannel.avgEngagementRate}% average engagement`;
      }
    }
    summary += ". ";
  }

  const allTopics = new Set<string>();
  valid.forEach((c) => c.topTopics.forEach((t) => allTopics.add(t)));
  if (allTopics.size > 0) {
    summary += `Common content themes across competitors include ${Array.from(allTopics).slice(0, 5).join(", ")}. `;
  }

  summary +=
    "The following sections provide channel comparisons, performance benchmarks, gap analysis, and actionable recommendations for your video marketing strategy.";

  return summary;
}

function buildGapAnalysis(channels: ChannelData[]): GapAnalysis[] {
  const allTopics = new Map<string, number>();
  const allThemes = new Set<string>();

  for (const ch of channels) {
    for (const topic of ch.topTopics) {
      allTopics.set(topic, (allTopics.get(topic) ?? 0) + 1);
    }
    ch.contentThemes.forEach((t) => allThemes.add(t));
  }

  const industryTopics = [...allTopics.entries()]
    .filter(([, count]) => count >= 2)
    .map(([topic]) => topic);

  const industryThemes = Array.from(allThemes);

  return channels.map((ch) => {
    const missingTopics = industryTopics.filter(
      (t) => !ch.topTopics.includes(t)
    );
    const missingThemes = industryThemes.filter(
      (t) => !ch.contentThemes.includes(t)
    );

    const underusedFormats: string[] = [];
    const avgViews = ch.avgViewsPerVideo;
    const hasShortForm = ch.videos.some(
      (v) => v.title.toLowerCase().includes("#shorts") || v.title.includes("Short")
    );
    const hasLongForm = ch.videos.some((v) => {
      const desc = v.description.length;
      return desc > 500;
    });
    const hasTutorial = ch.videos.some((v) =>
      /how to|tutorial|guide|tips/i.test(v.title)
    );

    if (!hasShortForm) underusedFormats.push("YouTube Shorts");
    if (!hasTutorial) underusedFormats.push("Tutorial / how-to content");
    if (!hasLongForm && ch.videos.length > 0)
      underusedFormats.push("In-depth long-form content");

    const opportunities: string[] = [];
    if (missingTopics.length > 0) {
      opportunities.push(
        `Cover trending topics: ${missingTopics.slice(0, 3).join(", ")}`
      );
    }
    if (missingThemes.length > 0) {
      opportunities.push(
        `Explore content formats: ${missingThemes.slice(0, 2).join(", ")}`
      );
    }
    if (ch.postingConsistency === "low") {
      opportunities.push(
        "Increase posting frequency to at least 4 videos/month for algorithm visibility"
      );
    }
    if (avgViews < Math.max(...channels.map((c) => c.avgViewsPerVideo)) * 0.5) {
      opportunities.push(
        "Optimize thumbnails and titles — competitor top videos outperform significantly"
      );
    }

    return {
      company: ch.companyName,
      missingTopics: missingTopics.slice(0, 5),
      underusedFormats,
      opportunities: opportunities.slice(0, 4),
    };
  });
}

function buildRecommendations(
  yourCompany: string,
  channels: ChannelData[],
  gaps: GapAnalysis[]
): Recommendation[] {
  const recs: Recommendation[] = [];
  const yourChannel = channels.find((c) => c.companyName === yourCompany);
  const yourGaps = gaps.find((g) => g.company === yourCompany);
  const leader = [...channels].sort(
    (a, b) => b.subscriberCount - a.subscriberCount
  )[0];

  if (yourChannel && leader && yourChannel.companyName !== leader.companyName) {
    recs.push({
      priority: "high",
      title: "Study and adapt leader content patterns",
      description: `${leader.companyName} leads with ${formatNumber(leader.subscriberCount)} subscribers and ${leader.uploadsPerMonth} uploads/month. Analyze their top 5 videos for title formulas, video length, and hook patterns.`,
      forCompany: yourCompany,
    });
  }

  if (yourGaps && yourGaps.missingTopics.length > 0) {
    recs.push({
      priority: "high",
      title: "Fill content topic gaps",
      description: `Competitors are covering topics you haven't addressed: ${yourGaps.missingTopics.join(", ")}. Create a content series around these themes within 30 days.`,
      forCompany: yourCompany,
    });
  }

  if (yourChannel && yourChannel.postingConsistency !== "high") {
    recs.push({
      priority: "high",
      title: "Establish a consistent publishing calendar",
      description: `You currently upload ~${yourChannel.uploadsPerMonth} videos/month. Competitors with high consistency upload 8+ times monthly. Commit to a fixed weekly schedule (e.g., every Tuesday and Friday).`,
      forCompany: yourCompany,
    });
  }

  recs.push({
    priority: "medium",
    title: "Double down on high-engagement formats",
    description:
      "Videos with tutorials, behind-the-scenes, and customer stories typically drive 2-3x higher engagement. Audit your top 3 performing videos and create variations on those themes.",
    forCompany: yourCompany,
  });

  if (yourGaps && yourGaps.underusedFormats.includes("YouTube Shorts")) {
    recs.push({
      priority: "medium",
      title: "Launch a YouTube Shorts strategy",
      description:
        "Shorts are underused in your channel but competitors leverage them for discovery. Repurpose long-form highlights into 30-60 second vertical clips weekly.",
      forCompany: yourCompany,
    });
  }

  recs.push({
    priority: "medium",
    title: "Improve video SEO and discoverability",
    description:
      "Optimize titles with primary keywords in the first 40 characters, write 200+ word descriptions with timestamps, and use 5-8 relevant tags. Competitors with strong SEO see higher organic reach.",
    forCompany: yourCompany,
  });

  recs.push({
    priority: "low",
    title: "Build community through engagement loops",
    description:
      "End every video with a specific question, pin a comment within 1 hour of upload, and respond to top comments within 24 hours. This signals quality to the algorithm and builds loyalty.",
    forCompany: yourCompany,
  });

  recs.push({
    priority: "low",
    title: "Benchmark and iterate monthly",
    description:
      "Re-run competitive analysis monthly. Track subscriber growth rate, avg views per video, and engagement rate against this baseline report.",
    forCompany: yourCompany,
  });

  return recs;
}

function buildRankings(channels: ChannelData[]): CompanyRanking[] {
  const bySubs = [...channels].sort(
    (a, b) => b.subscriberCount - a.subscriberCount
  );
  const byEng = [...channels].sort(
    (a, b) => b.avgEngagementRate - a.avgEngagementRate
  );
  const byConsist = [...channels].sort((a, b) => {
    const order = { high: 3, medium: 2, low: 1 };
    return order[b.postingConsistency] - order[a.postingConsistency];
  });
  const byVolume = [...channels].sort(
    (a, b) => b.uploadsPerMonth - a.uploadsPerMonth
  );

  return channels.map((ch) => {
    const subRank = bySubs.findIndex((c) => c.companyName === ch.companyName) + 1;
    const engRank = byEng.findIndex((c) => c.companyName === ch.companyName) + 1;
    const consistRank =
      byConsist.findIndex((c) => c.companyName === ch.companyName) + 1;
    const volumeRank =
      byVolume.findIndex((c) => c.companyName === ch.companyName) + 1;

    const overallScore = Math.round(
      ((channels.length - subRank + 1) / channels.length) * 25 +
        ((channels.length - engRank + 1) / channels.length) * 25 +
        ((channels.length - consistRank + 1) / channels.length) * 25 +
        ((channels.length - volumeRank + 1) / channels.length) * 25
    );

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (subRank === 1) strengths.push("Market leader in subscribers");
    if (engRank === 1) strengths.push("Highest engagement rate");
    if (consistRank === 1) strengths.push("Most consistent posting");
    if (volumeRank === 1) strengths.push("Highest content output");

    if (subRank === channels.length) weaknesses.push("Smallest subscriber base");
    if (engRank === channels.length) weaknesses.push("Lowest engagement");
    if (consistRank === channels.length)
      weaknesses.push("Inconsistent posting schedule");
    if (ch.videos.length === 0) weaknesses.push("Limited video data available");

    return {
      company: ch.companyName,
      overallScore,
      subscriberRank: subRank,
      engagementRank: engRank,
      consistencyRank: consistRank,
      contentVolumeRank: volumeRank,
      strengths,
      weaknesses,
    };
  }).sort((a, b) => b.overallScore - a.overallScore);
}

function buildComparativeInsights(channels: ChannelData[]) {
  const valid = channels.filter((c) => c.channelId);
  const mostSubscribers =
    [...valid].sort((a, b) => b.subscriberCount - a.subscriberCount)[0]
      ?.companyName ?? "N/A";
  const highestEngagement =
    [...valid].sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)[0]
      ?.companyName ?? "N/A";
  const mostConsistent =
    [...valid].sort((a, b) => {
      const order = { high: 3, medium: 2, low: 1 };
      return order[b.postingConsistency] - order[a.postingConsistency];
    })[0]?.companyName ?? "N/A";

  let bestVideo = { company: "N/A", title: "", views: 0 };
  for (const ch of valid) {
    const top = ch.videos[0];
    if (top && top.viewCount > bestVideo.views) {
      bestVideo = {
        company: ch.companyName,
        title: top.title,
        views: top.viewCount,
      };
    }
  }

  const topicSet = new Map<string, number>();
  valid.forEach((c) =>
    c.topTopics.forEach((t) => topicSet.set(t, (topicSet.get(t) ?? 0) + 1))
  );
  const industryTopics = [...topicSet.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([t]) => t);

  return {
    mostSubscribers,
    highestEngagement,
    mostConsistent,
    bestPerformingVideo: bestVideo,
    industryTopics,
  };
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

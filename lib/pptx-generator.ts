import PptxGenJS from "pptxgenjs";
import type { CompetitorReport } from "./types";

const COLORS = {
  primary: "312E81",
  secondary: "4F46E5",
  accent: "F97316",
  dark: "1E1B4B",
  light: "F8FAFC",
  white: "FFFFFF",
  muted: "64748B",
  chart: ["4F46E5", "F97316", "14B8A6", "F43F5E", "8B5CF6"],
};

export async function generatePowerPoint(
  report: CompetitorReport
): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.author = "Video Competitor Intelligence";
  pptx.title = `Video Marketing Report - ${report.yourCompany}`;
  pptx.subject = "Competitive Video Intelligence Analysis";
  pptx.layout = "LAYOUT_16x9";

  addCoverSlide(pptx, report);
  addExecutiveSummarySlide(pptx, report);
  addChannelOverviewSlide(pptx, report);
  addContentPerformanceSlide(pptx, report);
  addTopicsThemesSlide(pptx, report);
  addPostingFrequencySlide(pptx, report);
  addEngagementSlide(pptx, report);
  addGapAnalysisSlide(pptx, report);
  addRecommendationsSlide(pptx, report);
  addRankingSummarySlide(pptx, report);

  const output = await pptx.write({ outputType: "nodebuffer" });
  return output as Buffer;
}

function addSlideHeader(
  slide: PptxGenJS.Slide,
  title: string,
  subtitle?: string
) {
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.9,
    fill: { color: COLORS.primary },
  });
  slide.addText(title, {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.5,
    fontSize: 22,
    bold: true,
    color: COLORS.white,
    fontFace: "Arial",
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5,
      y: 0.55,
      w: 9,
      h: 0.3,
      fontSize: 11,
      color: "C7D6FE",
      fontFace: "Arial",
    });
  }
}

function addCoverSlide(pptx: PptxGenJS, report: CompetitorReport) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.dark };

  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
    fill: { color: COLORS.dark },
  });

  slide.addShape("rect", {
    x: 0,
    y: 4.5,
    w: "100%",
    h: 1,
    fill: { color: COLORS.secondary },
  });

  slide.addText("Video Competitor\nIntelligence Report", {
    x: 0.8,
    y: 1.2,
    w: 8.4,
    h: 1.8,
    fontSize: 36,
    bold: true,
    color: COLORS.white,
    fontFace: "Arial",
  });

  const allCompanies = [report.yourCompany, ...report.competitors];
  slide.addText(allCompanies.join("  •  "), {
    x: 0.8,
    y: 3.2,
    w: 8.4,
    h: 0.8,
    fontSize: 16,
    color: COLORS.accent,
    fontFace: "Arial",
  });

  slide.addText(
    `Report Date: ${new Date(report.generatedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    {
      x: 0.8,
      y: 4.7,
      w: 8,
      h: 0.4,
      fontSize: 12,
      color: COLORS.white,
      fontFace: "Arial",
    }
  );

  slide.addText("Prepared by Video Competitor Intelligence Tool", {
    x: 0.8,
    y: 5.1,
    w: 8,
    h: 0.3,
    fontSize: 10,
    color: "C7D6FE",
    fontFace: "Arial",
  });
}

function addExecutiveSummarySlide(pptx: PptxGenJS, report: CompetitorReport) {
  const slide = pptx.addSlide();
  addSlideHeader(slide, "Executive Summary", "Key findings at a glance");

  slide.addShape("rect", {
    x: 0.5,
    y: 1.2,
    w: 4.2,
    h: 1.2,
    fill: { color: "EEF2FF" },
    rectRadius: 0.1,
  });
  slide.addText("Market Leader", {
    x: 0.7,
    y: 1.3,
    w: 3.8,
    h: 0.3,
    fontSize: 11,
    color: COLORS.muted,
    fontFace: "Arial",
  });
  slide.addText(report.leader.company, {
    x: 0.7,
    y: 1.6,
    w: 3.8,
    h: 0.4,
    fontSize: 20,
    bold: true,
    color: COLORS.secondary,
    fontFace: "Arial",
  });

  slide.addShape("rect", {
    x: 5,
    y: 1.2,
    w: 4.5,
    h: 1.2,
    fill: { color: "FFF7ED" },
    rectRadius: 0.1,
  });
  slide.addText("Channels Analyzed", {
    x: 5.2,
    y: 1.3,
    w: 4,
    h: 0.3,
    fontSize: 11,
    color: COLORS.muted,
    fontFace: "Arial",
  });
  slide.addText(String(report.channels.filter((c) => c.channelId).length), {
    x: 5.2,
    y: 1.6,
    w: 4,
    h: 0.4,
    fontSize: 20,
    bold: true,
    color: COLORS.accent,
    fontFace: "Arial",
  });

  const summaryChunks = splitText(report.executiveSummary, 500);
  slide.addText(summaryChunks[0], {
    x: 0.5,
    y: 2.6,
    w: 9,
    h: 2.5,
    fontSize: 12,
    color: "334155",
    fontFace: "Arial",
    valign: "top",
  });

  slide.addText(`Why ${report.leader.company} leads:`, {
    x: 0.5,
    y: 4.8,
    w: 9,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: COLORS.primary,
    fontFace: "Arial",
  });
  slide.addText(report.leader.reason, {
    x: 0.5,
    y: 5.1,
    w: 9,
    h: 0.6,
    fontSize: 10,
    color: COLORS.muted,
    fontFace: "Arial",
  });
}

function addChannelOverviewSlide(pptx: PptxGenJS, report: CompetitorReport) {
  const slide = pptx.addSlide();
  addSlideHeader(
    slide,
    "Channel Overview Comparison",
    "Subscribers, videos, and total views"
  );

  const channels = report.channels.filter((c) => c.channelId);
  const labels = channels.map((c) =>
    c.companyName.length > 12 ? c.companyName.slice(0, 12) + "…" : c.companyName
  );

  slide.addChart(pptx.ChartType.bar, [
    {
      name: "Subscribers",
      labels,
      values: channels.map((c) => c.subscriberCount),
    },
  ], {
    x: 0.4,
    y: 1.1,
    w: 4.5,
    h: 3.2,
    showTitle: true,
    title: "Subscriber Count",
    chartColors: [COLORS.secondary],
    showValue: true,
    valAxisMaxVal: Math.max(...channels.map((c) => c.subscriberCount)) * 1.2 || 1000,
    catAxisLabelFontSize: 8,
  });

  slide.addChart(pptx.ChartType.bar, [
    {
      name: "Total Videos",
      labels,
      values: channels.map((c) => c.videoCount),
    },
  ], {
    x: 5.1,
    y: 1.1,
    w: 4.5,
    h: 3.2,
    showTitle: true,
    title: "Total Videos Published",
    chartColors: [COLORS.accent],
    showValue: true,
    catAxisLabelFontSize: 8,
  });

  const tableData = [
    [
      { text: "Company", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
      { text: "Subscribers", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
      { text: "Videos", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
      { text: "Uploads/Mo", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
    ],
    ...channels.map((c) => [
      c.companyName,
      formatNum(c.subscriberCount),
      String(c.videoCount),
      String(c.uploadsPerMonth),
    ]),
  ] as PptxGenJS.TableRow[];

  slide.addTable(tableData, {
    x: 0.4,
    y: 4.4,
    w: 9.2,
    h: 1.2,
    fontSize: 9,
    border: { pt: 0.5, color: "E2E8F0" },
    colW: [2.5, 2.2, 2.2, 2.3],
  });
}

function addContentPerformanceSlide(pptx: PptxGenJS, report: CompetitorReport) {
  const slide = pptx.addSlide();
  addSlideHeader(
    slide,
    "Content Performance",
    "Top performing videos by views"
  );

  const channels = report.channels.filter((c) => c.videos.length > 0);
  let yPos = 1.1;

  for (const ch of channels.slice(0, 5)) {
    const top = ch.videos[0];
    if (!top) continue;

    slide.addShape("rect", {
      x: 0.4,
      y: yPos,
      w: 9.2,
      h: 0.85,
      fill: { color: yPos % 2 === 0 ? "F8FAFC" : "FFFFFF" },
      line: { color: "E2E8F0", width: 0.5 },
    });

    slide.addText(ch.companyName, {
      x: 0.5,
      y: yPos + 0.05,
      w: 2,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: COLORS.secondary,
      fontFace: "Arial",
    });

    const title =
      top.title.length > 55 ? top.title.slice(0, 55) + "…" : top.title;
    slide.addText(title, {
      x: 2.6,
      y: yPos + 0.05,
      w: 5.5,
      h: 0.35,
      fontSize: 9,
      color: "334155",
      fontFace: "Arial",
    });

    slide.addText(
      `${formatNum(top.viewCount)} views  •  ${formatNum(top.likeCount)} likes  •  ${top.engagementRate}% eng.`,
      {
        x: 2.6,
        y: yPos + 0.4,
        w: 6,
        h: 0.3,
        fontSize: 8,
        color: COLORS.muted,
        fontFace: "Arial",
      }
    );

    yPos += 0.95;
    if (yPos > 5) break;
  }

  if (channels.length === 0) {
    slide.addText("No video performance data available.", {
      x: 0.5,
      y: 2,
      w: 9,
      h: 1,
      fontSize: 12,
      color: COLORS.muted,
    });
  }
}

function addTopicsThemesSlide(pptx: PptxGenJS, report: CompetitorReport) {
  const slide = pptx.addSlide();
  addSlideHeader(
    slide,
    "Content Topics & Themes",
    "What each company covers"
  );

  const channels = report.channels.filter((c) => c.channelId);
  let y = 1.1;

  for (const ch of channels) {
    slide.addText(ch.companyName, {
      x: 0.4,
      y,
      w: 2.5,
      h: 0.35,
      fontSize: 11,
      bold: true,
      color: COLORS.primary,
      fontFace: "Arial",
    });

    const topics =
      ch.topTopics.length > 0
        ? ch.topTopics.slice(0, 6).join("  •  ")
        : "No topics identified";
    slide.addText(`Topics: ${topics}`, {
      x: 0.4,
      y: y + 0.35,
      w: 9.2,
      h: 0.35,
      fontSize: 9,
      color: "475569",
      fontFace: "Arial",
    });

    const themes =
      ch.contentThemes.length > 0
        ? ch.contentThemes.join("  |  ")
        : "General brand content";
    slide.addText(`Themes: ${themes}`, {
      x: 0.4,
      y: y + 0.7,
      w: 9.2,
      h: 0.35,
      fontSize: 9,
      color: COLORS.muted,
      fontFace: "Arial",
    });

    y += 1.15;
    if (y > 5.2) break;
  }

  if (report.comparativeInsights.industryTopics.length > 0) {
    slide.addShape("rect", {
      x: 0.4,
      y: 5.0,
      w: 9.2,
      h: 0.55,
      fill: { color: "EEF2FF" },
    });
    slide.addText(
      `Industry-wide topics: ${report.comparativeInsights.industryTopics.slice(0, 8).join(", ")}`,
      {
        x: 0.5,
        y: 5.1,
        w: 9,
        h: 0.4,
        fontSize: 9,
        italic: true,
        color: COLORS.secondary,
        fontFace: "Arial",
      }
    );
  }
}

function addPostingFrequencySlide(pptx: PptxGenJS, report: CompetitorReport) {
  const slide = pptx.addSlide();
  addSlideHeader(
    slide,
    "Posting Frequency & Consistency",
    "Who is most active and on what cadence"
  );

  const channels = report.channels.filter((c) => c.channelId);
  const labels = channels.map((c) =>
    c.companyName.length > 10 ? c.companyName.slice(0, 10) + "…" : c.companyName
  );

  slide.addChart(pptx.ChartType.bar, [
    {
      name: "Uploads per Month",
      labels,
      values: channels.map((c) => c.uploadsPerMonth),
    },
  ], {
    x: 0.4,
    y: 1.1,
    w: 5.5,
    h: 3.5,
    showTitle: true,
    title: "Average Uploads per Month",
    chartColors: COLORS.chart,
    showValue: true,
    catAxisLabelFontSize: 8,
  });

  const consistData = [
    [
      { text: "Company", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
      { text: "Uploads/Month", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
      { text: "Consistency", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
      { text: "Assessment", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
    ],
    ...channels.map((c) => [
      c.companyName,
      String(c.uploadsPerMonth),
      c.postingConsistency.toUpperCase(),
      c.postingConsistency === "high"
        ? "Strong — algorithm-friendly cadence"
        : c.postingConsistency === "medium"
          ? "Moderate — room to increase"
          : "Low — needs content calendar",
    ]),
  ] as PptxGenJS.TableRow[];

  slide.addTable(consistData, {
    x: 5.8,
    y: 1.1,
    w: 3.8,
    h: 3.5,
    fontSize: 8,
    border: { pt: 0.5, color: "E2E8F0" },
    colW: [1.2, 0.9, 0.8, 0.9],
  });

  const mostActive = [...channels].sort(
    (a, b) => b.uploadsPerMonth - a.uploadsPerMonth
  )[0];
  if (mostActive) {
    slide.addText(
      `Insight: ${mostActive.companyName} is the most active publisher with ${mostActive.uploadsPerMonth} uploads/month, giving them a visibility advantage in YouTube's recommendation system.`,
      {
        x: 0.4,
        y: 4.8,
        w: 9.2,
        h: 0.7,
        fontSize: 10,
        color: "334155",
        fontFace: "Arial",
      }
    );
  }
}

function addEngagementSlide(pptx: PptxGenJS, report: CompetitorReport) {
  const slide = pptx.addSlide();
  addSlideHeader(
    slide,
    "Engagement Analysis",
    "Average views, likes, and comments per video"
  );

  const channels = report.channels.filter((c) => c.channelId);
  const labels = channels.map((c) =>
    c.companyName.length > 10 ? c.companyName.slice(0, 10) + "…" : c.companyName
  );

  slide.addChart(pptx.ChartType.bar, [
    {
      name: "Avg Views",
      labels,
      values: channels.map((c) => c.avgViewsPerVideo),
    },
    {
      name: "Avg Likes",
      labels,
      values: channels.map((c) => c.avgLikesPerVideo),
    },
  ], {
    x: 0.4,
    y: 1.1,
    w: 5.5,
    h: 3.2,
    showTitle: true,
    title: "Avg Views vs Likes per Video",
    chartColors: [COLORS.secondary, COLORS.accent],
    barDir: "col",
    catAxisLabelFontSize: 8,
  });

  slide.addChart(pptx.ChartType.bar, [
    {
      name: "Engagement Rate %",
      labels,
      values: channels.map((c) => c.avgEngagementRate),
    },
  ], {
    x: 5.8,
    y: 1.1,
    w: 3.8,
    h: 3.2,
    showTitle: true,
    title: "Engagement Rate (%)",
    chartColors: [COLORS.chart[2]],
    showValue: true,
    catAxisLabelFontSize: 8,
  });

  const engTable = [
    [
      { text: "Company", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
      { text: "Avg Views", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
      { text: "Avg Likes", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
      { text: "Avg Comments", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
      { text: "Eng. Rate", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
    ],
    ...channels.map((c) => [
      c.companyName,
      formatNum(c.avgViewsPerVideo),
      formatNum(c.avgLikesPerVideo),
      formatNum(c.avgCommentsPerVideo),
      `${c.avgEngagementRate}%`,
    ]),
  ] as PptxGenJS.TableRow[];

  slide.addTable(engTable, {
    x: 0.4,
    y: 4.5,
    w: 9.2,
    h: 1.2,
    fontSize: 8,
    border: { pt: 0.5, color: "E2E8F0" },
    colW: [2, 1.8, 1.8, 1.8, 1.8],
  });
}

function addGapAnalysisSlide(pptx: PptxGenJS, report: CompetitorReport) {
  const slide = pptx.addSlide();
  addSlideHeader(
    slide,
    "Gap Analysis",
    "Topics and formats competitors are covering that others miss"
  );

  let y = 1.1;
  for (const gap of report.gapAnalysis.slice(0, 4)) {
    slide.addText(gap.company, {
      x: 0.4,
      y,
      w: 9.2,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: COLORS.secondary,
      fontFace: "Arial",
    });

    const missing =
      gap.missingTopics.length > 0
        ? `Missing topics: ${gap.missingTopics.join(", ")}`
        : "Covering most industry topics";
    slide.addText(missing, {
      x: 0.4,
      y: y + 0.32,
      w: 9.2,
      h: 0.3,
      fontSize: 9,
      color: "475569",
      fontFace: "Arial",
    });

    if (gap.underusedFormats.length > 0) {
      slide.addText(`Underused formats: ${gap.underusedFormats.join(", ")}`, {
        x: 0.4,
        y: y + 0.62,
        w: 9.2,
        h: 0.3,
        fontSize: 9,
        color: COLORS.accent,
        fontFace: "Arial",
      });
    }

    if (gap.opportunities.length > 0) {
      slide.addText(
        `Opportunity: ${gap.opportunities[0]}`,
        {
          x: 0.4,
          y: y + 0.92,
          w: 9.2,
          h: 0.3,
          fontSize: 8,
          italic: true,
          color: COLORS.muted,
          fontFace: "Arial",
        }
      );
    }

    y += 1.35;
    if (y > 5.5) break;
  }
}

function addRecommendationsSlide(pptx: PptxGenJS, report: CompetitorReport) {
  const slide = pptx.addSlide();
  addSlideHeader(
    slide,
    "Video Marketing Recommendations",
    "Specific, actionable steps based on the data"
  );

  const high = report.recommendations.filter((r) => r.priority === "high");
  const medium = report.recommendations.filter((r) => r.priority === "medium");

  let y = 1.1;
  const items = [...high, ...medium].slice(0, 5);

  for (const rec of items) {
    const priorityColor =
      rec.priority === "high" ? COLORS.accent : COLORS.secondary;

    slide.addShape("rect", {
      x: 0.4,
      y,
      w: 0.08,
      h: 0.75,
      fill: { color: priorityColor },
    });

    slide.addText(`${rec.priority.toUpperCase()}: ${rec.title}`, {
      x: 0.6,
      y,
      w: 9,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: COLORS.primary,
      fontFace: "Arial",
    });

    slide.addText(rec.description, {
      x: 0.6,
      y: y + 0.32,
      w: 9,
      h: 0.45,
      fontSize: 9,
      color: "475569",
      fontFace: "Arial",
    });

    y += 0.9;
  }
}

function addRankingSummarySlide(pptx: PptxGenJS, report: CompetitorReport) {
  const slide = pptx.addSlide();
  addSlideHeader(
    slide,
    "Competitive Scorecard",
    "Overall ranking on key video marketing metrics"
  );

  const rankTable = [
    [
      { text: "Rank", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
      { text: "Company", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
      { text: "Score", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
      { text: "Subs Rank", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
      { text: "Eng. Rank", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
      { text: "Consistency", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
      { text: "Key Strength", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.white } },
    ],
    ...report.rankings.map((r, i) => [
      `#${i + 1}`,
      r.company,
      `${r.overallScore}/100`,
      `#${r.subscriberRank}`,
      `#${r.engagementRank}`,
      `#${r.consistencyRank}`,
      r.strengths[0] ?? "—",
    ]),
  ] as PptxGenJS.TableRow[];

  slide.addTable(rankTable, {
    x: 0.3,
    y: 1.1,
    w: 9.4,
    h: 3.5,
    fontSize: 9,
    border: { pt: 0.5, color: "E2E8F0" },
    colW: [0.6, 2, 0.9, 1, 1, 1.1, 2.8],
  });

  const winner = report.rankings[0];
  if (winner) {
    slide.addShape("rect", {
      x: 0.3,
      y: 4.8,
      w: 9.4,
      h: 0.8,
      fill: { color: "EEF2FF" },
    });
    slide.addText(
      `Overall Winner: ${winner.company} (Score: ${winner.overallScore}/100) — Best positioned for video marketing leadership in this competitive set.`,
      {
        x: 0.5,
        y: 4.95,
        w: 9,
        h: 0.5,
        fontSize: 11,
        bold: true,
        color: COLORS.primary,
        fontFace: "Arial",
      }
    );
  }
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function splitText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    chunks.push(remaining.slice(0, maxLen));
    remaining = remaining.slice(maxLen);
  }
  return chunks;
}

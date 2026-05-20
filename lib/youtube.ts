import type { ChannelData, VideoData } from "./types";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface YouTubeSearchItem {
  id?: { channelId?: string };
  snippet?: { title?: string; description?: string; thumbnails?: { high?: { url?: string } } };
}

interface YouTubeChannelItem {
  id?: string;
  snippet?: {
    title?: string;
    description?: string;
    thumbnails?: { high?: { url?: string } };
  };
  statistics?: {
    subscriberCount?: string;
    videoCount?: string;
    viewCount?: string;
  };
  contentDetails?: { relatedPlaylists?: { uploads?: string } };
}

interface YouTubePlaylistItem {
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    resourceId?: { videoId?: string };
    thumbnails?: { medium?: { url?: string } };
  };
}

interface YouTubeVideoItem {
  id?: string;
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: { medium?: { url?: string } };
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

async function youtubeFetch<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "YouTube API key is not configured. Set YOUTUBE_API_KEY in your environment."
    );
  }

  const url = new URL(`${YOUTUBE_API_BASE}/${endpoint}`);
  url.searchParams.set("key", apiKey);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`YouTube API error (${res.status}): ${err.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export async function searchChannel(
  companyName: string
): Promise<{ channelId: string; title: string } | null> {
  const data = await youtubeFetch<{ items?: YouTubeSearchItem[] }>("search", {
    part: "snippet",
    q: `${companyName} official`,
    type: "channel",
    maxResults: "5",
  });

  const items = data.items ?? [];
  if (items.length === 0) {
    const fallback = await youtubeFetch<{ items?: YouTubeSearchItem[] }>(
      "search",
      {
        part: "snippet",
        q: companyName,
        type: "channel",
        maxResults: "5",
      }
    );
    const fbItems = fallback.items ?? [];
    if (fbItems.length === 0) return null;
    const best = pickBestChannelMatch(companyName, fbItems);
    if (!best?.id?.channelId) return null;
    return {
      channelId: best.id.channelId,
      title: best.snippet?.title ?? companyName,
    };
  }

  const best = pickBestChannelMatch(companyName, items);
  if (!best?.id?.channelId) return null;
  return {
    channelId: best.id.channelId,
    title: best.snippet?.title ?? companyName,
  };
}

function pickBestChannelMatch(
  companyName: string,
  items: YouTubeSearchItem[]
): YouTubeSearchItem | null {
  const normalized = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
  let best: YouTubeSearchItem | null = null;
  let bestScore = -1;

  for (const item of items) {
    const title = (item.snippet?.title ?? "").toLowerCase();
    const titleNorm = title.replace(/[^a-z0-9]/g, "");
    let score = 0;
    if (titleNorm.includes(normalized) || normalized.includes(titleNorm)) {
      score += 10;
    }
    if (title.includes(companyName.toLowerCase())) score += 5;
    if (title.includes("official")) score += 3;
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return best ?? items[0] ?? null;
}

export async function fetchChannelData(
  companyName: string,
  channelId: string
): Promise<ChannelData> {
  const channelRes = await youtubeFetch<{ items?: YouTubeChannelItem[] }>(
    "channels",
    {
      part: "snippet,statistics,contentDetails",
      id: channelId,
    }
  );

  const channel = channelRes.items?.[0];
  if (!channel) {
    throw new Error(`Channel not found for ${companyName}`);
  }

  const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
  let videos: VideoData[] = [];

  if (uploadsPlaylistId) {
    const playlistRes = await youtubeFetch<{ items?: YouTubePlaylistItem[] }>(
      "playlistItems",
      {
        part: "snippet",
        playlistId: uploadsPlaylistId,
        maxResults: "50",
      }
    );

    const videoIds = (playlistRes.items ?? [])
      .map((i) => i.snippet?.resourceId?.videoId)
      .filter((id): id is string => Boolean(id));

    if (videoIds.length > 0) {
      videos = await fetchVideoDetails(videoIds);
    }
  }

  const subscriberCount = parseInt(
    channel.statistics?.subscriberCount ?? "0",
    10
  );
  const videoCount = parseInt(channel.statistics?.videoCount ?? "0", 10);
  const viewCount = parseInt(channel.statistics?.viewCount ?? "0", 10);

  const avgViews =
    videos.length > 0
      ? videos.reduce((s, v) => s + v.viewCount, 0) / videos.length
      : 0;
  const avgLikes =
    videos.length > 0
      ? videos.reduce((s, v) => s + v.likeCount, 0) / videos.length
      : 0;
  const avgComments =
    videos.length > 0
      ? videos.reduce((s, v) => s + v.commentCount, 0) / videos.length
      : 0;
  const avgEngagement =
    videos.length > 0
      ? videos.reduce((s, v) => s + v.engagementRate, 0) / videos.length
      : 0;

  const uploadsPerMonth = calculateUploadsPerMonth(videos);
  const postingConsistency = getPostingConsistency(uploadsPerMonth);
  const { topTopics, contentThemes } = extractTopicsFromVideos(videos);

  return {
    companyName,
    channelId,
    channelTitle: channel.snippet?.title ?? companyName,
    channelUrl: `https://www.youtube.com/channel/${channelId}`,
    subscriberCount,
    videoCount,
    viewCount,
    description: channel.snippet?.description ?? "",
    thumbnailUrl: channel.snippet?.thumbnails?.high?.url ?? "",
    videos: videos.sort((a, b) => b.viewCount - a.viewCount),
    avgViewsPerVideo: Math.round(avgViews),
    avgLikesPerVideo: Math.round(avgLikes),
    avgCommentsPerVideo: Math.round(avgComments),
    avgEngagementRate: Math.round(avgEngagement * 100) / 100,
    uploadsPerMonth,
    postingConsistency,
    topTopics,
    contentThemes,
  };
}

async function fetchVideoDetails(videoIds: string[]): Promise<VideoData[]> {
  const chunks: string[][] = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    chunks.push(videoIds.slice(i, i + 50));
  }

  const allVideos: VideoData[] = [];

  for (const chunk of chunks) {
    const res = await youtubeFetch<{ items?: YouTubeVideoItem[] }>("videos", {
      part: "snippet,statistics",
      id: chunk.join(","),
    });

    for (const item of res.items ?? []) {
      const views = parseInt(item.statistics?.viewCount ?? "0", 10);
      const likes = parseInt(item.statistics?.likeCount ?? "0", 10);
      const comments = parseInt(item.statistics?.commentCount ?? "0", 10);
      const engagementRate =
        views > 0 ? ((likes + comments) / views) * 100 : 0;

      allVideos.push({
        id: item.id ?? "",
        title: item.snippet?.title ?? "",
        description: item.snippet?.description ?? "",
        publishedAt: item.snippet?.publishedAt ?? "",
        viewCount: views,
        likeCount: likes,
        commentCount: comments,
        thumbnailUrl: item.snippet?.thumbnails?.medium?.url ?? "",
        engagementRate: Math.round(engagementRate * 100) / 100,
      });
    }
  }

  return allVideos;
}

function calculateUploadsPerMonth(videos: VideoData[]): number {
  if (videos.length < 2) return videos.length;

  const dates = videos
    .map((v) => new Date(v.publishedAt).getTime())
    .filter((d) => !isNaN(d))
    .sort((a, b) => a - b);

  if (dates.length < 2) return 0;

  const spanMs = dates[dates.length - 1] - dates[0];
  const spanMonths = spanMs / (1000 * 60 * 60 * 24 * 30);
  if (spanMonths < 0.5) return videos.length * 2;
  return Math.round((videos.length / spanMonths) * 10) / 10;
}

function getPostingConsistency(
  uploadsPerMonth: number
): "high" | "medium" | "low" {
  if (uploadsPerMonth >= 8) return "high";
  if (uploadsPerMonth >= 3) return "medium";
  return "low";
}

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "must", "shall", "can", "need",
  "this", "that", "these", "those", "i", "you", "he", "she", "it", "we",
  "they", "what", "which", "who", "when", "where", "why", "how", "all",
  "each", "every", "both", "few", "more", "most", "other", "some", "such",
  "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very",
  "just", "new", "now", "our", "your", "my", "his", "her", "its", "up",
  "out", "about", "into", "over", "after", "before", "between", "under",
  "again", "further", "then", "once", "here", "there", "any", "as", "if",
  "video", "official", "full", "hd", "4k", "watch", "subscribe", "channel",
]);

function extractTopicsFromVideos(videos: VideoData[]): {
  topTopics: string[];
  contentThemes: string[];
} {
  const wordFreq = new Map<string, number>();

  for (const video of videos) {
    const text = `${video.title} ${video.description}`.toLowerCase();
    const words = text.match(/[a-z]{3,}/g) ?? [];
    for (const word of words) {
      if (STOP_WORDS.has(word)) continue;
      wordFreq.set(word, (wordFreq.get(word) ?? 0) + 1);
    }
  }

  const sorted = [...wordFreq.entries()].sort((a, b) => b[1] - a[1]);
  const topTopics = sorted.slice(0, 8).map(([w]) => w);
  const contentThemes = categorizeThemes(topTopics, videos);
  return { topTopics, contentThemes };
}

function categorizeThemes(topWords: string[], videos: VideoData[]): string[] {
  const themes: string[] = [];
  const allText = videos
    .map((v) => `${v.title} ${v.description}`)
    .join(" ")
    .toLowerCase();

  const themePatterns: [string, RegExp][] = [
    ["Product demos & tutorials", /tutorial|how to|demo|guide|learn|tips/i],
    ["Brand storytelling", /story|journey|behind|culture|team|mission/i],
    ["Customer testimonials", /review|testimonial|customer|experience|feedback/i],
    ["Educational content", /explained|education|what is|science|facts/i],
    ["Entertainment & lifestyle", /fun|challenge|vlog|day in|lifestyle/i],
    ["Product launches", /launch|new|introducing|unveil|announcement/i],
    ["Industry news", /news|update|trend|report|industry/i],
    ["Events & campaigns", /event|live|festival|campaign|celebration/i],
  ];

  for (const [theme, pattern] of themePatterns) {
    if (pattern.test(allText)) themes.push(theme);
  }

  if (themes.length === 0 && topWords.length > 0) {
    themes.push(`Focus on: ${topWords.slice(0, 3).join(", ")}`);
  }

  return themes.slice(0, 5);
}

export async function fetchAllCompanies(
  yourCompany: string,
  competitors: string[]
): Promise<ChannelData[]> {
  const allNames = [yourCompany, ...competitors];
  const results: ChannelData[] = [];

  for (const name of allNames) {
    const found = await searchChannel(name);
    if (!found) {
      results.push(createPlaceholderChannel(name));
      continue;
    }
    try {
      const data = await fetchChannelData(name, found.channelId);
      results.push(data);
    } catch {
      results.push(createPlaceholderChannel(name));
    }
  }

  return results;
}

function createPlaceholderChannel(companyName: string): ChannelData {
  return {
    companyName,
    channelId: "",
    channelTitle: `${companyName} (channel not found)`,
    channelUrl: "",
    subscriberCount: 0,
    videoCount: 0,
    viewCount: 0,
    description: "No public YouTube channel found for this company name.",
    thumbnailUrl: "",
    videos: [],
    avgViewsPerVideo: 0,
    avgLikesPerVideo: 0,
    avgCommentsPerVideo: 0,
    avgEngagementRate: 0,
    uploadsPerMonth: 0,
    postingConsistency: "low",
    topTopics: [],
    contentThemes: [],
  };
}

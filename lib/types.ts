export interface VideoData {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  thumbnailUrl: string;
  engagementRate: number;
}

export interface ChannelData {
  companyName: string;
  channelId: string;
  channelTitle: string;
  channelUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  description: string;
  thumbnailUrl: string;
  videos: VideoData[];
  avgViewsPerVideo: number;
  avgLikesPerVideo: number;
  avgCommentsPerVideo: number;
  avgEngagementRate: number;
  uploadsPerMonth: number;
  postingConsistency: "high" | "medium" | "low";
  topTopics: string[];
  contentThemes: string[];
}

export interface GapAnalysis {
  company: string;
  missingTopics: string[];
  underusedFormats: string[];
  opportunities: string[];
}

export interface Recommendation {
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  forCompany: string;
}

export interface CompanyRanking {
  company: string;
  overallScore: number;
  subscriberRank: number;
  engagementRank: number;
  consistencyRank: number;
  contentVolumeRank: number;
  strengths: string[];
  weaknesses: string[];
}

export interface CompetitorReport {
  generatedAt: string;
  yourCompany: string;
  competitors: string[];
  channels: ChannelData[];
  leader: {
    company: string;
    reason: string;
  };
  executiveSummary: string;
  gapAnalysis: GapAnalysis[];
  recommendations: Recommendation[];
  rankings: CompanyRanking[];
  comparativeInsights: {
    mostSubscribers: string;
    highestEngagement: string;
    mostConsistent: string;
    bestPerformingVideo: { company: string; title: string; views: number };
    industryTopics: string[];
  };
}

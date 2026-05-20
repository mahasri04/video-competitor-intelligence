# Video Competitor Intelligence & Report Generator

A web application that analyzes YouTube video marketing performance across your company and up to 4 competitors. Fetches real public data, generates strategic insights, displays an interactive report, and exports a professional PowerPoint presentation.

Built for **MyPromoVideos Round 2 Assessment**.

## Features

- **Company input**: Your company + up to 4 competitors
- **Real YouTube data**: Subscriber counts, videos, views, likes, comments, upload frequency
- **Strategic analysis**: Executive summary, gap analysis, topic coverage, recommendations
- **Web report**: Interactive charts and tables (Recharts)
- **PowerPoint export**: 10+ slide professional `.pptx` with charts and consistent branding

## PowerPoint Slides (11 slides)

1. Cover — company names and report date
2. Executive Summary — market leader and key findings
3. Channel Overview — subscriber and video count charts
4. Content Performance — top videos per company
5. Content Topics & Themes — topic tags and content themes
6. Posting Frequency & Consistency — upload cadence comparison
7. Engagement Analysis — views, likes, comments, engagement rate
8. Gap Analysis — missing topics and opportunities
9. Video Marketing Recommendations — prioritized action items
10. Competitive Scorecard — rankings and overall scores

## Setup

### 1. Get a YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or use existing)
3. Enable **YouTube Data API v3**
4. Create credentials → API Key
5. (Recommended) Restrict the key to YouTube Data API v3 only

### 2. Install & Run Locally

```bash
npm install
cp .env.example .env.local
# Edit .env.local and add your YOUTUBE_API_KEY

npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add environment variable: `YOUTUBE_API_KEY` = your API key
4. Deploy

Your live URL will be: `https://your-project.vercel.app`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `YOUTUBE_API_KEY` | Yes | Google YouTube Data API v3 key |

## Usage

1. Enter your company name (as it appears on YouTube)
2. Add 1–4 competitor names
3. Click **Generate Competitive Report**
4. Review the web report (scroll through sections)
5. Click **Download PowerPoint Report** for the `.pptx` file

### Example Companies to Try

- **Nike** vs Adidas, Puma, Under Armour
- **Apple** vs Samsung, Google, Microsoft
- **Coca-Cola** vs Pepsi, Red Bull, Monster

Use exact brand names for best channel matching.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Recharts** (web charts)
- **PptxGenJS** (PowerPoint generation)
- **YouTube Data API v3**

## API Quota Note

Each analysis uses approximately 5–15 API units per company (search + channel + playlist + videos). The free tier allows 10,000 units/day — enough for hundreds of reports.

## Project Structure

```
app/
  api/analyze/     POST - fetch data & generate report
  api/download/    POST - generate PowerPoint file
  page.tsx         Main UI
components/
  CompanyForm.tsx  Input form
  ReportView.tsx   Report display with charts
lib/
  youtube.ts       YouTube API integration
  analyzer.ts      Competitive analysis engine
  pptx-generator.ts PowerPoint builder
  types.ts         TypeScript interfaces
```

## Submission Checklist

- [ ] Deploy to Vercel with `YOUTUBE_API_KEY` set
- [ ] Test with real company names (Nike, Adidas, etc.)
- [ ] Verify PowerPoint download works
- [ ] Zip source code for email attachment
- [ ] Record 5-min screen demo showing full flow

## License

Built for assessment purposes.

"use client";

import { useState } from "react";
import { Download, RotateCcw, BarChart3, Youtube } from "lucide-react";
import CompanyForm from "@/components/CompanyForm";
import ReportView from "@/components/ReportView";
import type { CompetitorReport } from "@/lib/types";

export default function Home() {
  const [report, setReport] = useState<CompetitorReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (yourCompany: string, competitors: string[]) => {
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yourCompany, competitors }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setReport(data);
      setTimeout(() => {
        document.getElementById("report-section")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!report) return;
    setIsDownloading(true);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Download failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Video_Report_${report.yourCompany.replace(/[^a-zA-Z0-9]/g, "_")}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-brand-50/30">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-slate-900">
                Video Competitor Intelligence
              </h1>
              <p className="text-xs text-slate-500">YouTube competitive analysis & reports</p>
            </div>
          </div>
          <div
            className="flex items-center gap-2.5 shrink-0 pl-3 sm:pl-4 border-l border-slate-200"
            title="Made by Maha Sri"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 via-brand-600 to-orange-500 text-xs font-bold text-white shadow-sm">
              MS
            </div>
            <div className="flex flex-col justify-center gap-0.5">
              <span className="text-[10px] font-medium uppercase leading-none tracking-wider text-slate-400">
                Crafted by
              </span>
              <span className="font-display text-sm font-semibold leading-none bg-gradient-to-r from-brand-700 to-orange-500 bg-clip-text text-transparent">
                Maha Sri
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Hero - only show when no report */}
        {!report && (
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
              Analyze Your Video Marketing
              <span className="block text-brand-600">Against Competitors</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Enter your company and up to 4 competitors. We fetch real YouTube data,
              analyze performance, and generate a professional report you can download
              as PowerPoint.
            </p>
          </div>
        )}

        {/* Form Card */}
        {!report && (
          <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8 mb-8">
            <CompanyForm onSubmit={handleAnalyze} isLoading={isLoading} />
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Loading state overlay */}
        {isLoading && (
          <div className="max-w-xl mx-auto text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-100 flex items-center justify-center animate-pulse-ring">
              <Youtube className="w-8 h-8 text-brand-600" />
            </div>
            <p className="text-slate-600 font-medium">Fetching YouTube channel data...</p>
            <p className="text-sm text-slate-400 mt-1">
              Searching channels, analyzing videos, and building insights
            </p>
          </div>
        )}

        {/* Report */}
        {report && (
          <div id="report-section">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-6">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                New Analysis
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25 hover:from-brand-700 hover:to-brand-800 disabled:opacity-50 transition-all"
              >
                {isDownloading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating PowerPoint...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download PowerPoint Report
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            <ReportView report={report} />
          </div>
        )}

        {/* Features - only when no report */}
        {!report && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            {[
              {
                title: "Real YouTube Data",
                desc: "Fetches live subscriber counts, video stats, and engagement metrics from public channels.",
              },
              {
                title: "Strategic Insights",
                desc: "Gap analysis, topic coverage, posting patterns, and actionable recommendations.",
              },
              {
                title: "Professional PPTX",
                desc: "Download a 10+ slide PowerPoint report with charts, ready to present to clients.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-2xl border border-slate-100 bg-white"
              >
                <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-slate-200/80 py-6 text-center">
        <p className="text-xs text-slate-400">Video Competitor Intelligence</p>
      </footer>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Trash2, Search, Sparkles } from "lucide-react";

interface CompanyFormProps {
  onSubmit: (yourCompany: string, competitors: string[]) => void;
  isLoading: boolean;
}

export default function CompanyForm({ onSubmit, isLoading }: CompanyFormProps) {
  const [yourCompany, setYourCompany] = useState("");
  const [competitors, setCompetitors] = useState(["", ""]);

  const addCompetitor = () => {
    if (competitors.length < 4) {
      setCompetitors([...competitors, ""]);
    }
  };

  const removeCompetitor = (index: number) => {
    if (competitors.length > 1) {
      setCompetitors(competitors.filter((_, i) => i !== index));
    }
  };

  const updateCompetitor = (index: number, value: string) => {
    const updated = [...competitors];
    updated[index] = value;
    setCompetitors(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filled = competitors.map((c) => c.trim()).filter(Boolean);
    if (!yourCompany.trim() || filled.length === 0) return;
    onSubmit(yourCompany.trim(), filled);
  };

  const isValid =
    yourCompany.trim().length > 0 &&
    competitors.some((c) => c.trim().length > 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="your-company"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Your Company Name
        </label>
        <input
          id="your-company"
          type="text"
          value={yourCompany}
          onChange={(e) => setYourCompany(e.target.value)}
          placeholder="e.g., Nike, Apple, Coca-Cola"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
          disabled={isLoading}
        />
        <p className="mt-1.5 text-xs text-slate-500">
          Enter the brand name as it appears on YouTube
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700">
            Competitors (up to 4)
          </label>
          {competitors.length < 4 && (
            <button
              type="button"
              onClick={addCompetitor}
              disabled={isLoading}
              className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add competitor
            </button>
          )}
        </div>

        <div className="space-y-3">
          {competitors.map((competitor, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={competitor}
                onChange={(e) => updateCompetitor(index, e.target.value)}
                placeholder={`Competitor ${index + 1} — e.g., Adidas, Samsung`}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                disabled={isLoading}
              />
              {competitors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCompetitor(index)}
                  disabled={isLoading}
                  className="p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50"
                  aria-label="Remove competitor"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold text-lg shadow-lg shadow-brand-500/25 hover:from-brand-700 hover:to-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing YouTube channels...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Generate Competitive Report
          </>
        )}
      </button>

      {!isLoading && (
        <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          Fetches real YouTube data • Analysis takes 15–30 seconds
        </p>
      )}
    </form>
  );
}

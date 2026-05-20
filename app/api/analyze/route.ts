import { NextRequest, NextResponse } from "next/server";
import { fetchAllCompanies } from "@/lib/youtube";
import { analyzeCompetitors } from "@/lib/analyzer";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { yourCompany, competitors } = body as {
      yourCompany?: string;
      competitors?: string[];
    };

    if (!yourCompany?.trim()) {
      return NextResponse.json(
        { error: "Your company name is required." },
        { status: 400 }
      );
    }

    const competitorList = (competitors ?? [])
      .map((c: string) => c.trim())
      .filter(Boolean)
      .slice(0, 4);

    if (competitorList.length === 0) {
      return NextResponse.json(
        { error: "At least one competitor is required." },
        { status: 400 }
      );
    }

    const channels = await fetchAllCompanies(
      yourCompany.trim(),
      competitorList
    );

    const report = analyzeCompetitors(
      yourCompany.trim(),
      competitorList,
      channels
    );

    return NextResponse.json(report);
  } catch (error) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "Analysis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

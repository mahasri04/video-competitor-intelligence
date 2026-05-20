import { NextRequest, NextResponse } from "next/server";
import { generatePowerPoint } from "@/lib/pptx-generator";
import type { CompetitorReport } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const report = (await request.json()) as CompetitorReport;

    if (!report?.yourCompany || !report?.channels) {
      return NextResponse.json(
        { error: "Invalid report data." },
        { status: 400 }
      );
    }

    const buffer = await generatePowerPoint(report);
    const filename = `Video_Report_${report.yourCompany.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pptx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("PPTX generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate PowerPoint.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

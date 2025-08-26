import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Report = {
  id: number;
  category: string;
  description: string;
  location: string;
  fileName: string | null;
  timestamp: string;
  latitude: number;
  longitude: number;
  resolved?: boolean;
  resolutionDescription?: string;
};

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { resolutionDescription } = await req.json();
    
    const reportsFile = path.join(process.cwd(), "reports.json");
    
    let reports: Report[] = [];
    try {
      const data = await fs.readFile(reportsFile, "utf8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        reports = parsed;
      }
    } catch {
      return NextResponse.json({ error: "Failed to read reports" }, { status: 500 });
    }
    
    // Find and update the report
    const reportId = parseInt(id, 10);
    const reportIndex = reports.findIndex(report => report.id === reportId);
    
    if (reportIndex === -1) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    
    // Update the report
    reports[reportIndex] = {
      ...reports[reportIndex],
      resolved: true,
      resolutionDescription
    };
    
    // Save updated reports
    await fs.writeFile(reportsFile, JSON.stringify(reports, null, 2), "utf8");
    
    return NextResponse.json({ 
      success: true, 
      report: reports[reportIndex] 
    }, { status: 200 });
  } catch (error) {
    console.error("Failed to resolve report:", error);
    return NextResponse.json({ error: "Failed to resolve report" }, { status: 500 });
  }
}
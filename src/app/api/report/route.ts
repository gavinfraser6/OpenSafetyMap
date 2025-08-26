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
};

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const category = String(form.get("category") ?? "");
    const description = String(form.get("description") ?? "");
    const location = String(form.get("location") ?? "");
    const file = form.get("file") as File | null;

    const reportsFile = path.join(process.cwd(), "reports.json");

    let reports: Report[] = [];
    try {
      const data = await fs.readFile(reportsFile, "utf8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        reports = parsed;
      }
    } catch {
      // If file doesn't exist or invalid JSON, start fresh
      reports = [];
    }

    const newReport: Report = {
      id: Date.now(),
      category,
      description,
      location,
      fileName: file ? file.name : null,
      timestamp: new Date().toISOString(),
    };

    reports.push(newReport);
    await fs.writeFile(reportsFile, JSON.stringify(reports, null, 2), "utf8");

    return NextResponse.json({ success: true, report: newReport }, { status: 200 });
  } catch (error) {
    console.error("Report submission failed:", error);
    return NextResponse.json({ error: "Failed to process report" }, { status: 500 });
  }
}
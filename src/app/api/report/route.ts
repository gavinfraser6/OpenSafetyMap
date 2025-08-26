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

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const category = String(form.get("category") ?? "");
    const description = String(form.get("description") ?? "");
    const location = String(form.get("location") ?? "");
    const latitude = Number(form.get("latitude") ?? 0);
    const longitude = Number(form.get("longitude") ?? 0);
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
      latitude,
      longitude,
    };

    reports.push(newReport);
    await fs.writeFile(reportsFile, JSON.stringify(reports, null, 2), "utf8");

    return NextResponse.json({ success: true, report: newReport }, { status: 200 });
  } catch (error) {
    console.error("Report submission failed:", error);
    return NextResponse.json({ error: "Failed to process report" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // Check if we're filtering by bounds
    const { searchParams } = new URL(req.url);
    const south = searchParams.get("south");
    const west = searchParams.get("west");
    const north = searchParams.get("north");
    const east = searchParams.get("east");

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

    // If bounds are provided, filter reports within bounds
    if (south && west && north && east) {
      const southNum = parseFloat(south);
      const westNum = parseFloat(west);
      const northNum = parseFloat(north);
      const eastNum = parseFloat(east);

      reports = reports.filter(report => {
        const lat = report.latitude;
        const lng = report.longitude;
        
        // Handle date line crossing if needed (simplified)
        if (westNum <= eastNum) {
          // Normal case
          return lat >= southNum && lat <= northNum && lng >= westNum && lng <= eastNum;
        } else {
          // Date line crossing case
          return lat >= southNum && lat <= northNum && (lng >= westNum || lng <= eastNum);
        }
      });
    }

    return NextResponse.json({ reports }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
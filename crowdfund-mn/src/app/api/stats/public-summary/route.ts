import { NextResponse } from "next/server";
import { getPublicStats } from "@/lib/db/stats";

// Revalidate at most once every 5 minutes — stats don't need real-time freshness
export const revalidate = 300;

export async function GET() {
  try {
    const stats = await getPublicStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error("[/api/stats/public-summary]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

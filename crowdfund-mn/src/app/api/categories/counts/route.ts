import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.project.groupBy({
      by: ["category"],
      where: { status: "ACTIVE" },
      _count: { _all: true },
    });

    const counts = rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.category] = row._count._all;
      return acc;
    }, {});

    return NextResponse.json({ counts });
  } catch (err) {
    console.error("[GET /api/categories/counts]", err);
    return NextResponse.json({ counts: {} });
  }
}

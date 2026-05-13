import { NextResponse } from "next/server";
import { completeDonationIfQpayPaid } from "@/lib/actions/donations";

async function handleCallback(req: Request) {
  const url = new URL(req.url);
  const donationId = url.searchParams.get("donationId");

  if (!donationId) {
    return NextResponse.json({ ok: false, error: "Missing donationId" }, { status: 400 });
  }

  const result = await completeDonationIfQpayPaid(donationId);
  if (!result.success) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, paid: result.paid });
}

export async function GET(req: Request) {
  return handleCallback(req);
}

export async function POST(req: Request) {
  return handleCallback(req);
}

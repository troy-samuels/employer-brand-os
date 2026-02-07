import { NextRequest, NextResponse } from "next/server";

import { SAMPLE_ANALYTICS } from "@/lib/utils/constants";

export async function GET() {
  return NextResponse.json({ analytics: SAMPLE_ANALYTICS });
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  return NextResponse.json({ success: true, event: payload });
}

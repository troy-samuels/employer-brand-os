import { NextResponse } from "next/server";

import { SAMPLE_JOBS } from "@/lib/utils/constants";

export async function GET() {
  return NextResponse.json({ jobs: SAMPLE_JOBS });
}

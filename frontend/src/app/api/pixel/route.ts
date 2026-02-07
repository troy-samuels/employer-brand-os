import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    pixel: {
      status: "active",
      last_seen_at: "2 minutes ago",
      schema_version: "v1.0",
      jobs_injected: 48,
    },
  });
}

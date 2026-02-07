import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { validateCsrf } from "@/lib/utils/csrf";
import { SAMPLE_ANALYTICS } from "@/lib/utils/constants";

const analyticsPayloadSchema = z
  .object({
    event: z.string().min(1).max(100).optional(),
    page: z.string().min(1).max(2048).optional(),
    timestamp: z.union([z.string(), z.number()]).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ analytics: SAMPLE_ANALYTICS });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!validateCsrf(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
  }

  const parsedPayload = analyticsPayloadSchema.safeParse(body);
  if (!parsedPayload.success) {
    return NextResponse.json({ error: "Invalid analytics payload" }, { status: 400 });
  }

  return NextResponse.json({ success: true, event: parsedPayload.data });
}

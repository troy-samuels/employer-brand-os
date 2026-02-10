import { NextResponse } from "next/server";
import {
  PIXEL_SCRIPT_ETAG,
  PIXEL_SCRIPT_SRI,
  PIXEL_SCRIPT_VERSION,
} from "@/lib/pixel/script-artifact";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  return NextResponse.json(
    {
      algorithm: "sha384",
      sri: PIXEL_SCRIPT_SRI,
      etag: PIXEL_SCRIPT_ETAG,
      version: PIXEL_SCRIPT_VERSION,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
}

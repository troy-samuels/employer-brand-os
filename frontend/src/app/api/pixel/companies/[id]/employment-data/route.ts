import { NextRequest, NextResponse } from "next/server";

import { getEmploymentData } from "@/lib/pixel/pixel-manager";
import { verifyPixelRequestSignature } from "@/lib/pixel/request-signing";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;
    const pixelId = request.headers.get("X-Rankwell-Pixel-ID");

    if (!pixelId) {
      return NextResponse.json(
        { error: "Missing pixel ID" },
        { status: 400 }
      );
    }

    const signatureResult = verifyPixelRequestSignature(request, pixelId);
    if (!signatureResult.ok) {
      return NextResponse.json(
        { error: signatureResult.message },
        { status: signatureResult.status }
      );
    }

    const data = await getEmploymentData(companyId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Pixel data error:", error);
    return NextResponse.json(
      { error: "Unable to load employment data" },
      { status: 500 }
    );
  }
}

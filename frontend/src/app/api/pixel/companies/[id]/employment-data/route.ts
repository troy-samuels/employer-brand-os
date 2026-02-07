import { NextRequest, NextResponse } from "next/server";

import { getEmploymentData } from "@/lib/pixel/pixel-manager";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;
    const pixelId = request.headers.get("X-BrandOS-Pixel-ID");

    if (!pixelId) {
      return NextResponse.json(
        { error: "Missing pixel ID" },
        { status: 400 }
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

import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "OpenRole — Is AI telling the truth about your company?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          padding: "60px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 40,
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: 32,
            letterSpacing: "-0.02em",
          }}
        >
          OpenRole
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 52,
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            maxWidth: 900,
          }}
        >
          Is AI telling the truth about your company?
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#a3a3a3",
            marginTop: 28,
            textAlign: "center",
          }}
        >
          Free AI Visibility Audit — 30 seconds, no signup
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            backgroundColor: "#10b981",
            color: "#ffffff",
            fontSize: 20,
            fontWeight: 600,
            padding: "14px 36px",
            borderRadius: 12,
          }}
        >
          openrole.co.uk
        </div>
      </div>
    ),
    { ...size }
  );
}

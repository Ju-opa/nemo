import { ImageResponse } from "next/og";

export const alt = "Nemo — Streaming sans limites";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          background: "linear-gradient(135deg, #080a0f 0%, #161a24 50%, #0f1119 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 48,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: "#f0f0f5",
              letterSpacing: "-0.02em",
              marginBottom: 16,
            }}
          >
            Nemo
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#e8b84b",
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            Streaming sans limites
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#8b8fa8",
            }}
          >
            Films & séries · 4K · VF & VOSTFR · Propulsé par TMDb
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

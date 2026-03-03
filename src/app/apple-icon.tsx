import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #080a0f 0%, #161a24 100%)",
          borderRadius: 24,
          border: "2px solid rgba(232, 184, 75, 0.3)",
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#e8b84b",
            letterSpacing: "-0.02em",
          }}
        >
          N
        </span>
      </div>
    ),
    { ...size }
  );
}

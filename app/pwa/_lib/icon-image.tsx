import { ImageResponse } from "next/og";

const background = "#faf8f5";
const foreground = "#2a2419";
const accent = "#d6cbb8";

type PwaIconOptions = {
  size: number;
  maskable?: boolean;
};

export function createPwaIconResponse({ size, maskable = false }: PwaIconOptions) {
  const padding = maskable ? Math.round(size * 0.14) : Math.round(size * 0.18);
  const glyphSize = size - padding * 2;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background,
          color: foreground,
        }}
      >
        <div
          style={{
            width: glyphSize,
            height: glyphSize,
            borderRadius: Math.round(size * 0.18),
            background: `linear-gradient(160deg, ${foreground} 0%, #493f30 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            boxShadow: `0 ${Math.round(size * 0.025)}px ${Math.round(size * 0.08)}px rgba(42, 36, 25, 0.18)`,
          }}
        >
          <div
            style={{
              width: Math.round(glyphSize * 0.62),
              height: Math.round(glyphSize * 0.72),
              borderRadius: Math.round(size * 0.06),
              background: "#fffdf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: Math.round(size * 0.06),
                border: `${Math.max(2, Math.round(size * 0.01))}px solid rgba(42, 36, 25, 0.08)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: Math.round(glyphSize * 0.08),
                background: accent,
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: Math.round(size * 0.02),
                width: "68%",
              }}
            >
              <div
                style={{
                  height: Math.round(size * 0.04),
                  borderRadius: 999,
                  background: foreground,
                  opacity: 0.92,
                }}
              />
              <div
                style={{
                  height: Math.round(size * 0.04),
                  width: "82%",
                  borderRadius: 999,
                  background: foreground,
                  opacity: 0.78,
                }}
              />
              <div
                style={{
                  height: Math.round(size * 0.04),
                  width: "56%",
                  borderRadius: 999,
                  background: foreground,
                  opacity: 0.55,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
    },
  );
}

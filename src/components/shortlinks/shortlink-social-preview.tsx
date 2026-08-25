import type { ReactElement } from "react";

interface ShortLinkSocialPreviewProps {
  imageUrl: string;
  title: string;
  width: number;
  height: number;
  showPlayButton: boolean;
  displayDuration: string | null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function ShortLinkSocialPreview({
  imageUrl,
  title,
  width,
  height,
  showPlayButton,
  displayDuration,
}: ShortLinkSocialPreviewProps): ReactElement {
  const normalizedTitle = title.trim() || "ShortLink";

  /*
   * Overlay mengikuti ukuran media asli.
   *
   * Sisi terpendek 720px = scale 1.
   * Tidak bergantung pada landscape / portrait.
   */
  const shortSide = Math.min(width, height);

  const scale = clamp(shortSide / 720, 0.6, 1.8);

  const edge = Math.round(24 * scale);

  const gap = Math.round(20 * scale);

  const fontSize = Math.round(26 * scale);

  const badgePaddingY = Math.round(8 * scale);

  const badgePaddingX = Math.round(13 * scale);

  const badgeRadius = Math.round(8 * scale);

  const playSize = Math.round(96 * scale);

  const playIconWidth = Math.round(40 * scale);

  const playIconHeight = Math.round(48 * scale);

  const playIconOffset = Math.round(6 * scale);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
        }}
      />

      {showPlayButton ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: playSize,
              height: playSize,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9999,
              background: "rgba(0,0,0,0.72)",
              boxShadow: `0 ${Math.round(6 * scale)}px ${Math.round(
                24 * scale,
              )}px rgba(0,0,0,0.35)`,
            }}
          >
            <svg
              width={playIconWidth}
              height={playIconHeight}
              viewBox="0 0 48 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                marginLeft: playIconOffset,
              }}
            >
              <path d="M4 3L44 28L4 53V3Z" fill="white" />
            </svg>
          </div>
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          left: edge,
          right: edge,
          bottom: edge,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap,
          pointerEvents: "none",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize,
          fontWeight: 700,
          lineHeight: 1.2,
          color: "#ffffff",
        }}
      >
        <div
          style={{
            minWidth: 0,
            maxWidth: displayDuration ? "78%" : "100%",
            display: "flex",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            padding: `${badgePaddingY}px ${badgePaddingX}px`,
            borderRadius: badgeRadius,
            background: "rgba(0,0,0,0.78)",
            textShadow: `0 ${Math.max(1, Math.round(scale))}px ${Math.round(
              3 * scale,
            )}px rgba(0,0,0,0.9)`,
          }}
        >
          {normalizedTitle}
        </div>

        {displayDuration ? (
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              padding: `${badgePaddingY}px ${badgePaddingX}px`,
              borderRadius: badgeRadius,
              background: "rgba(0,0,0,0.82)",
              textShadow: `0 ${Math.max(1, Math.round(scale))}px ${Math.round(
                3 * scale,
              )}px rgba(0,0,0,0.9)`,
            }}
          >
            {displayDuration}
          </div>
        ) : null}
      </div>
    </div>
  );
}

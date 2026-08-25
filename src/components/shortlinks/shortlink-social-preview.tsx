import type { ReactElement } from "react";

interface ShortLinkSocialPreviewProps {
  imageUrl: string;
  title: string;
  showPlayButton: boolean;
  displayDuration: string | null;
}

export function ShortLinkSocialPreview({
  imageUrl,
  title,
  showPlayButton,
  displayDuration,
}: ShortLinkSocialPreviewProps): ReactElement {
  const normalizedTitle = title.trim() || "ShortLink";

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
              width: 116,
              height: 116,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              background: "rgba(0,0,0,0.72)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
            }}
          >
            <svg
              width="48"
              height="56"
              viewBox="0 0 48 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                marginLeft: 8,
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
          left: 28,
          right: 28,
          bottom: 24,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 24,
          pointerEvents: "none",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 28,
          fontWeight: 700,
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
            padding: "9px 14px",
            borderRadius: 9,
            background: "rgba(0,0,0,0.78)",
            textShadow: "0 1px 3px rgba(0,0,0,0.9)",
          }}
        >
          {normalizedTitle}
        </div>

        {displayDuration ? (
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              padding: "9px 14px",
              borderRadius: 9,
              background: "rgba(0,0,0,0.82)",
              textShadow: "0 1px 3px rgba(0,0,0,0.9)",
            }}
          >
            {displayDuration}
          </div>
        ) : null}
      </div>
    </div>
  );
}

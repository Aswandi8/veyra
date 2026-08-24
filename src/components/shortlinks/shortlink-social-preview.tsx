import type { ReactElement } from "react";

interface ShortLinkSocialPreviewProps {
  imageUrl: string;
  hostname: string;
  showPlayButton: boolean;
  displayDuration: string | null;
}

export function ShortLinkSocialPreview({
  imageUrl,
  hostname,
  showPlayButton,
  displayDuration,
}: ShortLinkSocialPreviewProps): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "#0a0a0a",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        width={1200}
        height={630}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />

      {showPlayButton ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
            <div
              style={{
                width: 0,
                height: 0,
                marginLeft: 10,
                borderTop: "25px solid transparent",
                borderBottom: "25px solid transparent",
                borderLeft: "39px solid white",
              }}
            />
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
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 28,
          fontWeight: 700,
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "9px 14px",
            borderRadius: 9,
            background: "rgba(0,0,0,0.78)",
            textShadow: "0 1px 3px rgba(0,0,0,0.9)",
          }}
        >
          {hostname}
        </div>

        {displayDuration ? (
          <div
            style={{
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

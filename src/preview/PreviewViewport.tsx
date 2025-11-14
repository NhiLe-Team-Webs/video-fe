import React from "react";
import {
  COMPOSITION_HEIGHT,
  COMPOSITION_WIDTH,
  DEFAULT_PREVIEW_MAX_HEIGHT,
  DEFAULT_PREVIEW_MAX_WIDTH,
} from "../core/constants/video";

type PreviewViewportProps = {
  children: React.ReactNode;
  frameWidth?: number;
  frameHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  alignOrigin?: "center" | "top-left";
  background?: string;
};

const basePanelStyle: React.CSSProperties = {
  borderRadius: 32,
  overflow: "hidden",
  background: "#000",
  boxShadow: "0 45px 120px rgba(15,23,42,0.65)",
  border: "1px solid rgba(148,163,184,0.25)",
  position: "relative",
  display: "flex",
};

export const PreviewViewport: React.FC<PreviewViewportProps> = ({
  children,
  frameWidth = COMPOSITION_WIDTH,
  frameHeight = COMPOSITION_HEIGHT,
  maxWidth = DEFAULT_PREVIEW_MAX_WIDTH,
  maxHeight = DEFAULT_PREVIEW_MAX_HEIGHT,
  alignOrigin = "center",
  background = "#000",
}) => {
  const safeWidth = Math.max(1, frameWidth);
  const safeHeight = Math.max(1, frameHeight);

  const scale = Math.min(maxWidth / safeWidth, maxHeight / safeHeight, 1);
  const previewWidth = safeWidth * scale;
  const previewHeight = safeHeight * scale;

  return (
    <div
      style={{
        ...basePanelStyle,
        alignItems: "center",
        justifyContent: "center",
        width: previewWidth,
        height: previewHeight,
        background,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: alignOrigin === "center" ? "50%" : 0,
          left: alignOrigin === "center" ? "50%" : 0,
          width: safeWidth,
          height: safeHeight,
          transform:
            alignOrigin === "center"
              ? `translate(-50%, -50%) scale(${scale})`
              : `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
};

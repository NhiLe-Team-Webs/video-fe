import React from "react";
import {AbsoluteFill} from "remotion";
import {PreviewScene} from "./PreviewScene";
import {palette} from "../styles/designTokens";

export const TemplatePreviewPanel: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(130deg, rgba(2,6,23,1) 0%, rgba(15,23,42,0.85) 50%, rgba(248,113,113,0.4) 100%)`,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 15% 20%, rgba(248, 113, 113, 0.6), transparent 55%)",
          mixBlendMode: "screen",
          opacity: 0.95,
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 80% 10%, rgba(59, 130, 246, 0.35), transparent 60%)",
          opacity: 0.8,
          mixBlendMode: "lighten",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 60% 70%, rgba(252, 211, 77, 0.4), transparent 55%)",
          opacity: 0.7,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 40% 55%, rgba(15, 23, 42, 0.6), transparent 60%)",
          opacity: 0.8,
          mixBlendMode: "multiply",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(2,6,23,0.95) 60%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
        }}
      >
        <PreviewScene accentColor={palette.primaryRed} />
      </div>
    </AbsoluteFill>
  );
};

import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";

export type SectionTitleOverlayProps = {
  title?: string;
  subtitle?: string;
  durationInFrames: number;
};

export const SectionTitleOverlay: React.FC<SectionTitleOverlayProps> = ({
  title = "Strategy vs Tactics",
  subtitle = "Section Break",
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const fadeDuration = Math.max(12, Math.floor(durationInFrames * 0.2));
  const fadeOutStart = durationInFrames - fadeDuration;

  const overlayOpacity = interpolate(
    frame,
    [0, fadeDuration, fadeOutStart, durationInFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const blurredOpacity = interpolate(
    frame,
    [0, fadeDuration, fadeOutStart, durationInFrames],
    [0, 0.35, 0.35, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const panelOffset = interpolate(
    frame,
    [0, fadeDuration, fadeOutStart, durationInFrames],
    [50, 0, 0, -50],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: `rgba(0,0,0,${blurredOpacity})`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: Math.min(900, width * 0.85),
          height: Math.min(520, height * 0.7),
          borderRadius: 24,
          background: "#f1f2f4",
          boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
          transform: `translateY(${panelOffset}px)`,
          opacity: overlayOpacity,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          textTransform: "uppercase",
        }}
      >
        <div style={{fontSize: 32, letterSpacing: 8, color: "#6b7280", marginBottom: 24}}>
          {subtitle}
        </div>
        <div
          style={{
            fontSize: 72,
            lineHeight: 1.1,
            fontWeight: 900,
            color: "#374151",
            width: "80%",
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 32,
            width: "40%",
            height: 4,
            background: "linear-gradient(90deg, #111827, #6b7280)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};


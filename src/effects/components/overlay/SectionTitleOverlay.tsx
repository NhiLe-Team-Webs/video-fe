import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {palette, typography, motif} from "../../../styles/designTokens";

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
        background: palette.deepBlack,
        boxShadow: "0 30px 90px rgba(0,0,0,0.45)",
        transform: `translateY(${panelOffset}px)`,
        opacity: overlayOpacity,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
        <div
          style={{
            fontSize: 32,
            letterSpacing: 4,
            color: palette.lightGray,
            marginBottom: 24,
            fontFamily: typography.body,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            fontSize: 72,
            lineHeight: 1.1,
            fontWeight: 900,
            color: palette.brightestWhite,
            fontFamily: typography.headline,
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
            background: motif.triangleGlow,
            filter: "blur(0.5px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "-8px",
            background: motif.triangleGlow,
            opacity: 0.2,
            mixBlendMode: motif.overlayBlend as React.CSSProperties['mixBlendMode'],
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

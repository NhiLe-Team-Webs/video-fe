import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {typography, motif} from "../../../styles/designTokens";

export type SideFloatTextProps = {
  text?: string;
  side?: "left" | "right";
  color?: string;
  accent?: string;
  durationInFrames?: number;
};

export const SideFloatText: React.FC<SideFloatTextProps> = ({
  text = "MARKETING",
  side = "left",
  color = "#f8f7f4",
  accent = "#ffffff",
  durationInFrames = 120,
}) => {
  const frame = useCurrentFrame();
  const fadeDuration = Math.max(12, Math.floor(durationInFrames * 0.25));
  const fadeOutStart = durationInFrames - fadeDuration;
  const initialOffset = side === "left" ? -80 : 80;
  const exitOffset = side === "left" ? -140 : 140;

  const opacity = interpolate(
    frame,
    [0, fadeDuration, fadeOutStart, durationInFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const translateX = interpolate(
    frame,
    [0, fadeDuration, fadeOutStart, durationInFrames],
    [initialOffset, 0, 0, exitOffset],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: side === "left" ? "flex-start" : "flex-end",
        padding: "120px 120px 0",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          transform: `translateX(${translateX}px)`,
          opacity,
          fontSize: 48,
          fontWeight: 700,
          letterSpacing: 4,
          color,
          textTransform: "uppercase",
          textShadow: `0 6px 20px rgba(0,0,0,0.35)`,
        }}
      >
        <span
          style={{
            color: accent,
            position: "relative",
            zIndex: 1,
            fontFamily: typography.headline,
          }}
        >
          {text}
        </span>
        <span
          style={{
            position: "absolute",
            left: 8,
            bottom: -4,
            width: 24,
            height: 24,
            background: motif.triangleGlow,
            clipPath: "polygon(0 0, 100% 50%, 0 100%)",
            opacity: 0.6,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const SideFloatLeftText: React.FC<Omit<SideFloatTextProps, "side">> = (props) => (
  <SideFloatText {...props} side="left" />
);

export const SideFloatRightText: React.FC<Omit<SideFloatTextProps, "side">> = (props) => (
  <SideFloatText {...props} side="right" />
);

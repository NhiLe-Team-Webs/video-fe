import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {palette, typography} from "../../../styles/designTokens";

export type PopUp3DTextProps = {
  text?: string;
  subtitle?: string;
  color?: string;
  accent?: string;
  durationInFrames?: number;
};

export const PopUp3DText: React.FC<PopUp3DTextProps> = ({
  text = "DIGITAL MARKETING 101",
  subtitle = "A BEGINNER'S GUIDE",
  color = palette.brightestWhite,
  accent = palette.primaryRed,
  durationInFrames = 120,
}) => {
  const frame = useCurrentFrame();

  const popFrames = Math.max(10, Math.floor(durationInFrames * 0.25));
  const settleStart = durationInFrames - Math.max(10, Math.floor(durationInFrames * 0.2));

  const rotation = interpolate(
    frame,
    [0, popFrames, settleStart, durationInFrames],
    [90, 0, 0, -90],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const opacity = interpolate(
    frame,
    [0, popFrames / 2, settleStart, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 120,
        perspective: 1000,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotation}deg)`,
          opacity,
          textAlign: "center",
          textTransform: "uppercase",
        }}
      >
        <div
          style={{
        fontSize: 72,
        fontWeight: 800,
        letterSpacing: 2,
        color,
        fontFamily: typography.headline,
        textShadow: "0 20px 55px rgba(0,0,0,0.35)",
      }}
    >
      {text}
    </div>
    <div
      style={{
        marginTop: 8,
        fontSize: 36,
        fontWeight: 600,
        letterSpacing: 4,
        color: accent,
        fontFamily: typography.body,
        position: "relative",
        textTransform: "none",
      }}
    >
      {subtitle}
    </div>
  </div>
    </AbsoluteFill>
  );
};


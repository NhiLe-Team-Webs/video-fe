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
        paddingBottom: 100,
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
            fontSize: 88,
            fontWeight: 900,
            letterSpacing: 3,
            color,
            fontFamily: typography.headline,
            textShadow: "0 30px 85px rgba(0,0,0,0.55)",
          }}
        >
          {text}
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 42,
            fontWeight: 700,
            letterSpacing: 5,
            color: accent,
            fontFamily: typography.body,
            position: "relative",
            textTransform: "uppercase",
            textShadow: "0 20px 45px rgba(0,0,0,0.4)",
          }}
        >
          {subtitle}
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: -10,
              width: 220,
              height: 6,
              borderRadius: 999,
              background: `linear-gradient(90deg, ${accent}, ${color})`,
              transform: "translateX(-50%)",
              opacity: 0.75,
              boxShadow: `0 0 20px ${accent}`,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {palette, typography} from "../../../styles/designTokens";

export type SequentialListRevealProps = {
  items?: string[];
  color?: string;
  accent?: string;
  align?: "left" | "right";
};

const fallbackItems = ["TV", "RADIO", "NEWSPAPERS", "MAGAZINES", "BILLBOARDS"];

export const SequentialListReveal: React.FC<SequentialListRevealProps> = ({
  items = fallbackItems,
  color = palette.brightestWhite,
  accent = palette.primaryRed,
  align = "left",
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const spacing = 1.2;
  const perItemDelay = Math.max(6, Math.floor(0.2 * fps));
  const animationDuration = Math.max(8, Math.floor(0.35 * fps));

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: align === "left" ? "flex-start" : "flex-end",
        padding: "0 120px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24 * spacing,
          textAlign: align,
          textTransform: "uppercase",
        }}
      >
        {items.map((item, index) => {
          const start = index * perItemDelay;
          const end = start + animationDuration;
          const opacity = interpolate(frame, [start, end, end + 5], [0, 1, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const scale = interpolate(frame, [start, end], [0.8, 1.02], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <span
              key={item + index}
              style={{
                fontSize: 48,
                fontWeight: 800,
                letterSpacing: 2,
                color,
                opacity,
                transform: `scale(${scale})`,
                textShadow: "0 6px 25px rgba(0,0,0,0.45)",
                fontFamily: typography.headline,
              }}
            >
              <span style={{color: accent}}>{item}</span>
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};


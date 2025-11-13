import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";

export type LowerThirdProps = {
  title: string;
  subtitle?: string;
  accentColor?: string;
};

export const LowerThird: React.FC<LowerThirdProps> = ({
  title,
  subtitle,
  accentColor = "#ff9f1c",
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({frame, fps, config: {mass: 0.6, damping: 16}});
  const translateY = interpolate(progress, [0, 1], [120, 0]);

  return (
    <AbsoluteFill style={{justifyContent: "flex-end", padding: "0 64px 64px"}}>
      <div
        style={{
          padding: "18px 32px",
          borderRadius: 18,
          background: "rgba(0,0,0,0.75)",
          color: "#ffffff",
          fontFamily: "Inter, sans-serif",
          transform: `translateY(${translateY}px)`,
          borderLeft: `6px solid ${accentColor}`,
        }}
      >
        <div style={{fontSize: 38, fontWeight: 700}}>{title}</div>
        {subtitle && <div style={{opacity: 0.7}}>{subtitle}</div>}
      </div>
    </AbsoluteFill>
  );
};


import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";

export type PopUpTitleProps = {
  text: string;
  accentColor?: string;
  delayFrames?: number;
};

export const PopUpTitle: React.FC<PopUpTitleProps> = ({
  text,
  accentColor = "#ffd166",
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({
    frame: Math.max(0, frame - delayFrames),
    fps,
    config: {damping: 12, mass: 0.7},
  });
  const scale = interpolate(progress, [0, 1], [0.85, 1.05]);
  const translateY = interpolate(progress, [0, 1], [40, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "#101010",
      }}
    >
      <div
        style={{
          padding: "18px 28px",
          borderRadius: 20,
          background: accentColor,
          transform: `translateY(${translateY}px) scale(${scale})`,
          boxShadow: "0 18px 45px rgba(0,0,0,0.2)",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};


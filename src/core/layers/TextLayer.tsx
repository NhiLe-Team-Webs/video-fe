import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {fadeInOut} from "../utils/timeUtils";

type TextLayerProps = {
  text: string;
  durationInFrames: number;
  segmentIndex: number;
  style?: React.CSSProperties;
  accentColor?: string;
};

export const TextLayer: React.FC<TextLayerProps> = ({text, durationInFrames, segmentIndex, style, accentColor}) => {
  const frame = useCurrentFrame();
  const envelopeWindow = Math.max(12, Math.floor(durationInFrames * 0.2));
  const opacity = fadeInOut(frame, durationInFrames, envelopeWindow);
  const translateY = interpolate(frame, [0, durationInFrames], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 120px 140px",
        pointerEvents: "none",
      }}
    >
      <div
        data-segment={segmentIndex}
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          background: "rgba(15, 23, 42, 0.75)",
          borderRadius: 24,
          padding: "32px 48px",
          fontSize: 52,
          lineHeight: 1.2,
          textAlign: "center",
          color: "#f8fafc",
          border: accentColor ? `2px solid ${accentColor}` : undefined,
          boxShadow: `0 20px 60px rgba(15, 23, 42, 0.4)`,
          ...style,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

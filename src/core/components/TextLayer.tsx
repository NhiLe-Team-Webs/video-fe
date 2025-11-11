import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";

type TextLayerProps = {
  text: string;
  durationInFrames: number;
  segmentIndex: number;
};

const clampEnvelope = (frame: number, durationInFrames: number) => {
  const envelopeWindow = Math.max(12, Math.floor(durationInFrames * 0.15));
  const fadeIn = interpolate(frame, [0, envelopeWindow], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - envelopeWindow, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return Math.min(fadeIn, fadeOut);
};

export const TextLayer: React.FC<TextLayerProps> = ({text, durationInFrames, segmentIndex}) => {
  const frame = useCurrentFrame();
  const opacity = clampEnvelope(frame, durationInFrames);
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
          color: "#f8fafc",
          borderRadius: 24,
          padding: "32px 48px",
          fontSize: 52,
          fontWeight: 600,
          textAlign: "center",
          lineHeight: 1.2,
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.4)",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {typography, motif} from "../../../styles/designTokens";

export type PopUpTitleProps = {
  text: string;
  accentColor?: string;
  delayFrames?: number;
};

export const PopUpTitle: React.FC<PopUpTitleProps> = ({
  text,
  accentColor = "#C8102E",
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
        fontFamily: typography.headline,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "#fff",
      }}
    >
      <div
        style={{
          padding: "18px 28px",
          borderRadius: 28,
          background: `linear-gradient(135deg, ${accentColor}, rgba(255,255,255,0.15))`,
          transform: `translateY(${translateY}px) scale(${scale})`,
          boxShadow: `0 24px 60px rgba(200,16,46,0.45), 0 0 28px rgba(255,255,255,0.18)`,
          position: "relative",
          overflow: "hidden",
          minWidth: 280,
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-18px 12px auto auto",
            width: 90,
            height: 90,
            background: motif.triangleGlow,
            clipPath: "polygon(0 0, 80% 50%, 0 100%)",
            filter: "blur(6px)",
            pointerEvents: "none",
          }}
        />
        <span
          style={{
            position: "relative",
            zIndex: 2,
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
};


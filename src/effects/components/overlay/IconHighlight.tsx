import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {LottieEffect} from "../../engines/lottie/LottieEffect";

export type IconHighlightProps = {
  iconSrc?: string;
  position?: "left" | "right";
  durationInFrames: number;
};

const DEFAULT_ICON =
  "https://assets10.lottiefiles.com/packages/lf20_9wjm14ni.json";

export const IconHighlight: React.FC<IconHighlightProps> = ({
  iconSrc = DEFAULT_ICON,
  position = "right",
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fadeDuration = Math.max(10, Math.floor(durationInFrames * 0.2));
  const fadeOutStart = durationInFrames - fadeDuration;

  const opacity = interpolate(
    frame,
    [0, fadeDuration, fadeOutStart, durationInFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const scale = interpolate(
    frame,
    [0, fadeDuration * 0.6, fadeDuration, fadeOutStart, durationInFrames],
    [0.5, 1.1, 1, 1, 0.7],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const translate = interpolate(
    frame,
    [0, fadeDuration, fadeOutStart, durationInFrames],
    [position === "left" ? -40 : 40, 0, 0, position === "left" ? -20 : 20],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const float = Math.sin(frame / 12) * 4;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: position === "left" ? "flex-start" : "flex-end",
        padding: "0 120px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: 160,
          height: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          filter: "drop-shadow(0 25px 40px rgba(15,23,42,0.35))",
          transform: `translate(${translate}px, ${float}px) scale(${scale})`,
          opacity,
        }}
      >
        <LottieEffect src={iconSrc} loop style={{width: 140, height: 140}} />
      </div>
    </AbsoluteFill>
  );
};

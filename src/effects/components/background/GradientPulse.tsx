import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";

export type GradientPulseProps = {
  colors?: [string, string];
};

export const GradientPulse: React.FC<GradientPulseProps> = ({
  colors = ["#15171c", "#1d3557"],
}) => {
  const frame = useCurrentFrame();
  const rotation = interpolate(frame, [0, 150], [0, 360], {extrapolateRight: "extend"});

  return (
    <AbsoluteFill
      style={{
        background: `conic-gradient(from ${rotation}deg, ${colors[0]}, ${colors[1]}, ${colors[0]})`,
        filter: "blur(80px)",
      }}
    />
  );
};


import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";

export type BadgePulseProps = {
  label: string;
  color?: string;
};

export const BadgePulse: React.FC<BadgePulseProps> = ({label, color = "#ff4d6d"}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(Math.sin(frame / 10), [-1, 1], [0.95, 1.08]);
  const opacity = interpolate(Math.cos(frame / 15), [-1, 1], [0.7, 1]);

  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: "50%",
          border: `6px solid ${color}`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textTransform: "uppercase",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          letterSpacing: 2,
          transform: `scale(${scale})`,
          opacity,
          color,
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
};


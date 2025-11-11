import React from "react";
import {AbsoluteFill} from "remotion";

type OverlayProps = {
  accentColor?: string;
  opacity?: number;
};

export const Overlay: React.FC<OverlayProps> = ({accentColor = "#0ea5e9", opacity = 0.35}) => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `linear-gradient(180deg, rgba(0,0,0,0) 30%, ${accentColor}${Math.floor(opacity * 255)
          .toString(16)
          .padStart(2, "0")})`,
      }}
    />
  );
};

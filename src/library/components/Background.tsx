import React from "react";
import {AbsoluteFill} from "remotion";

type BackgroundProps = {
  color?: string;
  accentColor?: string;
};

export const Background: React.FC<BackgroundProps> = ({color = "#000", accentColor = "#0ea5e9"}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        backgroundImage: `radial-gradient(circle at 20% 20%, ${accentColor}22, transparent 45%), radial-gradient(circle at 80% 30%, ${accentColor}11, transparent 55%)`,
      }}
    />
  );
};

import React from "react";
import {AbsoluteFill} from "remotion";

type PreviewSceneProps = {
  accentColor?: string;
};

export const PreviewScene: React.FC<PreviewSceneProps> = ({accentColor = "#C8102E"}) => {
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        color: "#f8fafc",
        fontFamily: "Inter, sans-serif",
        fontSize: 48,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        background: `radial-gradient(circle at 35% 25%, ${accentColor}33, transparent 60%)`,
      }}
    >
      Template Preview
    </AbsoluteFill>
  );
};

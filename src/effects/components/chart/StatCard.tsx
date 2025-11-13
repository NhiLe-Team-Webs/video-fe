import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";

export type StatCardProps = {
  label: string;
  value: string;
  delta?: string;
};

export const StatCard: React.FC<StatCardProps> = ({label, value, delta}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({frame, fps, config: {damping: 18, mass: 0.9}});
  const rotateX = interpolate(progress, [0, 1], [80, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        perspective: 1200,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          background: "#08090a",
          color: "#f5f5f5",
          minWidth: 480,
          padding: "32px 40px",
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          transform: `rotateX(${rotateX}deg)`,
          transformOrigin: "bottom",
        }}
      >
        <div style={{opacity: 0.6, textTransform: "uppercase", letterSpacing: 4}}>{label}</div>
        <div style={{fontSize: 64, fontWeight: 700, margin: "12px 0"}}>{value}</div>
        {delta && <div style={{color: "#29d391"}}>{delta}</div>}
      </div>
    </AbsoluteFill>
  );
};


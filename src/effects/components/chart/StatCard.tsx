import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {palette, typography} from "../../../styles/designTokens";

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
        fontFamily: typography.body,
      }}
    >
      <div
        style={{
          background: palette.deepBlack,
          color: palette.brightestWhite,
          minWidth: 480,
          padding: "32px 40px",
          borderRadius: 28,
          border: `1px solid ${palette.lightGray}`,
          boxShadow: `0 25px 70px rgba(0,0,0,0.55), inset 0 0 45px rgba(255,255,255,0.05)`,
          transform: `rotateX(${rotateX}deg)`,
          transformOrigin: "bottom",
        }}
      >
        <div style={{opacity: 0.6, textTransform: "uppercase", letterSpacing: 4, fontFamily: typography.headline}}>
          {label}
        </div>
        <div style={{fontSize: 64, fontWeight: 700, margin: "12px 0", fontFamily: typography.headline}}>{value}</div>
        {delta && <div style={{color: palette.primaryRed, fontFamily: typography.body}}>{delta}</div>}
      </div>
    </AbsoluteFill>
  );
};


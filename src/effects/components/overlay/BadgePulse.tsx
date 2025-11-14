import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {palette, typography, motif} from "../../../styles/designTokens";

export type BadgePulseProps = {
  label: string;
};

export const BadgePulse: React.FC<BadgePulseProps> = ({
  label,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(Math.sin(frame / 10), [-1, 1], [0.96, 1.06]);
  const opacity = interpolate(Math.cos(frame / 15), [-1, 1], [0.7, 1]);

  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: "50%",
          border: `6px solid ${palette.lightGray}`,
          background: motif.triangleGlow,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textTransform: "uppercase",
          fontFamily: typography.headline,
          fontWeight: 700,
          letterSpacing: 2.2,
          transform: `scale(${scale})`,
          opacity,
          color: palette.brightestWhite,
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 24px 60px rgba(0,0,0,0.35), inset 0 0 25px rgba(255,255,255,0.15)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-12px",
            background: `radial-gradient(circle, rgba(255,255,255,0.25), transparent 65%)`,
            opacity: 0.6,
            mixBlendMode: motif.overlayBlend as React.CSSProperties['mixBlendMode'],
            filter: "blur(6px)",
            pointerEvents: "none",
          }}
        />
        <span style={{position: "relative", zIndex: 2}}>{label}</span>
      </div>
    </AbsoluteFill>
  );
};

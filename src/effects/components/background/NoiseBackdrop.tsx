import {noise3D} from "@remotion/noise";
import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";

const OVERSCAN_MARGIN = 100;
const ROWS = 10;
const COLS = 15;

export type NoiseBackdropProps = {
  baseColor?: string;
  accentColor?: string;
  circleRadius?: number;
  speed?: number;
  maxOffset?: number;
};

export const NoiseBackdrop: React.FC<NoiseBackdropProps> = ({
  baseColor = "#030712",
  accentColor = "rgba(255,255,255,0.35)",
  circleRadius = 10,
  speed = 0.02,
  maxOffset = 12,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: baseColor,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <svg
        width={width + OVERSCAN_MARGIN}
        height={height + OVERSCAN_MARGIN}
        style={{
          position: "absolute",
          left: -OVERSCAN_MARGIN / 2,
          top: -OVERSCAN_MARGIN / 2,
          mixBlendMode: "normal",
          opacity: 1,
        }}
      >
        {new Array(COLS).fill(0).map((_, i) =>
          new Array(ROWS).fill(0).map((__, j) => {
            const px = i / COLS;
            const py = j / ROWS;
            const dx = noise3D("x", px, py, frame * speed) * maxOffset;
            const dy = noise3D("y", px, py, frame * speed) * maxOffset;
            const x = i * ((width + OVERSCAN_MARGIN) / COLS) + dx;
            const y = j * ((height + OVERSCAN_MARGIN) / ROWS) + dy;
            const opacity = interpolate(
              noise3D("opacity", i, j, frame * speed),
              [-1, 1],
              [0, 1]
            );

            return (
              <circle
                key={`noise-${i}-${j}`}
                cx={x}
                cy={y}
                r={circleRadius}
                fill={accentColor}
                opacity={opacity}
              />
            );
          })
        )}
      </svg>
    </AbsoluteFill>
  );
};

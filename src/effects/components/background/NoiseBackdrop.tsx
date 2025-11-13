import React, {useMemo} from "react";
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {noise3D} from "@remotion/noise";

const OVERSCAN_MARGIN = 120;
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
  accentColor = "#38bdf8",
  circleRadius = 8,
  speed = 0.035,
  maxOffset = 60,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  const grid = useMemo(
    () =>
      Array.from({length: COLS}, (_, x) =>
        Array.from({length: ROWS}, (_, y) => ({x, y}))
      ),
    []
  );

  const background = `radial-gradient(circle at 35% 20%, ${accentColor}, transparent 50%), linear-gradient(135deg, ${baseColor}, rgba(3,7,18,0.7))`;

  return (
    <AbsoluteFill
      style={{
        background,
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
          mixBlendMode: "screen",
          opacity: 0.85,
        }}
      >
        {grid.map((column) =>
          column.map(({x, y}) => {
            const px = x / COLS;
            const py = y / ROWS;
            const dx =
              noise3D("x-offset", px * 2, py * 2, frame * speed) * maxOffset;
            const dy =
              noise3D("y-offset", px * 2, py * 2, (frame + 34) * speed) *
              maxOffset;

            const opacity = interpolate(
              noise3D("opa", x, y, frame * speed),
              [-1, 1],
              [0.2, 0.8],
              {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
            );

            const cx =
              x * ((width + OVERSCAN_MARGIN) / COLS) + OVERSCAN_MARGIN / 2 + dx;
            const cy =
              y * ((height + OVERSCAN_MARGIN) / ROWS) + OVERSCAN_MARGIN / 2 + dy;

            return (
              <circle
                key={`${x}-${y}`}
                cx={cx}
                cy={cy}
                r={circleRadius}
                fill={accentColor}
                opacity={opacity}
              />
            );
          })
        )}
      </svg>
      <svg
        width={width}
        height={height}
        style={{
          position: "absolute",
          inset: 0,
          mixBlendMode: "overlay",
        }}
      >
        {grid.map((column) =>
          column.map(({x, y}) => {
            const px = x / COLS;
            const py = y / ROWS;
            const noise = noise3D("halo", px * 1.3, py * 1.1, frame * speed);
            const pulse = 0.8 + Math.abs(noise) * 0.8;
            const opacity = interpolate(
              noise,
              [-1, 1],
              [0.05, 0.35],
              {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
            );

            const cx = x * ((width + OVERSCAN_MARGIN) / COLS) + OVERSCAN_MARGIN / 2;
            const cy = y * ((height + OVERSCAN_MARGIN) / ROWS) + OVERSCAN_MARGIN / 2;

            return (
              <circle
                key={`halo-${x}-${y}`}
                cx={cx}
                cy={cy}
                r={circleRadius * pulse}
                fill={baseColor}
                opacity={opacity}
              />
            );
          })
        )}
      </svg>
    </AbsoluteFill>
  );
};

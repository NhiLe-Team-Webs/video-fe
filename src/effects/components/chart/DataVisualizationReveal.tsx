import React, {useMemo} from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {palette, typography} from "../../../styles/designTokens";

type SeriesPoint = {
  label: string;
  primary: number;
  secondary?: number;
};

const fallbackPoints: SeriesPoint[] = [
  {label: "Q1", primary: 32, secondary: 25},
  {label: "Q2", primary: 48, secondary: 35},
  {label: "Q3", primary: 58, secondary: 42},
  {label: "Q4", primary: 72, secondary: 55},
];

const parsePoints = (input?: SeriesPoint[] | string): SeriesPoint[] => {
  if (!input) {
    return fallbackPoints;
  }

  const normalize = (items: SeriesPoint[]) =>
    items
      .filter((item) => item && typeof item.label === "string" && typeof item.primary === "number")
      .map((item) => ({
        label: item.label,
        primary: item.primary,
        secondary: item.secondary,
      }));

  if (Array.isArray(input)) {
    const normalized = normalize(input);
    return normalized.length > 0 ? normalized : fallbackPoints;
  }

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        const normalized = normalize(parsed as SeriesPoint[]);
        return normalized.length > 0 ? normalized : fallbackPoints;
      }
    } catch {
      return fallbackPoints;
    }
  }

  return fallbackPoints;
};

const getPathLength = (points: Array<{x: number; y: number}>): number => {
  if (points.length < 2) {
    return 0;
  }
  let sum = 0;
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    sum += Math.hypot(dx, dy);
  }
  return sum;
};

const buildPath = (points: Array<{x: number; y: number}>): string => {
  if (!points.length) {
    return "";
  }
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
};

export type DataVisualizationRevealProps = {
  points?: SeriesPoint[] | string;
  durationInFrames: number;
  backgroundColor?: string;
  gridColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  showSecondary?: boolean;
};

export const DataVisualizationReveal: React.FC<DataVisualizationRevealProps> = ({
  points,
  durationInFrames,
  backgroundColor = "#071631",
  gridColor = "rgba(255,255,255,0.15)",
  primaryColor = "#f97316",
  secondaryColor = "#38bdf8",
  showSecondary = true,
}) => {
  const frame = useCurrentFrame();
  const resolvedPoints = useMemo(() => parsePoints(points), [points]);
  const valueMax =
    resolvedPoints.reduce((max, point) => Math.max(max, point.secondary ?? 0, point.primary), 0) || 1;

  const chartWidth = 720;
  const chartHeight = 360;
  const padding = 80;
  const axisDuration = Math.min(20, Math.max(12, Math.floor(durationInFrames * 0.15)));
  const lineDuration = Math.max(24, durationInFrames * 0.35);

  const axisProgress = interpolate(frame, [0, axisDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineProgress = interpolate(frame, [axisDuration, axisDuration + lineDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const secondLineProgress = interpolate(
    frame,
    [axisDuration + lineDuration * 0.3, axisDuration + lineDuration * 1.2],
    [0, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const coordinates = useMemo(() => {
    if (!resolvedPoints.length) {
      return {primaryPoints: [], secondaryPoints: []};
    }
    const slice = resolvedPoints.map((point, index) => {
      const x = padding + (index / Math.max(resolvedPoints.length - 1, 1)) * chartWidth;
      const yPrimary = padding + chartHeight - (point.primary / valueMax) * chartHeight;
      const ySecondary =
        point.secondary !== undefined
          ? padding + chartHeight - (point.secondary / valueMax) * chartHeight
          : undefined;
      return {
        x,
        primary: yPrimary,
        secondary: ySecondary,
      };
    });
    return {
      primaryPoints: slice.map((entry) => ({x: entry.x, y: entry.primary})),
      secondaryPoints: slice
        .filter((entry) => entry.secondary !== undefined)
        .map((entry) => ({x: entry.x, y: entry.secondary as number})),
    };
  }, [resolvedPoints, valueMax]);

  const primaryLength = getPathLength(coordinates.primaryPoints);
  const secondaryLength = getPathLength(coordinates.secondaryPoints);
  const glowPulse = 1 + Math.sin(frame / 8) * 0.08;

  return (
    <AbsoluteFill
      style={{
        fontFamily: typography.body,
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        background: palette.deepBlack,
        color: palette.brightestWhite,
      }}
    >
      <div
        style={{
          width: chartWidth + padding * 2,
          height: chartHeight + padding * 2,
          position: "relative",
          borderRadius: 32,
          background: backgroundColor,
          boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
          overflow: "hidden",
          border: `1px solid ${palette.lightGray}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: padding,
            borderLeft: `2px solid ${gridColor}`,
            borderBottom: `2px solid ${gridColor}`,
            transformOrigin: "left bottom",
            transform: `scaleX(${axisProgress}) scaleY(${axisProgress})`,
          }}
        />

        {[1, 2, 3].map((row) => (
          <div
            key={`row-${row}`}
            style={{
              position: "absolute",
              left: padding,
              right: padding,
              top: padding + (chartHeight / 4) * row,
              height: 1,
              background: "rgba(255,255,255,0.08)",
            }}
          />
        ))}

        <svg
          width={chartWidth + padding * 2}
          height={chartHeight + padding * 2}
          viewBox={`0 0 ${chartWidth + padding * 2} ${chartHeight + padding * 2}`}
        >
          <path
            d={buildPath(coordinates.primaryPoints)}
            fill="none"
            stroke={primaryColor}
            strokeWidth={6}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={primaryLength || 1}
            strokeDashoffset={(1 - lineProgress) * primaryLength}
            opacity={primaryLength > 0 ? 1 : 0}
          />
          {showSecondary && (
            <path
              d={buildPath(coordinates.secondaryPoints)}
              fill="none"
              stroke={secondaryColor}
              strokeWidth={4}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={secondaryLength || 1}
              strokeDashoffset={(1 - secondLineProgress) * secondaryLength}
              opacity={secondaryLength > 0 ? 0.9 : 0}
            />
          )}
        </svg>

        {resolvedPoints.map((point, index) => {
          const progressPerPoint = lineProgress - index * 0.08;
          const pointOpacity = interpolate(progressPerPoint, [0, 0.4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const x = padding + (index / Math.max(resolvedPoints.length - 1, 1)) * chartWidth;
          const yPrimary = padding + chartHeight - (point.primary / valueMax) * chartHeight;
          const ySecondary =
            point.secondary !== undefined
              ? padding + chartHeight - (point.secondary / valueMax) * chartHeight
              : null;

          return (
            <React.Fragment key={`${point.label}-${index}`}>
              <div
                style={{
                  position: "absolute",
                  left: x - 6,
                  top: yPrimary - 6,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: primaryColor,
                  transform: `scale(${progressPerPoint > 0.9 ? glowPulse : 1})`,
                  opacity: pointOpacity,
                  transition: "transform 120ms ease",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: x - 25,
                  top: yPrimary - 34,
                  fontSize: 18,
                  fontWeight: 700,
                  color: primaryColor,
                  opacity: pointOpacity,
                }}
              >
                {point.primary}
              </div>
              {ySecondary !== null && showSecondary && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      left: x - 5,
                      top: ySecondary - 5,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: secondaryColor,
                      opacity: interpolate(secondLineProgress - index * 0.08, [0, 0.4], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      }),
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: x - 20,
                      top: ySecondary - 28,
                      fontSize: 16,
                      color: secondaryColor,
                      fontWeight: 600,
                      opacity: interpolate(secondLineProgress - index * 0.08, [0, 0.6], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      }),
                    }}
                  >
                    {point.secondary}
                  </div>
                </>
              )}
              <div
                style={{
                  position: "absolute",
                  left: x - 30,
                  bottom: padding - 40,
                  width: 60,
                  textAlign: "center",
                  fontSize: 16,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  opacity: axisProgress,
                  color: "#94a3b8",
                }}
              >
                {point.label}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

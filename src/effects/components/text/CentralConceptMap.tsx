/* eslint-disable @remotion/slow-css-property */
import React, {useMemo} from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {palette, typography, motif} from "../../../styles/designTokens";

type NodeItem = {
  label: string;
};

const fallbackNodes: NodeItem[] = [
  {label: "Content"},
  {label: "On-Page SEO"},
  {label: "Keyword Research"},
  {label: "Link Building"},
];

const parseNodes = (input?: NodeItem[] | string): NodeItem[] => {
  if (!input) {
    return fallbackNodes;
  }

  const normalize = (items: NodeItem[]) =>
    items
      .filter((item) => item && typeof item.label === "string")
      .map((item) => ({
        label: item.label,
      }));

  if (Array.isArray(input)) {
    const normalized = normalize(input);
    return normalized.length > 0 ? normalized : fallbackNodes;
  }

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        const normalized = normalize(parsed as NodeItem[]);
        return normalized.length > 0 ? normalized : fallbackNodes;
      }
    } catch {
      return fallbackNodes;
    }
  }

  return fallbackNodes;
};

export type CentralConceptMapProps = {
  centralLabel?: string;
  nodes?: NodeItem[] | string;
  durationInFrames: number;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
};

export const CentralConceptMap: React.FC<CentralConceptMapProps> = ({
  centralLabel = "SEO",
  nodes,
  durationInFrames,
  accentColor = palette.primaryRed,
  backgroundColor = palette.deepBlack,
  textColor = palette.brightestWhite,
}) => {
  const frame = useCurrentFrame();
  const resolvedNodes = useMemo(() => parseNodes(nodes), [nodes]);
  const ringDrawFrames = Math.max(20, durationInFrames * 0.4);
  const ringProgress = interpolate(frame, [0, ringDrawFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const centerOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const centerScale = 1 + Math.sin(frame / 15) * 0.03;

  const radius = 240;
  const circumference = 2 * Math.PI * radius;

  return (
    <AbsoluteFill
      style={{
        fontFamily: typography.body,
        color: textColor,
        background: `radial-gradient(circle at top, rgba(255,255,255,0.04), transparent 45%), ${backgroundColor}`,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        pointerEvents: "none",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1080 1080"
        style={{position: "absolute", inset: 0}}
      >
        <circle
          cx="540"
          cy="540"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={2}
          strokeDasharray="8 14"
          strokeDashoffset={circumference * (1 - ringProgress)}
          // eslint-disable-next-line @remotion/non-pure-animation
          style={{transition: "stroke-dashoffset 100ms linear"}}
        />
      </svg>

        <div
          style={{
            fontSize: 90,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 8,
            color: accentColor,
            opacity: centerOpacity,
            transform: `scale(${centerScale})`,
            // eslint-disable-next-lirgba(57, 57, 57, 0.35)w-css-property
            textShadow: "0 20px 50px rgba(0,0,0,0.35)",
            fontFamily: typography.headline,
            position: "relative",
          }}
        >
          {centralLabel}
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 18,
              width: 60,
              height: 38,
              background: motif.triangleGlow,
              mixBlendMode: motif.overlayBlend as React.CSSProperties['mixBlendMode'],
              borderRadius: "0 12px 12px 0",
              /// eslint-disable-next-line @remotion/slow-css-property
              boxShadow: "0 15px 35px rgba(200,16,46,0.4)",
              transform: "skewX(-10deg)",
            }}
          />
        </div>

      {resolvedNodes.map((node, index) => {
        const angle = (index / resolvedNodes.length) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * (radius + 60);
        const y = Math.sin(angle) * (radius + 60);
        const appearStart = 12 + index * 8;
        const appearEnd = appearStart + 16;
        const opacity = interpolate(frame, [appearStart, appearEnd], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const offset = interpolate(frame, [appearStart, appearEnd], [20, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={`${node.label}-${index}`}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(${x + offset * Math.cos(angle)}px, ${y + offset * Math.sin(angle)}px) translate(-50%, -50%)`,
              fontSize: 32,
              fontWeight: 600,
              textAlign: "center",
              textTransform: "uppercase",
              opacity,
            }}
          >
            {node.label}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

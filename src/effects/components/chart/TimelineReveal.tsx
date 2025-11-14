import React, {useMemo} from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {palette, typography} from "../../../styles/designTokens";

type TimelineItem = {
  title: string;
  subtitle?: string;
  accent?: string;
};

const fallbackItems: TimelineItem[] = [
  {title: "Social Media Blitz", subtitle: "Awareness phase", accent: "#38bdf8"},
  {title: "Coupon Funnels", subtitle: "Acquisition boost", accent: "#f472b6"},
  {title: "Hire SEO Crew", subtitle: "Sustain growth", accent: "#fbbf24"},
  {title: "Automation Layer", subtitle: "Scale operations", accent: "#a78bfa"},
];

const parseItems = (input?: TimelineItem[] | string): TimelineItem[] => {
  if (!input) {
    return fallbackItems;
  }

  const normalizeArray = (arr: TimelineItem[]) =>
    arr.filter((item) => item && typeof item.title === "string").map((item) => ({
      title: item.title,
      subtitle: item.subtitle,
      accent: item.accent,
    }));

  if (Array.isArray(input)) {
    const normalized = normalizeArray(input);
    return normalized.length > 0 ? normalized : fallbackItems;
  }

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        const normalized = normalizeArray(parsed as TimelineItem[]);
        return normalized.length > 0 ? normalized : fallbackItems;
      }
    } catch {
      return fallbackItems;
    }
  }

  return fallbackItems;
};

export type TimelineRevealProps = {
  items?: TimelineItem[] | string;
  durationInFrames?: number;
};

export const TimelineReveal: React.FC<TimelineRevealProps> = ({items, durationInFrames = 180}) => {
  const frame = useCurrentFrame();
  const resolvedItems = useMemo(() => parseItems(items), [items]);
  const stages = Math.max(resolvedItems.length - 1, 1);

  const lineProgress = interpolate(frame, [0, durationInFrames * 0.7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const overlayOpacity = interpolate(frame, [0, 12, durationInFrames - 12, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily: typography.body,
        padding: "120px 140px",
        background: palette.deepBlack,
        color: palette.brightestWhite,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top left, rgba(56,189,248,0.25), transparent 45%), radial-gradient(circle at top right, rgba(168,85,247,0.2), transparent 40%)",
          opacity: overlayOpacity,
          transition: "opacity 200ms ease-out",
        }}
      />

      <div style={{position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column"}}>
        <div style={{flex: 1, display: "flex", alignItems: "center"}}>
          <div style={{width: "100%", position: "relative", height: 320}}>
            <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              transform: "translateY(-50%)",
              height: 8,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 999,
            }}
          />

            <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              transform: "translateY(-50%)",
              height: 8,
              width: `${lineProgress * 100}%`,
              background: "linear-gradient(90deg, #C8102E, #a855f7, #F2F2F2)",
              borderRadius: 999,
              boxShadow: "0 0 35px rgba(200,16,46,0.6)",
            }}
            >
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "50%",
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#fef9c3",
                  boxShadow: "0 0 25px rgba(254,249,195,0.9)",
                  transform: "translate(50%, -50%)",
                  opacity: lineProgress > 0 ? 1 : 0,
                }}
              />
            </div>

            {resolvedItems.map((item, index) => {
              const position = stages === 0 ? 0.5 : index / stages;
              const appearStart = durationInFrames * 0.2 + index * 8;
              const appearEnd = appearStart + 18;
              const nodeProgress = interpolate(frame, [appearStart, appearEnd], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });

              const reached = lineProgress >= position - 0.0001;
              const pulse = reached ? 1 + Math.sin(frame / 6) * 0.08 : 1;
              const circleScale = reached ? pulse : nodeProgress;
              const accent = item.accent ?? "#fef3c7";

              const labelOpacity = nodeProgress;
              const labelOffset = interpolate(nodeProgress, [0, 1], [24, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });

              return (
                <div
                  key={`${item.title}-${index}`}
                  style={{
                    position: "absolute",
                    left: `${position * 100}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 200,
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: reached ? accent : "rgba(255,255,255,0.25)",
                      boxShadow: reached ? `0 0 25px ${accent}` : "none",
                      border: "2px solid rgba(255,255,255,0.45)",
                      margin: "0 auto",
                      transform: `scale(${Math.max(circleScale, 0)})`,
                      transition: "background 200ms ease",
                    }}
                  />
                  <div
                    style={{
                      marginTop: 56,
                      textAlign: "center",
                      opacity: labelOpacity,
                      transform: `translateY(${labelOffset * -1}px)`,
                      transition: "opacity 200ms ease-out",
                      fontFamily: typography.headline,
                    }}
                  >
                    <div style={{fontSize: 20, fontWeight: 700}}>{item.title}</div>
                    {item.subtitle && (
                      <div style={{fontSize: 16, opacity: 0.7, marginTop: 4, fontFamily: typography.body}}>
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};


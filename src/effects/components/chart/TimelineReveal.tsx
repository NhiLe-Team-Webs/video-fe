import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";

type TimelineItem = {
  title: string;
  subtitle?: string;
};

const fallbackItems: TimelineItem[] = [
  {title: "Phase 1", subtitle: "Kickoff & alignment"},
  {title: "Phase 2", subtitle: "Build & iterate"},
  {title: "Phase 3", subtitle: "Launch & measure"},
];

export type TimelineRevealProps = {
  items?: TimelineItem[];
};

export const TimelineReveal: React.FC<TimelineRevealProps> = ({items}) => {
  const resolvedItems = items && items.length > 0 ? items : fallbackItems;
  const frame = useCurrentFrame();
  const lineProgress = interpolate(frame, [0, 50], [0, 100], {extrapolateRight: "clamp"});

  return (
    <AbsoluteFill
      style={{
        padding: "120px 160px",
        fontFamily: "Space Grotesk, sans-serif",
        color: "#fdfdfd",
      }}
    >
      <div style={{height: "100%", position: "relative"}}>
        <div
          style={{
            position: "absolute",
            left: 0,
            width: 4,
            height: `${lineProgress}%`,
            background: "linear-gradient(180deg, #45caff, #ff1b6b)",
            borderRadius: 2,
            transition: "height 80ms linear",
          }}
        />
        <div style={{marginLeft: 32, display: "flex", flexDirection: "column", gap: 48}}>
          {resolvedItems.map((item, index) => (
            <div key={item.title + index}>
              <div style={{fontSize: 42, fontWeight: 600}}>{item.title}</div>
              {item.subtitle && <div style={{opacity: 0.7}}>{item.subtitle}</div>}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};


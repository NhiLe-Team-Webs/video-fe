import React from "react";
import {AbsoluteFill, Sequence} from "remotion";
import {useEffectByKey} from "../../effects/hooks/useEffectByKey";
import type {EffectTrackEntry, NormalizedEffectEvent} from "../types";

type EffectEntry = (EffectTrackEntry | NormalizedEffectEvent) &
  Partial<Pick<NormalizedEffectEvent, "startFrame" | "durationInFrames" | "endFrame">>;

type PlanEffectsLayerProps = {
  entries?: EffectEntry[];
  fps: number;
  layerZIndex?: number;
  showSampleContent?: boolean;
};

const clampFrameWindow = (entry: EffectEntry, fps: number) => {
  if (
    typeof entry.startFrame === "number" &&
    typeof entry.durationInFrames === "number" &&
    entry.durationInFrames > 0
  ) {
    return {from: entry.startFrame, duration: entry.durationInFrames};
  }
  const from = Math.max(0, Math.round((entry.start ?? 0) * fps));
  const duration = Math.max(1, Math.round((entry.duration ?? 0) * fps) || 1);
  return {from, duration};
};

export const PlanEffectsLayer: React.FC<PlanEffectsLayerProps> = ({
  entries,
  fps,
  layerZIndex,
  showSampleContent = true,
}) => {
  if (!entries?.length) {
    return null;
  }

  return (
    <AbsoluteFill style={{zIndex: layerZIndex ?? 3, pointerEvents: "none"}}>
      {entries.map((entry) => {
        const {from, duration} = clampFrameWindow(entry, fps);
        return (
          <Sequence
            key={`effect-${entry.id}`}
            from={from}
            durationInFrames={duration}
            name={`effect-${entry.id}`}
          >
            <TimedEffect entry={entry} durationInFrames={duration} showSampleContent={showSampleContent} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const TimedEffect: React.FC<{
  entry: EffectEntry;
  durationInFrames: number;
  showSampleContent: boolean;
}> = ({entry, durationInFrames, showSampleContent}) => {
  const resolution = useEffectByKey(entry.effectKey);

  if (!resolution) {
    return <EffectPlaceholder label={entry.effectKey} />;
  }

  const {Component, metadata} = resolution;
  const needsChildren =
    showSampleContent &&
    (metadata?.category === "motion" ||
      metadata?.recommendedLayer === "base" ||
      entry.effectKey.startsWith("motion."));

  return (
    <AbsoluteFill>
      <Component durationInFrames={durationInFrames} {...(entry.props ?? {})}>
        {needsChildren ? <EffectSampleScene /> : null}
      </Component>
    </AbsoluteFill>
  );
};

const EffectPlaceholder: React.FC<{label: string}> = ({label}) => (
  <AbsoluteFill
    style={{
      border: "2px dashed rgba(255,255,255,0.4)",
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      color: "rgba(248,250,252,0.8)",
      fontFamily: "Inter, sans-serif",
      textTransform: "uppercase",
      fontSize: 28,
      letterSpacing: 1,
      background: "rgba(15,23,42,0.6)",
    }}
  >
    {label}
  </AbsoluteFill>
);

const EffectSampleScene: React.FC = () => (
  <div
    style={{
      width: "100%",
      height: "100%",
      borderRadius: 24,
      background:
        "linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(2,6,23,0.85) 70%), url(https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=900&q=60) center/cover",
      color: "#f8fafc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      letterSpacing: 1,
    }}
  >
    Speaker
  </div>
);


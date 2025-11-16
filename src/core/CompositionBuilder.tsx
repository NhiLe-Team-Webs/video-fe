import React from "react";
import {Sequence, AbsoluteFill} from "remotion";
import {VideoLayer} from "./layers/VideoLayer";
import {AudioLayer} from "./AudioLayer";
import {PlanEffectsLayer} from "./layers/PlanEffectsLayer";
import {TransitionManager} from "./layers/TransitionManager";
import {NoiseBackdrop} from "../effects/components/background/NoiseBackdrop";
import type {LoadedPlan, NormalizedSegment} from "./types";
import type {TransitionDefinition} from "../transitions/transitionTypes";

type CompositionBuilderProps = {
  plan: LoadedPlan;
  theme?: Record<string, unknown>;
  templateConfig?: Record<string, unknown>;
  effects?: Record<string, React.FC<Record<string, unknown>>>;
  resolveAnimation?: (segment: NormalizedSegment) => React.FC<Record<string, unknown>>;
  resolveTransition?: (params: {
    segment: NormalizedSegment;
    nextSegment?: NormalizedSegment;
    index?: number;
  }) => TransitionDefinition | null;
};

const BrollCard: React.FC<{scale: number; file: string}> = ({scale, file}) => {
  const cardStyle: React.CSSProperties = {
    position: "absolute",
    inset: "15%",
    borderRadius: 32,
    overflow: "hidden",
    transform: `scale(${scale})`,
    transformOrigin: "center",
    border: "1px solid rgba(255,255,255,0.25)",
    boxShadow: "0 30px 70px rgba(2,6,23,0.45)",
    zIndex: 3,
  };

  return (
    <div style={cardStyle}>
      <VideoLayer clip={file} muted={false} durationSeconds={1} startFrom={0} shake />
    </div>
  );
};

const TEXT_EFFECT_PREFIX = "text.";
const MIN_BROLL_WINDOW_SECONDS = 0.6;
const MAX_BROLL_WINDOWS_PER_SEGMENT = 1;

type FrameWindow = {start: number; end: number};

const mergeIntervals = (intervals: FrameWindow[]): FrameWindow[] => {
  if (!intervals.length) {
    return [];
  }
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const merged: FrameWindow[] = [];
  let current = {...sorted[0]};
  for (let i = 1; i < sorted.length; i += 1) {
    const next = sorted[i];
    if (next.start <= current.end) {
      current.end = Math.max(current.end, next.end);
    } else {
      merged.push(current);
      current = {...next};
    }
  }
  merged.push(current);
  return merged;
};

const computeCardWindows = (segment: NormalizedSegment, effects: LoadedPlan["effects"], fps: number): FrameWindow[] => {
  const minFrames = Math.max(1, Math.round(MIN_BROLL_WINDOW_SECONDS * fps));
  const textIntervals = mergeIntervals(
    effects
      .filter((effect) => (effect.effectKey ?? "").startsWith(TEXT_EFFECT_PREFIX))
      .map((effect) => ({
        start: Math.max(effect.startFrame, segment.startFrame),
        end: Math.min(effect.endFrame, segment.endFrame),
      }))
      .filter((interval) => interval.end > interval.start)
  );

  const windows: FrameWindow[] = [];
  let cursor = segment.startFrame;
  textIntervals.forEach((interval) => {
    if (interval.start - cursor >= minFrames) {
      windows.push({start: cursor, end: interval.start});
    }
    cursor = Math.max(cursor, interval.end);
  });
  if (segment.endFrame - cursor >= minFrames) {
    windows.push({start: cursor, end: segment.endFrame});
  }

  return windows.slice(0, MAX_BROLL_WINDOWS_PER_SEGMENT);
};

const resolvePlannedWindow = (
  segment: NormalizedSegment,
  broll: NormalizedSegment["broll"],
  fps: number
): FrameWindow | null => {
  if (!broll || typeof broll.startAt !== "number") {
    return null;
  }
  const minFrames = Math.max(1, Math.round(MIN_BROLL_WINDOW_SECONDS * fps));
  const startFrame = segment.startFrame + Math.max(0, Math.round(broll.startAt * fps));
  const requestedDuration =
    typeof broll.duration === "number" && broll.duration > 0 ? broll.duration : MIN_BROLL_WINDOW_SECONDS;
  const durationFrames = Math.max(minFrames, Math.round(requestedDuration * fps));
  const endFrame = Math.min(segment.endFrame, startFrame + durationFrames);
  if (endFrame - startFrame < minFrames) {
    return null;
  }
  return {start: startFrame, end: endFrame};
};

const resolveBrollWindows = (
  segment: NormalizedSegment,
  effects: LoadedPlan["effects"],
  fps: number
): FrameWindow[] => {
  const planned = resolvePlannedWindow(segment, segment.broll, fps);
  if (planned) {
    return [planned];
  }
  return computeCardWindows(segment, effects, fps);
};

const BackgroundOverlay: React.FC<{effect?: string}> = ({effect}) => {
  // Normalize keys like "background.noiseBackdrop" or "noiseBackdrop"
  const key = effect ? String(effect).split(".").pop() : undefined;

  if (key === "noiseBackdrop") {
    return (
      <NoiseBackdrop
        baseColor="rgba(3,7,18,0.92)"
        accentColor="rgba(255,255,255,0.22)"
        circleRadius={8}
        speed={0.02}
        maxOffset={12}
      />
    );
  }

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at center, rgba(2,6,23,0.8), rgba(3,7,18,0.95))",
      }}
    />
  );
};

const PlanBrollBackgroundLayer: React.FC<{
  segments: NormalizedSegment[];
  effects: LoadedPlan["effects"];
  fps: number;
}> = ({segments, effects, fps}) => {
  const nodes: React.ReactNode[] = [];
  segments.forEach((segment, index) => {
    const broll = segment.broll;
    if (!broll || !broll.backgroundEffect) {
      return;
    }
    const windows = resolveBrollWindows(segment, effects, fps);
    windows.forEach((window, wi) => {
      const durationInFrames = window.end - window.start;
      nodes.push(
        <Sequence
          key={`broll-bg-${segment.id ?? index}-${wi}`}
          from={window.start}
          durationInFrames={durationInFrames}
          name={`broll-bg-${segment.id ?? index}-${wi}`}
        >
          <AbsoluteFill style={{pointerEvents: "none"}}>
            <BackgroundOverlay effect={broll.backgroundEffect} />
          </AbsoluteFill>
        </Sequence>
      );
    });
  });

  return (
    <AbsoluteFill style={{pointerEvents: "none", zIndex: 2}}>
      {nodes}
    </AbsoluteFill>
  );
};

export const CompositionBuilder: React.FC<CompositionBuilderProps> = ({plan, resolveTransition}) => {
  if (!plan.segments.length) {
    return null;
  }

  const renderSegmentContent = (segment: NormalizedSegment, index: number) => (
    <AbsoluteFill>
      <VideoLayer
        clip={segment.clip}
        startFrom={segment.sourceStart ?? 0}
        durationSeconds={segment.duration}
        muted={segment.mute}
      />
      {segment.broll?.mode === "card" && segment.broll.file
        ? (() => {
            const brollFile = segment.broll?.file;
            if (!brollFile) {
              return null;
            }
            const windows = resolveBrollWindows(segment, plan.effects, plan.fps);
            if (!windows.length) {
              return null;
            }
            return windows.map((window, windowIndex) => {
              const from = window.start - segment.startFrame;
              const durationInFrames = window.end - window.start;
              return (
                <Sequence
                  key={`broll-${segment.id ?? index}-${windowIndex}`}
                  from={from}
                  durationInFrames={durationInFrames}
                  name={`segment-${segment.id?.toString() ?? index}-broll-${windowIndex}`}
                >
                  <BrollCard scale={segment.broll?.cardScale ?? 0.85} file={brollFile} />
                </Sequence>
              );
            });
          })()
        : null}
      {/* background overlay for b-roll windows is rendered in separate PlanBrollBackgroundLayer */}
      {segment.sfx && (
        <AudioLayer
          src={segment.sfx}
          startFrom={0}
          endAt={segment.durationInFrames}
          volume={0.5}
        />
      )}
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      <TransitionManager
        plan={plan}
        resolveTransition={resolveTransition}
      >
        {renderSegmentContent}
      </TransitionManager>
      <PlanBrollBackgroundLayer segments={plan.segments} effects={plan.effects} fps={plan.fps} />
      <PlanEffectsLayer entries={plan.effects} fps={plan.fps} showSampleContent={false} layerZIndex={5} />
    </AbsoluteFill>
  );
};

import React, {useMemo} from "react";
import {AbsoluteFill, Sequence, useVideoConfig} from "remotion";
import planJson from "../data/plan.json";
import {VideoLayer} from "../core/layers/VideoLayer";
import {TransitionLayer} from "../core/layers/TransitionLayer";
import {AudioLayer} from "../core/AudioLayer";
import {palette} from "../styles/designTokens";
import {useHotReloadPlan} from "./useHotReloadPlan";
import type {
  EditingPlan,
  HighlightPlan,
  SegmentBrollPlan,
  SegmentPlan,
  TransitionPlan,
} from "./types";
import {buildTimeline, getTimelineDuration, type TimelineSegment} from "./utils/timeline";

const DEFAULT_VIDEO_SOURCE = "input/footage.mp4";
const DEFAULT_TRANSITION_SECONDS = 0.75;

const ensurePlan = (candidate: unknown): EditingPlan | null => {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const plan = candidate as Partial<EditingPlan>;
  const segments = Array.isArray(plan.segments) ? plan.segments : [];
  if (!segments.length) {
    return null;
  }

  return {
    segments: segments.filter((segment) => typeof segment?.duration === "number" && segment.duration > 0),
    highlights: Array.isArray(plan.highlights) ? plan.highlights : [],
    meta: plan.meta,
  };
};

const coercePlan = (hot: unknown, fallback: EditingPlan): EditingPlan => ensurePlan(hot) ?? fallback;

const mapTransitionEffect = (transition?: TransitionPlan) => {
  if (!transition?.type) {
    return "fade_in";
  }
  if (transition.type === "slide" || transition.type === "slideWhoosh") {
    return "zoom_in";
  }
  if (transition.type === "crossfade" || transition.type === "fadeCamera") {
    return "fade_in";
  }
  return "none";
};

const HighlightOverlay: React.FC<{highlight: HighlightPlan}> = ({highlight}) => {
  const label = highlight.keyword ?? highlight.text ?? highlight.title ?? highlight.id;
  const position = highlight.position ?? "bottom";
  const justifyContent =
    position === "top" ? "flex-start" : position === "center" ? "center" : "flex-end";

  return (
    <AbsoluteFill
      pointerEvents="none"
      style={{
        justifyContent,
        alignItems: "center",
        padding: "4% 6%",
      }}
    >
      <div
        style={{
          minWidth: 420,
          maxWidth: "72%",
          borderRadius: 28,
          padding: "20px 32px",
          background: "rgba(15,23,42,0.65)",
          border: "1px solid rgba(248,250,252,0.3)",
          color: palette.brightestWhite,
          fontFamily: "Inter, sans-serif",
          fontSize: 44,
          fontWeight: 600,
          letterSpacing: 0.3,
          textTransform: "uppercase",
          boxShadow: "0 24px 60px rgba(2,6,23,0.5)",
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
};

const HighlightAudio: React.FC<{highlight: HighlightPlan}> = ({highlight}) => {
  if (!highlight.sfx) {
    return null;
  }
  return <AudioLayer src={highlight.sfx} volume={0.85} />;
};

const normalizeAssetPath = (file: string) => file.replace(/^\/+/, "");

const resolveBrollAsset = (file: string) => {
  let cleaned = file.trim();
  if (!cleaned.length) {
    return null;
  }
  cleaned = cleaned.replace(/^\/+/, "");

  if (cleaned.startsWith("assets/")) {
    return cleaned;
  }
  if (cleaned.startsWith("broll/")) {
    return `assets/${cleaned}`;
  }
  return `assets/broll/${cleaned}`;
};

const BrollPlaceholder: React.FC<{label?: string}> = ({label}) => (
  <AbsoluteFill
    style={{
      background: "rgba(12,21,38,0.75)",
      border: "2px dashed rgba(255,255,255,0.28)",
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      color: "rgba(226,232,240,0.85)",
      fontFamily: "Inter, sans-serif",
      letterSpacing: 0.5,
      textTransform: "uppercase",
      fontSize: 36,
    }}
  >
    {label ?? "B-Roll Placeholder"}
  </AbsoluteFill>
);

const BrollMedia: React.FC<{
  broll: SegmentBrollPlan;
  fps: number;
  durationFrames: number;
  mode: SegmentBrollPlan["mode"];
}> = ({broll, fps, durationFrames, mode}) => {
  const clip = broll.file ? resolveBrollAsset(broll.file) : null;

  if (!clip) {
    return <BrollPlaceholder label={broll.id} />;
  }
  const durationSeconds = durationFrames / fps;
  const containerStyle =
    mode === "full"
      ? {position: "absolute" as const, inset: 0, borderRadius: 0}
      : {
          position: "absolute" as const,
          width: "38%",
          height: "38%",
          top: "8%",
          right: "6%",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
          border: "1px solid rgba(255,255,255,0.25)",
        };

  return (
    <div style={containerStyle}>
      <div style={{position: "relative", width: "100%", height: "100%"}}>
        <VideoLayer
          clip={clip}
          startFrom={broll.startAt ?? 0}
          durationSeconds={broll.duration ?? durationSeconds}
          muted
        />
      </div>
    </div>
  );
};

type FrameWindow = {from: number; duration: number};

const toFrameWindow = (highlight: HighlightPlan, fps: number): FrameWindow | null => {
  if (typeof highlight.start !== "number" || typeof highlight.duration !== "number") {
    return null;
  }
  const startFrame = Math.max(0, Math.round(highlight.start * fps));
  const durationFrames = Math.max(1, Math.round(highlight.duration * fps));
  return {from: startFrame, duration: durationFrames};
};

const computeBrollWindows = (
  segment: TimelineSegment,
  highlights: HighlightPlan[],
  fps: number
): FrameWindow[] => {
  if (!highlights.length) {
    return [{from: segment.from, duration: segment.duration}];
  }

  const segmentStart = segment.from;
  const segmentEnd = segmentStart + segment.duration;
  const padFrames = Math.max(0, Math.round(fps * 0.15));

  const overlapping = highlights
    .map((highlight) => toFrameWindow(highlight, fps))
    .filter((window): window is FrameWindow => Boolean(window))
    .map((window) => {
      const windowStart = window.from;
      const windowEnd = window.from + window.duration;
      if (windowEnd <= segmentStart || windowStart >= segmentEnd) {
        return null;
      }
      const paddedStart = Math.max(segmentStart, windowStart - padFrames);
      const paddedEnd = Math.min(segmentEnd, windowEnd + padFrames);
      if (paddedEnd <= paddedStart) {
        return null;
      }
      return {
        from: paddedStart,
        to: paddedEnd,
      };
    })
    .filter((window): window is {from: number; to: number} => Boolean(window))
    .sort((a, b) => a.from - b.from);

  if (!overlapping.length) {
    return [{from: segmentStart, duration: segment.duration}];
  }

  const merged: {from: number; to: number}[] = [];
  let current = overlapping[0];

  for (const next of overlapping.slice(1)) {
    if (next.from <= current.to + 1) {
      current = {
        from: current.from,
        to: Math.max(current.to, next.to),
      };
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);

  return merged.map((window) => ({
    from: window.from,
    duration: Math.max(1, window.to - window.from),
  }));
};

const PlanVideoTrack: React.FC<{
  timeline: TimelineSegment[];
  videoSource: string;
}> = ({timeline, videoSource}) => {
  return (
    <AbsoluteFill>
      {timeline.map((entry, index) => (
        <Sequence
          key={`segment-${entry.segment.id ?? index}`}
          from={entry.from}
          durationInFrames={entry.duration}
          name={`segment-${entry.segment.id ?? index}`}
        >
          <TransitionLayer
            effect={mapTransitionEffect(entry.segment.transitionIn ?? entry.segment.transitionOut)}
            durationInFrames={entry.duration}
          >
            <VideoLayer
              clip={videoSource}
              startFrom={entry.segment.sourceStart ?? 0}
              durationSeconds={entry.segment.duration}
              muted
            />
          </TransitionLayer>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const PlanBrollLayer: React.FC<{
  timeline: TimelineSegment[];
  highlights: HighlightPlan[];
  fps: number;
}> = ({timeline, highlights, fps}) => {
  return (
    <AbsoluteFill pointerEvents="none">
      {timeline.map((segment, index) => {
        const broll = segment.segment.broll;
        if (!broll) {
          return null;
        }

        const windows = computeBrollWindows(segment, highlights, fps);
        const mode = broll.mode ?? "overlay";

        return windows.map((window, windowIndex) => (
          <Sequence
            key={`broll-${segment.segment.id ?? index}-${windowIndex}`}
            from={window.from}
            durationInFrames={window.duration}
            name={`broll-${segment.segment.id ?? index}-${windowIndex}`}
          >
            <BrollMedia broll={broll} fps={fps} durationFrames={window.duration} mode={mode} />
          </Sequence>
        ));
      })}
    </AbsoluteFill>
  );
};

const PlanHighlightsLayer: React.FC<{highlights: HighlightPlan[]; fps: number}> = ({highlights, fps}) => (
  <AbsoluteFill pointerEvents="none">
    {highlights.map((highlight) => {
      const from = Math.round(highlight.start * fps);
      const duration = Math.max(1, Math.round(highlight.duration * fps));
      return (
        <Sequence key={`highlight-${highlight.id}`} from={from} durationInFrames={duration} name={`highlight-${highlight.id}`}>
          <HighlightOverlay highlight={highlight} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

const PlanSfxLayer: React.FC<{highlights: HighlightPlan[]; fps: number}> = ({highlights, fps}) => (
  <>
    {highlights
      .filter((highlight) => Boolean(highlight.sfx))
      .map((highlight) => {
        const from = Math.round(highlight.start * fps);
        const duration = Math.max(1, Math.round(highlight.duration * fps));
        return (
          <Sequence key={`sfx-${highlight.id}`} from={from} durationInFrames={duration} name={`sfx-${highlight.id}`}>
            <HighlightAudio highlight={highlight} />
          </Sequence>
        );
      })}
  </>
);

const fallbackPlan = planJson as EditingPlan;

export const PlanPreviewPanel: React.FC = () => {
  const {fps} = useVideoConfig();
  const hotPlan = useHotReloadPlan() as unknown;
  const plan = useMemo(() => coercePlan(hotPlan, fallbackPlan), [hotPlan]);

  const timeline = useMemo<TimelineSegment[]>(
    () => buildTimeline(plan.segments ?? [], fps, DEFAULT_TRANSITION_SECONDS),
    [plan.segments, fps]
  );
  const highlights = useMemo(
    () => (Array.isArray(plan.highlights) ? plan.highlights.filter((item) => item.duration > 0) : []),
    [plan.highlights]
  );
  const totalDuration = useMemo(() => getTimelineDuration(timeline), [timeline]);
  const videoSource = normalizeAssetPath(plan.meta?.sourceVideo ?? DEFAULT_VIDEO_SOURCE);

  if (!timeline.length || totalDuration <= 0) {
    return (
      <AbsoluteFill
        style={{
          background: "#0b1120",
          alignItems: "center",
          justifyContent: "center",
          color: "#e2e8f0",
          fontFamily: "Inter, sans-serif",
        }}
      >
        No segments found in plan.json
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        background: "#000",
        fontFamily: "Inter, sans-serif",
        color: palette.brightestWhite,
      }}
    >
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle at 20% 30%, rgba(248,113,113,0.22), transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <Sequence name="video" durationInFrames={totalDuration}>
        <PlanVideoTrack timeline={timeline} videoSource={videoSource} />
      </Sequence>

      <Sequence name="broll" durationInFrames={totalDuration}>
        <PlanBrollLayer timeline={timeline} highlights={highlights} fps={fps} />
      </Sequence>

      <Sequence name="highlights" durationInFrames={totalDuration}>
        <PlanHighlightsLayer highlights={highlights} fps={fps} />
      </Sequence>

      <Sequence name="sfx" durationInFrames={totalDuration}>
        <PlanSfxLayer highlights={highlights} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

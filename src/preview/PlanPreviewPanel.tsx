import React, {useMemo, useState} from "react";
import {AbsoluteFill, Img, Sequence, Video, staticFile, useVideoConfig, useCurrentFrame} from "remotion";
import {noise3D} from "@remotion/noise";
import planJson from "../data/plan.json";
import {TransitionLayer} from "../core/layers/TransitionLayer";
import {AudioLayer} from "../core/AudioLayer";
import {palette} from "../styles/designTokens";
import {useHotReloadPlan} from "./useHotReloadPlan";
import {getEffectMetadata} from "../effects/hooks/useEffectByKey";
import type {EffectKey} from "../types/EffectTypes";
import {secondsToFrames} from "../core/utils/frameUtils";
import type {
  EditingPlan,
  HighlightPlan,
  PlanTracks,
  SegmentBrollPlan,
  SfxTrackEntry,
  TransitionPlan,
} from "./types";
import {buildTimeline, getTimelineDuration, type TimelineSegment} from "./utils/timeline";
import {PlanEffectsLayer} from "../core/layers/PlanEffectsLayer";

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
    templateId: typeof plan.templateId === "string" ? plan.templateId : "template0",
    animationId: typeof plan.animationId === "string" ? plan.animationId : undefined,
    transitionId: typeof plan.transitionId === "string" ? plan.transitionId : undefined,
    music: typeof plan.music === "string" || plan.music === null ? plan.music : null,
    segments: segments.filter((segment) => typeof segment?.duration === "number" && segment.duration > 0),
    highlights: Array.isArray(plan.highlights) ? plan.highlights : [],
    meta: plan.meta ?? {},
    tracks: plan.tracks,
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
  if (transition.type === "crossfade" || transition.type === "fadeCamera" || transition.type === "cut") {
    return "fade_in";
  }
  return "none";
};

const HighlightAudio: React.FC<{highlight: HighlightPlan}> = ({highlight}) => {
  if (!highlight.sfx) {
    return null;
  }
  return <AudioLayer src={normalizeAssetPath(highlight.sfx)} volume={0.85} />;
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

const VIDEO_ASSETS = [".mp4", ".mov", ".mkv", ".webm"];
const isVideoAsset = (file: string) => {
  const lower = file.toLowerCase();
  return VIDEO_ASSETS.some((ext) => lower.endsWith(ext));
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
  const [videoFailed, setVideoFailed] = useState(false);
  const frame = useCurrentFrame();
  
  const clip = broll.file ? resolveBrollAsset(broll.file) : null;

  if (!clip) {
    return <BrollPlaceholder label={broll.id} />;
  }

  const durationSeconds = durationFrames / fps;
  const startSeconds = broll.startAt ?? 0;
  const playbackSeconds = broll.duration ?? durationSeconds;
  const startFrame = Math.max(0, Math.round(startSeconds * fps));
  const endFrame = startFrame + Math.max(1, Math.round(playbackSeconds * fps));
  const isVideo = isVideoAsset(clip);

  const cardScale = broll.cardScale ?? 0.85;
  const containerStyle =
    mode === "full"
      ? {position: "absolute" as const, inset: 0, borderRadius: 0}
      : {
          position: "absolute" as const,
          width: `${Math.round(cardScale * 100)}%`,
          height: `${Math.round(cardScale * 100)}%`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: 36,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.15)",
        };

  return (
    <div style={containerStyle}>
      {isVideo ? (
        videoFailed ? (
          <BrollPlaceholder label={broll.id} />
        ) : (
          <Video
            src={staticFile(clip)}
            startFrom={startFrame}
            endAt={endFrame}
            muted
            style={{width: "100%", height: "100%", objectFit: "cover"}}
            onError={() => setVideoFailed(true)}
          />
        )
      ) : (
        (() => {
          const speed = 0.02;
          const maxOffset = 6;
          const maxRotate = 0.6;
          const seed = clip || "broll-img";
          const dx = noise3D(seed + "x", frame * speed, 0, 0) * maxOffset;
          const dy = noise3D(seed + "y", frame * speed, 0, 0) * maxOffset;
          const rot = noise3D(seed + "r", frame * speed, 0, 0) * maxRotate;
          const style: React.CSSProperties = {
            width: "110%",
            height: "110%",
            objectFit: "cover",
            transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
            willChange: "transform",
          };
          return <Img src={staticFile(clip)} style={style} />;
        })()
      )}
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
  fps: number;
}> = ({timeline, videoSource, fps}) => {
  const resolvedSrc = staticFile(videoSource);
  return (
    <AbsoluteFill style={{zIndex: 0}}>
      {timeline.map((entry, index) => {
        const startSeconds = entry.segment.sourceStart ?? 0;
        const durationSeconds = entry.segment.duration;
        const startFrame = Math.max(0, Math.round(startSeconds * fps));
        const endFrame = startFrame + Math.max(1, Math.round(durationSeconds * fps));
        return (
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
              <AbsoluteFill style={{backgroundColor: "#000"}}>
                <Video
                  src={resolvedSrc}
                  startFrom={startFrame}
                  endAt={endFrame}
                  muted={false}
                  style={{width: "100%", height: "100%", objectFit: "cover"}}
                />
              </AbsoluteFill>
            </TransitionLayer>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const PlanBrollLayer: React.FC<{
  timeline: TimelineSegment[];
  highlights: HighlightPlan[];
  fps: number;
}> = ({timeline, highlights, fps}) => {
  return (
    <AbsoluteFill style={{zIndex: 1, pointerEvents: "none"}}>
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

const clampSfxDurationFrames = (durationFrames: number, fps: number) => {
  const maxFrames = Math.max(1, Math.round(0.8 * fps));
  return Math.max(1, Math.min(durationFrames, maxFrames));
};

const PlanHighlightSfxLayer: React.FC<{highlights: HighlightPlan[]; fps: number}> = ({highlights, fps}) => (
  <>
    {highlights
      .filter((highlight) => Boolean(highlight.sfx))
      .map((highlight) => {
        const from = Math.round(highlight.start * fps);
        const durationFrames = Math.max(1, Math.round(highlight.duration * fps));
        const duration = clampSfxDurationFrames(durationFrames, fps);
        return (
          <Sequence key={`sfx-${highlight.id}`} from={from} durationInFrames={duration} name={`sfx-${highlight.id}`}>
            <HighlightAudio highlight={highlight} />
          </Sequence>
        );
      })}
  </>
);

const PlanTrackSfxLayer: React.FC<{entries?: SfxTrackEntry[]; fps: number}> = ({entries, fps}) => {
  if (!entries?.length) {
    return null;
  }
  return (
    <>
      {entries.map((entry) => {
        const from = Math.round(entry.start * fps);
        const durationFrames = Math.max(1, Math.round(entry.duration * fps));
        const duration = clampSfxDurationFrames(durationFrames, fps);
        const src = normalizeAssetPath(entry.src);
        return (
          <Sequence
            key={`track-sfx-${entry.id}`}
            from={from}
            durationInFrames={duration}
            name={`track-sfx-${entry.id}`}
          >
            <AudioLayer src={src} volume={entry.volume ?? 1} />
          </Sequence>
        );
      })}
    </>
  );
};

const PlanMusicLayer: React.FC<{music?: string | null}> = ({music}) => {
  if (!music) {
    return null;
  }
  return <AudioLayer src={normalizeAssetPath(music)} loop volume={0.55} />;
};

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
  const timelineDuration = useMemo(() => getTimelineDuration(timeline), [timeline]);
  const metaDurationFrames = useMemo(() => {
    const metaDuration = plan.meta?.duration;
    const metaSeconds =
      typeof metaDuration === "number" && Number.isFinite(metaDuration) && metaDuration > 0 ? metaDuration : null;
    return metaSeconds ? secondsToFrames(metaSeconds, fps) : null;
  }, [plan.meta?.duration, fps]);
  const totalDuration = metaDurationFrames ?? timelineDuration;
  const videoSource = normalizeAssetPath(plan.meta?.sourceVideo ?? DEFAULT_VIDEO_SOURCE);
  const planTracks: PlanTracks = plan.tracks ?? {};
  const effectEntries = useMemo(() => planTracks.effects ?? [], [planTracks.effects]);
  const brollDerivedEffects = useMemo(() => {
    const entries: Array<{
      id: string;
      start: number;
      duration: number;
      effectKey: string;
      props?: Record<string, unknown>;
    }> = [];
    timeline.forEach((segment) => {
      const broll = segment.segment.broll;
      if (!broll || !broll.backgroundEffect) return;
      const windows = computeBrollWindows(segment, highlights, fps);
      const keySuffix = String(broll.backgroundEffect).split('.').pop();
      const effectKey = keySuffix?.startsWith('background.') ? keySuffix : `background.${keySuffix}`;
      windows.forEach((w, i) => {
        entries.push({
          id: `broll-bg-${segment.segment.id ?? 'seg'}-${i}`,
          start: Math.round(w.from) / fps,
          duration: Math.max(1, Math.round(w.duration)) / fps,
          effectKey,
        });
      });
    });
    return entries;
  }, [timeline, highlights, fps]);
  const combinedEffectEntries = useMemo(() => [...effectEntries, ...brollDerivedEffects], [effectEntries, brollDerivedEffects]);
  const backgroundEffects = useMemo(
    () =>
      combinedEffectEntries.filter((entry) => {
        const metadata = getEffectMetadata(entry.effectKey as EffectKey);
        return metadata?.category === "background" || entry.effectKey.startsWith("background.");
      }),
    [combinedEffectEntries]
  );
  const overlayEffects = useMemo(
    () =>
      combinedEffectEntries.filter((entry) => {
        const metadata = getEffectMetadata(entry.effectKey as EffectKey);
        return metadata?.category !== "background" && !entry.effectKey.startsWith("background.");
      }),
    [combinedEffectEntries]
  );
  const sfxEntries = planTracks.sfx ?? [];

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
          zIndex: -1,
        }}
      />

      <Sequence name="video" durationInFrames={totalDuration}>
        <PlanVideoTrack timeline={timeline} videoSource={videoSource} fps={fps} />
      </Sequence>

      {backgroundEffects.length ? (
        <Sequence name="effects-background" durationInFrames={totalDuration}>
          <PlanEffectsLayer entries={backgroundEffects} fps={fps} layerZIndex={0} />
        </Sequence>
      ) : null}

      <Sequence name="broll" durationInFrames={totalDuration}>
        <PlanBrollLayer timeline={timeline} highlights={highlights} fps={fps} />
      </Sequence>

      <Sequence name="highlight-sfx" durationInFrames={totalDuration}>
        <PlanHighlightSfxLayer highlights={highlights} fps={fps} />
      </Sequence>

      {overlayEffects.length ? (
        <Sequence name="effects" durationInFrames={totalDuration}>
          <PlanEffectsLayer entries={overlayEffects} fps={fps} />
        </Sequence>
      ) : null}

      <Sequence name="track-sfx" durationInFrames={totalDuration}>
        <PlanTrackSfxLayer entries={sfxEntries} fps={fps} />
      </Sequence>

      {plan.music ? (
        <Sequence name="music" durationInFrames={totalDuration}>
          <PlanMusicLayer music={plan.music} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

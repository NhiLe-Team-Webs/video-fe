import React, {useMemo, useState} from "react";
import {AbsoluteFill, Img, Sequence, Video, staticFile, useVideoConfig, useCurrentFrame, interpolate} from "remotion";
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
            muted={false}
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

const VideoWithZoom: React.FC<{
  src: string;
  startFrom: number;
  endAt: number;
  highlights: HighlightPlan[];
  fps: number;
}> = ({src, startFrom, endAt, highlights, fps}) => {
  const frame = useCurrentFrame();

  // Find which highlight (if any) is active in this segment's time range
  const getScaleForFrame = (currentFrame: number): number => {
    const currentSec = currentFrame / fps;
    for (const h of highlights) {
      if (currentSec >= h.start && currentSec < h.start + h.duration) {
        // Zoom in at start, zoom out at end (faster: 10% + 85% instead of 25% + 75%)
        const hStart = Math.round(h.start * fps);
        const hEnd = Math.round((h.start + h.duration) * fps);
        const zoomInEnd = Math.max(3, Math.floor((hEnd - hStart) * 0.10));
        const zoomOutStart = Math.max(zoomInEnd + 1, Math.floor((hEnd - hStart) * 0.85));
        const maxScale = 1.18; // 18% zoom in (slightly more)

        const relativeFrame = currentFrame - hStart;
        const scale = interpolate(
          relativeFrame,
          [0, zoomInEnd, zoomOutStart, hEnd - hStart],
          [1, maxScale, maxScale, 1],
          {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
        );
        return scale;
      }
    }
    return 1;
  };

  const scale = getScaleForFrame(frame);

  return (
    <AbsoluteFill style={{backgroundColor: "#000", overflow: "hidden"}}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          width: "100%",
          height: "100%",
        }}
      >
        <Video
          src={src}
          startFrom={startFrom}
          endAt={endAt}
          muted={false}
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const PlanVideoTrack: React.FC<{
  timeline: TimelineSegment[];
  videoSource: string;
  fps: number;
  highlights: HighlightPlan[];
}> = ({timeline, videoSource, fps, highlights}) => {
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
              <VideoWithZoom
                src={resolvedSrc}
                startFrom={startFrame}
                endAt={endFrame}
                highlights={highlights}
                fps={fps}
              />
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
  const derivedSfxEntries = useMemo(() => {
    const entries: Array<{
      id: string;
      start: number;
      duration: number;
      src: string;
      volume?: number;
    }> = [];

    const uiPop = "assets/sfx/ui/pop.mp3";
    const whoosh = "assets/sfx/whoosh/whoosh.mp3";
    const ding = "assets/sfx/emphasis/ding.mp3";
    const notif = "assets/sfx/tech/notification.mp3";

    const MIN_SFX_SPACING = 0.8; // seconds between auto sfx
    const SFX_DURATION = 0.6; // default seconds

    let lastPlaced = -999;

    // Prefer placing sfx near highlights (if they don't already have sfx)
    const sortedHighlights = (highlights ?? []).slice().sort((a, b) => a.start - b.start);
    for (const h of sortedHighlights) {
      if (typeof h.start !== "number") continue;
      const startSec = h.start;
      if (h.sfx) {
        lastPlaced = startSec;
        continue;
      }
      if (startSec - lastPlaced < MIN_SFX_SPACING) continue;

      // choose SFX based on animation/type (some plans may include non-standard fields)
      const hExtra = h as unknown as {animation?: string; volume?: number};
      let src = uiPop;
      if (h.type === "sectionTitle") src = whoosh;
      else if (hExtra.animation === "fade" || hExtra.animation === "fadeIn") src = notif;
      else if (hExtra.animation === "pop" || hExtra.animation === "zoom") src = uiPop;
      else src = ding;

      entries.push({
        id: `derived-sfx-h-${h.id ?? Math.round(startSec * 1000)}`,
        start: startSec,
        duration: SFX_DURATION,
        src,
        volume: typeof hExtra.volume === "number" ? hExtra.volume : 0.75,
      });
      lastPlaced = startSec;
    }

    // Add one sfx per b-roll window (soft whoosh) if spacing allows
    timeline.forEach((seg) => {
      const broll = seg.segment.broll;
      if (!broll) return;
      const windows = computeBrollWindows(seg, highlights, fps);
      if (!windows.length) return;
      const w = windows[0];
      const startSec = w.from / fps;
      if (startSec - lastPlaced < MIN_SFX_SPACING) return;
      entries.push({
        id: `derived-sfx-b-${seg.segment.id ?? seg.from}`,
        start: startSec,
        duration: Math.min(1, SFX_DURATION),
        src: whoosh,
        volume: 0.6,
      });
      lastPlaced = startSec;
    });

    return entries;
  }, [highlights, timeline, fps]);

  const sfxEntries = useMemo(() => {
    const explicit = planTracks.sfx ?? [];
    // Normalize explicit entries to shape used by PlanTrackSfxLayer (id,start,duration,src,volume)
    const normalized = explicit.map((e) => ({...e}));
    // Merge derived entries after explicit ones
    return [...normalized, ...derivedSfxEntries];
  }, [planTracks.sfx, derivedSfxEntries]);
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

  // Derived chart effects using only TimelineReveal and DataVisualizationReveal
  const derivedChartOverlayEffects = useMemo(() => {
    const entries: Array<{
      id: string;
      start: number;
      duration: number;
      effectKey: string;
      props?: Record<string, unknown>;
    }> = [];

    const MIN_EFFECT_SPACING = 4; // seconds between effects
    let lastEffectEnd = -999;

    // Collect all existing effects (explicit + broll bg) to check for overlaps
    const allExistingEffects = [...effectEntries, ...brollDerivedEffects];

    // Alternate between TimelineReveal and DataVisualizationReveal
    // Use segment text as timeline/data content
    const sortedHighlights = (highlights ?? []).slice().sort((a, b) => a.start - b.start);
    let useTimeline = true;

    for (const h of sortedHighlights) {
      if (typeof h.start !== "number") continue;
      const startSec = h.start;
      
      // Skip if too close to last placed effect
      if (startSec - lastEffectEnd < MIN_EFFECT_SPACING) continue;

      const effectKey = useTimeline ? "chart.timelineReveal" : "chart.dataReveal";
      const effectDuration = useTimeline ? 2.4 : 2.8; // from effects.json durations
      const effectEnd = startSec + effectDuration;

      // Check if this effect would overlap with any existing effect
      const hasOverlap = allExistingEffects.some((existing) => {
        const existingEnd = existing.start + existing.duration;
        // Overlap if: new starts before existing ends AND new ends after existing starts
        return startSec < existingEnd && effectEnd > existing.start;
      });

      if (hasOverlap) continue;

      // Build props with segment text if available
      const props: Record<string, unknown> = {
        durationInFrames: Math.round(effectDuration * fps),
      };

      if (useTimeline && h.text) {
        // TimelineReveal expects items array
        props.items = [
          {
            title: String(h.text).slice(0, 40),
            subtitle: `Step ${Math.floor((highlights?.indexOf(h) ?? 0) + 1)}`,
            accent: "#fbbf24",
          },
        ];
      } else if (!useTimeline && h.text) {
        // DataVisualizationReveal expects points array
        props.points = [
          {label: "Start", primary: 30},
          {label: "Mid", primary: 60},
          {label: "Peak", primary: 90},
        ];
      }

      entries.push({
        id: `derived-chart-${useTimeline ? 'timeline' : 'data'}-${h.id ?? Math.round(startSec * 1000)}`,
        start: startSec,
        duration: effectDuration,
        effectKey,
        props,
      });

      lastEffectEnd = effectEnd;
      useTimeline = !useTimeline; // alternate effects
    }

    return entries;
  }, [highlights, fps, effectEntries, brollDerivedEffects]);

  const combinedEffectEntries = useMemo(
    () => [...effectEntries, ...brollDerivedEffects, ...derivedChartOverlayEffects],
    [effectEntries, brollDerivedEffects, derivedChartOverlayEffects]
  );
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
        <PlanVideoTrack timeline={timeline} videoSource={videoSource} fps={fps} highlights={highlights} />
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

import planFromBundle from "../data/plan.json";
import {warn} from "../core/utils/logger";
import {calcFrameRange, secondsToFrames, totalFrames} from "../core/utils/frameUtils";
import type {
  Plan,
  Segment,
  LoadedPlan,
  NormalizedSegmentCore,
  PlanTracks,
  NormalizedEffectEvent,
  NormalizedAudioEvent,
} from "../core/types";

type LoadPlanOptions = {
  fps?: number;
};

const DEFAULT_FPS = 30;
const DEFAULT_TEMPLATE_ID = "template0";
const DEFAULT_PRIMARY_CLIP = "input/footage.mp4";
const PLACEHOLDER_CLIP = "assets/placeholder.jpg";
const DEFAULT_EFFECT = "none";
const DEFAULT_DURATION_SECONDS = 3;

const planCache = new Map<number, LoadedPlan>();

type NodeRequireFunction = (moduleName: string) => unknown;

const readPlanFromDisk = (): Plan => {
  const dynamicRequire = typeof window === "undefined" ? (eval("require") as NodeRequireFunction) : null;

  if (!dynamicRequire) {
    return planFromBundle as unknown as Plan;
  }

  const fs = dynamicRequire("fs") as typeof import("fs");
  const path = dynamicRequire("path") as typeof import("path");
  const filePath = path.join(__dirname, "../data/plan.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Plan;
};

const resolveDurationLimit = (plan?: Plan) => {
  const candidate = plan?.meta?.duration;
  if (typeof candidate === "number" && Number.isFinite(candidate) && candidate > 0) {
    return candidate;
  }
  return undefined;
};

const sanitizeSegment = (
  segment: Partial<Segment> | undefined,
  index: number,
  fps: number,
  timelineLimit?: number
): NormalizedSegmentCore | null => {
  const clip =
    typeof segment?.clip === "string" && segment.clip.trim().length > 0
      ? segment.clip.trim()
      : DEFAULT_PRIMARY_CLIP || PLACEHOLDER_CLIP;

  let durationSeconds =
    typeof segment?.duration === "number" && Number.isFinite(segment.duration) && segment.duration > 0
      ? segment.duration
      : (() => {
          warn(`Segment #${index} missing/invalid duration. Using ${DEFAULT_DURATION_SECONDS}s`);
          return DEFAULT_DURATION_SECONDS;
        })();

  const sourceStartSeconds =
    typeof segment?.sourceStart === "number" && Number.isFinite(segment.sourceStart) && segment.sourceStart >= 0
      ? segment.sourceStart
      : 0;

  if (typeof timelineLimit === "number" && Number.isFinite(timelineLimit) && timelineLimit > 0) {
    if (sourceStartSeconds >= timelineLimit) {
      return null;
    }
    const maxAllowed = timelineLimit - sourceStartSeconds;
    if (maxAllowed <= 0) {
      return null;
    }
    durationSeconds = Math.min(durationSeconds, maxAllowed);
    if (durationSeconds <= 0) {
      return null;
    }
  }

  const resolvedText =
    typeof segment?.text === "string" && segment.text.trim().length > 0
      ? segment.text
      : typeof segment?.label === "string" && segment.label.trim().length > 0
        ? segment.label
        : typeof segment?.title === "string" && segment.title.trim().length > 0
          ? segment.title
          : "";

  return {
    clip,
    text: resolvedText,
    effect: typeof segment?.effect === "string" ? segment.effect : DEFAULT_EFFECT,
    duration: durationSeconds,
    durationInFrames: secondsToFrames(durationSeconds, fps),
    sfx: typeof segment?.sfx === "string" && segment.sfx.length > 0 ? segment.sfx : undefined,
    emotion: typeof segment?.emotion === "string" && segment.emotion.length > 0 ? segment.emotion : undefined,
    animationId: typeof segment?.animationId === "string" ? segment.animationId : undefined,
    transitionId: typeof segment?.transitionId === "string" ? segment.transitionId : undefined,
    sourceStart: typeof segment?.sourceStart === "number" && Number.isFinite(segment.sourceStart) && segment.sourceStart >= 0 ? segment.sourceStart : undefined,
    mute: typeof segment?.mute === "boolean" ? segment.mute : true,
    broll:
      segment?.broll && typeof segment.broll === "object"
        ? {
            id: typeof segment.broll.id === "string" ? segment.broll.id : undefined,
            file: typeof segment.broll.file === "string" ? segment.broll.file : undefined,
            mode:
              ["full", "overlay", "pictureInPicture", "card"].includes(segment.broll.mode ?? "")
                ? segment.broll.mode
                : undefined,
            startAt:
              typeof segment.broll.startAt === "number" && Number.isFinite(segment.broll.startAt)
                ? segment.broll.startAt
                : undefined,
            duration:
              typeof segment.broll.duration === "number" && Number.isFinite(segment.broll.duration)
                ? segment.broll.duration
                : undefined,
            playbackRate:
              typeof segment.broll.playbackRate === "number" && Number.isFinite(segment.broll.playbackRate)
                ? segment.broll.playbackRate
                : undefined,
          }
        : undefined,
  };
};

const normalizeTrackEvents = <T extends {start: number; duration: number}>(entries: T[], fps: number) =>
  entries.map((entry) => {
    const startFrame = secondsToFrames(entry.start, fps);
    const durationInFrames = Math.max(1, secondsToFrames(entry.duration, fps));
    return {...entry, startFrame, durationInFrames, endFrame: startFrame + durationInFrames};
  });

const clampTrackEvents = <T extends {start: number; duration: number; startFrame: number; durationInFrames: number; endFrame: number}>(
  events: T[],
  fps: number,
  limitSeconds?: number
) => {
  if (typeof limitSeconds !== "number" || !Number.isFinite(limitSeconds) || limitSeconds <= 0) {
    return events;
  }
  return events
    .map((event) => {
      if (event.start >= limitSeconds) {
        return null;
      }
      const maxAllowed = limitSeconds - event.start;
      if (maxAllowed <= 0) {
        return null;
      }
      const durationSeconds = Math.min(event.duration, maxAllowed);
      if (durationSeconds <= 0) {
        return null;
      }
      const durationInFrames = Math.max(1, secondsToFrames(durationSeconds, fps));
      return {
        ...event,
        duration: durationSeconds,
        durationInFrames,
        endFrame: event.startFrame + durationInFrames,
      };
    })
    .filter((event): event is T => Boolean(event));
};

export const normalizePlan = (plan: Plan, fps: number): LoadedPlan => {
  const templateId =
    typeof plan?.templateId === "string" && plan.templateId.trim().length > 0
      ? plan.templateId
      : (() => {
          warn(`Plan missing templateId. Falling back to ${DEFAULT_TEMPLATE_ID}`);
          return DEFAULT_TEMPLATE_ID;
        })();

  const durationLimitSeconds = resolveDurationLimit(plan);
  const rawSegments = Array.isArray(plan?.segments) ? plan.segments : [];
  const normalizedSegments = rawSegments
    .map((segment, index) => sanitizeSegment(segment, index, fps, durationLimitSeconds))
    .filter((segment): segment is NormalizedSegmentCore => Boolean(segment));
  const segmentsWithTimeline = calcFrameRange(normalizedSegments, fps).map(({start, end, ...rest}) => ({
    ...rest,
    startFrame: start,
    endFrame: end,
  }));

  const tracks: PlanTracks = plan?.tracks ?? {};
  const normalizedEffects: NormalizedEffectEvent[] = clampTrackEvents(
    normalizeTrackEvents(tracks.effects ?? [], fps) as NormalizedEffectEvent[],
    fps,
    durationLimitSeconds
  );
  const normalizedAudio: NormalizedAudioEvent[] = clampTrackEvents(
    normalizeTrackEvents(tracks.sfx ?? [], fps) as NormalizedAudioEvent[],
    fps,
    durationLimitSeconds
  );

  const resolvedMusic =
    plan?.music === null ? null : typeof plan?.music === "string" ? plan.music : undefined;

  const resolvedDurationInFrames =
    typeof durationLimitSeconds === "number" && Number.isFinite(durationLimitSeconds) && durationLimitSeconds > 0
      ? secondsToFrames(durationLimitSeconds, fps)
      : totalFrames(normalizedSegments, fps);

  return {
    templateId,
    music: resolvedMusic,
    animationId: typeof plan?.animationId === "string" ? plan.animationId : undefined,
    transitionId: typeof plan?.transitionId === "string" ? plan.transitionId : undefined,
    segments: segmentsWithTimeline,
    durationInFrames: resolvedDurationInFrames,
    fps,
    meta: plan?.meta,
    effects: normalizedEffects,
    audioEvents: normalizedAudio,
  };
};

const getRawPlan = (): Plan => {
  return typeof window === "undefined" ? readPlanFromDisk() : (planFromBundle as unknown as Plan);
};

export const loadPlan = (options: LoadPlanOptions = {}): LoadedPlan => {
  const fps = options.fps ?? DEFAULT_FPS;

  if (planCache.has(fps)) {
    return planCache.get(fps)!;
  }

  const rawPlan = getRawPlan();
  const normalizedPlan = normalizePlan(rawPlan, fps);
  planCache.set(fps, normalizedPlan);
  return normalizedPlan;
};

import planFromBundle from "../data/plan.json";
import {warn} from "./utils/logger";
import {calcFrameRange, secondsToFrames, totalFrames} from "./utils/frameUtils";
import type {Plan, Segment, LoadedPlan, NormalizedSegmentCore} from "./types";

type LoadPlanOptions = {
  fps?: number;
};

const DEFAULT_FPS = 30;
const DEFAULT_TEMPLATE_ID = "template0";
const DEFAULT_CLIP = "assets/placeholder.jpg";
const DEFAULT_EFFECT = "none";
const DEFAULT_DURATION_SECONDS = 3;

const planCache = new Map<number, LoadedPlan>();

const readPlanFromDisk = (): Plan => {
  const dynamicRequire = typeof window === "undefined" ? (eval("require") as NodeRequireFunction) : null;

  if (!dynamicRequire) {
    return planFromBundle as Plan;
  }

  const fs = dynamicRequire("fs") as typeof import("fs");
  const path = dynamicRequire("path") as typeof import("path");
  const filePath = path.join(__dirname, "../data/plan.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Plan;
};

type NodeRequireFunction = (moduleName: string) => unknown;

const sanitizeSegment = (
  segment: Partial<Segment> | undefined,
  index: number,
  fps: number
): NormalizedSegmentCore => {
  const clip =
    typeof segment?.clip === "string" && segment.clip.trim().length > 0
      ? segment.clip
      : (() => {
          warn(`Segment #${index} missing clip. Falling back to ${DEFAULT_CLIP}`);
          return DEFAULT_CLIP;
        })();

  const durationSeconds =
    typeof segment?.duration === "number" && Number.isFinite(segment.duration) && segment.duration > 0
      ? segment.duration
      : (() => {
          warn(`Segment #${index} missing/invalid duration. Using ${DEFAULT_DURATION_SECONDS}s`);
          return DEFAULT_DURATION_SECONDS;
        })();

  const normalized: NormalizedSegmentCore = {
    clip,
    text: typeof segment?.text === "string" ? segment.text : "",
    effect: typeof segment?.effect === "string" ? segment.effect : DEFAULT_EFFECT,
    duration: durationSeconds,
    durationInFrames: secondsToFrames(durationSeconds, fps),
    sfx: typeof segment?.sfx === "string" && segment.sfx.length > 0 ? segment.sfx : undefined,
    emotion: typeof segment?.emotion === "string" && segment.emotion.length > 0 ? segment.emotion : undefined,
  };

  return normalized;
};

const sanitizePlan = (plan: Plan, fps: number): LoadedPlan => {
  const templateId =
    typeof plan?.templateId === "string" && plan.templateId.trim().length > 0
      ? plan.templateId
      : (() => {
          warn(`Plan missing templateId. Falling back to ${DEFAULT_TEMPLATE_ID}`);
          return DEFAULT_TEMPLATE_ID;
        })();

  const rawSegments = Array.isArray(plan?.segments) ? plan.segments : [];
  const normalizedSegments = rawSegments.map((segment, index) => sanitizeSegment(segment, index, fps));
  const segmentsWithTimeline = calcFrameRange(normalizedSegments, fps).map(({start, end, ...rest}) => ({
    ...rest,
    startFrame: start,
    endFrame: end,
  }));

  const parsedPlan: LoadedPlan = {
    templateId,
    music: typeof plan?.music === "string" ? plan.music : undefined,
    segments: segmentsWithTimeline,
    durationInFrames: totalFrames(normalizedSegments, fps),
    fps,
  };

  return parsedPlan;
};

const getRawPlan = (): Plan => {
  return typeof window === "undefined" ? readPlanFromDisk() : (planFromBundle as Plan);
};

export const loadPlan = (options: LoadPlanOptions = {}): LoadedPlan => {
  const fps = options.fps ?? DEFAULT_FPS;

  if (planCache.has(fps)) {
    return planCache.get(fps)!;
  }

  const rawPlan = getRawPlan();
  const normalizedPlan = sanitizePlan(rawPlan, fps);
  planCache.set(fps, normalizedPlan);
  return normalizedPlan;
};

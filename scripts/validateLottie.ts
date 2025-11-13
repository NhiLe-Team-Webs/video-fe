export type RawLottieAnimation = {
  v?: string;
  fr?: number;
  ip?: number;
  op?: number;
  nm?: string;
  h?: number;
  w?: number;
  assets?: Array<{id?: string; p?: string; u?: string; e?: number}>;
  layers?: Array<{refId?: string; nm?: string; w?: number; h?: number; ip?: number; op?: number}>;
  markers?: Array<{cm?: string; tm?: number; dr?: number}>;
  [key: string]: unknown;
};

export type LottieMetadata = {
  name: string;
  frameRate: number;
  inPoint: number;
  outPoint: number;
  durationInFrames: number;
  durationInSeconds: number;
  width: number;
  height: number;
  layerCount: number;
  assetCount: number;
  markerCount: number;
  version: string;
};

export type LottieValidationResult = {
  valid: boolean;
  warnings: string[];
  errors: string[];
  metadata: LottieMetadata;
};

const DEFAULT_METADATA: LottieMetadata = {
  name: "Unnamed Lottie",
  frameRate: 30,
  inPoint: 0,
  outPoint: 0,
  durationInFrames: 0,
  durationInSeconds: 0,
  width: 0,
  height: 0,
  layerCount: 0,
  assetCount: 0,
  markerCount: 0,
  version: "unknown",
};

const hasExpressions = (input: string) =>
  /"exp"?res/i.test(input) || /"expression"/i.test(input) || /"tm":\{/i.test(input);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

export const extractMetadata = (animation: RawLottieAnimation): LottieMetadata => {
  const frameRate = animation.fr ?? DEFAULT_METADATA.frameRate;
  const inPoint = animation.ip ?? DEFAULT_METADATA.inPoint;
  const outPoint = animation.op ?? DEFAULT_METADATA.outPoint;
  const durationInFrames = Math.max(0, outPoint - inPoint);

  return {
    name: animation.nm ?? DEFAULT_METADATA.name,
    frameRate,
    inPoint,
    outPoint,
    durationInFrames,
    durationInSeconds: frameRate > 0 ? durationInFrames / frameRate : 0,
    width: animation.w ?? DEFAULT_METADATA.width,
    height: animation.h ?? DEFAULT_METADATA.height,
    layerCount: animation.layers?.length ?? 0,
    assetCount: animation.assets?.length ?? 0,
    markerCount: animation.markers?.length ?? 0,
    version: animation.v ?? DEFAULT_METADATA.version,
  };
};

const checkMissingAssets = (animation: RawLottieAnimation): string[] => {
  if (!animation.layers?.length || !animation.assets?.length) {
    return [];
  }

  const assetIds = new Set(
    animation.assets
      .map((asset) => asset.id)
      .filter((id): id is string => Boolean(id))
  );

  const missing: string[] = [];
  animation.layers.forEach((layer) => {
    if (layer.refId && !assetIds.has(layer.refId)) {
      missing.push(layer.refId);
    }
  });
  return Array.from(new Set(missing));
};

const parseVersionNumber = (version?: string) => {
  if (!version) {
    return null;
  }
  const [major, minor] = version.split(".").map((part) => Number.parseInt(part, 10));
  if (Number.isNaN(major)) {
    return null;
  }
  return {major, minor: Number.isNaN(minor) ? 0 : minor};
};

export const validateLottie = (
  animation: RawLottieAnimation,
  serialized?: string
): LottieValidationResult => {
  const metadata = extractMetadata(animation);
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!animation.assets || animation.assets.length === 0) {
    warnings.push("No assets array found (pure vector animation).");
  }

  if (!animation.layers || animation.layers.length === 0) {
    errors.push("Animation does not contain any layers.");
  }

  if (!animation.fr || animation.fr <= 0) {
    errors.push("Frame rate (fr) missing or invalid.");
  } else if (animation.fr > 60) {
    warnings.push(`High frame rate detected (${animation.fr} fps).`);
  }

  if (metadata.durationInSeconds > 20) {
    warnings.push(`Duration longer than recommended (>${metadata.durationInSeconds.toFixed(2)}s).`);
  } else if (metadata.durationInSeconds === 0) {
    errors.push("Duration evaluates to 0 seconds.");
  }

  const missedAssets = checkMissingAssets(animation);
  if (missedAssets.length) {
    errors.push(`Missing referenced assets: ${missedAssets.join(", ")}`);
  }

  const version = parseVersionNumber(animation.v);
  if (version && version.major < 5) {
    warnings.push(`Lottie version ${animation.v} detected – consider re-exporting with v5+.`);
  }

  if (!serialized) {
    try {
      serialized = JSON.stringify(animation);
    } catch {
      // ignore serialization errors here
    }
  }

  if (serialized && hasExpressions(serialized)) {
    errors.push("Expressions detected – Remotion cannot evaluate AE expressions.");
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    metadata,
  };
};

export type LottieRegistryEntry = {
  key: string;
  name: string;
  category: string;
  sourcePath: string;
  publicPath: string;
  frameRate: number;
  durationInFrames: number;
  durationInSeconds: number;
  width: number;
  height: number;
  version: string;
  layerCount: number;
  assetCount: number;
  markerCount: number;
  valid: boolean;
  warnings: string[];
  errors: string[];
  tags: string[];
  updatedAt: string;
};

export type LottieRegistry = Record<string, LottieRegistryEntry>;

export const createRegistryEntry = ({
  key,
  category,
  tags = [],
  sourcePath,
  publicPath,
  validation,
}: {
  key: string;
  category: string;
  tags?: string[];
  sourcePath: string;
  publicPath: string;
  validation: LottieValidationResult;
}): LottieRegistryEntry => {
  const {metadata, warnings, errors, valid} = validation;
  return {
    key,
    name: metadata.name || slugify(key),
    category,
    sourcePath,
    publicPath,
    frameRate: metadata.frameRate,
    durationInFrames: metadata.durationInFrames,
    durationInSeconds: metadata.durationInSeconds,
    width: metadata.width,
    height: metadata.height,
    version: metadata.version,
    layerCount: metadata.layerCount,
    assetCount: metadata.assetCount,
    markerCount: metadata.markerCount,
    valid,
    warnings,
    errors,
    tags,
    updatedAt: new Date().toISOString(),
  };
};


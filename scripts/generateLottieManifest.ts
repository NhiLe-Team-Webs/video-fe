import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import type {LottieRegistry, LottieRegistryEntry} from "./validateLottie";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MANIFEST_PATH = path.resolve(__dirname, "../src/effects/registry/manifest.json");
const REGISTRY_PATH = path.resolve(__dirname, "../src/effects/registry/lottieRegistry.json");

type ManifestShape = {
  gsap: Array<Record<string, unknown>>;
  lottie: Array<{
    id: string;
    path: string;
    tags?: string[];
    type?: string;
    emotions?: string[];
    durationInFrames?: number;
    frameRate?: number;
  }>;
};

const buildManifestEntries = (registry: LottieRegistry) => {
  const entries: ManifestShape["lottie"] = [];
  Object.values(registry).forEach((entry: LottieRegistryEntry) => {
    if (!entry.valid) {
      return;
    }
    entries.push({
      id: entry.id,
      path: entry.publicPath,
      tags: entry.tags,
      type: entry.category,
      emotions: entry.tags,
      durationInFrames: entry.durationInFrames,
      frameRate: entry.frameRate,
    });
  });
  return entries.sort((a, b) => a.id.localeCompare(b.id));
};

const generateManifest = async () => {
  const [manifestRaw, registryRaw] = await Promise.all([
    fs.readFile(MANIFEST_PATH, "utf-8"),
    fs.readFile(REGISTRY_PATH, "utf-8"),
  ]);

  const manifest = JSON.parse(manifestRaw) as ManifestShape;
  const registry = JSON.parse(registryRaw) as LottieRegistry;

  manifest.lottie = buildManifestEntries(registry);

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`✅ Updated manifest with ${manifest.lottie.length} Lottie entries.`);
};

if (process.argv[1] === __filename) {
  generateManifest().catch((error) => {
    console.error("Lottie manifest generation failed:", error);
    process.exit(1);
  });
}

export {generateManifest};


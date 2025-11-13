import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {
  createRegistryEntry,
  LottieRegistry,
  RawLottieAnimation,
  validateLottie,
} from "./validateLottie";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOTTIE_ROOT = path.resolve(__dirname, "../public/assets/library/animations/lottie");
const REGISTRY_PATH = path.resolve(__dirname, "../src/effects/registry/lottieRegistry.json");

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const collectJsonFiles = async (dir: string): Promise<string[]> => {
  const entries = await fs.readdir(dir, {withFileTypes: true});
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return collectJsonFiles(fullPath);
      }
      if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
        return [fullPath];
      }
      return [];
    })
  );
  return files.flat();
};

const buildRegistry = async () => {
  const files = await collectJsonFiles(LOTTIE_ROOT);
  if (files.length === 0) {
    console.warn("⚠️  No Lottie JSON files found. Registry will be empty.");
  }

  const registryEntries: [string, ReturnType<typeof createRegistryEntry> & {id: string}][] = [];

  for (const filePath of files) {
    const relativeToRoot = path.relative(LOTTIE_ROOT, filePath);
    const segments = relativeToRoot.split(path.sep).filter(Boolean);
    const category = (segments.length > 1 ? segments[0] : "overlay") || "overlay";
    const fileName = path.basename(filePath, path.extname(filePath));
    const slug = slugify(fileName);
    const key = `${category}.${slug}`;
    const publicPath = path.posix.join(
      "assets/library/animations/lottie",
      relativeToRoot.split(path.sep).join(path.posix.sep)
    );
    const sourcePath = path
      .relative(process.cwd(), filePath)
      .split(path.sep)
      .join(path.posix.sep);

    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(raw) as RawLottieAnimation;
      const validation = validateLottie(data, raw);
      const entry = createRegistryEntry({
        key,
        category,
        tags: [category, slug],
        sourcePath,
        publicPath,
        validation,
      });
      registryEntries.push([key, {...entry, id: slug}]);
    } catch (error) {
      console.error(`❌ Failed to process ${relativeToRoot}`, error);
    }
  }

  const sorted = registryEntries.sort(([a], [b]) => a.localeCompare(b));
  const registry: LottieRegistry = {};
  for (const [key, entry] of sorted) {
    registry[key] = entry;
  }
  await fs.writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2));
  console.log(`✅ Updated lottie registry with ${sorted.length} entries.`);
};

if (process.argv[1] === __filename) {
  buildRegistry().catch((error) => {
    console.error("Lottie intake failed:", error);
    process.exit(1);
  });
}

export {buildRegistry as intakeLottie};

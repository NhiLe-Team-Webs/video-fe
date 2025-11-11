import fs from "fs/promises";
import path from "path";

type ManifestEntry = {
  id: string;
  path: string;
};

type ManifestShape = {
  animations: ManifestEntry[];
  audio: ManifestEntry[];
  text: ManifestEntry[];
  components: ManifestEntry[];
};

const LIBRARY_ROOT = path.resolve(__dirname, "../src/library");
const OUTPUT_PATH = path.join(LIBRARY_ROOT, "manifest.json");

const CATEGORY_CONFIG = [
  {
    key: "animations",
    dir: "animations",
    extensions: [".tsx", ".ts", ".json"],
  },
  {
    key: "audio",
    dir: "audio",
    extensions: [".mp3", ".wav", ".aac", ".m4a"],
  },
  {
    key: "text",
    dir: "text",
    extensions: [".json", ".ts", ".tsx"],
  },
  {
    key: "components",
    dir: "components",
    extensions: [".tsx", ".ts"],
  },
] as const;

const normalizePath = (absolutePath: string) => {
  const relative = path.relative(path.join(LIBRARY_ROOT), absolutePath);
  return path.posix.join("library", relative.split(path.sep).join(path.posix.sep));
};

const collectFiles = async (dir: string, extensions: string[]): Promise<string[]> => {
  const files: string[] = [];

  const walk = async (currentDir: string) => {
    let entries: fs.Dirent[];
    try {
      entries = await fs.readdir(currentDir, {withFileTypes: true});
    } catch {
      return;
    }

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
        continue;
      }

      const ext = path.extname(entry.name).toLowerCase();
      if (extensions.includes(ext)) {
        files.push(entryPath);
      }
    }
  };

  await walk(dir);
  return files;
};

const toManifestEntries = (files: string[]): ManifestEntry[] => {
  return files.map((filePath) => {
    const id = path.basename(filePath, path.extname(filePath));
    return {
      id,
      path: normalizePath(filePath),
    };
  });
};

const writeManifest = async (manifest: ManifestShape) => {
  const json = JSON.stringify(manifest, null, 2);
  await fs.writeFile(OUTPUT_PATH, `${json}\n`, "utf-8");
};

const main = async () => {
  const manifest: ManifestShape = {
    animations: [],
    audio: [],
    text: [],
    components: [],
  };

  for (const category of CATEGORY_CONFIG) {
    const categoryRoot = path.join(LIBRARY_ROOT, category.dir);
    const files = await collectFiles(categoryRoot, category.extensions);
    (manifest as Record<string, ManifestEntry[]>)[category.key] = toManifestEntries(files);
  }

  await writeManifest(manifest);

  const stats = Object.entries(manifest).map(([key, entries]) => `${key}: ${entries.length}`).join(" | ");
  console.log(`✅ Manifest updated -> ${stats}`);
};

main().catch((error) => {
  console.error("Manifest generation failed:", error);
  process.exit(1);
});

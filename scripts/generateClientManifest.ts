import {promises as fs} from "node:fs";
import path from "node:path";

import packageJson from "../package.json";
import effects from "../src/effects/registry/effects.json";
import lottieRegistry from "../src/effects/registry/lottieRegistry.json";
import animationManifest from "../src/effects/registry/manifest.json";
import {templateManifest} from "../src/core/utils/manifest";
import {effectTaxonomy} from "../src/effects/taxonomy/effectTaxonomy";
import {EffectCategory} from "../src/effects/taxonomy/effectCategories";
import {listRegisteredTransitions, DEFAULT_TRANSITION_ID} from "../src/transitions/transitionRegistry";

const CLIENT_MANIFEST_PATH = path.resolve(__dirname, "../src/data/clientManifest.json");
const PUBLIC_ASSETS_PATH = path.resolve(__dirname, "../public/assets");

type AssetEntry = {
  name: string;
  path: string;
  size: number;
};

type ClientManifest = {
  version: string;
  timestamp: string;
  templates: typeof templateManifest;
  effects: typeof effects;
  lottie: typeof lottieRegistry;
  animations: typeof animationManifest;
  transitions: ReturnType<typeof listRegisteredTransitions>;
  taxonomy: {
    categories: typeof EffectCategory;
    effectTaxonomy: typeof effectTaxonomy;
  };
  defaults: {
    templateId: string;
    transitionId: string;
    animationId: string;
  };
  assets: {
    broll: AssetEntry[];
    sfx: Record<string, AssetEntry[]>;
  };
};

const readAssetFiles = async (dir: string): Promise<AssetEntry[]> => {
  const entries = await fs.readdir(dir, {withFileTypes: true});
  const files = entries.filter((entry) => entry.isFile());
  return Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dir, file.name);
      const stats = await fs.stat(filePath);
      return {
        name: file.name,
        path: path.relative(path.resolve(__dirname, "../public"), filePath).replace(/\\/g, "/"),
        size: stats.size,
      };
    })
  );
};

const collectBroll = async (): Promise<AssetEntry[]> => {
  const brollDir = path.join(PUBLIC_ASSETS_PATH, "broll");
  return readAssetFiles(brollDir);
};

const collectSfx = async (): Promise<Record<string, AssetEntry[]>> => {
  const sfxDir = path.join(PUBLIC_ASSETS_PATH, "sfx");
  const categories = await fs.readdir(sfxDir, {withFileTypes: true});
  const payload: Record<string, AssetEntry[]> = {};

  await Promise.all(
    categories
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const files = await readAssetFiles(path.join(sfxDir, entry.name));
        payload[entry.name] = files;
      })
  );

  return payload;
};

const buildManifest = async (): Promise<ClientManifest> => ({
  version: packageJson.version ?? "0.0.0",
  timestamp: new Date().toISOString(),
  templates: templateManifest,
  effects,
  lottie: lottieRegistry,
  animations: animationManifest,
  transitions: listRegisteredTransitions(),
  taxonomy: {
    categories: EffectCategory,
    effectTaxonomy,
  },
  defaults: {
    templateId: templateManifest[0]?.id ?? "template0",
    transitionId: DEFAULT_TRANSITION_ID,
    animationId: animationManifest.gsap?.[0]?.id ?? "gsap-fade-in",
  },
  assets: {
    broll: await collectBroll(),
    sfx: await collectSfx(),
  },
});

const main = async () => {
  const manifest = await buildManifest();
  const json = JSON.stringify(manifest, null, 2);
  await fs.writeFile(CLIENT_MANIFEST_PATH, `${json}\n`, "utf-8");
  console.log(
    `✅ Client manifest written (${manifest.templates.length} templates, ${Object.keys(manifest.effects).length} effects).`
  );
};

main().catch((error) => {
  console.error("Client manifest generation failed:", error);
  process.exit(1);
});

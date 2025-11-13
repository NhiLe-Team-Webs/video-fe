import {promises as fs} from "node:fs";
import path from "node:path";

type GsapEntry = {
  id: string;
  component: string;
  tags?: string[];
  type?: string;
  emotions?: string[];
};

type LottieEntry = {
  id: string;
  path: string;
  tags?: string[];
  type?: string;
  emotions?: string[];
};

type ManifestShape = {
  gsap: GsapEntry[];
  lottie: LottieEntry[];
};

const RESOLVE = (relativePath: string) => path.resolve(__dirname, relativePath);
const MANIFEST_PATH = RESOLVE("../src/effects/registry/manifest.json");

const readManifest = async (): Promise<ManifestShape> => {
  const raw = await fs.readFile(MANIFEST_PATH, "utf-8");
  return JSON.parse(raw) as ManifestShape;
};

const sortEntries = <T extends {id: string}>(entries: T[]) =>
  [...entries].sort((a, b) => a.id.localeCompare(b.id));

const writeManifest = async (manifest: ManifestShape) => {
  const json = JSON.stringify(manifest, null, 2);
  await fs.writeFile(MANIFEST_PATH, `${json}\n`, "utf-8");
};

const main = async () => {
  const manifest = await readManifest();
  const sortedManifest: ManifestShape = {
    gsap: sortEntries(manifest.gsap ?? []),
    lottie: sortEntries(manifest.lottie ?? []),
  };

  await writeManifest(sortedManifest);
  console.log(
    `✅ Manifest normalized -> gsap: ${sortedManifest.gsap.length} | lottie: ${sortedManifest.lottie.length}`
  );
};

main().catch((error) => {
  console.error("Manifest normalization failed:", error);
  process.exit(1);
});

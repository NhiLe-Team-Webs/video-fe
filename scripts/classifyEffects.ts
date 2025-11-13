import {writeFileSync} from "node:fs";
import path from "node:path";
import effectsJson from "../src/effects/registry/effects.json";
import {effectTaxonomy} from "../src/effects/taxonomy/effectTaxonomy";
import {effectComponentMap} from "../src/effects/components";
import {EffectKey, EffectRegistryRecord} from "../src/types/EffectTypes";

const registryPath = path.resolve(__dirname, "../src/effects/registry/effects.json");
const registry = effectsJson as Record<EffectKey, EffectRegistryRecord>;

const taxonomyEntries = Object.values(effectTaxonomy).flat();
const taxonomyByKey = new Map<EffectKey, (typeof taxonomyEntries)[number]>(
  taxonomyEntries.map((entry) => [entry.key as EffectKey, entry])
);

const componentKeys = Object.keys(effectComponentMap) as EffectKey[];
const registryKeys = Object.keys(registry) as EffectKey[];
const taxonomyKeys = taxonomyEntries.map((entry) => entry.key as EffectKey);

const missingMetadata = componentKeys.filter((key) => !registry[key]);
const missingComponents = taxonomyKeys.filter((key) => !componentKeys.includes(key));
const orphanRegistry = registryKeys.filter((key) => !componentKeys.includes(key));

const args = process.argv.slice(2);
const shouldWrite = args.includes("--write");

const createStubEntry = (key: EffectKey): EffectRegistryRecord => {
  const taxonomy = taxonomyByKey.get(key);
  const [category] = key.split(".") as [EffectRegistryRecord["category"], string];

  return {
    key,
    name: taxonomy?.label ?? key,
    category,
    description: taxonomy?.description ?? "",
    tags: taxonomy?.intents ?? [],
    mood: [],
    duration: taxonomy?.defaultDuration ?? 1,
    preview: "",
    props: [],
    recommendedLayer: "foreground",
    componentPath: "",
    version: "0.0.0",
  };
};

if (shouldWrite && missingMetadata.length > 0) {
  const updatedRegistry = {...registry};
  missingMetadata.forEach((key) => {
    updatedRegistry[key] = createStubEntry(key);
  });

  const orderedKeys = Object.keys(updatedRegistry).sort() as EffectKey[];
  const orderedObject: Record<EffectKey, EffectRegistryRecord> = orderedKeys.reduce(
    (acc, key) => {
      acc[key] = updatedRegistry[key];
      return acc;
    },
    {} as Record<EffectKey, EffectRegistryRecord>
  );

  writeFileSync(registryPath, JSON.stringify(orderedObject, null, 2));
  console.log(`✅ Added ${missingMetadata.length} stub metadata entries.`);
}

const logList = (label: string, list: EffectKey[]) => {
  if (list.length === 0) {
    console.log(`- ${label}: none`);
    return;
  }
  console.log(`- ${label} (${list.length}):`);
  list.forEach((key) => console.log(`   • ${key}`));
};

console.log("🔎 Effect classification report");
logList("Missing metadata", missingMetadata);
logList("Missing components", missingComponents);
logList("Orphan registry entries", orphanRegistry);

if (!shouldWrite) {
  console.log('\nPass "--write" to add stub metadata for missing keys.');
}

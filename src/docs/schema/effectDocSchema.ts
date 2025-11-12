import {EffectMetadata} from "../../types/EffectTypes";

export type EffectDocSchema = EffectMetadata & {
  version: string;
  componentPath?: string;
  status?: "draft" | "reviewed" | "deprecated";
};

export const effectDocFields: Array<keyof EffectDocSchema> = [
  "key",
  "name",
  "category",
  "description",
  "tags",
  "mood",
  "duration",
  "preview",
  "props",
  "recommendedLayer",
  "version",
  "componentPath",
  "status",
];


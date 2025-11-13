import {ComponentType} from "react";
import {EffectCategory} from "../effects/taxonomy/effectCategories";

export type EffectKey = `${EffectCategory}.${string}`;

export type EffectPropPrimitive =
  | "string"
  | "number"
  | "color"
  | "boolean"
  | "richtext"
  | "image"
  | "video";

export interface EffectPropDescriptor {
  name: string;
  type: EffectPropPrimitive;
  required?: boolean;
  description?: string;
  defaultValue?: unknown;
}

export interface EffectMetadata {
  key: EffectKey;
  name: string;
  category: EffectCategory;
  description?: string;
  tags: string[];
  mood?: string[];
  duration: number;
  preview?: string;
  props: EffectPropDescriptor[];
  recommendedLayer?: "base" | "overlay" | "foreground";
}

export interface EffectTaxonomyEntry {
  key: EffectKey;
  label: string;
  description: string;
  category: EffectCategory;
  intents: string[];
  defaultDuration?: number;
}

export interface EffectRegistryRecord extends EffectMetadata {
  version: string;
  componentPath?: string;
}

export type EffectComponent = ComponentType<Record<string, unknown>>;

export interface EffectResolution {
  key: EffectKey;
  metadata: EffectRegistryRecord;
  Component: EffectComponent;
}

export type EffectComponentMap = Partial<Record<EffectKey, EffectComponent>>;

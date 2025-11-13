import React, {useMemo} from "react";
import {effectComponentMap} from "../components";
import {effectTaxonomy, isEffectKey} from "../taxonomy/effectTaxonomy";
import effectsData from "../registry/effects.json";
import lottieRegistry from "../registry/lottieRegistry.json";
import {LottieEffect} from "../engines/lottie/LottieEffect";
import {EffectCategory} from "../taxonomy/effectCategories";
import {EffectKey, EffectRegistryRecord, EffectResolution} from "../../types/EffectTypes";

type EffectsJsonShape = Record<string, EffectRegistryRecord>;

const registry = effectsData as EffectsJsonShape;

const validateEffect = (key: EffectKey) => {
  const metadata = registry[key];
  const Component = effectComponentMap[key];
  if (metadata && Component) {
    return {metadata, Component} as const;
  }
  const lottieEntry = (lottieRegistry as Record<string, (typeof lottieRegistry)[string]>)[key];
  if (lottieEntry) {
    const fallbackCategory =
      (Object.values(EffectCategory) as string[]).includes(lottieEntry.category)
        ? (lottieEntry.category as EffectCategory)
        : EffectCategory.Overlay;
    const lottieMetadata: EffectRegistryRecord = {
      key,
      name: lottieEntry.name,
      category: fallbackCategory,
      description: `Lottie animation for ${lottieEntry.name}`,
      tags: lottieEntry.tags ?? [],
      mood: [],
      duration: lottieEntry.durationInSeconds,
      preview: lottieEntry.publicPath,
      props: [],
      recommendedLayer: fallbackCategory === EffectCategory.Overlay ? "overlay" : "foreground",
      version: lottieEntry.version,
      componentPath: "src/effects/engines/lottie/LottieEffect",
    };
    const LottieComponent: React.FC = () => (
      <LottieEffect src={lottieEntry.publicPath} loop style={{width: lottieEntry.width, height: lottieEntry.height}} />
    );
    return {metadata: lottieMetadata, Component: LottieComponent} as const;
  }
  return null;
};

export const getEffectMetadata = (key: EffectKey): EffectRegistryRecord | null =>
  registry[key] ?? null;

export type UseEffectByKeyOptions = {
  fallbackKey?: EffectKey;
};

export const useEffectByKey = (
  key: string | EffectKey | null | undefined,
  options?: UseEffectByKeyOptions
): EffectResolution | null => {
  return useMemo(() => {
    const normalizedKey = isEffectKey(key ?? "") ? (key as EffectKey) : options?.fallbackKey;
    if (!normalizedKey) {
      return null;
    }

    const validated = validateEffect(normalizedKey);
    if (!validated) {
      return null;
    }

    return {
      key: normalizedKey,
      metadata: validated.metadata,
      Component: validated.Component,
    };
  }, [key, options?.fallbackKey]);
};

export const listEffectKeys = (): EffectKey[] => {
  const taxonomyKeys = Object.keys(effectTaxonomy).flatMap((category) =>
    effectTaxonomy[category as keyof typeof effectTaxonomy].map((item) => item.key)
  ) as EffectKey[];
  const lottieKeys = Object.keys(lottieRegistry) as EffectKey[];
  return Array.from(new Set([...taxonomyKeys, ...lottieKeys]));
};

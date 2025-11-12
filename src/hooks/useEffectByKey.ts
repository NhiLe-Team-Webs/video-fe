import {useMemo} from "react";
import {effectComponentMap} from "../components/effects";
import {effectTaxonomy, isEffectKey} from "../constants/effectTaxonomy";
import effectsData from "../data/effects.json";
import {EffectKey, EffectRegistryRecord, EffectResolution} from "../types/EffectTypes";

type EffectsJsonShape = Record<string, EffectRegistryRecord>;

const registry = effectsData as EffectsJsonShape;

const validateEffect = (key: EffectKey) => {
  const metadata = registry[key];
  const Component = effectComponentMap[key];
  if (!metadata || !Component) {
    return null;
  }

  return {metadata, Component} as const;
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

export const listEffectKeys = (): EffectKey[] =>
  Object.keys(effectTaxonomy).flatMap((category) =>
    effectTaxonomy[category as keyof typeof effectTaxonomy].map((item) => item.key)
  ) as EffectKey[];

import {useMemo} from "react";
import lottieRegistry from "../registry/lottieRegistry.json";
import {LottieEffect} from "../engines/lottie/LottieEffect";
import {EffectCategory} from "../taxonomy/effectCategories";

type LottieRegistryShape = typeof lottieRegistry;
type LottieEntry = LottieRegistryShape[keyof LottieRegistryShape];

export type LottieResolution =
  | {
      key: string;
      entry: LottieEntry;
      Component: React.FC;
    }
  | null;

export const listLottieKeys = () => Object.keys(lottieRegistry);

export const useLottieByKey = (key: string | null | undefined): LottieResolution => {
  return useMemo(() => {
    if (!key) {
      return null;
    }
    const entry = (lottieRegistry as LottieRegistryShape)[key];
    if (!entry) {
      return null;
    }
    const Component: React.FC = () => (
      <LottieEffect src={entry.publicPath} loop style={{width: entry.width, height: entry.height}} />
    );
    return {key, entry, Component};
  }, [key]);
};

export const isLottieCategory = (category: string) =>
  [
    EffectCategory.Overlay,
    EffectCategory.Background,
    EffectCategory.Motion,
    EffectCategory.Text,
    EffectCategory.Transition,
  ].includes(category as EffectCategory);


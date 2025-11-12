import {EffectComponentMap} from "../../types/EffectTypes";
import {textEffectComponents} from "./text";
import {motionEffectComponents} from "./motion";
import {chartEffectComponents} from "./chart";
import {backgroundEffectComponents} from "./background";
import {overlayEffectComponents} from "./overlay";

export * from "./text";
export * from "./motion";
export * from "./chart";
export * from "./background";
export * from "./overlay";

export const effectComponentMap: EffectComponentMap = {
  ...textEffectComponents,
  ...motionEffectComponents,
  ...chartEffectComponents,
  ...backgroundEffectComponents,
  ...overlayEffectComponents,
};


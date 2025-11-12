import {EffectComponentMap} from "../../../types/EffectTypes";
import {ZoomFocus} from "./ZoomFocus";
import {SlidePan} from "./SlidePan";

export {ZoomFocus, SlidePan};

export const motionEffectComponents: EffectComponentMap = {
  "motion.zoomFocus": ZoomFocus,
  "motion.slidePan": SlidePan,
};


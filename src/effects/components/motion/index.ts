import {EffectComponentMap} from "../../../types/EffectTypes";
import {ZoomFocus} from "./ZoomFocus";
import {SlidePan} from "./SlidePan";
import {FadeIn} from "./FadeIn";
import {SlideUp} from "./SlideUp";
import {ZoomIn} from "./ZoomIn";

export {ZoomFocus, SlidePan, FadeIn, SlideUp, ZoomIn};

export const motionEffectComponents: EffectComponentMap = {
  "motion.zoomFocus": ZoomFocus,
  "motion.slidePan": SlidePan,
  "motion.fadeIn": FadeIn,
  "motion.slideUp": SlideUp,
  "motion.zoomIn": ZoomIn,
};

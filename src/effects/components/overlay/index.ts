import {EffectComponentMap} from "../../../types/EffectTypes";
import {LowerThird} from "./LowerThird";
import {BadgePulse} from "./BadgePulse";
import {SectionTitleOverlay} from "./SectionTitleOverlay";

export {LowerThird, BadgePulse, SectionTitleOverlay};

export const overlayEffectComponents: EffectComponentMap = {
  "overlay.lowerThird": LowerThird,
  "overlay.badgePulse": BadgePulse,
  "overlay.sectionTitle": SectionTitleOverlay,
};


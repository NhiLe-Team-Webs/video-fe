import {EffectComponentMap} from "../../../types/EffectTypes";
import {LowerThird} from "./LowerThird";
import {BadgePulse} from "./BadgePulse";
import {SectionTitleOverlay} from "./SectionTitleOverlay";
import {IconHighlight} from "./IconHighlight";

export {LowerThird, BadgePulse, SectionTitleOverlay, IconHighlight};

export const overlayEffectComponents: EffectComponentMap = {
  "overlay.lowerThird": LowerThird,
  "overlay.badgePulse": BadgePulse,
  "overlay.sectionTitle": SectionTitleOverlay,
  "overlay.iconHighlight": IconHighlight,
};


import {EffectComponentMap} from "../../../types/EffectTypes";
import {LowerThird} from "./LowerThird";
import {BadgePulse} from "./BadgePulse";
import {SectionTitleOverlay} from "./SectionTitleOverlay";
import {IconHighlight} from "./IconHighlight";
import {SocialIconPop} from "./SocialIconPop";
import {AppIntroLowerThird} from "./AppIntroLowerThird";

export {LowerThird, BadgePulse, SectionTitleOverlay, IconHighlight, SocialIconPop};

export const overlayEffectComponents: EffectComponentMap = {
  "overlay.lowerThird": LowerThird,
  "overlay.badgePulse": BadgePulse,
  "overlay.sectionTitle": SectionTitleOverlay,
  "overlay.iconHighlight": IconHighlight,
  "overlay.socialIconPop": SocialIconPop,
  "overlay.appIntro": AppIntroLowerThird,
};


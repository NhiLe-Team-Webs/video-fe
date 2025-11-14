import {EffectComponentMap} from "../../../types/EffectTypes";
import {LowerThird} from "./LowerThird";
import {BadgePulse} from "./BadgePulse";
import {SectionTitleOverlay} from "./SectionTitleOverlay";
import {IconHighlight} from "./IconHighlight";
import {SocialIconPop} from "./SocialIconPop";
import {AppIntroLowerThird} from "./AppIntroLowerThird";
import {AudioVisualizer} from "./AudioVisualizer";
import {AnimatedEmojiBurst} from "./AnimatedEmojiBurst";

export {LowerThird, BadgePulse, SectionTitleOverlay, IconHighlight, SocialIconPop, AppIntroLowerThird, AudioVisualizer, AnimatedEmojiBurst};

export const overlayEffectComponents: EffectComponentMap = {
  "overlay.lowerThird": LowerThird,
  "overlay.badgePulse": BadgePulse,
  "overlay.sectionTitle": SectionTitleOverlay,
  "overlay.iconHighlight": IconHighlight,
  "overlay.socialIconPop": SocialIconPop,
  "overlay.appIntro": AppIntroLowerThird,
  "overlay.audioVisualizer": AudioVisualizer,
  "overlay.emojiBurst": AnimatedEmojiBurst,
};


import {EffectComponentMap} from "../../../types/EffectTypes";
import {PopUpTitle} from "./PopUpTitle";
import {TypeOnCaption} from "./TypeOnCaption";
import {SwipeHighlight} from "./SwipeHighlight";

export {PopUpTitle, TypeOnCaption, SwipeHighlight};

export const textEffectComponents: EffectComponentMap = {
  "text.popUp": PopUpTitle,
  "text.typeOn": TypeOnCaption,
  "text.swipeHighlight": SwipeHighlight,
};


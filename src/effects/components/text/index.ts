import {EffectComponentMap} from "../../../types/EffectTypes";
import {PopUpTitle} from "./PopUpTitle";
import {TypeOnCaption} from "./TypeOnCaption";
import {SwipeHighlight} from "./SwipeHighlight";
import {PopUp3DText} from "./PopUp3DText";

export {PopUpTitle, TypeOnCaption, SwipeHighlight, PopUp3DText};

export const textEffectComponents: EffectComponentMap = {
  "text.popUp": PopUpTitle,
  "text.typeOn": TypeOnCaption,
  "text.swipeHighlight": SwipeHighlight,
  "text.popUp3D": PopUp3DText,
};


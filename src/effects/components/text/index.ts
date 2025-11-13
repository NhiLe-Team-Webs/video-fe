import {EffectComponentMap} from "../../../types/EffectTypes";
import {PopUpTitle} from "./PopUpTitle";
import {TypeOnCaption} from "./TypeOnCaption";
import {SwipeHighlight} from "./SwipeHighlight";
import {PopUp3DText} from "./PopUp3DText";
import {SideFloatText, SideFloatLeftText, SideFloatRightText} from "./SideFloatText";
import {SequentialListReveal} from "./SequentialListReveal";

export {
  PopUpTitle,
  TypeOnCaption,
  SwipeHighlight,
  PopUp3DText,
  SideFloatText,
  SideFloatLeftText,
  SideFloatRightText,
  SequentialListReveal,
};

export const textEffectComponents: EffectComponentMap = {
  "text.popUp": PopUpTitle,
  "text.typeOn": TypeOnCaption,
  "text.swipeHighlight": SwipeHighlight,
  "text.popUp3D": PopUp3DText,
  "text.sideFloat": SideFloatText,
  "text.sideFloatLeft": SideFloatLeftText,
  "text.sideFloatRight": SideFloatRightText,
  "text.sequentialList": SequentialListReveal,
};


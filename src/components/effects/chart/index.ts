import {EffectComponentMap} from "../../../types/EffectTypes";
import {StatCard} from "./StatCard";
import {TimelineReveal} from "./TimelineReveal";

export {StatCard, TimelineReveal};

export const chartEffectComponents: EffectComponentMap = {
  "chart.statCard": StatCard,
  "chart.timelineReveal": TimelineReveal,
};


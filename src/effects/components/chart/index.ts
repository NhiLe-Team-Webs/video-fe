import {EffectComponentMap} from "../../../types/EffectTypes";
import {StatCard} from "./StatCard";
import {TimelineReveal} from "./TimelineReveal";
import {DataVisualizationReveal} from "./DataVisualizationReveal";

export {StatCard, TimelineReveal, DataVisualizationReveal};

export const chartEffectComponents: EffectComponentMap = {
  "chart.statCard": StatCard,
  "chart.timelineReveal": TimelineReveal,
  "chart.dataReveal": DataVisualizationReveal,
};


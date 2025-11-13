import {EffectComponentMap} from "../../../types/EffectTypes";
import {StatCard} from "./StatCard";
import {TimelineReveal} from "./TimelineReveal";
import {DataVisualizationReveal} from "./DataVisualizationReveal";
import {BranchTreeExpansion} from "./BranchTreeExpansion";

export {StatCard, TimelineReveal, DataVisualizationReveal, BranchTreeExpansion};

export const chartEffectComponents: EffectComponentMap = {
  "chart.statCard": StatCard,
  "chart.timelineReveal": TimelineReveal,
  "chart.dataReveal": DataVisualizationReveal,
  "chart.branchTree": BranchTreeExpansion,
};


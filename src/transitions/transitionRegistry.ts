import type {TransitionDefinition} from "./transitionTypes";
import {DEFAULT_TRANSITION_ID} from "./transitionTypes";
import {essentialTransitions} from "./packs/essentials";
import {slideTransitions} from "./packs/slides";
import {dynamicTransitions} from "./packs/dynamic";
import {stylizedTransitions} from "./packs/stylized";

const transitionList: TransitionDefinition[] = [
  ...essentialTransitions,
  ...slideTransitions,
  ...dynamicTransitions,
  ...stylizedTransitions,
];

const transitionRegistry = transitionList.reduce<Record<string, TransitionDefinition>>((acc, transition) => {
  acc[transition.id] = transition;
  return acc;
}, {});

export const listRegisteredTransitions = () => transitionList;

export const getTransitionById = (id?: string | null): TransitionDefinition | null => {
  if (!id) {
    return null;
  }

  return transitionRegistry[id] ?? null;
};

export {DEFAULT_TRANSITION_ID};
export type {TransitionDefinition};

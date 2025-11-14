import {getTransitionById, listRegisteredTransitions} from "./transitionRegistry";
import type {TransitionDefinition} from "./transitionRegistry";

export const resolveTransitionById = (id?: string | null): TransitionDefinition | null => {
  if (!id) {
    return null;
  }

  return getTransitionById(id);
};

export {DEFAULT_TRANSITION_ID} from "./transitionTypes";
export {listRegisteredTransitions};
export type {TransitionDefinition};

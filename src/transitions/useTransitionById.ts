import {DEFAULT_TRANSITION_ID, getTransitionById, listRegisteredTransitions} from "./transitionRegistry";
import type {TransitionDefinition} from "./transitionRegistry";

export const useTransitionById = (id?: string | null): TransitionDefinition | null => {
  if (!id) {
    return null;
  }

  return getTransitionById(id);
};

export {DEFAULT_TRANSITION_ID, listRegisteredTransitions};
export type {TransitionDefinition};

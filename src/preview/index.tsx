import React from "react";
import {CompositionBuilder} from "../core/CompositionBuilder";
import {loadPlan} from "../core/loadPlan";
import type {LoadedPlan} from "../core/types";

const plan: LoadedPlan = loadPlan();

export const Preview: React.FC = () => {
  return <CompositionBuilder plan={plan} />;
};

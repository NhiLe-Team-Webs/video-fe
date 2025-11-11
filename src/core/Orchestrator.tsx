import React from "react";
import {CompositionBuilder} from "./CompositionBuilder";
import type {LoadedPlan} from "./types";

type OrchestratorProps = {
  plan: LoadedPlan;
};

export const Orchestrator: React.FC<OrchestratorProps> = ({plan}) => {
  return <CompositionBuilder plan={plan} />;
};

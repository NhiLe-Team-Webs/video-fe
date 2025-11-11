import React from "react";
import {loadPlan} from "./loadPlan";
import type {LoadedPlan} from "./types";
import {logPlan} from "./utils/logger";
import {getTemplateById} from "./TemplateEngine";

type OrchestratorProps = {
  plan?: LoadedPlan;
};

export const Orchestrator: React.FC<OrchestratorProps> = ({plan}) => {
  const resolvedPlan = plan ?? loadPlan();
  logPlan({template: resolvedPlan.templateId, segments: resolvedPlan.segments.length});

  const TemplateComponent = getTemplateById(resolvedPlan.templateId);

  return <TemplateComponent plan={resolvedPlan} />;
};

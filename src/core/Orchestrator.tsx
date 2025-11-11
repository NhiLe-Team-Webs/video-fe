import React from "react";
import {loadPlan} from "./loadPlan";
import type {LoadedPlan} from "./types";
import {Template0} from "../templates/template0/composition";
import {logPlan} from "./utils/logger";

type OrchestratorProps = {
  plan?: LoadedPlan;
};

const TEMPLATE_MAP = {
  template0: Template0,
};

export const Orchestrator: React.FC<OrchestratorProps> = ({plan}) => {
  const resolvedPlan = plan ?? loadPlan();
  logPlan({template: resolvedPlan.templateId, segments: resolvedPlan.segments.length});

  const TemplateComponent = TEMPLATE_MAP[resolvedPlan.templateId as keyof typeof TEMPLATE_MAP] ?? Template0;

  return <TemplateComponent plan={resolvedPlan} />;
};

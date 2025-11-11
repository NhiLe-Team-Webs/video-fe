import React from "react";
import {loadPlan} from "./loadPlan";
import type {LoadedPlan} from "./types";
import {logPlan, info} from "./utils/logger";
import {getTemplateById} from "./TemplateEngine";
import {getFps} from "./utils/fpsControl";
import {DebugOverlay} from "./utils/debugOverlay";
import {isDebug} from "./utils/env";

type OrchestratorProps = {
  plan?: LoadedPlan;
  fps?: number;
};

export const Orchestrator: React.FC<OrchestratorProps> = ({plan, fps}) => {
  const fallbackPlan = plan ?? loadPlan();
  const resolvedFps = fps ?? getFps(fallbackPlan.templateId);
  const resolvedPlan =
    plan ?? (fallbackPlan.fps === resolvedFps ? fallbackPlan : loadPlan({fps: resolvedFps}));

  logPlan({
    template: resolvedPlan.templateId,
    segments: resolvedPlan.segments.length,
    fps: resolvedPlan.fps,
  });

  const TemplateComponent = getTemplateById(resolvedPlan.templateId);

  const debugData = {
    template: resolvedPlan.templateId,
    segments: resolvedPlan.segments.length,
    fps: resolvedPlan.fps,
    durationFrames: resolvedPlan.durationInFrames,
  };

  if (isDebug()) {
    info("Debug data", debugData);
  }

  return (
    <>
      <TemplateComponent plan={resolvedPlan} />
      <DebugOverlay data={debugData} />
    </>
  );
};

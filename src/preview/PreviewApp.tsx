import React, {useEffect, useMemo, useState} from "react";
import {useHotReloadPlan} from "./useHotReloadPlan";
import {getTemplateById} from "../core/TemplateEngine";
import {normalizePlan} from "../orchestrator/loadPlan";
import {getFps} from "../core/utils/fpsControl";
import {useQuickReload} from "./hooks/useQuickReload";

export const PreviewApp: React.FC = () => {
  const [templateId, setTemplateId] = useState("template0");
  const watchSources = useMemo(
    () => [
      "/src/data/plan.json",
      "/src/effects/registry/manifest.json",
      `/src/templates/${templateId}/template.json`,
    ],
    [templateId]
  );
  const {version} = useQuickReload(watchSources);
  const planData = useHotReloadPlan(version);

  useEffect(() => {
    if (planData.templateId && planData.templateId !== templateId) {
      setTemplateId(planData.templateId);
    }
  }, [planData.templateId, templateId]);

  const previewPlan = useMemo(() => {
    const fps = getFps(templateId);
    return normalizePlan({...planData, templateId}, fps);
  }, [planData, templateId]);

  const TemplateComponent = getTemplateById(templateId);

  return <TemplateComponent plan={previewPlan} />;
};

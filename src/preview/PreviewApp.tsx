import React, {useEffect, useMemo, useState} from "react";
import {AbsoluteFill} from "remotion";
import {useHotReloadPlan} from "./useHotReloadPlan";
import {TemplateSelector} from "./TemplateSelector";
import {getTemplateById} from "../core/TemplateEngine";
import {normalizePlan} from "../core/loadPlan";
import {getFps} from "../core/utils/fpsControl";

export const PreviewApp: React.FC = () => {
  const planData = useHotReloadPlan();
  const [templateId, setTemplateId] = useState(planData.templateId ?? "template0");

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

  return (
    <AbsoluteFill>
      <TemplateSelector value={templateId} onSelect={setTemplateId} />
      <TemplateComponent plan={previewPlan} />
    </AbsoluteFill>
  );
};

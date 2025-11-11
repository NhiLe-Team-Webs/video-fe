import React, {useEffect, useMemo, useState} from "react";
import {AbsoluteFill} from "remotion";
import {useHotReloadPlan} from "./useHotReloadPlan";
import {TemplateSelector} from "./TemplateSelector";
import {getTemplateById} from "../core/TemplateEngine";
import {normalizePlan} from "../core/loadPlan";
import {getFps} from "../core/utils/fpsControl";
import {useQuickReload} from "./hooks/useQuickReload";

export const PreviewApp: React.FC = () => {
  const [templateId, setTemplateId] = useState("template0");
  const watchSources = useMemo(
    () => [
      "/src/data/plan.json",
      "/src/library/animations/manifest.json",
      `/src/templates/${templateId}/template.json`,
    ],
    [templateId]
  );
  const {version, toast} = useQuickReload(watchSources);
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

  return (
    <AbsoluteFill>
      <TemplateSelector value={templateId} onSelect={setTemplateId} />
      <TemplateComponent plan={previewPlan} />
      {toast ? (
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            padding: "8px 16px",
            borderRadius: 12,
            background: "rgba(15,23,42,0.8)",
            color: "#f8fafc",
          }}
        >
          {toast}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

import React, {useEffect, useMemo, useState} from "react";
import {AbsoluteFill} from "remotion";
import {useHotReloadPlan} from "./useHotReloadPlan";
import {TemplateSelector} from "./TemplateSelector";
import {getTemplateById} from "../core/TemplateEngine";
import {normalizePlan} from "../orchestrator/loadPlan";
import {getFps} from "../core/utils/fpsControl";
import {useQuickReload} from "./hooks/useQuickReload";

const PREVIEW_FRAME_WIDTH = 1280;
const PREVIEW_FRAME_HEIGHT = 720;

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
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at top, rgba(15,23,42,1), rgba(2,6,23,1))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: PREVIEW_FRAME_WIDTH,
          height: PREVIEW_FRAME_HEIGHT,
          borderRadius: 40,
          overflow: "hidden",
          boxShadow: "0 45px 120px rgba(2,6,23,0.8)",
          border: "1px solid rgba(148,163,184,0.2)",
          position: "relative",
          background: "#000",
        }}
      >
        <TemplateComponent plan={previewPlan} />
        <TemplateSelector minimal value={templateId} onSelect={setTemplateId} />
        {toast ? (
          <div
            style={{
              position: "absolute",
              bottom: 16,
              right: 16,
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(15,23,42,0.75)",
              color: "#f8fafc",
              fontSize: 12,
              letterSpacing: 0.5,
              border: "1px solid rgba(148,163,184,0.2)",
            }}
          >
            {toast}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

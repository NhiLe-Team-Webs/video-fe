import React, {useCallback, useMemo, useState} from "react";
import {AbsoluteFill} from "remotion";
import defaultPlan from "../data/plan.json";
import type {Plan} from "../core/types";
import {normalizePlan} from "../orchestrator/loadPlan";
import {getFps} from "../core/utils/fpsControl";
import {getTemplateById} from "../core/TemplateEngine";

const dropZoneStyle: React.CSSProperties = {
  border: "1px dashed rgba(148,163,184,0.8)",
  borderRadius: 12,
  padding: 12,
  textAlign: "center",
  fontSize: 12,
  cursor: "pointer",
};

const toPlan = (raw: Plan): Plan => ({
  ...raw,
  templateId: raw.templateId ?? "template0",
});

const convertPlan = (plan: Plan) => {
  const templateId = plan.templateId ?? "template0";
  const fps = getFps(templateId);
  return normalizePlan({...plan, templateId}, fps);
};

export const PlanPreviewPanel: React.FC = () => {
  const [plan, setPlan] = useState<Plan>(toPlan(defaultPlan as Plan));
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const normalizedPlan = useMemo(() => convertPlan(plan), [plan]);
  const TemplateComponent = getTemplateById(normalizedPlan.templateId);

  const handlePlanChange = useCallback((nextPlan: Plan) => {
    try {
      setPlan(toPlan(nextPlan));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const handleFileInput = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Plan;
      handlePlanChange(parsed);
    } catch (err) {
      setError(`Failed to parse file: ${(err as Error).message}`);
    }
  }, [handlePlanChange]);

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      void handleFileInput(droppedFile);
    }
  };

  const fetchPlanFromUrl = async () => {
    if (!urlInput.trim()) {
      return;
    }
    try {
      const response = await fetch(urlInput.trim());
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const parsed = (await response.json()) as Plan;
      handlePlanChange(parsed);
    } catch (err) {
      setError(`Failed to fetch plan: ${(err as Error).message}`);
    }
  };

  const durationInfo = (
    <div style={{fontSize: 14}}>
      <div>Duration: {(normalizedPlan.durationInFrames / normalizedPlan.fps).toFixed(2)}s</div>
      <div>FPS: {normalizedPlan.fps}</div>
      <div>Segments: {normalizedPlan.segments.length}</div>
    </div>
  );

  const timeline = (
    <div style={{marginTop: 12}}>
      <div style={{display: "flex", gap: 4, height: 20}}>
        {normalizedPlan.segments.map((segment, index) => (
          <div
            key={`${segment.clip}-${index}`}
            style={{
              flex: segment.durationInFrames,
              background: index % 2 === 0 ? "rgba(14,165,233,0.5)" : "rgba(248,250,252,0.5)",
              borderRadius: 2,
              position: "relative",
              minWidth: 8,
            }}
            title={`${segment.text ?? "Segment"} (${segment.startFrame} - ${segment.endFrame})`}
          />
        ))}
      </div>
      <div style={{marginTop: 8, display: "flex", flexDirection: "column", gap: 4}}>
        {normalizedPlan.segments.map((segment, index) => (
          <div key={`${segment.clip}-row-${index}`} style={{fontSize: 12, display: "flex", justifyContent: "space-between"}}>
            <span>{segment.text ?? `Segment ${index + 1}`}</span>
            <span>
              {segment.startFrame} → {segment.endFrame}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        gap: 24,
        padding: 24,
        boxSizing: "border-box",
        fontFamily: "Inter, sans-serif",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        color: "#e2e8f0",
      }}
    >
      <div
        style={{
          width: 360,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          background: "rgba(15,23,42,0.65)",
          padding: 20,
          borderRadius: 20,
          backdropFilter: "blur(8px)",
        }}
      >
        <div>
          <label style={{display: "flex", flexDirection: "column", gap: 6}}>
            Plan URL
            <div style={{display: "flex", gap: 8}}>
              <input
                type="text"
                value={urlInput}
                placeholder="https://example.com/plan.json"
                onChange={(event) => setUrlInput(event.target.value)}
                style={{flex: 1}}
              />
              <button type="button" onClick={fetchPlanFromUrl}>
                Load
              </button>
            </div>
          </label>
        </div>

        <div
          style={dropZoneStyle}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById("plan-upload-input")?.click()}
        >
          Drag & drop plan.json here or click to upload
        </div>
        <input
          id="plan-upload-input"
          type="file"
          accept=".json,application/json"
          style={{display: "none"}}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleFileInput(file);
            }
          }}
        />

        {error ? (
          <div style={{color: "#f87171", fontSize: 12}}>
            {error}
          </div>
        ) : null}

        <div>
          <div style={{fontWeight: 600, marginBottom: 6}}>Plan Overview</div>
          <div>Template: {normalizedPlan.templateId}</div>
          {durationInfo}
          {timeline}
        </div>
      </div>

      <div style={{flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center"}}>
        <div
          style={{
            width: 360,
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 40px 80px rgba(15,23,42,0.6)",
            background: "#000",
          }}
        >
          <TemplateComponent plan={normalizedPlan} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

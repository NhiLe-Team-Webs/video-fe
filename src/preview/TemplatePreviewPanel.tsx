import React, {useEffect, useMemo, useState} from "react";
import {AbsoluteFill} from "remotion";
import rawPlan from "../data/plan.json";
import type {Plan} from "../core/types";
import {templateManifest} from "../core/utils/manifest";
import {getTemplateById} from "../core/TemplateEngine";
import {normalizePlan} from "../orchestrator/loadPlan";
import {getFps} from "../core/utils/fpsControl";

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;
const templateOptions = templateManifest.map((template) => template.id);

const clampNumber = (value: number, fallback: number, min = 0.1) => {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(min, value);
};

const INITIAL_PLAN_TEXT = JSON.stringify(rawPlan, null, 2);

export const TemplatePreviewPanel: React.FC = () => {
  const [planText, setPlanText] = useState(INITIAL_PLAN_TEXT);
  const [templateId, setTemplateId] = useState(rawPlan.templateId ?? templateOptions[0] ?? "template0");
  const [fpsInput, setFpsInput] = useState(getFps(templateId));
  const [widthInput, setWidthInput] = useState(DEFAULT_WIDTH);
  const [heightInput, setHeightInput] = useState(DEFAULT_HEIGHT);
  const [durationScale, setDurationScale] = useState(1);

  useEffect(() => {
    setFpsInput(getFps(templateId));
  }, [templateId]);

  const {plan: parsedPlan, error: parseError} = useMemo(() => {
    try {
      return {plan: JSON.parse(planText) as Plan, error: null};
    } catch (err) {
      return {plan: rawPlan as Plan, error: (err as Error).message};
    }
  }, [planText]);

  const fps = clampNumber(fpsInput, 30, 1);
  const scaledPlan = useMemo<Plan>(() => {
    const scale = clampNumber(durationScale, 1, 0.1);
    return {
      ...parsedPlan,
      templateId,
      segments: parsedPlan.segments?.map((segment) => ({
        ...segment,
        duration: segment.duration * scale,
      })) ?? [],
    };
  }, [parsedPlan, templateId, durationScale]);

  const previewPlan = useMemo(() => normalizePlan(scaledPlan, fps), [scaledPlan, fps]);
  const TemplateComponent = getTemplateById(templateId);

  const handlePlanUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    setPlanText(text);
  };

  const handleResetPlan = () => {
    setPlanText(INITIAL_PLAN_TEXT);
  };

  const previewScale = useMemo(() => {
    const maxWidth = 500;
    const maxHeight = 800;
    const scaleX = maxWidth / widthInput;
    const scaleY = maxHeight / heightInput;
    return Math.min(scaleX, scaleY, 1);
  }, [widthInput, heightInput]);

  return (
    <AbsoluteFill
      style={{
        fontFamily: "Inter, sans-serif",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        color: "#e2e8f0",
        display: "flex",
        padding: 24,
        boxSizing: "border-box",
        gap: 24,
      }}
    >
      <div
        style={{
          width: 360,
          background: "rgba(15,23,42,0.75)",
          padding: 20,
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          backdropFilter: "blur(8px)",
        }}
      >
        <div>
          <label style={{display: "flex", flexDirection: "column", gap: 6}}>
            Template
            <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              {templateOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label style={{display: "flex", flexDirection: "column", gap: 6}}>
          FPS
          <input
            type="number"
            min={1}
            step={1}
            value={fpsInput}
            onChange={(e) => setFpsInput(parseFloat(e.target.value))}
          />
        </label>

        <div style={{display: "flex", gap: 12}}>
          <label style={{flex: 1, display: "flex", flexDirection: "column", gap: 6}}>
            Width
            <input
              type="number"
              min={320}
              value={widthInput}
              onChange={(e) => setWidthInput(parseInt(e.target.value, 10))}
            />
          </label>
          <label style={{flex: 1, display: "flex", flexDirection: "column", gap: 6}}>
            Height
            <input
              type="number"
              min={320}
              value={heightInput}
              onChange={(e) => setHeightInput(parseInt(e.target.value, 10))}
            />
          </label>
        </div>

        <label style={{display: "flex", flexDirection: "column", gap: 6}}>
          Duration scale
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={durationScale}
            onChange={(e) => setDurationScale(parseFloat(e.target.value))}
          />
        </label>

        <div>
          <label style={{display: "flex", flexDirection: "column", gap: 6}}>
            Plan JSON
            <textarea
              value={planText}
              onChange={(e) => setPlanText(e.target.value)}
              rows={8}
              style={{width: "100%", fontFamily: "monospace", fontSize: 12}}
            />
          </label>
          {parseError ? (
            <div style={{color: "#f87171", fontSize: 12, marginTop: 6}}>JSON error: {parseError}</div>
          ) : null}
          <div style={{display: "flex", gap: 8, marginTop: 8}}>
            <button type="button" onClick={handleResetPlan}>
              Reset
            </button>
            <label
              style={{
                cursor: "pointer",
                background: "#334155",
                padding: "6px 12px",
                borderRadius: 6,
              }}
            >
              Upload JSON
              <input
                type="file"
                accept=".json,application/json"
                onChange={handlePlanUpload}
                style={{display: "none"}}
              />
            </label>
          </div>
        </div>
      </div>

      <div style={{flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center"}}>
        <div
          style={{
            width: widthInput,
            height: heightInput,
            transform: `scale(${previewScale})`,
            transformOrigin: "center",
            boxShadow: "0 40px 80px rgba(15,23,42,0.55)",
            borderRadius: 24,
            overflow: "hidden",
            background: "#000",
          }}
        >
          <TemplateComponent plan={previewPlan} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

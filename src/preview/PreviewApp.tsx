import React from "react";
import {AbsoluteFill} from "remotion";
import {PlanPreviewPanel} from "./PlanPreviewPanel";

export const PreviewApp: React.FC = () => {
  return (
    <AbsoluteFill>
      <PlanPreviewPanel />
    </AbsoluteFill>
  );
};

import React from "react";
import type {LoadedPlan} from "../../core/types";

type TemplateCompositionProps = {
  plan: LoadedPlan;
};

export const Template0Composition: React.FC<TemplateCompositionProps> = ({plan}) => {
  return (
    <div className="template0">
      <h1>{plan.templateId}</h1>
      <p>{`Segments: ${plan.segments.length}`}</p>
    </div>
  );
};

// Legacy placeholder kept for reference with the initial Remotion bootstrap.
export const LegacyComposition = () => {
  return null;
};

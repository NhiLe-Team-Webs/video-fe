import {Composition, getInputProps, registerRoot} from "remotion";
import {PlanOrchestrator} from "./orchestrator/PlanOrchestrator";
import {loadPlan} from "./orchestrator/loadPlan";
import {getFps} from "./core/utils/fpsControl";
import {PreviewApp} from "./preview";
import {EffectGallery} from "./effects/preview/EffectGallery";
import {TemplatePreviewPanel} from "./preview/TemplatePreviewPanel";
import {PlanPreviewPanel} from "./preview/PlanPreviewPanel";
import {totalFrames} from "./core/utils/frameUtils";

const inputProps = getInputProps<{devMode?: boolean}>();
const bootstrapPlan = loadPlan();
const initialFps = getFps(bootstrapPlan.templateId);
const plan = bootstrapPlan.fps === initialFps ? bootstrapPlan : loadPlan({fps: initialFps});
const PREVIEW_WIDTH = 1920;
const PREVIEW_HEIGHT = 1080;
const showDevCompositions = inputProps.devMode ?? true;

export const RemotionRoot: React.FC = () => (
  <>
    {showDevCompositions ? (
      <>
        <Composition
          id="live-preview"
          component={PreviewApp}
          durationInFrames={totalFrames(plan.segments, initialFps)}
          fps={initialFps}
          width={PREVIEW_WIDTH}
          height={PREVIEW_HEIGHT}
        />
        <Composition
          id="effects-gallery"
          component={EffectGallery}
          durationInFrames={180}
          fps={initialFps}
          width={PREVIEW_WIDTH}
          height={PREVIEW_HEIGHT}
        />
        <Composition
          id="template-preview"
          component={TemplatePreviewPanel}
          durationInFrames={totalFrames(plan.segments, initialFps)}
          fps={initialFps}
          width={PREVIEW_WIDTH}
          height={PREVIEW_HEIGHT}
        />
        <Composition
          id="plan-preview"
          component={PlanPreviewPanel}
          durationInFrames={totalFrames(plan.segments, initialFps)}
          fps={initialFps}
          width={PREVIEW_WIDTH}
          height={PREVIEW_HEIGHT}
        />
      </>
    ) : null}
    <Composition
      id="auto-video"
      component={PlanOrchestrator}
      durationInFrames={plan.durationInFrames}
      fps={initialFps}
      width={PREVIEW_WIDTH}
      height={PREVIEW_HEIGHT}
      defaultProps={{plan, fps: initialFps}}
    />
  </>
);

if (!(globalThis as {__remotionRootRegistered?: boolean}).__remotionRootRegistered) {
  registerRoot(RemotionRoot);
  (globalThis as {__remotionRootRegistered?: boolean}).__remotionRootRegistered = true;
}

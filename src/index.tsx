import {Composition, getInputProps, registerRoot} from "remotion";
import {PlanOrchestrator} from "./orchestrator/PlanOrchestrator";
import {loadPlan} from "./orchestrator/loadPlan";
import {getFps} from "./core/utils/fpsControl";
import {PreviewApp} from "./preview";
import {EffectGallery} from "./effects/preview/EffectGallery";
import {TemplatePreviewPanel} from "./preview/TemplatePreviewPanel";
import {PlanPreviewPanel} from "./preview/PlanPreviewPanel";
import {totalFrames} from "./core/utils/frameUtils";
import {TransitionGallery} from "./transitions/preview/TransitionGallery";

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
          component={typeof PreviewApp === 'function' ? PreviewApp : () => {console.error("PreviewApp is undefined"); return null;}}
          durationInFrames={totalFrames(plan.segments, initialFps)}
          fps={initialFps}
          width={PREVIEW_WIDTH}
          height={PREVIEW_HEIGHT}
        />
        <Composition
          id="effects-gallery"
          component={typeof EffectGallery === 'function' ? EffectGallery : () => {console.error("EffectGallery is undefined"); return null;}}
          durationInFrames={180}
          fps={initialFps}
          width={PREVIEW_WIDTH}
          height={PREVIEW_HEIGHT}
        />
        <Composition
          id="transition-gallery"
          component={typeof TransitionGallery === 'function' ? TransitionGallery : () => {console.error("TransitionGallery is undefined"); return null;}}
          durationInFrames={180}
          fps={initialFps}
          width={PREVIEW_WIDTH}
          height={PREVIEW_HEIGHT}
        />
        <Composition
          id="template-preview"
          component={typeof TemplatePreviewPanel === 'function' ? TemplatePreviewPanel : () => {console.error("TemplatePreviewPanel is undefined"); return null;}}
          durationInFrames={totalFrames(plan.segments, initialFps)}
          fps={initialFps}
          width={PREVIEW_WIDTH}
          height={PREVIEW_HEIGHT}
        />
        <Composition
          id="plan-preview"
          component={typeof PlanPreviewPanel === 'function' ? PlanPreviewPanel : () => {console.error("PlanPreviewPanel is undefined"); return null;}}
          durationInFrames={totalFrames(plan.segments, initialFps)}
          fps={initialFps}
          width={PREVIEW_WIDTH}
          height={PREVIEW_HEIGHT}
        />
      </>
    ) : null}
    <Composition
      id="auto-video"
      component={typeof PlanOrchestrator === 'function' ? PlanOrchestrator : () => {console.error("PlanOrchestrator is undefined"); return null;}}
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

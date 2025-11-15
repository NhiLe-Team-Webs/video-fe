import {Composition, getInputProps, registerRoot} from "remotion";
import {loadPlan} from "./orchestrator/loadPlan";
import {getFps} from "./core/utils/fpsControl";
import {PreviewApp} from "./preview";
import {EffectGallery} from "./effects/preview/EffectGallery";
import {TemplatePreviewPanel} from "./preview/TemplatePreviewPanel";
import {totalFrames} from "./core/utils/frameUtils";
import {TransitionGallery} from "./transitions/preview/TransitionGallery";

const inputProps = getInputProps<{devMode?: boolean}>();
const bootstrapPlan = loadPlan();
const initialFps = getFps(bootstrapPlan.templateId);
const plan = bootstrapPlan.fps === initialFps ? bootstrapPlan : loadPlan({fps: initialFps});
const PREVIEW_WIDTH = 1920;
const PREVIEW_HEIGHT = 1080;
const showDevCompositions = inputProps.devMode ?? true;
const compositionDurationInFrames =
  plan.durationInFrames ?? totalFrames(plan.segments, initialFps);

export const RemotionRoot: React.FC = () => (
  <>
    {showDevCompositions ? (
      <>
        <Composition
          id="live-preview"
          component={typeof PreviewApp === 'function' ? PreviewApp : () => {console.error("PreviewApp is undefined"); return null;}}
          durationInFrames={compositionDurationInFrames}
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
          durationInFrames={compositionDurationInFrames}
          fps={initialFps}
          width={PREVIEW_WIDTH}
          height={PREVIEW_HEIGHT}
        />
      </>
    ) : null}
  </>
);

if (!(globalThis as {__remotionRootRegistered?: boolean}).__remotionRootRegistered) {
  registerRoot(RemotionRoot);
  (globalThis as {__remotionRootRegistered?: boolean}).__remotionRootRegistered = true;
}

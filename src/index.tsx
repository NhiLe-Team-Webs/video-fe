import {Composition, getInputProps, registerRoot} from "remotion";
import {Orchestrator} from "./core/Orchestrator";
import {loadPlan} from "./core/loadPlan";
import {getFps} from "./core/utils/fpsControl";
import {PreviewApp} from "./preview";
import {AnimationPreviewApp} from "./library/animations/AnimationPreviewApp";
import {TemplatePreviewPanel} from "./preview/TemplatePreviewPanel";
import {totalFrames} from "./core/utils/frameUtils";

const inputProps = getInputProps<{devMode?: boolean}>();
const bootstrapPlan = loadPlan();
const initialFps = getFps(bootstrapPlan.templateId);
const plan = bootstrapPlan.fps === initialFps ? bootstrapPlan : loadPlan({fps: initialFps});
const isDevMode = Boolean(inputProps.devMode);

export const RemotionRoot: React.FC = () => (
  <>
    {isDevMode ? (
      <>
        <Composition
          id="live-preview"
          component={PreviewApp}
          durationInFrames={totalFrames(plan.segments, initialFps)}
          fps={initialFps}
          width={1080}
          height={1920}
        />
        <Composition
          id="animation-browser"
          component={AnimationPreviewApp}
          durationInFrames={120}
          fps={initialFps}
          width={1080}
          height={1920}
        />
        <Composition
          id="template-preview"
          component={TemplatePreviewPanel}
          durationInFrames={totalFrames(plan.segments, initialFps)}
          fps={initialFps}
          width={1080}
          height={1920}
        />
      </>
    ) : null}
    {!isDevMode ? (
      <Composition
        id="auto-video"
        component={Orchestrator}
        durationInFrames={plan.durationInFrames}
        fps={initialFps}
        width={1080}
        height={1920}
        defaultProps={{plan, fps: initialFps}}
      />
    ) : null}
  </>
);

registerRoot(RemotionRoot);

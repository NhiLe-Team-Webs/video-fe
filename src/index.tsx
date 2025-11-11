import {Composition, registerRoot} from "remotion";
import {Orchestrator} from "./core/Orchestrator";
import {loadPlan} from "./core/loadPlan";
import {getFps} from "./core/utils/fpsControl";
import {PreviewApp} from "./preview";
import {AnimationPreviewApp} from "./library/animations/AnimationPreviewApp";
import {totalFrames} from "./core/utils/frameUtils";

const bootstrapPlan = loadPlan();
const initialFps = getFps(bootstrapPlan.templateId);
const plan = bootstrapPlan.fps === initialFps ? bootstrapPlan : loadPlan({fps: initialFps});

export const RemotionRoot: React.FC = () => (
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
      id="auto-video"
      component={Orchestrator}
      durationInFrames={plan.durationInFrames}
      fps={initialFps}
      width={1080}
      height={1920}
      defaultProps={{plan, fps: initialFps}}
    />
  </>
);

registerRoot(RemotionRoot);

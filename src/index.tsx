import {Composition, registerRoot} from "remotion";
import {Orchestrator} from "./core/Orchestrator";
import {loadPlan} from "./core/loadPlan";
import {getFps} from "./core/utils/fpsControl";

const bootstrapPlan = loadPlan();
const initialFps = getFps(bootstrapPlan.templateId);
const plan = bootstrapPlan.fps === initialFps ? bootstrapPlan : loadPlan({fps: initialFps});

export const RemotionRoot: React.FC = () => (
  <Composition
    id="auto-video"
    component={Orchestrator}
    durationInFrames={plan.durationInFrames}
    fps={initialFps}
    width={1080}
    height={1920}
    defaultProps={{plan, fps: initialFps}}
  />
);

registerRoot(RemotionRoot);

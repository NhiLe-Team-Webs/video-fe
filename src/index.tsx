import {Composition} from "remotion";
import {Orchestrator} from "./core/Orchestrator";
import {loadPlan} from "./core/loadPlan";

const plan = loadPlan();

export const RemotionRoot: React.FC = () => (
  <Composition
    id="auto-video"
    component={Orchestrator}
    durationInFrames={plan.durationInFrames}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{plan}}
  />
);

import {loadPlan} from "../orchestrator/loadPlan";
import {getFps} from "./utils/fpsControl";

const bootstrapPlan = loadPlan();
const fps = getFps(bootstrapPlan.templateId);
const plan = bootstrapPlan.fps === fps ? bootstrapPlan : loadPlan({fps});

console.log(JSON.stringify(plan, null, 2));

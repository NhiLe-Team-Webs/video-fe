import {loadPlan} from "./loadPlan";

const plan = loadPlan();
console.log(JSON.stringify(plan, null, 2));

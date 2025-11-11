import {useEffect, useState} from "react";
import planData from "../data/plan.json";
import type {Plan} from "../core/types";
import {warn} from "../core/utils/logger";

const fetchPlanJson = async (): Promise<Plan | null> => {
  try {
    const response = await fetch(`/src/data/plan.json?cachebust=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch plan.json: ${response.statusText}`);
    }
    return (await response.json()) as Plan;
  } catch (error) {
    warn("Failed to reload plan.json", error);
    return null;
  }
};

export const useHotReloadPlan = () => {
  const [plan, setPlan] = useState(planData as Plan);

  useEffect(() => {
    const interval = setInterval(async () => {
      const remotePlan = await fetchPlanJson();
      if (remotePlan) {
        setPlan(remotePlan);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return plan;
};

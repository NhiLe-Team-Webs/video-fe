import {useEffect, useState} from "react";
import planData from "../data/plan.json";
import type {Plan} from "../core/types";
import {warn} from "../core/utils/logger";

const CAN_FETCH_REMOTE_PLAN =
  typeof window !== "undefined" && process.env.REMOTION_SOURCE_WATCH === "true";

const fetchPlanJson = async (): Promise<Plan | null> => {
  if (!CAN_FETCH_REMOTE_PLAN) {
    return null;
  }
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

export const useHotReloadPlan = (refreshKey = 0) => {
  const [plan, setPlan] = useState(planData as Plan);

  useEffect(() => {
    let cancelled = false;

    if (!CAN_FETCH_REMOTE_PLAN) {
      return;
    }

    const loadRemotePlan = async () => {
      const remotePlan = await fetchPlanJson();
      if (remotePlan && !cancelled) {
        setPlan(remotePlan);
      }
    };

    void loadRemotePlan();

    const interval = setInterval(loadRemotePlan, 4000);

    return () => {
      cancelled = true;
      if (CAN_FETCH_REMOTE_PLAN) {
        clearInterval(interval);
      }
    };
  }, [refreshKey]);

  return plan;
};

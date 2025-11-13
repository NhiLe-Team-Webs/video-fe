import {gsap} from "gsap";

type TimelineVars = Parameters<typeof gsap.timeline>[0];
type TimelineInstance = ReturnType<typeof gsap.timeline>;

let configured = false;

const ensureConfigured = () => {
  if (configured) {
    return;
  }

  gsap.defaults({
    ease: "power2.out",
    duration: 1,
  });

  configured = true;
};

export const getGsap = () => {
  ensureConfigured();
  return gsap;
};

export const createTimeline = (vars?: TimelineVars): TimelineInstance => {
  return getGsap().timeline({paused: true, ...vars});
};

export type {TimelineInstance as GsapTimeline};

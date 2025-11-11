import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {useCurrentFrame} from "remotion";
import type {LoadedPlan, NormalizedSegment} from "../types";

type DebugInfo = {
  frame: number;
  fps: number;
  segmentIndex: number | null;
  segment?: NormalizedSegment;
};

type DebugContextValue = {
  info: DebugInfo | null;
  overlayVisible: boolean;
  toggleOverlay: () => void;
};

const DebugContext = createContext<DebugContextValue | undefined>(undefined);

const findSegment = (segments: NormalizedSegment[], frame: number) => {
  return segments.find((segment) => frame >= segment.startFrame && frame < segment.endFrame);
};

export const DebugProvider: React.FC<React.PropsWithChildren<{plan: LoadedPlan}>> = ({plan, children}) => {
  const frame = useCurrentFrame();
  const [overlayVisible, setOverlayVisible] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "d") {
        return;
      }

      const modifierPressed = event.ctrlKey || event.metaKey;
      const noModifier = !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey;

      if (modifierPressed || noModifier) {
        setOverlayVisible((visible) => !visible);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const info = useMemo<DebugInfo | null>(() => {
    const segment = findSegment(plan.segments, frame);
    const segmentIndex = segment ? plan.segments.indexOf(segment) : null;
    return {
      frame,
      fps: plan.fps,
      segment,
      segmentIndex,
    };
  }, [frame, plan]);

  const toggleOverlay = useCallback(() => {
    setOverlayVisible((visible) => !visible);
  }, []);

  const value = useMemo(
    () => ({
      info,
      overlayVisible,
      toggleOverlay,
    }),
    [info, overlayVisible, toggleOverlay]
  );

  return <DebugContext.Provider value={value}>{children}</DebugContext.Provider>;
};

export const useDebugContext = () => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error("useDebugContext must be used within a DebugProvider");
  }
  return context;
};

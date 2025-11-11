import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {useCurrentFrame} from "remotion";
import type {NormalizedSegment} from "../types";

type DebugInfo = {
  frame: number;
  segmentIndex: number | null;
  segment?: NormalizedSegment;
  animationId?: string;
  sfx?: string;
  emotion?: string;
  fps: number;
};

type DebugContextValue = {
  info: DebugInfo | null;
  setSegment: (segmentIndex: number, segment: NormalizedSegment, animationId?: string) => void;
  setSegmentIndex: (segmentIndex: number | null) => void;
  toggleOverlay: () => void;
  overlayVisible: boolean;
};

const DebugContext = createContext<DebugContextValue | undefined>(undefined);

export const DebugProvider: React.FC<React.PropsWithChildren<{fps: number}>> = ({fps, children}) => {
  const frame = useCurrentFrame();
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [segmentIndex, setSegmentIndexState] = useState<number | null>(null);
  const [segmentDetail, setSegmentDetail] = useState<{
    segment?: NormalizedSegment;
    animationId?: string;
  }>({});

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "d" && (event.ctrlKey || event.metaKey || event.shiftKey || !event.getModifierState("CapsLock"))) {
        setOverlayVisible((visible) => !visible);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const info = useMemo<DebugInfo | null>(() => {
    if (segmentIndex === null) {
      return {
        frame,
        segmentIndex: null,
        fps,
      };
    }

    return {
      frame,
      segmentIndex,
      segment: segmentDetail.segment,
      animationId: segmentDetail.animationId ?? segmentDetail.segment?.animationId,
      sfx: segmentDetail.segment?.sfx,
      emotion: segmentDetail.segment?.emotion,
      fps,
    };
  }, [frame, fps, segmentDetail.animationId, segmentDetail.segment, segmentIndex]);

  const setSegment = useCallback(
    (index: number, segment: NormalizedSegment, animationId?: string) => {
      setSegmentIndexState(index);
      setSegmentDetail({segment, animationId});
    },
    []
  );

  const setSegmentIndex = useCallback((index: number | null) => {
    setSegmentIndexState(index);
  }, []);

  const toggleOverlay = useCallback(() => {
    setOverlayVisible((visible) => !visible);
  }, []);

  const value = useMemo(
    () => ({
      info,
      setSegment,
      setSegmentIndex,
      overlayVisible,
      toggleOverlay,
    }),
    [info, overlayVisible, setSegment, setSegmentIndex, toggleOverlay]
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

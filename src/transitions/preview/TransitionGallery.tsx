import React, {useEffect, useMemo, useState} from "react";
import {AbsoluteFill} from "remotion";
import {TransitionSeries} from "@remotion/transitions";
import {listRegisteredTransitions, type TransitionDefinition} from "../transitionRegistry";

const transitions = listRegisteredTransitions();
const tagFilters = [
  "all",
  ...Array.from(
    new Set(transitions.flatMap((entry) => (entry.tags ?? []).filter((tag) => (tag ?? "").trim().length > 0)))
  ),
];

const SampleCard: React.FC<{label: string; accent: string; variant: "entering" | "exiting"}> = ({
  label,
  accent,
  variant,
}) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      borderRadius: 36,
      background:
        variant === "entering"
          ? `linear-gradient(135deg, ${accent}, rgba(15,23,42,0.95))`
          : "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(2,6,23,0.95))",
      boxShadow: "0 25px 80px rgba(15,23,42,0.45)",
      color: "#f8fafc",
      fontSize: 44,
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    }}
  >
    {label}
  </div>
);

const TransitionPreview: React.FC<{transition: TransitionDefinition}> = ({transition}) => (
  <div
    style={{
      flex: 1,
      minHeight: 0,
      borderRadius: 32,
      padding: 24,
      background: "rgba(2,6,23,0.92)",
      border: "1px solid rgba(148,163,184,0.18)",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={70}>
        <SampleCard
          label={transition.sample?.exitingLabel ?? "Previous Clip"}
          accent={transition.sample?.accent ?? "#38bdf8"}
          variant="exiting"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition timing={transition.timing} presentation={transition.presentation} />
      <TransitionSeries.Sequence durationInFrames={70}>
        <SampleCard
          label={transition.sample?.enteringLabel ?? "Next Clip"}
          accent={transition.sample?.accent ?? "#38bdf8"}
          variant="entering"
        />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </div>
);

export const TransitionGallery: React.FC = () => {
  const [tag, setTag] = useState(tagFilters[0] ?? "all");
  const [selectedId, setSelectedId] = useState(transitions[0]?.id ?? "");

  const filteredTransitions = useMemo(() => {
    if (tag === "all") {
      return transitions;
    }
    return transitions.filter((entry) => entry.tags.includes(tag));
  }, [tag]);

  useEffect(() => {
    if (!filteredTransitions.some((entry) => entry.id === selectedId)) {
      setSelectedId(filteredTransitions[0]?.id ?? "");
    }
  }, [filteredTransitions, selectedId]);

  const selected =
    filteredTransitions.find((entry) => entry.id === selectedId) ?? filteredTransitions[0] ?? null;

  return (
    <AbsoluteFill
      style={{
        fontFamily: "Inter, sans-serif",
        background: "radial-gradient(circle at top, rgba(56,189,248,0.25), rgba(15,23,42,1))",
        color: "#f8fafc",
        padding: 28,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div style={{display: "flex", gap: 12, flexWrap: "wrap"}}>
        <select
          value={tag}
          onChange={(event) => setTag(event.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(15,23,42,0.6)",
            color: "#f8fafc",
            minWidth: 220,
            position: "relative",
            zIndex: 2,
          }}
        >
          {tagFilters.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "Tất cả tags" : option}
            </option>
          ))}
        </select>

        <select
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(15,23,42,0.6)",
            color: "#f8fafc",
            minWidth: 260,
            position: "relative",
            zIndex: 2,
          }}
        >
          {filteredTransitions.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.name}
            </option>
          ))}
        </select>
      </div>

      {selected ? (
        <div style={{display: "flex", gap: 20, flex: 1, minHeight: 0}}>
          <TransitionPreview transition={selected} />
          <div
            style={{
              width: 360,
              borderRadius: 28,
              background: "rgba(15,23,42,0.65)",
              backdropFilter: "blur(10px)",
              padding: 20,
              border: "1px solid rgba(148,163,184,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div>
              <div style={{fontSize: 18, fontWeight: 600}}>{selected.name}</div>
              <div style={{fontSize: 13, opacity: 0.8}}>{selected.description}</div>
            </div>
            <div
              style={{
                fontSize: 12,
                opacity: 0.85,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div>
                ID: <code style={{fontSize: 11}}>{selected.id}</code>
              </div>
            </div>
            <div style={{display: "flex", flexWrap: "wrap", gap: 8}}>
              {(selected.tags ?? []).filter((badge) => badge?.trim().length).map((badge) => (
                <span
                  key={`${selected.id}-${badge}`}
                  style={{
                    fontSize: 11,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "rgba(2,6,23,0.9)",
                    border: "1px solid rgba(148,163,184,0.3)",
                    textTransform: "capitalize",
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
            <div style={{marginTop: "auto", fontSize: 12, opacity: 0.8}}>
              Preview labels: {selected.sample?.exitingLabel ?? "Previous Clip"} →{" "}
              {selected.sample?.enteringLabel ?? "Next Clip"}
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            borderRadius: 28,
            border: "1px dashed rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            opacity: 0.8,
          }}
        >
          Không tìm thấy transition
        </div>
      )}
    </AbsoluteFill>
  );
};

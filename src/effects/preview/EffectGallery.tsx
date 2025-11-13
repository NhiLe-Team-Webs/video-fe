import React, {useEffect, useMemo, useState} from "react";
import {AbsoluteFill, useVideoConfig} from "remotion";
import effectRegistry from "../registry/effects.json";
import lottieRegistry from "../registry/lottieRegistry.json";
import {useEffectByKey} from "../hooks/useEffectByKey";
import type {EffectKey} from "../../types/EffectTypes";
import {EffectCategory} from "../taxonomy/effectCategories";

type RegistryEntry = {
  key: EffectKey;
  name: string;
  category: string;
  durationSeconds?: number;
};

const buildEntries = (): RegistryEntry[] => {
  const componentEntries = Object.entries(effectRegistry).map(([key, metadata]) => ({
    key: key as EffectKey,
    name: metadata.name,
    category: metadata.category,
    durationSeconds: metadata.duration ?? 1,
  }));

  const lottieEntries = Object.values(lottieRegistry).map((entry) => ({
    key: entry.key as EffectKey,
    name: entry.name,
    category: entry.category ?? EffectCategory.Overlay,
    durationSeconds: entry.durationInSeconds ?? 1.5,
  }));

  return [...componentEntries, ...lottieEntries].sort((a, b) => a.name.localeCompare(b.name));
};

const entries = buildEntries();
const categories = ["all", ...Array.from(new Set(entries.map((entry) => entry.category)))];

const SampleScene: React.FC = () => (
  <div
    style={{
      width: "100%",
      height: "100%",
      borderRadius: 36,
      background:
        "linear-gradient(135deg, rgba(51,65,85,0.9), rgba(15,23,42,0.9)), url(https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=60) center/cover",
      color: "#f8fafc",
      fontSize: 48,
      fontWeight: 800,
      letterSpacing: 1,
      textTransform: "uppercase",
      textShadow: "0 10px 25px rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    Speaker
  </div>
);

const EffectPreview: React.FC<{entry: RegistryEntry}> = ({entry}) => {
  const {fps} = useVideoConfig();
  const resolution = useEffectByKey(entry.key);
  if (!resolution) {
    return <div style={{opacity: 0.6}}>Effect not registered.</div>;
  }
  const {Component, metadata} = resolution;
  const durationInFrames = Math.max(1, Math.round((entry.durationSeconds ?? 1) * fps));
  const needsChildren =
    metadata?.category === "motion" ||
    metadata?.recommendedLayer === "base" ||
    entry.key.startsWith("motion.");

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        borderRadius: 28,
        background: "rgba(2,6,23,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}
    >
      {needsChildren ? (
        <Component durationInFrames={durationInFrames}>
          <SampleScene />
        </Component>
      ) : (
        <Component durationInFrames={durationInFrames} />
      )}
    </div>
  );
};

export const EffectGallery: React.FC = () => {
  const [category, setCategory] = useState("all");
  const [selectedKey, setSelectedKey] = useState<EffectKey | null>(entries[0]?.key ?? null);

  const visibleEntries = useMemo(() => {
    if (category === "all") {
      return entries;
    }
    return entries.filter((entry) => entry.category === category);
  }, [category]);

  useEffect(() => {
    if (!visibleEntries.some((entry) => entry.key === selectedKey)) {
      setSelectedKey(visibleEntries[0]?.key ?? null);
    }
  }, [visibleEntries, selectedKey]);

  const selectedEntry =
    visibleEntries.find((entry) => entry.key === selectedKey) ?? visibleEntries[0] ?? null;

  return (
    <AbsoluteFill
      style={{
        fontFamily: "Inter, sans-serif",
        background: "radial-gradient(circle at top, rgba(56,189,248,0.25), rgba(15,23,42,1))",
        color: "#f8fafc",
        padding: 32,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{display: "flex", gap: 12, flexWrap: "wrap"}}>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(15,23,42,0.65)",
            color: "#f8fafc",
            position: "relative",
            zIndex: 2,
          }}
        >
          {categories.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={selectedKey ?? ""}
          onChange={(event) => setSelectedKey(event.target.value as EffectKey)}
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(15,23,42,0.65)",
            color: "#f8fafc",
            minWidth: 220,
            position: "relative",
            zIndex: 2,
          }}
        >
          {visibleEntries.map((entry) => (
            <option key={entry.key} value={entry.key}>
              {entry.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{flex: 1, position: "relative", zIndex: 1}}>
        {selectedEntry ? (
          <EffectPreview entry={selectedEntry} />
        ) : (
          <div style={{opacity: 0.6}}>No effect found for this filter.</div>
        )}
      </div>
    </AbsoluteFill>
  );
};

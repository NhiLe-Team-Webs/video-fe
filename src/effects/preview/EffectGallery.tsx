import React, {useMemo, useState} from "react";
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
  tags: string[];
  durationSeconds?: number;
  engine: "gsap" | "lottie" | "native" | "unknown";
};

const detectEngine = (componentPath?: string): RegistryEntry["engine"] => {
  if (!componentPath) {
    return "unknown";
  }
  if (componentPath.includes("/gsap/")) {
    return "gsap";
  }
  if (componentPath.includes("/lottie/")) {
    return "lottie";
  }
  return "native";
};

const buildEntries = (): RegistryEntry[] => {
  const effectEntries = Object.entries(effectRegistry).map(([key, metadata]) => ({
    key: key as EffectKey,
    name: metadata.name,
    category: metadata.category,
    tags: metadata.tags ?? [],
    durationSeconds: metadata.duration ?? 1,
    engine: detectEngine(metadata.componentPath),
  }));

  const lottieEntries = Object.values(lottieRegistry).map((entry) => ({
    key: entry.key as EffectKey,
    name: entry.name,
    category: entry.category ?? EffectCategory.Overlay,
    tags: entry.tags ?? [],
    durationSeconds: entry.durationInSeconds ?? 1.5,
    engine: "lottie" as const,
  }));

  return [...effectEntries, ...lottieEntries].sort((a, b) => a.name.localeCompare(b.name));
};

const galleryEntries = buildEntries();
const filterOptions = ["all", ...Array.from(new Set(galleryEntries.map((entry) => entry.category)))];

const SampleContent: React.FC<{label: string}> = ({label}) => (
  <div
    style={{
      padding: "16px 20px",
      borderRadius: 16,
      background: "rgba(15,23,42,0.85)",
      color: "#f8fafc",
      fontWeight: 600,
      letterSpacing: 0.5,
    }}
  >
    {label}
  </div>
);

const EffectCard: React.FC<{entry: RegistryEntry}> = ({entry}) => {
  const {fps} = useVideoConfig();
  const resolution = useEffectByKey(entry.key);
  const durationInFrames = Math.max(1, Math.round((entry.durationSeconds ?? 1) * fps));

  if (!resolution) {
    return null;
  }

  const {Component, metadata} = resolution;
  const shouldWrapChildren = entry.engine !== "lottie" && metadata?.category !== EffectCategory.Background;

  return (
    <div
      style={{
        background: "rgba(15,23,42,0.65)",
        borderRadius: 20,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minWidth: 260,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          height: 180,
          borderRadius: 16,
          background: "rgba(2,6,23,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {shouldWrapChildren ? (
          <Component durationInFrames={durationInFrames}>
            <SampleContent label={entry.name} />
          </Component>
        ) : (
          <Component durationInFrames={durationInFrames} />
        )}
      </div>
      <div style={{display: "flex", flexDirection: "column", gap: 4}}>
        <div style={{fontWeight: 600}}>{entry.name}</div>
        <div style={{fontSize: 12, textTransform: "uppercase", opacity: 0.7}}>
          {entry.category} · {entry.engine}
        </div>
        {entry.tags.length ? (
          <div style={{display: "flex", flexWrap: "wrap", gap: 6}}>
            {entry.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "rgba(59,130,246,0.15)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const EffectGallery: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState("all");

  const visibleEntries = useMemo(() => {
    if (categoryFilter === "all") {
      return galleryEntries;
    }
    return galleryEntries.filter((entry) => entry.category === categoryFilter);
  }, [categoryFilter]);

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
        gap: 24,
      }}
    >
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <div>
          <div style={{fontSize: 28, fontWeight: 700}}>Effect Gallery</div>
          <div style={{opacity: 0.8, fontSize: 14}}>
            Unified preview for GSAP, Lottie, and native effects ({galleryEntries.length} entries)
          </div>
        </div>
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(15,23,42,0.65)",
            color: "#f8fafc",
          }}
        >
          {filterOptions.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          overflowY: "auto",
          paddingRight: 8,
        }}
      >
        {visibleEntries.length === 0 ? (
          <div style={{opacity: 0.6}}>No effects found for this category.</div>
        ) : (
          visibleEntries.map((entry) => <EffectCard key={entry.key} entry={entry} />)
        )}
      </div>
    </AbsoluteFill>
  );
};

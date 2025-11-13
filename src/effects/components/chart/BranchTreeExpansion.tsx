import React, {useMemo} from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";

type BranchTreeNode = {
  label: string;
  subtitle?: string;
  color?: string;
  children?: BranchTreeNode[];
};

const fallbackTree: BranchTreeNode = {
  label: "SMM Strategy",
  subtitle: "Social media-first growth loop",
  color: "#22d3ee",
  children: [
    {
      label: "Facebook Marketing",
      color: "#1877f2",
      subtitle: "Groups / Ads / Live",
      children: [
        {label: "Facebook Groups", color: "#0ea5e9"},
        {label: "Creative Ads", subtitle: "Carousel, Reel, Collection"},
      ],
    },
    {
      label: "TikTok Growth",
      color: "#010101",
      subtitle: "Trends + creators",
      children: [
        {label: "Creator Collabs", color: "#06b6d4"},
        {label: "Trend Hooks", subtitle: "Dialogues + hacks"},
      ],
    },
    {
      label: "YouTube Series",
      color: "#ff0000",
      subtitle: "Educational + software",
      children: [
        {label: "Product Walkthroughs"},
        {label: "Community Highlights", color: "#f97316"},
      ],
    },
  ],
};

const sanitizeId = (value?: string) =>
  (value ?? "branch")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") || "branch";

const normalizeHex = (hex: string) => {
  const normalized = hex.replace("#", "").trim();
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return [255, 255, 255];
  }
  const value = parseInt(expanded, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const blendWithWhite = (hex: string, amount: number) => {
  const [r, g, b] = normalizeHex(hex);
  const mix = (channel: number) =>
    Math.round(channel + (255 - channel) * Math.min(1, Math.max(0, amount)));
  const toHex = (value: number) => value.toString(16).padStart(2, "0");
  return `#${[mix(r), mix(g), mix(b)].map(toHex).join("")}`;
};

const parseTree = (input?: BranchTreeNode | string): BranchTreeNode => {
  const normalizeNode = (node?: BranchTreeNode): BranchTreeNode | null => {
    if (!node || typeof node.label !== "string" || !node.label.trim()) {
      return null;
    }
    const children =
      Array.isArray(node.children) && node.children.length > 0
        ? node.children
            .map(normalizeNode)
            .filter((child): child is BranchTreeNode => child !== null)
        : undefined;

    return {
      label: node.label.trim(),
      subtitle: typeof node.subtitle === "string" ? node.subtitle.trim() : undefined,
      color: typeof node.color === "string" ? node.color.trim() : undefined,
      children,
    };
  };

  if (!input) {
    return fallbackTree;
  }

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      const normalized = normalizeNode(parsed);
      return normalized ?? fallbackTree;
    } catch {
      return fallbackTree;
    }
  }

  const normalized = normalizeNode(input);
  return normalized ?? fallbackTree;
};

type NodeInstance = BranchTreeNode & {
  id: string;
  depth: number;
  parentId?: string;
};

type TreeStructure = {
  nodes: NodeInstance[];
  nodesByDepth: Map<number, NodeInstance[]>;
  nodeById: Map<string, NodeInstance>;
  depthIndexMap: Map<string, number>;
  maxDepth: number;
};

const buildTreeStructure = (root: BranchTreeNode): TreeStructure => {
  const nodes: NodeInstance[] = [];
  const nodesByDepth = new Map<number, NodeInstance[]>();
  const nodeById = new Map<string, NodeInstance>();
  const depthIndexMap = new Map<string, number>();
  let counter = 0;

  const traverse = (node: BranchTreeNode, depth = 0, parentId?: string) => {
    const id = `${parentId ?? "root"}-${depth}-${sanitizeId(node.label)}-${counter++}`;
    const instance: NodeInstance = {
      ...node,
      depth,
      parentId,
      id,
    };
    nodes.push(instance);
    nodeById.set(id, instance);
    const depthList = nodesByDepth.get(depth) ?? [];
    depthIndexMap.set(id, depthList.length);
    depthList.push(instance);
    nodesByDepth.set(depth, depthList);
    if (node.children?.length) {
      node.children.forEach((child) => traverse(child, depth + 1, id));
    }
  };

  traverse(root);
  const maxDepth = nodes.reduce((max, node) => Math.max(max, node.depth), 0);
  return {nodes, nodesByDepth, nodeById, depthIndexMap, maxDepth};
};

type ConnectorDatum = {
  childId: string;
  depth: number;
  path: string;
  length: number;
};

const pathFromPoints = (points: Array<{x: number; y: number}>) =>
  points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");

const pathLength = (points: Array<{x: number; y: number}>) => {
  if (points.length < 2) {
    return 0;
  }
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.hypot(dx, dy);
  }
  return total;
};

export type BranchTreeExpansionProps = {
  tree?: BranchTreeNode | string;
  durationInFrames: number;
  accentColor?: string;
};

export const BranchTreeExpansion: React.FC<BranchTreeExpansionProps> = ({
  tree,
  durationInFrames,
  accentColor = "#7c3aed",
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const resolvedTree = useMemo(() => parseTree(tree), [tree]);
  const {
    nodes,
    nodesByDepth,
    nodeById,
    depthIndexMap,
    maxDepth,
  } = useMemo(() => buildTreeStructure(resolvedTree), [resolvedTree]);

  const chartWidth = Math.max(520, Math.min(1100, Math.floor(width * 0.92)));
  const heightCap = Math.max(260, Math.min(540, Math.floor(height * 0.6)));
  const baseYOffset = 70;
  const extraBottom = 40;
  const depthCount = Math.max(1, maxDepth + 1);
  const verticalGap =
    depthCount > 1
      ? Math.max(60, (heightCap - baseYOffset - extraBottom) / (depthCount - 1))
      : 0;
  const svgHeight =
    depthCount > 1 ? baseYOffset + (depthCount - 1) * verticalGap + extraBottom : heightCap;
  const containerHeight = svgHeight + 30;

  const layoutData = useMemo(() => {
    const nodePositions = new Map<string, {x: number; y: number}>();
    nodesByDepth.forEach((depthNodes, depth) => {
      const slotWidth = chartWidth / Math.max(depthNodes.length + 1, 2);
      depthNodes.forEach((node, index) => {
        const x = slotWidth * (index + 1);
        const y =
          depthCount > 1
            ? baseYOffset + depth * verticalGap
            : heightCap / 2;
        nodePositions.set(node.id, {x, y});
      });
    });

    const connectors: ConnectorDatum[] = [];
    nodes.forEach((node) => {
      if (!node.parentId) {
        return;
      }
      const parent = nodeById.get(node.parentId);
      const start = parent ? nodePositions.get(parent.id) : undefined;
      const end = nodePositions.get(node.id);
      if (!start || !end) {
        return;
      }
      const midY = (start.y + end.y) / 2;
      const points = [
        {x: start.x, y: start.y},
        {x: start.x, y: midY},
        {x: end.x, y: midY},
        {x: end.x, y: end.y},
      ];
      connectors.push({
        childId: node.id,
        depth: node.depth,
        path: pathFromPoints(points),
        length: pathLength(points),
      });
    });

    return {nodePositions, connectors};
  }, [
    baseYOffset,
    chartWidth,
    depthCount,
    heightCap,
    nodeById,
    nodes,
    nodesByDepth,
    verticalGap,
  ]);

  const {nodePositions, connectors} = layoutData;
  const gradientId = `branch-flow-${sanitizeId(resolvedTree.label)}`;
  const connectorDelayStep = Math.max(12, Math.round(fps * 0.28));
  const connectorDrawDuration = Math.max(18, Math.round(fps * 0.3));
  const accentLighter = blendWithWhite(accentColor, 0.4);
  const accentGlow = blendWithWhite(accentColor, 0.6);

  const nodeSize = 150;
  const depthSpacingFrames = Math.max(14, Math.round(fps * 0.32));
  const nodeFadeDuration = Math.min(18, Math.max(10, Math.round(fps * 0.2)));
  const nodeHoldFrames = Math.max(12, Math.round(fps * 0.2));

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        background: "transparent",
      }}
    >
      <div
        style={{
          width: chartWidth,
          height: containerHeight,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: chartWidth,
            height: containerHeight,
            position: "relative",
            fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          }}
        >
          <svg
            width={chartWidth}
            height={svgHeight}
            style={{position: "absolute", inset: 0, pointerEvents: "none"}}
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={accentColor} stopOpacity={0.95} />
                <stop offset="60%" stopColor={accentLighter} stopOpacity={0.7} />
                <stop offset="100%" stopColor={accentGlow} stopOpacity={0.5} />
              </linearGradient>
            </defs>
            {connectors.map((connector) => {
              const drawStart = Math.max(0, connector.depth * connectorDelayStep - 6);
              const drawProgress = interpolate(
                frame,
                [drawStart, drawStart + connectorDrawDuration],
                [0, 1],
                {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
              );
              const connectorOpacity = interpolate(
                frame,
                [drawStart, drawStart + connectorDrawDuration * 0.4, durationInFrames - 12, durationInFrames],
                [0, 1, 1, 0],
                {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
              );
              return (
                <path
                  key={`connector-${connector.childId}`}
                  d={connector.path}
                  stroke={`url(#${gradientId})`}
                  strokeWidth={4}
                  fill="none"
                  opacity={connectorOpacity}
                  strokeDasharray={connector.length || 1}
                  strokeDashoffset={(1 - drawProgress) * (connector.length || 1)}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}
          </svg>
          {nodes.map((node) => {
            const position = nodePositions.get(node.id);
            if (!position) {
              return null;
            }
            const depthIndex = depthIndexMap.get(node.id) ?? 0;
            const appearStart = depthIndex * 4 + depthSpacingFrames * node.depth + 2;
            const fadeOutStartBase = Math.max(
              durationInFrames - 12,
              appearStart + nodeFadeDuration + nodeHoldFrames
            );
            const maxFadeOutStart = Math.max(0, durationInFrames - 1);
            const fadeOutStart = Math.min(maxFadeOutStart, fadeOutStartBase);
            const fadeOutEnd = Math.min(durationInFrames, fadeOutStart + 10);
            const opacity = interpolate(
              frame,
              [appearStart, appearStart + nodeFadeDuration, fadeOutStart, fadeOutEnd],
              [0, 1, 1, 0],
              {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
            );
            const appearProgress = interpolate(
              frame,
              [appearStart, appearStart + nodeFadeDuration],
              [0, 1],
              {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
            );
            const floatX = Math.cos((frame - appearStart) / 12) * 1.6;
            const floatY = Math.sin((frame - appearStart) / 14) * 2.5;
            const translateY =
              (1 - appearProgress) * (25 + node.depth * 6) + (node.depth === 0 ? -4 : 0) + floatY;
            const rotation = Math.sin((frame - appearStart) / 18) * 1.2;
            const baseScale = interpolate(
              frame,
              [appearStart, appearStart + nodeFadeDuration * 0.6, appearStart + nodeFadeDuration],
              [0.68, 1.15, 1],
              {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
            );
            const rootBoost =
              node.depth === 0
                ? spring({frame, fps, config: {damping: 16, mass: 1}}) * 0.07
                : 0;
            const nodeColor = node.color ?? accentColor;
            const haloOpacity =
              opacity *
              ((node.depth === 0 ? 0.75 : 0.45) + Math.abs(Math.sin((frame - appearStart) / 10)) * 0.25);
            return (
              <div
                key={`node-${node.id}`}
                style={{
                  position: "absolute",
                  left: position.x - nodeSize / 2 + floatX,
                  top: position.y - nodeSize / 2 + translateY,
                  width: nodeSize,
                  height: nodeSize,
                  borderRadius: 38,
                  transform: `scale(${baseScale + rootBoost}) rotate(${rotation}deg)`,
                  opacity,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: -18,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${blendWithWhite(
                      nodeColor,
                      0.6
                    )} 0%, transparent 65%)`,
                    filter: "blur(18px)",
                    opacity: haloOpacity,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 34,
                    background: `linear-gradient(135deg, ${nodeColor}, ${blendWithWhite(
                      nodeColor,
                      0.3
                    )})`,
                    border: `2px solid ${blendWithWhite(nodeColor, 0.5)}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "18px 16px",
                    boxShadow: "0 25px 50px rgba(15,23,42,0.45)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      letterSpacing: 0.6,
                      textTransform: "uppercase",
                      color: "#fff",
                      textShadow: "0 2px 12px rgba(15,23,42,0.4)",
                      marginBottom: node.subtitle ? 6 : 0,
                    }}
                  >
                    {node.label}
                  </div>
                  {node.subtitle && (
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#e2e8f0",
                        opacity: 0.9,
                        letterSpacing: 0.4,
                      }}
                    >
                      {node.subtitle}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

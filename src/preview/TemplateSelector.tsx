import React, {useState, useEffect} from "react";
import type {CSSProperties} from "react";
import {templateManifest} from "../core/utils/manifest";

type TemplateSelectorProps = {
  value?: string;
  onSelect: (id: string) => void;
  minimal?: boolean;
  style?: CSSProperties;
};

const templates = templateManifest.map((template) => template.id);

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({value, onSelect, minimal = false, style}) => {
  const [selected, setSelected] = useState(value ?? templates[0] ?? "template0");

  useEffect(() => {
    if (value && value !== selected) {
      setSelected(value);
    }
  }, [value, selected]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelected(event.target.value);
    onSelect(event.target.value);
  };

  const baseStyle: CSSProperties = minimal
    ? {
        position: "absolute",
        top: 12,
        left: 12,
        zIndex: 5,
        background: "rgba(2,6,23,0.75)",
        color: "#f8fafc",
        padding: "6px 10px",
        borderRadius: 999,
        fontFamily: "Inter, sans-serif",
        border: "1px solid rgba(248,250,252,0.15)",
        boxShadow: "0 8px 20px rgba(2,6,23,0.55)",
      }
    : {
        position: "absolute",
        top: 16,
        left: 16,
        zIndex: 999,
        background: "rgba(0,0,0,0.45)",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: 8,
        fontFamily: "monospace",
        display: "flex",
        gap: 8,
        alignItems: "center",
      };

  return (
    <div style={{...baseStyle, ...style}}>
      {minimal ? null : <label htmlFor="template-selector">🎬 Template:</label>}
      <select
        id="template-selector"
        value={selected}
        onChange={handleChange}
        style={
          minimal
            ? {
                border: "none",
                background: "transparent",
                color: "inherit",
                fontWeight: 600,
                textTransform: "capitalize",
              }
            : undefined
        }
      >
        {templates.map((templateId) => (
          <option key={templateId} value={templateId}>
            {templateId}
          </option>
        ))}
      </select>
    </div>
  );
};

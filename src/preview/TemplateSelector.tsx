import React, {useState, useEffect} from "react";
import {templateManifest} from "../core/utils/manifest";

type TemplateSelectorProps = {
  value?: string;
  onSelect: (id: string) => void;
};

const templates = templateManifest.map((template) => template.id);

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({value, onSelect}) => {
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

  return (
    <div
      style={{
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
      }}
    >
      <label htmlFor="template-selector">🎬 Template:</label>
      <select id="template-selector" value={selected} onChange={handleChange}>
        {templates.map((templateId) => (
          <option key={templateId} value={templateId}>
            {templateId}
          </option>
        ))}
      </select>
    </div>
  );
};

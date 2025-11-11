import template0 from "../../templates/template0/template.json";
import template1 from "../../templates/template1/template.json";
import template2 from "../../templates/template2/template.json";

export type TemplateMetadata = {
  id: string;
  name: string;
  description: string;
  rules?: Record<string, string>;
  audio?: {
    bgm?: string;
    sfxFallback?: string;
  };
  [key: string]: unknown;
};

export const templateManifest: TemplateMetadata[] = [template0, template1, template2];

export const findTemplateMeta = (id: string) => templateManifest.find((item) => item.id === id);

import type {FC} from "react";
import type {LoadedPlan} from "./types";
import {Template0} from "../templates/template0/composition";
import {Template1} from "../templates/template1/composition";
import {Template2} from "../templates/template2/composition";

export type TemplateComponent = FC<{plan: LoadedPlan}>;

const templateRegistry: Record<string, TemplateComponent> = {
  template0: Template0,
  template1: Template1,
  template2: Template2,
};

export const getTemplateById = (id: string): TemplateComponent => {
  return templateRegistry[id] ?? Template0;
};

export const listAvailableTemplates = () => Object.keys(templateRegistry);

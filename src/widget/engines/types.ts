import { CustomColors } from "../WidgetStateProvider"

export interface EngineOptions {
  mapperMappings?: Record<string, string>;
  forceOverride?: boolean;
  variableFormats?: Record<string, string>;
}

export interface InjectionEngine {
  apply: (colors: CustomColors, radius: number | null, targetElement: HTMLElement, options?: EngineOptions) => void;
  cleanup: (targetElement: HTMLElement, options?: EngineOptions) => void;
}

import { InjectionEngine } from "./types"
import { CustomEngine } from "./custom-engine"
import { MapperEngine } from "./mapper-engine"

export * from "./types"

export const Engines: Record<string, InjectionEngine> = {
  custom: CustomEngine,
  mapper: MapperEngine,
  // Other engines will be added here
}

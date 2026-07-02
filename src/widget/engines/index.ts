import { InjectionEngine } from "./types"
import { CustomEngine } from "./custom-engine"
import { OverrideEngine } from "./override-engine"

export * from "./types"

export const Engines: Record<string, InjectionEngine> = {
  custom: CustomEngine,
  override: OverrideEngine,
}

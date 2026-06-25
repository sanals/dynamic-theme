import { InjectionEngine } from "./types"
import { CustomEngine } from "./custom-engine"
import { MapperEngine } from "./mapper-engine"
import { ForcerEngine } from "./forcer-engine"
import { CssomEngine } from "./cssom-engine"

export * from "./types"

export const Engines: Record<string, InjectionEngine> = {
  custom: CustomEngine,
  mapper: MapperEngine,
  forcer: ForcerEngine,
  cssom: CssomEngine,
}

import { InjectionEngine } from "./types"
import { CustomEngine } from "./custom-engine"
import { MapperEngine } from "./mapper-engine"
import { StMgrEngine } from "./st-mgr-engine"
import { ThCtrlEngine } from "./th-ctrl-engine"

export * from "./types"

export const Engines: Record<string, InjectionEngine> = {
  custom: CustomEngine,
  mapper: MapperEngine,
  stMgr: StMgrEngine,
  thCtrl: ThCtrlEngine,
}

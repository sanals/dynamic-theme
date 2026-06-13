"use client"

import { DesignControls } from "@/components/design-controls"

export function GlobalDesignWidget() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] shadow-2xl rounded-xl border border-border/20 bg-background/80 backdrop-blur-md p-2 max-w-[90vw] overflow-x-auto">
      <DesignControls />
    </div>
  )
}

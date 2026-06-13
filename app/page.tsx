"use client"

import { useDesign } from "@/components/providers/design-provider"
import { RakeryShell } from "@/components/designs/rakery-shell"
import { H2NShell } from "@/components/designs/h2n-shell"
import { SynthesisShell } from "@/components/designs/synthesis-shell"
import { DholeishShell } from "@/components/designs/dholeish-shell"
import { useEffect, useState } from "react"

export default function Page() {
  const { activeDesign } = useDesign()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-background" /> // Prevent hydration mismatch flash
  }

  if (activeDesign === "dholeish") return <DholeishShell />
  if (activeDesign === "synthesis") return <SynthesisShell />
  if (activeDesign === "h2n") return <H2NShell />
  return <RakeryShell />
}

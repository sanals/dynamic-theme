"use client"

import { useEffect, useRef, useState } from "react"
import { DesignControls } from "@/components/design-controls"
import { GripHorizontal, Minimize2, Palette } from "lucide-react"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "global-widget-state"

type WidgetPos = { x: number; y: number }

export function GlobalDesignWidget() {
  const widgetRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  
  const [isMinimized, setIsMinimized] = useState(false)
  const [pos, setPos] = useState<WidgetPos | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const dragStartMouse = useRef({ x: 0, y: 0 })
  const dragStartPos = useRef({ x: 0, y: 0 })
  const clickStart = useRef({ x: 0, y: 0, time: 0 })
  const widgetSize = useRef({ width: 0, height: 0 })

  // Hydrate from localStorage
  useEffect(() => {
    setMounted(true)
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const state = JSON.parse(stored)
        if (state.isMinimized !== undefined) setIsMinimized(state.isMinimized)
        if (state.pos) setPos(state.pos)
      }
    } catch (e) {
      console.error("Failed to load widget state", e)
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (mounted) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ isMinimized, pos }))
    }
  }, [mounted, isMinimized, pos])

  // Clamp position to window bounds on resize
  useEffect(() => {
    if (!pos || !widgetRef.current) return
    const clampPos = () => {
      const rect = widgetRef.current!.getBoundingClientRect()
      // Use max(0) for dimensions in case it's hidden or very small
      const maxX = Math.max(0, window.innerWidth - rect.width)
      const maxY = Math.max(0, window.innerHeight - rect.height)
      
      const newX = Math.max(0, Math.min(pos.x, maxX))
      const newY = Math.max(0, Math.min(pos.y, maxY))
      
      if (newX !== pos.x || newY !== pos.y) {
        setPos({ x: newX, y: newY })
      }
    }
    
    window.addEventListener('resize', clampPos)
    // We intentionally don't call it immediately on mount because the widget 
    // might still be rendering its full width. Rely on the user dragging it.
    return () => window.removeEventListener('resize', clampPos)
  }, [pos])


  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    
    if (!isMinimized) {
      // Don't drag if clicking interactive elements or pickers
      if (
        target.closest("button") || 
        target.closest("input") || 
        target.closest("select") ||
        target.closest("textarea") ||
        target.closest("[draggable]")
      ) {
        return
      }
    }

    e.preventDefault() // Prevent text selection
    setIsDragging(true)
    
    // Calculate current absolute pos and cache dimensions
    const rect = widgetRef.current!.getBoundingClientRect()
    widgetSize.current = { width: rect.width, height: rect.height }

    let currentX = pos?.x
    let currentY = pos?.y
    if (currentX === undefined || currentY === undefined) {
      currentX = rect.left
      currentY = rect.top
      setPos({ x: currentX, y: currentY })
    }

    dragStartMouse.current = { x: e.clientX, y: e.clientY }
    dragStartPos.current = { x: currentX, y: currentY }
    clickStart.current = { x: e.clientX, y: e.clientY, time: Date.now() }
    
    target.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !widgetRef.current) return
    
    const dx = e.clientX - dragStartMouse.current.x
    const dy = e.clientY - dragStartMouse.current.y
    
    let newX = dragStartPos.current.x + dx
    let newY = dragStartPos.current.y + dy
    
    // Bounds checking during drag using cached dimensions (NO REFLOW!)
    const maxX = window.innerWidth - widgetSize.current.width
    const maxY = window.innerHeight - widgetSize.current.height
    
    newX = Math.max(0, Math.min(newX, maxX))
    newY = Math.max(0, Math.min(newY, maxY))
    
    setPos({ x: newX, y: newY })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setIsDragging(false)
    const target = e.target as HTMLElement
    if (target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId)
    }

    // Detect click vs drag on the minimized pill
    const dx = Math.abs(e.clientX - clickStart.current.x)
    const dy = Math.abs(e.clientY - clickStart.current.y)
    const dt = Date.now() - clickStart.current.time
    if (isMinimized && dx < 5 && dy < 5 && dt < 300) {
      setIsMinimized(false)
    }
  }

  if (!mounted) return null

  return (
    <div
      ref={widgetRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={pos ? { 
        left: pos.x, 
        top: pos.y,
        transition: isDragging ? "none" : undefined
      } : undefined}
      className={cn(
        "fixed z-[100] shadow-2xl transition-all duration-200 ease-out",
        !pos && "bottom-6 left-1/2 -translate-x-1/2",
        isDragging && "transition-none select-none",
        isMinimized 
          ? "rounded-full bg-primary text-primary-foreground p-3.5 cursor-grab active:cursor-grabbing hover:bg-primary/90 hover:scale-105 transition-transform"
          : "rounded-xl border border-border/20 bg-background/80 backdrop-blur-md p-3 flex items-center gap-3 w-fit max-w-[95vw] cursor-grab active:cursor-grabbing"
      )}
    >
      {isMinimized ? (
        <Palette className="size-6 pointer-events-none text-white" />
      ) : (
        <div className="overflow-x-auto overflow-y-hidden no-scrollbar max-w-[90vw] w-fit pr-2">
          <DesignControls onMinimize={() => setIsMinimized(true)} />
        </div>
      )}
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { DesignControls } from "@/components/design-controls"
import { Palette } from "lucide-react"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "global-widget-state"

type WidgetPos = { x: number; y: number }

export function GlobalDesignWidget({ isStandalone = false }: { isStandalone?: boolean }) {
  const widgetRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  
  const [isMinimized, setIsMinimized] = useState(false)
  const [pos, setPos] = useState<WidgetPos | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const dragStartMouse = useRef({ x: 0, y: 0 })
  const dragStartPos = useRef({ x: 0, y: 0 })
  const clickStart = useRef({ x: 0, y: 0, time: 0 })
  const widgetSize = useRef({ width: 0, height: 0 })

  const isDraggingRef = useRef(false)
  const currentPosRef = useRef<WidgetPos | null>(null)

  // Hydrate from localStorage
  useEffect(() => {
    setMounted(true)
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const state = JSON.parse(stored)
        if (state.isMinimized !== undefined) setIsMinimized(state.isMinimized)
        if (state.pos) {
          setPos(state.pos)
          currentPosRef.current = state.pos
        }
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
        const newPos = { x: newX, y: newY }
        setPos(newPos)
        currentPosRef.current = newPos
      }
    }
    
    window.addEventListener('resize', clampPos)
    // We intentionally don't call it immediately on mount because the widget 
    // might still be rendering its full width. Rely on the user dragging it.
    return () => window.removeEventListener('resize', clampPos)
  }, [pos])


  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    let target = e.target as Node
    if (target.nodeType === Node.TEXT_NODE && target.parentElement) {
      target = target.parentElement
    }
    const targetEl = target as HTMLElement
    
    if (!isMinimized) {
      // Don't drag if clicking interactive elements or pickers
      if (
        targetEl.closest("button") || 
        targetEl.closest("input") || 
        targetEl.closest("select") ||
        targetEl.closest("textarea") ||
        targetEl.closest("[draggable]")
      ) {
        return
      }
    }

    e.preventDefault() // Prevent text selection
    isDraggingRef.current = true
    setIsDragging(true)
    
    // Calculate current absolute pos and cache dimensions
    const rect = widgetRef.current!.getBoundingClientRect()
    widgetSize.current = { width: rect.width, height: rect.height }

    let currentX = pos?.x
    let currentY = pos?.y
    if (currentX === undefined || currentY === undefined) {
      currentX = rect.left
      currentY = rect.top
      const initialPos = { x: currentX, y: currentY }
      setPos(initialPos)
      currentPosRef.current = initialPos
    }

    dragStartMouse.current = { x: e.clientX, y: e.clientY }
    dragStartPos.current = { x: currentX, y: currentY }
    clickStart.current = { x: e.clientX, y: e.clientY, time: Date.now() }
    
    if (widgetRef.current) {
      widgetRef.current.setPointerCapture(e.pointerId)
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !widgetRef.current) return
    
    const dx = e.clientX - dragStartMouse.current.x
    const dy = e.clientY - dragStartMouse.current.y
    
    let newX = dragStartPos.current.x + dx
    let newY = dragStartPos.current.y + dy
    
    // Bounds checking during drag using cached dimensions (NO REFLOW!)
    const maxX = window.innerWidth - widgetSize.current.width
    const maxY = window.innerHeight - widgetSize.current.height
    
    newX = Math.max(0, Math.min(newX, maxX))
    newY = Math.max(0, Math.min(newY, maxY))
    
    currentPosRef.current = { x: newX, y: newY }
    widgetRef.current.style.left = `${newX}px`
    widgetRef.current.style.top = `${newY}px`
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    setIsDragging(false)
    
    if (widgetRef.current && widgetRef.current.hasPointerCapture(e.pointerId)) {
      widgetRef.current.releasePointerCapture(e.pointerId)
    }

    if (currentPosRef.current) {
      setPos(currentPosRef.current)
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
        "fixed z-[100] shadow-2xl transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out",
        !pos && "bottom-6 right-6",
        isDragging && "transition-none select-none",
        isMinimized 
          ? "rounded-full bg-primary text-primary-foreground p-3.5 cursor-grab active:cursor-grabbing hover:bg-primary/90 hover:scale-105 transition-transform"
          : "rounded-xl border border-foreground/15 ring-1 ring-foreground/5 bg-background/80 backdrop-blur-md p-3 flex items-center gap-3 w-fit max-w-[95vw] cursor-grab active:cursor-grabbing"
      )}
    >
      {isMinimized ? (
        <div className="animate-in fade-in zoom-in-90 duration-200">
          <Palette className="size-6 pointer-events-none text-white" />
        </div>
      ) : (
        <div className="max-w-[90vw] w-fit pr-2 animate-in fade-in zoom-in-95 duration-200">
          <DesignControls isStandalone={isStandalone} onMinimize={() => setIsMinimized(true)} />
        </div>
      )}
    </div>
  )
}

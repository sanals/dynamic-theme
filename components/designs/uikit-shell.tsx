import React, { useState, useRef } from "react"
import { 
  Search, Check, ChevronRight, AlertCircle, 
  Mail, Lock, Loader2, GripVertical, 
  Upload, User, Settings, Home, CreditCard,
  Plus, ChevronLeft,
  XCircle, AlignLeft, AlignCenter, AlignRight
} from "lucide-react"
import { cn } from "@/lib/utils"

export function UiKitShell() {
  // States for interactive elements
  const [toggleOn, setToggleOn] = useState(true)
  const [sliderVal, setSliderVal] = useState(50)
  const [activeTab, setActiveTab] = useState("Account")
  
  const [activeView, setActiveView] = useState("Grid")
  const [activeAlign, setActiveAlign] = useState("Left")
  
  const [isBtnLoading, setIsBtnLoading] = useState(false)
  const [isBtnSuccess, setIsBtnSuccess] = useState(false)
  
  const [checkboxTerms, setCheckboxTerms] = useState(true)
  const [radioPayment, setRadioPayment] = useState("Credit Card")
  
  const [activePage, setActivePage] = useState(1)
  
  const [emailValue, setEmailValue] = useState("Invalid email format")
  const [emailError, setEmailError] = useState(true)

  // Drag and Upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [isDraggingFile, setIsDraggingFile] = useState(false)

  // Draggable Items state
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [listItems, setListItems] = useState([
    { id: 1, title: "Draggable Item 1", desc: "Sortable list item", icon: <User className="size-4 text-secondary-foreground" /> },
    { id: 2, title: "Draggable Item 2", desc: "Sortable list item", icon: <Settings className="size-4 text-secondary-foreground" /> }
  ])

  const handleDragStart = (index: number) => setDraggedItem(index)
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedItem === null || draggedItem === index) return
    const newItems = [...listItems]
    const item = newItems.splice(draggedItem, 1)[0]
    newItems.splice(index, 0, item)
    setDraggedItem(index)
    setListItems(newItems)
  }

  const simulateLoading = () => {
    setIsBtnLoading(true)
    setTimeout(() => {
      setIsBtnLoading(false)
      setIsBtnSuccess(true)
      setTimeout(() => setIsBtnSuccess(false), 2000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-inner">
              <span className="text-primary-foreground font-black text-sm">UI</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Component Library</h1>
          </div>
          <div className="flex items-center gap-6 text-sm font-semibold text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors hidden sm:block">Foundation</span>
            <span className="hover:text-foreground cursor-pointer transition-colors hidden sm:block">Components</span>
            <span className="hover:text-foreground cursor-pointer transition-colors hidden sm:block">Patterns</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-12 max-w-6xl flex flex-col gap-24">
        
        {/* Intro */}
        <section className="flex flex-col gap-5 max-w-3xl">
          {/* Breadcrumbs moved to top */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <a href="#" className="hover:text-primary transition-colors flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-md"><Home className="size-3" /> Home</a>
            <ChevronRight className="size-3.5 opacity-50" />
            <a href="#" className="hover:text-primary transition-colors bg-muted/30 px-2 py-1 rounded-md">Components</a>
            <ChevronRight className="size-3.5 opacity-50" />
            <span className="text-foreground font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md">Breadcrumb</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter">Design System</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            An exhaustive catalog of UI elements. This environment rigorously tests the active theme across hundreds of atomic variations, interactive states, and complex structures. All elements here are fully interactive.
          </p>
        </section>

        {/* 1. FOUNDATION */}
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-2 border-b border-border pb-4">
            <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">1. Foundation</h2>
            <h3 className="text-3xl font-bold tracking-tight">Colors & Typography</h3>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
            <ColorSwatch name="Background" bgClass="bg-background" textClass="text-foreground" borderClass="border-border" />
            <ColorSwatch name="Foreground" bgClass="bg-foreground" textClass="text-background" />
            <ColorSwatch name="Card" bgClass="bg-card" textClass="text-card-foreground" borderClass="border-border/50" />
            <ColorSwatch name="Primary" bgClass="bg-primary" textClass="text-primary-foreground" />
            <ColorSwatch name="Secondary" bgClass="bg-secondary" textClass="text-secondary-foreground" />
            <ColorSwatch name="Muted" bgClass="bg-muted" textClass="text-muted-foreground" />
            <ColorSwatch name="Border" bgClass="bg-border" textClass="text-foreground" />
          </div>

          {/* Typography */}
          <div className="flex flex-col gap-10 bg-card border border-border/50 rounded-2xl p-8 sm:p-12 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-12">
              <span className="text-sm text-muted-foreground font-mono w-24 shrink-0">h1</span>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tighter">The quick brown fox</h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-12">
              <span className="text-sm text-muted-foreground font-mono w-24 shrink-0">h2</span>
              <h2 className="text-4xl font-bold tracking-tight border-b border-border pb-2">Jumps over the lazy dog</h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-12">
              <span className="text-sm text-muted-foreground font-mono w-24 shrink-0">h3</span>
              <h3 className="text-2xl font-semibold tracking-tight">Pack my box with five dozen</h3>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-12">
              <span className="text-sm text-muted-foreground font-mono w-24 shrink-0">p (body)</span>
              <p className="text-base leading-7 max-w-3xl">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, <span className="font-bold">quis nostrud exercitation</span> ullamco laboris nisi ut aliquip ex ea commodo consequat. <a href="#" className="text-primary hover:underline font-medium">Learn more here</a>.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-12">
              <span className="text-sm text-muted-foreground font-mono w-24 shrink-0">blockquote</span>
              <blockquote className="border-l-4 border-primary pl-6 italic text-lg text-muted-foreground max-w-2xl">
                "Design is not just what it looks like and feels like. Design is how it works."
              </blockquote>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-12">
              <span className="text-sm text-muted-foreground font-mono w-24 shrink-0">inline code</span>
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                console.log("Hello UI Kit")
              </code>
            </div>
          </div>
        </div>

        {/* 2. INTERACTIVE */}
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-2 border-b border-border pb-4">
            <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">2. Interactive Elements</h2>
            <h3 className="text-3xl font-bold tracking-tight">Buttons & Inputs</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Buttons */}
            <div className="flex flex-col gap-8">
              <h4 className="text-lg font-semibold border-b border-border/50 pb-2">Button Variants</h4>
              
              <div className="flex flex-wrap gap-4 items-center">
                <button className="h-10 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm">
                  Primary
                </button>
                <button className="h-10 px-4 py-2 rounded-md bg-secondary text-secondary-foreground font-medium text-sm hover:opacity-80 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm">
                  Secondary
                </button>
                <button className="h-10 px-4 py-2 rounded-md border border-border bg-background hover:bg-muted text-foreground font-medium text-sm active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm">
                  Outline
                </button>
                <button className="h-10 px-4 py-2 rounded-md bg-transparent hover:bg-muted text-foreground font-medium text-sm active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Ghost
                </button>
                <button className="h-10 px-4 py-2 rounded-md bg-red-500/10 text-red-500 dark:text-red-400 font-medium text-sm hover:bg-red-500 hover:text-white active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                  Destructive
                </button>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <button 
                  onClick={simulateLoading}
                  disabled={isBtnLoading}
                  className={cn(
                    "h-10 px-4 py-2 rounded-md text-primary-foreground font-medium text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95",
                    isBtnSuccess ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:opacity-90",
                    isBtnLoading && "opacity-70 cursor-not-allowed active:scale-100"
                  )}
                >
                  {isBtnLoading ? <Loader2 className="size-4 animate-spin" /> : isBtnSuccess ? <Check className="size-4" /> : <Mail className="size-4" />} 
                  {isBtnLoading ? "Sending..." : isBtnSuccess ? "Sent!" : "Send Email"}
                </button>
                <button disabled className="h-10 px-4 py-2 rounded-md border border-border bg-muted text-muted-foreground font-medium text-sm flex items-center gap-2 cursor-not-allowed">
                  <Lock className="size-4" /> Locked
                </button>
                <button className="size-10 rounded-md border border-border bg-background hover:bg-muted text-foreground flex items-center justify-center transition-colors shadow-sm active:scale-95">
                  <Plus className="size-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <button className="h-8 px-3 rounded-md bg-primary text-primary-foreground font-medium text-xs hover:opacity-90 active:scale-95 transition-all">
                  Small
                </button>
                <button className="h-10 px-4 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 active:scale-95 transition-all">
                  Default Size
                </button>
                <button className="h-12 px-8 rounded-md bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 active:scale-95 transition-all shadow-md">
                  Large Size
                </button>
              </div>

              {/* Toggle Buttons */}
              <h4 className="text-lg font-semibold border-b border-border/50 pb-2 mt-4">Toggle Buttons</h4>
              <div className="flex items-center p-1 rounded-lg bg-muted/50 border border-border w-fit">
                {["Grid", "List", "Map"].map(view => (
                  <button 
                    key={view} 
                    onClick={() => setActiveView(view)}
                    className={cn(
                      "h-8 px-4 rounded-md text-sm font-medium transition-colors", 
                      activeView === view ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {view}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 rounded-md border border-border p-1 w-fit bg-background">
                {[
                  { id: "Left", icon: <AlignLeft className="size-4" /> },
                  { id: "Center", icon: <AlignCenter className="size-4" /> },
                  { id: "Right", icon: <AlignRight className="size-4" /> }
                ].map(align => (
                  <button 
                    key={align.id}
                    onClick={() => setActiveAlign(align.id)}
                    className={cn(
                      "size-8 rounded-sm flex items-center justify-center transition-colors", 
                      activeAlign === align.id ? "bg-muted text-foreground shadow-inner" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {align.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs & Forms */}
            <div className="flex flex-col gap-8">
              <h4 className="text-lg font-semibold border-b border-border/50 pb-2">Inputs & Form Controls</h4>
              
              <div className="flex flex-col gap-6 max-w-sm">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Standard Input</label>
                  <input type="text" placeholder="Type here..." className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm transition-shadow" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Input with Icon</label>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input type="text" placeholder="Search components..." className="flex h-10 w-full rounded-md border border-border bg-background pl-10 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm transition-shadow" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className={cn("text-sm font-semibold transition-colors", emailError && "text-red-500 dark:text-red-400")}>
                    Validation State
                  </label>
                  <input 
                    type="text" 
                    value={emailValue}
                    onChange={(e) => {
                      setEmailValue(e.target.value)
                      setEmailError(false)
                    }}
                    onBlur={() => {
                      if (!emailValue.includes("@")) setEmailError(true)
                    }}
                    className={cn(
                      "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 shadow-sm transition-all", 
                      emailError 
                        ? "border-red-500 bg-red-500/5 text-red-500 focus-visible:ring-red-500" 
                        : "border-border text-foreground focus-visible:ring-primary placeholder:text-muted-foreground"
                    )} 
                  />
                  {emailError ? (
                    <p className="text-xs text-red-500 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200"><XCircle className="size-3" /> Please provide a valid email (must contain @).</p>
                  ) : (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 animate-in fade-in duration-200">Email format is valid.</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Textarea</label>
                  <textarea placeholder="Write a message..." rows={3} className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm resize-none transition-shadow" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3. CONTROLS */}
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-2 border-b border-border pb-4">
            <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">3. Form Controls & Sliders</h2>
            <h3 className="text-3xl font-bold tracking-tight">Selection & Ranges</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Checkboxes & Radio */}
            <div className="flex flex-col gap-6">
              <h4 className="text-lg font-semibold border-b border-border/50 pb-2">Checkboxes & Radios</h4>
              
              <div className="flex flex-col gap-4">
                <label 
                  className="flex items-start gap-3 cursor-pointer group"
                  onClick={(e) => { e.preventDefault(); setCheckboxTerms(!checkboxTerms) }}
                >
                  <div className={cn(
                    "mt-0.5 size-5 shrink-0 rounded border flex items-center justify-center shadow-sm transition-colors", 
                    checkboxTerms ? "border-primary bg-primary" : "border-border bg-background group-hover:border-primary"
                  )}>
                    {checkboxTerms && <Check className="size-3.5 text-primary-foreground animate-in zoom-in duration-150" strokeWidth={3} />}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium leading-none group-hover:text-primary transition-colors">Accept Terms</span>
                    <span className="text-xs text-muted-foreground leading-normal">You agree to our terms of service and privacy policy.</span>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer group opacity-50">
                  <div className="mt-0.5 size-5 shrink-0 rounded border border-border bg-background flex items-center justify-center">
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium leading-none">Disabled Checkbox</span>
                  </div>
                </label>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                {["Credit Card", "PayPal", "Apple Pay"].map(radio => (
                  <label 
                    key={radio}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={(e) => { e.preventDefault(); setRadioPayment(radio) }}
                  >
                    <div className={cn(
                      "size-4 shrink-0 rounded-full border flex items-center justify-center transition-colors shadow-sm", 
                      radioPayment === radio ? "border-primary" : "border-border bg-background group-hover:border-primary"
                    )}>
                      {radioPayment === radio && <div className="size-2 rounded-full bg-primary animate-in zoom-in duration-150" />}
                    </div>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{radio}</span>
                  </label>
                ))}
                
                <label className="flex items-center gap-3 cursor-not-allowed group opacity-50">
                  <div className="size-4 shrink-0 rounded-full border border-border bg-background flex items-center justify-center" />
                  <span className="text-sm font-medium">Disabled Option</span>
                </label>
              </div>
            </div>

            {/* Switches & Sliders */}
            <div className="flex flex-col gap-6">
              <h4 className="text-lg font-semibold border-b border-border/50 pb-2">Switches & Sliders</h4>
              
              <div className="flex flex-col gap-6">
                <div 
                  className="flex items-center justify-between bg-card border border-border/50 p-4 rounded-xl shadow-sm cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setToggleOn(!toggleOn)}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold">Enable Notifications</span>
                    <span className="text-xs text-muted-foreground">Receive push alerts.</span>
                  </div>
                  <button 
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-inner",
                      toggleOn ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span className={cn("pointer-events-none block size-5 rounded-full bg-background shadow ring-0 transition-transform duration-200 ease-in-out", toggleOn ? "translate-x-5" : "translate-x-0")} />
                  </button>
                </div>

                <div className="flex flex-col gap-3 bg-card border border-border/50 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">Volume Control</label>
                    <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{sliderVal}%</span>
                  </div>
                  <div className="relative w-full h-2 flex items-center">
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={sliderVal}
                      onChange={(e) => setSliderVal(parseInt(e.target.value))}
                      className="absolute w-full h-2 bg-muted rounded-full appearance-none cursor-pointer z-10 opacity-0" 
                    />
                    <div className="absolute w-full h-2 bg-muted rounded-full overflow-hidden pointer-events-none">
                      <div className="h-full bg-primary pointer-events-none" style={{ width: `${sliderVal}%` }} />
                    </div>
                    <div 
                      className="absolute h-4 w-4 rounded-full bg-background border-2 border-primary shadow pointer-events-none transition-transform" 
                      style={{ left: `calc(${sliderVal}% - 8px)` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
                    <span>0</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Draggables & Upload */}
            <div className="flex flex-col gap-6">
              <h4 className="text-lg font-semibold border-b border-border/50 pb-2">Drag & Upload</h4>
              
              <div className="flex flex-col gap-3">
                {listItems.map((item, idx) => (
                  <div 
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    className={cn(
                      "flex items-center gap-3 bg-card border p-3 rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition-all group",
                      draggedItem === idx ? "scale-105 shadow-xl ring-2 ring-primary border-primary z-10" : "border-border/50 hover:border-primary/50"
                    )}
                  >
                    <GripVertical className="size-4 text-muted-foreground group-hover:text-primary transition-colors cursor-grab" />
                    <div className="size-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true) }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDraggingFile(false)
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setUploadedFileName(e.dataTransfer.files[0].name)
                  }
                }}
                className={cn(
                  "mt-2 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group", 
                  isDraggingFile ? "border-primary bg-primary/10 scale-[1.02]" : "border-border/60 hover:border-primary/50 bg-muted/20 hover:bg-muted/40",
                  uploadedFileName && "bg-primary/5 border-primary/30"
                )}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadedFileName(e.target.files[0].name)
                    }
                  }} 
                />
                <div className={cn("size-10 rounded-full flex items-center justify-center mb-1 transition-colors", uploadedFileName ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary group-hover:bg-primary/20")}>
                  {uploadedFileName ? <Check className="size-5" /> : <Upload className="size-5" />}
                </div>
                <span className={cn("text-sm font-semibold", uploadedFileName && "text-primary")}>
                  {uploadedFileName ? `Ready to upload: ${uploadedFileName}` : "Click or drag file to this area"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {uploadedFileName ? "Click to select a different file" : "Supports JPG, PNG and SVG."}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* 4. NAVIGATION & DISPLAY */}
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-2 border-b border-border pb-4">
            <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">4. Layout & Display</h2>
            <h3 className="text-3xl font-bold tracking-tight">Navigation & Data</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Tabs & Navigation */}
            <div className="flex flex-col gap-8">
              <h4 className="text-lg font-semibold border-b border-border/50 pb-2">Tabs & Breadcrumbs</h4>
              
              <div className="flex flex-col gap-6">
                {/* Tabs */}
                <div className="flex items-center p-1 bg-muted/50 border border-border rounded-lg w-full">
                  {["Account", "Password", "Settings", "Billing"].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "flex-1 h-9 rounded-md text-sm font-medium transition-all",
                        activeTab === tab 
                          ? "bg-background text-foreground shadow-sm" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="p-6 bg-card border border-border/50 rounded-xl shadow-sm min-h-[120px] transition-all animate-in fade-in duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    {activeTab === "Account" && <User className="size-4 text-primary" />}
                    {activeTab === "Password" && <Lock className="size-4 text-primary" />}
                    {activeTab === "Settings" && <Settings className="size-4 text-primary" />}
                    {activeTab === "Billing" && <CreditCard className="size-4 text-primary" />}
                    {activeTab} Preferences
                  </h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Make changes to your {activeTab.toLowerCase()} here. This content tab dynamically switches state, rendering different content while utilizing the theme's card backgrounds.
                  </p>
                </div>

                {/* Pagination */}
                <div className="flex items-center gap-1 mt-4">
                  <button 
                    onClick={() => setActivePage(Math.max(1, activePage - 1))}
                    disabled={activePage === 1}
                    className="h-9 px-3 rounded-md border border-border bg-background hover:bg-muted text-foreground flex items-center gap-1 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="size-4" /> Prev
                  </button>
                  {[1, 2, 3].map(page => (
                    <button 
                      key={page}
                      onClick={() => setActivePage(page)}
                      className={cn(
                        "size-9 rounded-md flex items-center justify-center text-sm font-medium transition-colors",
                        activePage === page ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-foreground"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    onClick={() => setActivePage(Math.min(3, activePage + 1))}
                    disabled={activePage === 3}
                    className="h-9 px-3 rounded-md border border-border bg-background hover:bg-muted text-foreground flex items-center gap-1 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Badges & Feedback */}
            <div className="flex flex-col gap-8">
              <h4 className="text-lg font-semibold border-b border-border/50 pb-2">Feedback & Status</h4>
              
              <div className="flex flex-col gap-6">
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-sm cursor-default hover:opacity-90 transition-opacity">Default Badge</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground shadow-sm cursor-default hover:opacity-90 transition-opacity">Secondary Badge</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-border text-foreground bg-background cursor-default hover:bg-muted transition-colors">Outline Badge</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20 cursor-default">Destructive Badge</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 cursor-default">Success Badge</span>
                </div>

                {/* Alerts */}
                <div className="flex flex-col gap-4">
                  <div className="relative w-full rounded-lg border border-border/60 bg-card p-4 flex gap-3 text-sm shadow-sm hover:shadow-md transition-shadow">
                    <AlertCircle className="size-4 text-primary shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <h5 className="font-semibold leading-none tracking-tight">System Update Available</h5>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        A new software version is ready to be installed. Please restart.
                      </div>
                    </div>
                  </div>
                  <div className="relative w-full rounded-lg border border-red-500/30 bg-red-500/5 p-4 flex gap-3 text-sm shadow-sm">
                    <XCircle className="size-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <h5 className="font-semibold leading-none tracking-tight text-red-500 dark:text-red-400">Connection Error</h5>
                      <div className="text-sm text-red-500/80 leading-relaxed">
                        Failed to reach the server. Please check your internet connection.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress & Skeleton */}
                <div className="flex flex-col gap-5 mt-2 border border-border/50 bg-card rounded-xl p-5 shadow-sm">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Uploading files...</span>
                      <span>{sliderVal}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-300 ease-out" style={{ width: `${sliderVal}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Linked to the slider above.</p>
                  </div>

                  <div className="border-t border-border/50 pt-5 flex items-center gap-4">
                    <div className="size-12 rounded-full bg-muted animate-pulse shrink-0" />
                    <div className="flex flex-col gap-2 w-full">
                      <div className="h-3.5 bg-muted rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Data Table */}
          <div className="flex flex-col gap-6 mt-4">
            <h4 className="text-lg font-semibold border-b border-border/50 pb-2">Data Display (Table)</h4>
            <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
              <div className="w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="border-b border-border/60 bg-muted/30">
                    <tr className="border-b border-border/50 transition-colors">
                      <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Invoice</th>
                      <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Method</th>
                      <th className="h-12 px-4 text-right align-middle font-semibold text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {[
                      { id: "INV001", status: "Paid", method: "Credit Card", amount: "$250.00" },
                      { id: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
                      { id: "INV003", status: "Unpaid", method: "Bank Transfer", amount: "$350.00" },
                      { id: "INV004", status: "Paid", method: "Apple Pay", amount: "$450.00" },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border/50 transition-colors hover:bg-muted/50 cursor-pointer group">
                        <td className="p-4 align-middle font-medium group-hover:text-primary transition-colors">{row.id}</td>
                        <td className="p-4 align-middle">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                            row.status === "Paid" ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" : 
                            row.status === "Pending" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" : 
                            "bg-red-500/10 text-red-500 border border-red-500/20"
                          )}>
                            {row.status}
                          </span>
                        </td>
                        <td className="p-4 align-middle text-muted-foreground group-hover:text-foreground transition-colors">{row.method}</td>
                        <td className="p-4 align-middle text-right font-mono font-medium">{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

function ColorSwatch({ name, bgClass, textClass, borderClass }: { name: string, bgClass: string, textClass: string, borderClass?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={cn("h-16 w-full rounded-xl shadow-sm flex items-center justify-center font-mono text-[10px] font-bold select-none transition-transform hover:scale-105 duration-200", bgClass, textClass, borderClass ? `border ${borderClass}` : "border border-black/5 dark:border-white/5")}>
        Aa
      </div>
      <span className="text-xs font-semibold text-muted-foreground pl-1">{name}</span>
    </div>
  )
}

import { useState } from "react"
import { 
  LayoutDashboard, Users, Activity, Settings, 
  Search, Bell, ChevronDown, MoreHorizontal,
  ArrowUpRight, ArrowDownRight,
  BarChart3, Wallet, Download,
  CheckCircle2, GitCommit, Plus,
  ListFilter, MoreVertical, MessageSquare
} from "lucide-react"
import { cn } from "@/lib/utils"

export function SaasShell() {
  const [activeNav, setActiveNav] = useState("Dashboard")
  const [timeframe, setTimeframe] = useState("7 Days")

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden font-sans selection:bg-primary/30">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border/50 bg-card hidden md:flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <div className="flex items-center gap-2 text-primary">
            <div className="size-7 rounded-lg bg-primary flex items-center justify-center shadow-inner">
              <span className="text-primary-foreground font-black text-sm">S</span>
            </div>
            <span className="font-bold text-foreground tracking-tight text-lg">SaaSify</span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-1 overflow-y-auto">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-2 mt-2">Overview</span>
          
          {[
            { id: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
            { id: "Analytics", icon: <BarChart3 className="size-4" /> },
            { id: "Customers", icon: <Users className="size-4" /> },
            { id: "Finances", icon: <Wallet className="size-4" /> },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-all",
                activeNav === item.id 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {item.id}
              </div>
              {item.id === "Customers" && (
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold", activeNav === item.id ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary")}>12</span>
              )}
            </button>
          ))}

          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-2 mt-6">Workspace</span>
          
          <button className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-blue-500" />
              Engineering
            </div>
          </button>
          <button className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-emerald-500" />
              Design System
            </div>
          </button>
          <button className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-purple-500" />
              Marketing
            </div>
          </button>

          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-2 mt-6">Settings</span>
          
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Settings className="size-4" />
            Configuration
          </button>
        </div>

        {/* User Profile Block */}
        <div className="p-4 border-t border-border/50 mt-auto bg-card">
          <button className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border/50">
                <span className="text-secondary-foreground font-bold text-xs">JD</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">Jane Doe</span>
                <span className="text-xs text-muted-foreground">Pro Plan</span>
              </div>
            </div>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search users, transactions, or projects..." 
              className="w-full h-9 bg-muted/40 hover:bg-muted border border-transparent hover:border-border/50 focus:bg-background focus:border-border rounded-full pl-9 pr-4 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-inner placeholder:text-muted-foreground/70"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <kbd className="hidden sm:inline-flex items-center justify-center rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">⌘</kbd>
              <kbd className="hidden sm:inline-flex items-center justify-center rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">K</kbd>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 ml-4">
            <button className="relative size-9 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="size-5" />
              <span className="absolute top-2 right-2.5 size-2 rounded-full bg-primary border-2 border-background" />
            </button>
            <div className="h-6 w-px bg-border/50 hidden sm:block mx-1" />
            <button className="h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm">
              <Plus className="size-4" /> <span className="hidden sm:inline">New Project</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 flex flex-col gap-8 pb-32">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black tracking-tight">{activeNav}</h2>
              <p className="text-muted-foreground text-sm">Overview of your metrics and latest activity.</p>
            </div>
            <div className="flex items-center p-1 rounded-lg bg-muted/50 border border-border w-fit shrink-0">
              {["24h", "7 Days", "30 Days"].map(t => (
                <button 
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={cn(
                    "h-8 px-3 rounded-md text-xs font-semibold transition-all",
                    timeframe === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics Grid with Sparklines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard 
              title="Total Revenue" value="$45,231.89" change="+20.1%" trend="up"
              sparkPoints="0,15 10,12 20,20 30,15 40,25 50,22 60,30 70,25 80,35 90,30 100,40"
            />
            <MetricCard 
              title="Subscriptions" value="+2,350" change="+18.1%" trend="up"
              sparkPoints="0,30 10,25 20,35 30,30 40,20 50,25 60,15 70,20 80,10 90,15 100,5"
            />
            <MetricCard 
              title="Active Users" value="12,234" change="+12%" trend="up"
              sparkPoints="0,40 20,35 40,38 60,20 80,25 100,10"
            />
            <MetricCard 
              title="Churn Rate" value="2.4%" change="-1.1%" trend="down" isGoodDown
              sparkPoints="0,10 20,15 40,12 60,30 80,25 100,40"
            />
          </div>

          {/* Main Visualizations Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* SVG Area Chart (No external library required) */}
            <div className="lg:col-span-2 border border-border/50 bg-card rounded-xl p-6 shadow-sm flex flex-col gap-6 group">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h3 className="font-semibold text-card-foreground">Audience Overview</h3>
                  <span className="text-sm text-muted-foreground">Daily unique visitors over time</span>
                </div>
                <button className="h-8 px-3 rounded-md border border-border/50 hover:bg-muted text-xs font-medium transition-colors flex items-center gap-2">
                  <Download className="size-3" /> Export
                </button>
              </div>
              
              <div className="w-full h-[280px] mt-4 relative">
                {/* Y Axis Labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-muted-foreground font-mono pb-6">
                  <span>10k</span><span>7.5k</span><span>5k</span><span>2.5k</span><span>0</span>
                </div>
                
                {/* Horizontal Grid Lines */}
                <div className="absolute left-8 right-0 top-0 h-full flex flex-col justify-between pb-6 pointer-events-none">
                  {[0,1,2,3,4].map(i => <div key={i} className="w-full border-b border-border/30 border-dashed h-0" />)}
                </div>

                {/* SVG Chart */}
                <div className="absolute left-8 right-0 top-0 bottom-6">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="area-gradient-secondary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Secondary Area & Line (Previous Period) */}
                    <path d="M0,40 L0,30 Q10,25 20,28 T40,25 T60,32 T80,20 T100,25 L100,40 Z" fill="url(#area-gradient-secondary)" />
                    <path d="M0,30 Q10,25 20,28 T40,25 T60,32 T80,20 T100,25" fill="none" stroke="hsl(var(--secondary))" strokeWidth="1" strokeDasharray="2,2" />

                    {/* Primary Area & Line (Current Period) */}
                    <path d="M0,40 L0,25 Q10,15 20,20 T40,12 T60,20 T80,5 T100,10 L100,40 Z" fill="url(#area-gradient)" />
                    <path d="M0,25 Q10,15 20,20 T40,12 T60,20 T80,5 T100,10" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Interactive Hover Point (Fake) */}
                    <circle cx="80" cy="5" r="2" className="fill-background stroke-primary stroke-[1.5] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </svg>
                  
                  {/* Fake Tooltip */}
                  <div className="absolute top-[8%] left-[80%] -translate-x-1/2 -translate-y-full bg-foreground text-background text-xs font-semibold px-2.5 py-1.5 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mb-2 z-10 flex flex-col items-center">
                    <span>8,432 views</span>
                    <span className="text-[10px] text-background/70 font-normal">Oct 24</span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
                  </div>
                </div>

                {/* X Axis Labels */}
                <div className="absolute left-8 right-0 bottom-0 flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            </div>

            {/* Radial Progress Chart & Goal Tracking */}
            <div className="border border-border/50 bg-card rounded-xl p-6 shadow-sm flex flex-col gap-6">
              <h3 className="font-semibold text-card-foreground">Monthly Goal</h3>
              
              <div className="flex-1 flex flex-col items-center justify-center gap-6 relative pt-4">
                {/* SVG Radial Chart */}
                <div className="relative size-40">
                  <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                    {/* Background Track */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/30" />
                    {/* Progress Track (75%) */}
                    <circle 
                      cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="12" 
                      strokeDasharray={2 * Math.PI * 38} 
                      strokeDashoffset={(2 * Math.PI * 38) * (1 - 0.75)} 
                      strokeLinecap="round" 
                      className="text-primary transition-all duration-1000 ease-out" 
                    />
                  </svg>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black tracking-tighter">75%</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reached</span>
                  </div>
                </div>
                
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-primary" /> New Signups</div>
                    <span className="font-semibold">4,231</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-muted" /> Target</div>
                    <span className="font-semibold">5,500</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Data Table & Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Rich Data Table */}
            <div className="lg:col-span-2 border border-border/50 bg-card rounded-xl shadow-sm flex flex-col overflow-hidden">
              <div className="p-5 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <h3 className="font-semibold text-card-foreground">Recent Transactions</h3>
                  <span className="text-sm text-muted-foreground">Manage and track your latest sales.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <input type="text" placeholder="Filter..." className="h-8 pl-8 pr-3 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary w-32 sm:w-48" />
                  </div>
                  <button className="h-8 px-2.5 rounded-md border border-border bg-background hover:bg-muted flex items-center gap-1.5 text-xs font-medium">
                    <ListFilter className="size-3.5" /> Filter
                  </button>
                </div>
              </div>
              
              <div className="w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="bg-muted/30 border-b border-border/50">
                    <tr>
                      <th className="h-10 px-5 text-left align-middle font-medium text-muted-foreground text-xs">Customer</th>
                      <th className="h-10 px-5 text-left align-middle font-medium text-muted-foreground text-xs">Status</th>
                      <th className="h-10 px-5 text-left align-middle font-medium text-muted-foreground text-xs">Date</th>
                      <th className="h-10 px-5 text-right align-middle font-medium text-muted-foreground text-xs">Amount</th>
                      <th className="h-10 px-5 text-right align-middle font-medium text-muted-foreground text-xs"></th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {[
                      { name: "Liam Johnson", email: "liam@example.com", status: "Completed", date: "Oct 24, 2023", amount: "$250.00", initials: "LJ" },
                      { name: "Emma Smith", email: "emma@example.com", status: "Processing", date: "Oct 23, 2023", amount: "$150.00", initials: "ES" },
                      { name: "Noah Williams", email: "noah@example.com", status: "Failed", date: "Oct 22, 2023", amount: "$350.00", initials: "NW" },
                      { name: "Ava Brown", email: "ava@example.com", status: "Completed", date: "Oct 21, 2023", amount: "$450.00", initials: "AB" },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border/50 transition-colors hover:bg-muted/30 group">
                        <td className="p-4 px-5 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold shrink-0">{row.initials}</div>
                            <div className="flex flex-col">
                              <span className="font-medium group-hover:text-primary transition-colors">{row.name}</span>
                              <span className="text-[10px] text-muted-foreground">{row.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 px-5 align-middle">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                            row.status === "Completed" ? "bg-green-500/10 text-green-600 dark:text-green-400" : 
                            row.status === "Processing" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : 
                            "bg-red-500/10 text-red-500"
                          )}>
                            {row.status}
                          </span>
                        </td>
                        <td className="p-4 px-5 align-middle text-muted-foreground text-xs">{row.date}</td>
                        <td className="p-4 px-5 align-middle text-right font-mono font-medium text-xs">{row.amount}</td>
                        <td className="p-4 px-5 align-middle text-right">
                          <button className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted transition-colors">
                            <MoreVertical className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-border/50 bg-muted/10 text-xs text-muted-foreground text-center">
                Showing 1-4 of 24 transactions
              </div>
            </div>

            {/* Activity Feed */}
            <div className="border border-border/50 bg-card rounded-xl p-6 shadow-sm flex flex-col gap-6">
              <h3 className="font-semibold text-card-foreground">Activity Log</h3>
              <div className="flex flex-col relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border/60">
                
                {[
                  { title: "New deployment", desc: "Production build #42 deployed", time: "2m ago", icon: <GitCommit className="size-3" />, color: "bg-primary" },
                  { title: "Database backup", desc: "Automated snapshot created", time: "1h ago", icon: <CheckCircle2 className="size-3" />, color: "bg-green-500" },
                  { title: "User signed up", desc: "Jane Doe created an account", time: "3h ago", icon: <Users className="size-3" />, color: "bg-blue-500" },
                  { title: "Build failed", desc: "Staging build #41 failed", time: "5h ago", icon: <Activity className="size-3" />, color: "bg-red-500" },
                ].map((item, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group py-3">
                    {/* Icon marker */}
                    <div className={cn("flex items-center justify-center size-6 rounded-full border-2 border-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -translate-x-[5px] text-white", item.color)}>
                      {item.icon}
                    </div>
                    {/* Content */}
                    <div className="w-[calc(100%-2.5rem)] ml-8 md:ml-0 md:w-[calc(50%-1.5rem)] flex flex-col border border-transparent group-hover:bg-muted/50 p-2 rounded-lg transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-sm group-hover:text-primary transition-colors">{item.title}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{item.time}</span>
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-1">{item.desc}</span>
                    </div>
                  </div>
                ))}

              </div>
            </div>

          </div>

          {/* Kanban Board (Project View Snippet) */}
          <div className="flex flex-col gap-6 mt-4">
            <h4 className="text-lg font-semibold border-b border-border/50 pb-2">Task Board (Kanban)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* To Do Column */}
              <div className="flex flex-col gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between font-semibold text-sm">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-border" />
                    To Do
                  </div>
                  <span className="bg-muted px-2 py-0.5 rounded-full text-xs">2</span>
                </div>
                <KanbanCard title="Design System Review" tag="Design" priority="High" comments={4} />
                <KanbanCard title="Update Authentication" tag="Backend" priority="Medium" comments={2} />
                <button className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground border-2 border-dashed border-border/50 rounded-lg py-3 hover:bg-muted hover:text-foreground transition-colors">
                  <Plus className="size-3" /> Add Task
                </button>
              </div>

              {/* In Progress Column */}
              <div className="flex flex-col gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between font-semibold text-sm">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
                    In Progress
                  </div>
                  <span className="bg-muted px-2 py-0.5 rounded-full text-xs">1</span>
                </div>
                <KanbanCard title="Dashboard Visualization" tag="Frontend" priority="High" comments={12} />
              </div>

              {/* Done Column */}
              <div className="flex flex-col gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between font-semibold text-sm">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-green-500" />
                    Done
                  </div>
                  <span className="bg-muted px-2 py-0.5 rounded-full text-xs">1</span>
                </div>
                <KanbanCard title="Color Palette Generator" tag="Feature" priority="Low" comments={0} />
              </div>

            </div>
          </div>

        </div>

      </main>
    </div>
  )
}

function MetricCard({ title, value, change, trend, sparkPoints, isGoodDown = false }: { title: string, value: string, change: string, trend: "up" | "down", sparkPoints: string, isGoodDown?: boolean }) {
  const isPositive = trend === "up" ? !isGoodDown : isGoodDown;
  
  return (
    <div className="border border-border/50 bg-card rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col gap-4 overflow-hidden relative">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</h3>
        <div className={cn("flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md", isPositive ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-500 dark:text-red-400")}>
          {trend === "up" ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {change}
        </div>
      </div>
      <div className="flex flex-col z-10">
        <span className="text-3xl font-black tracking-tight">{value}</span>
      </div>
      
      {/* SVG Sparkline Background */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
          <polyline 
            points={sparkPoints}
            fill="none" 
            stroke={isPositive ? "currentColor" : "hsl(0, 84.2%, 60.2%)"} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={isPositive ? "text-primary" : ""}
          />
        </svg>
      </div>
    </div>
  )
}

function KanbanCard({ title, tag, priority, comments, isDragging = false }: { title: string, tag: string, priority: "High" | "Medium" | "Low", comments: number, isDragging?: boolean }) {
  return (
    <div className={cn(
      "bg-card border p-4 rounded-lg flex flex-col gap-3 shadow-sm cursor-grab active:cursor-grabbing transition-all hover:border-primary/50 group",
      isDragging ? "rotate-2 scale-105 shadow-xl ring-2 ring-primary border-primary z-10" : "border-border/50"
    )}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">{tag}</span>
        <MoreHorizontal className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <h5 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">{title}</h5>
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          <div className="size-5 rounded-full bg-secondary border border-border/50 flex items-center justify-center shrink-0">
            <span className="text-[8px] font-bold text-secondary-foreground">JD</span>
          </div>
          {comments > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="size-3" /> {comments}
            </div>
          )}
        </div>
        <span className={cn(
          "text-[10px] font-bold px-1.5 py-0.5 rounded",
          priority === "High" ? "bg-red-500/10 text-red-500" : priority === "Medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground"
        )}>
          {priority}
        </span>
      </div>
    </div>
  )
}

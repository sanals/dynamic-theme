import { Target } from "lucide-react"

interface DholeishProductCardProps {
  title: string
  subtitle: string
  subtext: string
  imageUrl: string
}

export function DholeishProductCard({ title, subtitle, subtext, imageUrl }: DholeishProductCardProps) {
  return (
    <div className="group relative bg-card/90 rounded-[2rem] p-3 shadow-2xl overflow-hidden flex flex-col h-[400px] border border-white/5 backdrop-blur-md transition-all hover:-translate-y-1">

      {/* Top right glowing light effect */}
      <div className="absolute -top-10 -right-10 w-[250px] h-[250px] bg-pedestal-glow/40 blur-[50px] rounded-full pointer-events-none z-0" />

      {/* Glossy overlay effect on the outer card */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-20 pointer-events-none z-0" />

      {/* Inner Border Wrapper */}
      <div className="relative z-10 flex-1 rounded-[1.5rem] border-[1.5px] border-border/80 overflow-hidden flex flex-col justify-between p-5 group-hover:border-primary/50 transition-colors shadow-[inset_0_4px_20px_rgba(255,255,255,0.03)]">

        {/* Top/Image Area with 3D Pedestal */}
        <div className="relative flex-1 w-full flex flex-col items-center justify-end pb-[32px]">

          {/* Floating Product Image */}
          <img
            src={imageUrl}
            alt={title}
            className="relative z-30 w-full max-w-[80%] max-h-[170px] object-contain group-hover:-translate-y-4 transition-transform duration-500 ease-out mix-blend-multiply dark:mix-blend-normal drop-shadow-xl"
          />

          {/* 3D Pedestal using CSS Cylinder */}
          <div className="absolute bottom-4 w-[75%] h-[36px] z-10 flex flex-col items-center group-hover:scale-95 transition-transform duration-500">

            {/* Shadow cast BY the image ONTO the pedestal */}
            <div className="absolute top-[18px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[21px] bg-black/60 blur-[10px] rounded-[50%] z-20 pointer-events-none" />

            {/* Top of pedestal (Light Green) */}
            <div className="w-full h-[36px] bg-pedestal-top rounded-[50%] absolute top-0 z-10 blur-[1.5px] shadow-[inset_0_-3px_12px_rgba(0,0,0,0.15),0_0_8px_rgba(0,0,0,0.1)]" />

            {/* Body of pedestal (Dark Green) */}
            <div className="w-full h-[12px] bg-pedestal-body absolute top-[18px] z-0" />

            {/* Bottom curve of pedestal (Dark Green) */}
            <div className="w-full h-[36px] bg-pedestal-body rounded-[50%] absolute top-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.3)] z-0 blur-[1.5px]" />

            {/* Soft floor shadow cast BY the pedestal ONTO the floor */}
            <div className="w-[110%] h-[24px] bg-pedestal-shadow/80 blur-xl rounded-[50%] absolute top-[30px] -z-10" />
          </div>
        </div>

        {/* Typography and bottom layout */}
        <div className="relative z-20 flex justify-between items-end mt-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono opacity-80">{subtitle}</span>
            <h3 className="text-sm font-bold tracking-wider text-foreground uppercase mt-0.5">{title}</h3>
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono opacity-60 whitespace-pre-line leading-relaxed mt-1">
              {subtext}
            </span>
          </div>

          <button className="flex items-center justify-center size-9 rounded-full bg-black/20 hover:bg-black/30 transition-colors border border-white/10 backdrop-blur-md shrink-0 self-end mb-1">
            <Target className="size-4.5 text-foreground opacity-90" />
          </button>
        </div>

      </div>
    </div>
  )
}

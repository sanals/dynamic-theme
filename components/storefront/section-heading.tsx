export function SectionHeading({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-2 text-center">
      <h2 className="text-balance font-heading text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}

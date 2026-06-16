const navLinks = ["Catalog", "Designs", "Filaments", "Materials", "Pricing"]

export function StorefrontHeader({ brandName = "Rakery" }: { brandName?: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <a
            href="#"
            className="font-heading text-xl font-bold tracking-tight text-foreground flex items-center gap-2"
          >
            <span className="size-4 rounded bg-primary" aria-hidden />
            {brandName}
          </a>
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-6">
              {navLinks.map((link, i) => (
                <li key={link}>
                  <a
                    href="#"
                    className={
                      i === 0
                        ? "text-sm font-semibold text-foreground"
                        : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    }
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

      </div>
    </header>
  )
}

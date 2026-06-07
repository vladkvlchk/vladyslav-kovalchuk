interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  /** Wraps the title/subtitle in a tight translucent blur backdrop. */
  glassTitle?: boolean;
}

const glassClasses =
  "inline-block w-fit rounded-md bg-background/60 px-2 py-0.5 backdrop-blur-[2px]";

export function Section({
  children,
  title,
  subtitle,
  className,
  glassTitle,
}: SectionProps) {
  return (
    <section className={`py-16 sm:py-20 ${className ?? ""}`}>
      {(title || subtitle) && (
        <div className="mb-10">
          {title && (
            <h2
              className={`text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 ${
                glassTitle ? glassClasses : ""
              }`}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className={`mt-2 text-zinc-500 dark:text-zinc-400 ${
                glassTitle ? glassClasses : ""
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

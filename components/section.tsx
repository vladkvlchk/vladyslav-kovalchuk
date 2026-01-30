interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function Section({ children, title, subtitle, className }: SectionProps) {
  return (
    <section className={`py-16 sm:py-20 ${className ?? ""}`}>
      {(title || subtitle) && (
        <div className="mb-10">
          {title && (
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

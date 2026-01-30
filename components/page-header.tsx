interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="border-b border-zinc-100 dark:border-zinc-800 pb-10 pt-16 sm:pt-20">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      )}
    </div>
  );
}

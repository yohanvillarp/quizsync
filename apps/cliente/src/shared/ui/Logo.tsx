export function Logo() {
  return (
    <div
      className="inline-flex items-center justify-center px-6 py-3 bg-white border-4 border-[var(--color-ink)] shadow-[6px_6px_0px_0px_var(--color-ink-offset)] hover:animate-live-paper transition-all cursor-pointer select-none"
      style={{ filter: "url(#sketchy-filter)" }}
    >
      <h1 className="font-headline text-4xl font-black uppercase tracking-widest text-[var(--color-ink)]">
        Quiz<span className="bg-[var(--color-high-yellow)] px-2 ml-1 inline-block -rotate-3 border-2 border-[var(--color-ink)]">Sync</span>
      </h1>
    </div>
  );
}

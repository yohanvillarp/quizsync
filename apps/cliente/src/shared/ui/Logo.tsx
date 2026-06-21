export function Logo() {
  return (
    <div
      className="inline-flex items-center justify-center px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-white border-[3px] sm:border-4 border-[var(--color-ink)] shadow-[4px_4px_0px_0px_var(--color-ink-offset)] sm:shadow-[6px_6px_0px_0px_var(--color-ink-offset)] hover:animate-live-paper transition-all cursor-pointer select-none"
      style={{ filter: "url(#sketchy-filter)" }}
    >
      <h1 className="font-headline font-black tracking-widest text-[var(--color-ink)] text-2xl sm:text-3xl md:text-4xl">
        Quiz<span className="bg-[var(--color-high-yellow)] px-1 sm:px-2 ml-1 inline-block -rotate-3 border-2 border-[var(--color-ink)] text-2xl sm:text-3xl md:text-4xl">Sync</span>
      </h1>
    </div>
  );
}

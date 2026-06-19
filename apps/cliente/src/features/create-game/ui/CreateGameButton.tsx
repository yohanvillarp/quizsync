export function CreateGameButton() {
  const handleCreate = () => {
    // TODO: Connect with routing or server logic later
    console.log("Navigating to create game...");
  };

  return (
    <button
      onClick={handleCreate}
      className="w-full py-4 bg-transparent border-4 border-[var(--color-ink)] border-dashed rounded-lg hover:bg-[var(--color-paper-dim)] transition-transform hover:-rotate-1 active:scale-95 flex items-center justify-center font-headline text-2xl font-bold text-[var(--color-ink)]"
    >
      CREAR
    </button>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function JoinGameForm() {
  const navigate = useNavigate();
  const [pin, setPin] = useState<string>("");
  const isPinValid = pin.length === 6;

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setPin(value);
  };

  const handleJoin = () => {
    if (!isPinValid) return;
    navigate(`/lobby/${pin}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isPinValid) {
      handleJoin();
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {/* PIN Input Container */}
      <div className="w-full relative group">
        <div className="bg-[var(--color-paper)] border-4 border-[var(--color-ink)] rounded-xl p-2 sm:p-4 md:p-6 shadow-[4px_4px_0px_0px_var(--color-ink-offset)] sm:shadow-[6px_6px_0px_0px_var(--color-ink-offset)]">
          <input
            className="w-full bg-transparent border-none outline-none focus:ring-0 text-center font-headline text-2xl sm:text-4xl md:text-6xl placeholder:text-[var(--color-paper-dim)] text-[var(--color-ink)] uppercase tracking-widest py-3 sm:py-4 font-black"
            maxLength={6}
            placeholder="PIN DE JUEGO"
            type="text"
            value={pin}
            onChange={handlePinChange}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {/* UNIRSE Button (Highlighted) */}
      <button
        onClick={handleJoin}
        disabled={!isPinValid}
        className={`w-full relative py-3 sm:py-4 bg-[var(--color-high-yellow)] border-4 border-[var(--color-ink)] rounded-lg flex items-center justify-center group overflow-hidden md:p-6 shadow-[4px_4px_0px_0px_var(--color-ink-offset)] sm:shadow-[6px_6px_0px_0px_var(--color-ink-offset)] font-headline text-xl sm:text-3xl font-bold text-[var(--color-ink)] transition-all ${
          isPinValid
            ? "hover:scale-105 active:scale-95 hover:animate-live-paper cursor-pointer"
            : "opacity-50 cursor-not-allowed saturate-50"
        }`}
      >
        UNIRSE
      </button>
    </div>
  );
}

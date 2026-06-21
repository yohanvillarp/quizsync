import { useAlertStore } from '@/shared/store/useAlertStore';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export function GlobalAlert() {
  const { isOpen, type, title, message, close } = useAlertStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--color-paper)] border-4 border-[var(--color-ink)] w-full max-w-md rounded-2xl shadow-[8px_8px_0px_0px_var(--color-ink)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[var(--color-high-pink)] border-b-4 border-[var(--color-ink)] p-4 flex items-center gap-3">
          {type === 'alert' ? <Info className="text-[var(--color-ink)]" size={28} /> : <AlertTriangle className="text-[var(--color-ink)]" size={28} />}
          <h2 className="font-display text-2xl font-black text-[var(--color-ink)] uppercase tracking-wide">
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 bg-[var(--color-paper)]">
          <p className="font-body text-xl text-[var(--color-ink)] leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[var(--color-paper-dim)] border-t-4 border-[var(--color-ink)] flex items-center justify-end gap-4">
          {type === 'confirm' && (
            <button
              onClick={() => close(false)}
              className="px-6 py-2 bg-gray-200 border-4 border-[var(--color-ink)] rounded-xl font-headline font-bold text-lg text-[var(--color-ink)] shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase"
            >
              Cancelar
            </button>
          )}
          
          <button
            onClick={() => close(true)}
            className={`px-6 py-2 border-4 border-[var(--color-ink)] rounded-xl font-headline font-bold text-lg text-[var(--color-ink)] shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase ${
              type === 'alert' ? 'bg-[var(--color-high-yellow)]' : 'bg-[var(--color-high-green)]'
            }`}
          >
            {type === 'alert' ? 'Entendido' : 'Confirmar'}
          </button>
        </div>

      </div>
    </div>
  );
}

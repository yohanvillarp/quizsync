import { ArrowLeft, Backpack, MousePointer2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { CursorInventoryWidget } from "@/widgets/inventory/ui/CursorInventoryWidget";
import { AvatarInventoryWidget } from "@/widgets/inventory/ui/AvatarInventoryWidget";

export function InventoryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'avatars' | 'cursors'>('avatars');

  return (
    <div className="w-full min-h-screen p-8 bg-[var(--color-paper)] relative flex flex-col items-center">
      
      {/* Header a ancho completo (w-full px-8) */}
      <div className="w-full flex items-center justify-between z-10 mb-8 mt-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[var(--color-ink)] rounded-xl shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] transition-all font-bold"
        >
          <ArrowLeft size={20} /> Volver
        </button>
        <h1 className="text-4xl font-headline font-black flex items-center gap-3">
          <Backpack size={40} /> Inventario
        </h1>
        <div className="w-[100px]"></div> {/* Spacer */}
      </div>

      {/* Tabs a ancho completo */}
      <div className="w-full flex gap-4 border-b-4 border-[var(--color-ink)] pb-4 mb-10">
        <button 
          onClick={() => setActiveTab('avatars')}
          className={`flex items-center gap-2 px-6 py-3 border-2 border-[var(--color-ink)] rounded-t-xl font-bold text-xl transform translate-y-4 transition-colors ${
            activeTab === 'avatars' ? 'bg-[var(--color-high-yellow)]' : 'bg-white hover:bg-slate-100'
          }`}
        >
          <User size={24} /> Avatares
        </button>
        <button 
          onClick={() => setActiveTab('cursors')}
          className={`flex items-center gap-2 px-6 py-3 border-2 border-[var(--color-ink)] rounded-t-xl font-bold text-xl transform translate-y-4 transition-colors ${
            activeTab === 'cursors' ? 'bg-[var(--color-high-yellow)]' : 'bg-white hover:bg-slate-100'
          }`}
        >
          <MousePointer2 size={24} /> Punteros
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'avatars' && <AvatarInventoryWidget />}
      {activeTab === 'cursors' && <CursorInventoryWidget />}

    </div>
  );
}

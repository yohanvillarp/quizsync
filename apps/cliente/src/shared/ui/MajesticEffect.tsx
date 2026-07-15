import { useEffect, useState } from "react";
import { useAvatarStore } from "@/shared/store/useAvatarStore";

// Un componente SVG de corona estilo doodle
const DoodleCrown = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M20 75L15 30L35 45L50 15L65 45L85 30L80 75H20Z"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="drop-shadow-md"
    />
    <circle cx="15" cy="25" r="4" fill="currentColor" />
    <circle cx="50" cy="10" r="4" fill="currentColor" />
    <circle cx="85" cy="25" r="4" fill="currentColor" />
  </svg>
);

// Un componente SVG de nota musical estilo doodle
const DoodleNote = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M30 70C25 70 20 65 20 60C20 55 25 50 30 50C35 50 40 55 40 60V20L75 10V50C70 50 65 45 65 40C65 35 70 30 75 30C80 30 85 35 85 40V15C85 15 65 20 40 25V70Z"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="30" cy="65" r="8" fill="currentColor" />
    <circle cx="75" cy="45" r="8" fill="currentColor" />
  </svg>
);

export function MajesticEffect() {
  const { selectedAvatar } = useAvatarStore();
  const [particles, setParticles] = useState<{ id: number; type: 'crown' | 'note'; left: number; delay: number; scale: number; duration: number }[]>([]);

  useEffect(() => {
    if (selectedAvatar === 'gallo') {
      // Generar partículas aleatorias
      const newParticles = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        type: (Math.random() > 0.5 ? 'crown' : 'note') as 'crown' | 'note',
        left: Math.random() * 100, // %
        delay: Math.random() * 5, // segundos
        scale: 0.5 + Math.random() * 0.8, // Tamaño
        duration: 8 + Math.random() * 7, // Animación dura entre 8 y 15s
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [selectedAvatar]);

  if (selectedAvatar !== 'gallo') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Viñeta dorada/roja */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(212,175,55,0.15)_80%,rgba(42,5,11,0.4)_100%)] animate-pulse-slow"></div>
      
      {/* Resplandor superior (como focos de escenario) */}
      <div className="absolute top-0 left-1/4 w-1/2 h-[50vh] bg-[#D4AF37] opacity-10 blur-[100px] rounded-full mix-blend-plus-lighter transform -translate-y-1/2"></div>
      
      {/* Partículas flotantes */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute bottom-[-100px] text-[#D4AF37] opacity-40 animate-float-particle"
          style={{
            left: `${p.left}%`,
            transform: `scale(${p.scale})`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.type === 'crown' ? <DoodleCrown className="w-12 h-12" /> : <DoodleNote className="w-10 h-10" />}
        </div>
      ))}
    </div>
  );
}

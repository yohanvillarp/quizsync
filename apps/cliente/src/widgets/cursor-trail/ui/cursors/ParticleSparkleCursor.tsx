import { useEffect, useRef, useState } from 'react';

const MAX_PARTICLES = 60;

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  scale: number;
}

export function ParticleSparkleCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<(HTMLDivElement | null)[]>([]);

  const requestRef = useRef<number>(0);
  const mousePos = useRef({ x: -100, y: -100 });
  const prevMousePos = useRef({ x: -100, y: -100 });
  
  const particles = useRef<Particle[]>([]);
  const particleIndex = useRef(0);
  
  const states = useRef({ isClicking: false, isHovering: false, isVisible: false });
  const [, setForceRender] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!states.current.isVisible) {
        states.current.isVisible = true;
        prevMousePos.current = { ...mousePos.current };
        setForceRender(prev => prev + 1);
      }

      const target = e.target as HTMLElement;
      const computedStyle = window.getComputedStyle(target);
      const isClickable = target.closest('button') || target.closest('a') || computedStyle.cursor === 'pointer';
      states.current.isHovering = !!isClickable;
    };

    const handleMouseDown = () => { 
      states.current.isClicking = true; 
      // Explosión de partículas
      for(let i=0; i<10; i++) {
        spawnParticle(true);
      }
    };
    const handleMouseUp = () => { states.current.isClicking = false; };
    const handleMouseLeave = () => { 
      states.current.isVisible = false; 
      setForceRender(prev => prev + 1);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    const spawnParticle = (burst = false) => {
      const { x, y } = mousePos.current;
      const angle = Math.random() * Math.PI * 2;
      const speed = burst ? Math.random() * 8 + 3 : Math.random() * 3 + 1;
      
      const p: Particle = {
        id: particleIndex.current % MAX_PARTICLES,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: burst ? 0.96 : 0.94, // Más lento el fade out
        scale: Math.random() * 1.2 + 0.8, // Escala más grande (0.8 a 2.0)
      };
      
      const existingIdx = particles.current.findIndex(pt => pt.id === p.id);
      if (existingIdx !== -1) {
        particles.current[existingIdx] = p;
      } else {
        particles.current.push(p);
      }
      particleIndex.current++;
    };

    const update = () => {
      if (states.current.isVisible) {
        const { x, y } = mousePos.current;
        const dx = x - prevMousePos.current.x;
        const dy = y - prevMousePos.current.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Emitir partículas al moverse rápido
        if (dist > 3) {
          spawnParticle(); // Emitir con más frecuencia
          if (dist > 15) spawnParticle(); // Emitir extra si va muy rápido
        }

        // Actualizar núcleo
        if (coreRef.current) {
          coreRef.current.style.transform = `translate(${x - 12}px, ${y - 12}px) scale(${states.current.isClicking ? 0.7 : states.current.isHovering ? 1.4 : 1.2}) rotate(${states.current.isHovering ? 90 : 0}deg)`;
        }

        // Actualizar partículas
        particles.current.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.life *= p.maxLife; // fade out exponencial
          
          const el = particlesRef.current[p.id];
          if (el) {
            if (p.life < 0.05) {
              el.style.opacity = '0';
            } else {
              el.style.transform = `translate(${p.x - 6}px, ${p.y - 6}px) scale(${p.scale * p.life})`;
              el.style.opacity = p.life.toString();
            }
          }
        });

        prevMousePos.current = { x, y };
      }
      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  if (!states.current.isVisible) return null;

  return (
    <div ref={containerRef} className="fixed top-0 left-0 pointer-events-none z-[9999]">
      {/* Partículas */}
      {Array.from({ length: MAX_PARTICLES }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { particlesRef.current[i] = el; }}
          className="absolute top-0 left-0 w-3 h-3 bg-[var(--dynamic-cursor-color)] rounded-full opacity-0 shadow-[0_0_8px_var(--dynamic-cursor-color)]"
        />
      ))}
      
      {/* Núcleo Estelar */}
      <div 
        ref={coreRef}
        className="absolute top-0 left-0 text-[var(--dynamic-cursor-color)] drop-shadow-[0_0_12px_var(--dynamic-cursor-color)] transition-transform duration-75 ease-out"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        </svg>
      </div>
    </div>
  );
}

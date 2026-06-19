import { useEffect, useRef, useState } from 'react';

const NUM_CLONES = 5;

export function CyberGlitchCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const clonesRef = useRef<(HTMLDivElement | null)[]>([]);

  const requestRef = useRef<number>(0);
  const mousePos = useRef({ x: -100, y: -100 });
  const trail = useRef<{x: number, y: number}[]>(Array(NUM_CLONES).fill({ x: -100, y: -100 }));
  const states = useRef({ isClicking: false, isHovering: false, isVisible: false });

  const [, setForceRender] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!states.current.isVisible) {
        states.current.isVisible = true;
        trail.current = Array(NUM_CLONES).fill({ ...mousePos.current });
        setForceRender(prev => prev + 1);
      }

      const target = e.target as HTMLElement;
      const computedStyle = window.getComputedStyle(target);
      const isClickable = target.closest('button') || target.closest('a') || computedStyle.cursor === 'pointer';
      states.current.isHovering = !!isClickable;
    };

    const handleMouseDown = () => { states.current.isClicking = true; };
    const handleMouseUp = () => { states.current.isClicking = false; };
    const handleMouseLeave = () => { 
      states.current.isVisible = false; 
      setForceRender(prev => prev + 1);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    const update = () => {
      if (states.current.isVisible && containerRef.current) {
        const { x, y } = mousePos.current;
        const { isClicking, isHovering } = states.current;

        // Propagar estela
        for (let i = NUM_CLONES - 1; i > 0; i--) {
          trail.current[i] = trail.current[i - 1];
        }
        trail.current[0] = { x, y };

        // Renderizar base (el que sigue exactamente al cursor)
        const baseClone = clonesRef.current[0];
        if (baseClone) {
          // Si hace clic, se encoge. Si hover, gira aleatoriamente (glitch)
          let rotation = 0;
          if (isHovering) rotation = (Math.random() - 0.5) * 45;
          const scale = isClicking ? 0.5 : isHovering ? 1.2 : 1;
          baseClone.style.transform = `translate(${x - 8}px, ${y - 8}px) scale(${scale}) rotate(${rotation}deg)`;
        }

        // Renderizar ecos de aberración cromática
        for (let i = 1; i < NUM_CLONES; i++) {
          const clone = clonesRef.current[i];
          if (!clone) continue;

          const point = trail.current[i];
          const distFromMouse = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
          
          // Solo mostrar clones si nos movemos rápido
          if (distFromMouse > 10) {
            const glitchOffset = (Math.random() - 0.5) * 10;
            clone.style.transform = `translate(${point.x - 8 + glitchOffset}px, ${point.y - 8 + glitchOffset}px)`;
            clone.style.opacity = (1 - i / NUM_CLONES).toString();
          } else {
            clone.style.opacity = '0'; // Ocultar si está quieto
          }
        }
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
    <div ref={containerRef} className="pointer-events-none z-[9999] fixed top-0 left-0">
      {/* Clones de rastro (Cyan y Red para aberración) */}
      {Array.from({ length: NUM_CLONES - 1 }).map((_, i) => (
        <div
          key={`clone-${i}`}
          ref={(el) => { clonesRef.current[i + 1] = el; }}
          className={`absolute top-0 left-0 w-4 h-4 border-2 transition-transform duration-75 ease-out ${
            i % 2 === 0 ? 'border-cyan-400 bg-cyan-400/20' : 'border-red-500 bg-red-500/20'
          }`}
        />
      ))}
      
      {/* Core Cursor */}
      <div 
        ref={(el) => { clonesRef.current[0] = el; }}
        className="absolute top-0 left-0 w-4 h-4 bg-[var(--dynamic-cursor-color)] border-2 border-black shadow-[0_0_0_2px_var(--dynamic-cursor-color)] transition-transform duration-75 ease-out"
      />
    </div>
  );
}

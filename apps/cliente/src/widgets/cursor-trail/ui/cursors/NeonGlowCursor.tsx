import { useEffect, useRef, useState } from 'react';

export function NeonGlowCursor() {
  const coreRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);

  const requestRef = useRef<number>(0);
  const mousePos = useRef({ x: -100, y: -100 });
  const auraPos = useRef({ x: -100, y: -100 });
  const states = useRef({ isClicking: false, isHovering: false, isVisible: false });

  const [, setForceRender] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!states.current.isVisible) {
        states.current.isVisible = true;
        auraPos.current = { ...mousePos.current };
        setForceRender(prev => prev + 1);
      }

      const target = e.target as HTMLElement;
      const isClickable = target.closest('button, a, input, select, [role="button"], .cursor-pointer, [style*="cursor: pointer"]');
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
      if (states.current.isVisible && coreRef.current && auraRef.current) {
        const { x, y } = mousePos.current;
        const { isClicking, isHovering } = states.current;
        
        // Núcleo es instantáneo
        coreRef.current.style.transform = `translate(${x - 4}px, ${y - 4}px) scale(${isClicking ? 0.8 : isHovering ? 1.5 : 1})`;

        // Aura tiene una inercia muy pesada
        auraPos.current.x += (x - auraPos.current.x) * 0.08;
        auraPos.current.y += (y - auraPos.current.y) * 0.08;
        
        // El aura crece mucho al hacer clic o hover
        const auraScale = isClicking ? 1.5 : isHovering ? 1.2 : 1;
        const auraOpacity = isClicking ? '0.8' : isHovering ? '0.6' : '0.4';

        auraRef.current.style.transform = `translate(${auraPos.current.x - 64}px, ${auraPos.current.y - 64}px) scale(${auraScale})`;
        auraRef.current.style.opacity = auraOpacity;
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
    <>
      {/* Halo de Neón (Pesado) */}
      <div 
        ref={auraRef}
        className="fixed top-0 left-0 w-32 h-32 rounded-full blur-[24px] mix-blend-screen opacity-50 pointer-events-none z-[9998]"
        style={{ backgroundColor: 'var(--dynamic-cursor-color)' }}
      />
      
      {/* Núcleo Blanco Brillante (Rápido) */}
      <div 
        ref={coreRef}
        className="fixed top-0 left-0 w-4 h-4 bg-white rounded-full pointer-events-none z-[9999] shadow-[0_0_12px_4px_var(--dynamic-cursor-color)]"
      />
    </>
  );
}

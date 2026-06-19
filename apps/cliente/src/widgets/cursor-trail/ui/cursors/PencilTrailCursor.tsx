import { useEffect, useRef, useState } from 'react';

// Cantidad de puntos de tinta en la estela
const TRAIL_LENGTH = 20;

export function PencilTrailCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  const requestRef = useRef<number>(0);
  const mousePos = useRef({ x: -100, y: -100 });
  
  // Guardamos un historial de posiciones
  const trail = useRef<{x: number, y: number}[]>(Array(TRAIL_LENGTH).fill({ x: -100, y: -100 }));
  const states = useRef({ isClicking: false, isHovering: false, isVisible: false });

  const [, setForceRender] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!states.current.isVisible) {
        states.current.isVisible = true;
        // Iniciar estela en la posición del ratón para no verla viajar desde la esquina
        trail.current = Array(TRAIL_LENGTH).fill({ ...mousePos.current });
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
        
        // Actualizar estela
        // Desplazamos todos los puntos hacia atrás
        for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
          trail.current[i] = trail.current[i - 1];
        }
        // El nuevo punto es la posición actual, con un poco de suavizado
        trail.current[0] = {
          x: trail.current[1].x + (x - trail.current[1].x) * 0.4,
          y: trail.current[1].y + (y - trail.current[1].y) * 0.4,
        };

        // Renderizar puntos
        dotsRef.current.forEach((dot, index) => {
          if (!dot) return;
          const point = trail.current[index];
          // Los puntos se hacen más pequeños y transparentes a medida que se alejan en la estela
          const scale = 1 - (index / TRAIL_LENGTH);
          const opacity = 1 - (index / TRAIL_LENGTH);
          // Si está hover/clickeando, hacemos la tinta más gruesa
          const baseSize = states.current.isClicking ? 2 : states.current.isHovering ? 1.5 : 1;
          
          dot.style.transform = `translate(${point.x - 6}px, ${point.y - 6}px) scale(${scale * baseSize})`;
          dot.style.opacity = opacity.toString();
        });
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
      {Array.from({ length: TRAIL_LENGTH }).map((_, i) => (
        <div
          key={i}
          ref={el => dotsRef.current[i] = el}
          className="absolute top-0 left-0 w-3 h-3 bg-[var(--dynamic-cursor-color)] rounded-full transition-transform duration-75"
        />
      ))}
    </div>
  );
}

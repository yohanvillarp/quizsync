import { useEffect, useRef, useState } from 'react';

export function DotRingCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const requestRef = useRef<number>(0);
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const states = useRef({ isClicking: false, isHovering: false, isVisible: false });

  // Forzar un render para visibilidad inicial si es necesario, 
  // pero usaremos ref directos para posición por rendimiento.
  const [, setForceRender] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!states.current.isVisible) {
        states.current.isVisible = true;
        ringPos.current = { ...mousePos.current };
        setForceRender(prev => prev + 1);
      }

      const target = e.target as HTMLElement;
      const computedStyle = window.getComputedStyle(target);
      const isClickable = 
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'input' ||
        target.closest('button') || 
        target.closest('a') ||
        target.getAttribute('role') === 'button' ||
        computedStyle.cursor === 'pointer';

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
      if (states.current.isVisible && dotRef.current && ringRef.current) {
        // Dot sigue exactamente al ratón
        const { x, y } = mousePos.current;
        const { isClicking, isHovering } = states.current;
        
        dotRef.current.style.transform = `translate(${x - 8}px, ${y - 8}px) scale(${isClicking ? 0.5 : isHovering ? 1.5 : 1})`;

        // Ring sigue con un "lerp" (suavizado magnético)
        ringPos.current.x += (x - ringPos.current.x) * 0.15;
        ringPos.current.y += (y - ringPos.current.y) * 0.15;
        
        ringRef.current.style.transform = `translate(${ringPos.current.x - 24}px, ${ringPos.current.y - 24}px) scale(${isClicking ? 1.5 : isHovering ? 1.2 : 1})`;
        ringRef.current.style.opacity = isClicking ? '0' : isHovering ? '0.8' : '0.4';
        ringRef.current.style.borderStyle = isHovering ? 'dashed' : 'solid';
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
      <div 
        ref={dotRef}
        className="fixed top-0 left-0 w-4 h-4 bg-[var(--dynamic-cursor-color)] rounded-full pointer-events-none z-[9999] transition-transform duration-75 ease-out shadow-[0_0_0_2px_rgba(255,255,255,0.8)]"
      />
      <div 
        ref={ringRef}
        className="fixed top-0 left-0 w-12 h-12 border-[3px] border-[var(--dynamic-cursor-color)] rounded-full pointer-events-none z-[9998] transition-all duration-75 ease-out shadow-[0_0_0_1px_rgba(255,255,255,0.5)]"
      />
    </>
  );
}

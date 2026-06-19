import { useEffect, useRef, useState } from 'react';

export function KineticCrosshairCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bracketsRef = useRef<(HTMLDivElement | null)[]>([]);

  const requestRef = useRef<number>(0);
  const mousePos = useRef({ x: -100, y: -100 });
  const prevMousePos = useRef({ x: -100, y: -100 });
  
  // Velocidad suavizada
  const velocity = useRef(0);
  
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
        const dx = x - prevMousePos.current.x;
        const dy = y - prevMousePos.current.y;
        
        // Calcular velocidad cruda (distancia desde el último frame)
        const rawVelocity = Math.sqrt(dx * dx + dy * dy);
        
        // Suavizar velocidad (resorte)
        velocity.current += (rawVelocity - velocity.current) * 0.1;
        
        // La dispersión base depende de la velocidad. Si está hovered, se contrae un poco. Si está clickeado, se contrae mucho.
        let spread = 12 + (velocity.current * 0.8);
        if (states.current.isHovering) spread = 8 + (velocity.current * 0.2);
        if (states.current.isClicking) spread = 4;
        
        // Límite máximo de dispersión
        spread = Math.min(spread, 40);

        // Actualizar centro
        containerRef.current.style.transform = `translate(${x}px, ${y}px)`;

        // Actualizar posiciones de los 4 "brackets" o marcas
        if (bracketsRef.current[0]) bracketsRef.current[0].style.transform = `translate(0px, -${spread}px)`; // Top
        if (bracketsRef.current[1]) bracketsRef.current[1].style.transform = `translate(0px, ${spread}px)`;  // Bottom
        if (bracketsRef.current[2]) bracketsRef.current[2].style.transform = `translate(-${spread}px, 0px)`; // Left
        if (bracketsRef.current[3]) bracketsRef.current[3].style.transform = `translate(${spread}px, 0px)`;  // Right

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
      {/* Centro */}
      <div className="absolute w-1.5 h-1.5 bg-[var(--dynamic-cursor-color)] rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
      
      {/* Top */}
      <div ref={(el) => { bracketsRef.current[0] = el; }} className="absolute w-0.5 h-3 bg-[var(--dynamic-cursor-color)] -translate-x-1/2 -translate-y-full shadow-[0_0_1px_rgba(255,255,255,0.8)] transition-transform duration-75 ease-out" />
      {/* Bottom */}
      <div ref={(el) => { bracketsRef.current[1] = el; }} className="absolute w-0.5 h-3 bg-[var(--dynamic-cursor-color)] -translate-x-1/2 shadow-[0_0_1px_rgba(255,255,255,0.8)] transition-transform duration-75 ease-out" />
      {/* Left */}
      <div ref={(el) => { bracketsRef.current[2] = el; }} className="absolute w-3 h-0.5 bg-[var(--dynamic-cursor-color)] -translate-x-full -translate-y-1/2 shadow-[0_0_1px_rgba(255,255,255,0.8)] transition-transform duration-75 ease-out" />
      {/* Right */}
      <div ref={(el) => { bracketsRef.current[3] = el; }} className="absolute w-3 h-0.5 bg-[var(--dynamic-cursor-color)] -translate-y-1/2 shadow-[0_0_1px_rgba(255,255,255,0.8)] transition-transform duration-75 ease-out" />
    </div>
  );
}

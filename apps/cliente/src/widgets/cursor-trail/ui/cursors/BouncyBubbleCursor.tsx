import { useEffect, useRef, useState } from 'react';

export function BouncyBubbleCursor() {
  const bubbleRef = useRef<HTMLDivElement>(null);

  const requestRef = useRef<number>(0);
  const mousePos = useRef({ x: -100, y: -100 });
  const bubblePos = useRef({ x: -100, y: -100 });
  const velocity = useRef({ x: 0, y: 0 });

  const states = useRef({ isClicking: false, isHovering: false, isVisible: false });

  const [, setForceRender] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!states.current.isVisible) {
        states.current.isVisible = true;
        bubblePos.current = { ...mousePos.current };
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
      if (states.current.isVisible && bubbleRef.current) {
        const { x, y } = mousePos.current;
        const { isClicking, isHovering } = states.current;

        // Física de resorte (suavizado magnético pesado)
        const dx = x - bubblePos.current.x;
        const dy = y - bubblePos.current.y;
        
        velocity.current.x = dx * 0.2;
        velocity.current.y = dy * 0.2;

        bubblePos.current.x += velocity.current.x;
        bubblePos.current.y += velocity.current.y;

        // Calcular ángulo y deformación (squash and stretch)
        const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.y ** 2);
        const angle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI);
        
        // Estirar basado en velocidad (máximo estiramiento de 2.0x, encogimiento a 0.5x)
        const stretch = 1 + Math.min(speed * 0.05, 1);
        const squash = 1 - Math.min(speed * 0.02, 0.5);

        const baseScale = isClicking ? 0.6 : isHovering ? 1.5 : 1;

        // Aplicamos traslación, luego rotación en dirección del movimiento, y luego escalado deformante
        bubbleRef.current.style.transform = `translate(${bubblePos.current.x - 16}px, ${bubblePos.current.y - 16}px) rotate(${angle}deg) scale(${stretch * baseScale}, ${squash * baseScale})`;
        
        bubbleRef.current.style.backgroundColor = 'var(--dynamic-cursor-color)';
        if (isClicking) {
          bubbleRef.current.style.filter = 'brightness(0.7) contrast(1.5)';
        } else if (isHovering) {
          bubbleRef.current.style.filter = 'brightness(1.3) saturate(1.5)';
        } else {
          bubbleRef.current.style.filter = 'none';
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
    <div 
      ref={bubbleRef}
      className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] opacity-80 mix-blend-multiply border-2 border-black"
      style={{
        transformOrigin: 'center center',
        willChange: 'transform, background-color',
        transition: 'background-color 0.2s ease-out'
      }}
    />
  );
}

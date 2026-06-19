import { useEffect, useState } from 'react';
import { useCursorStore, type CursorType } from '@/shared/store/useCursorStore';
import { DotRingCursor } from './cursors/DotRingCursor';
import { PencilTrailCursor } from './cursors/PencilTrailCursor';
import { KineticCrosshairCursor } from './cursors/KineticCrosshairCursor';
import { ParticleSparkleCursor } from './cursors/ParticleSparkleCursor';
import { NeonGlowCursor } from './cursors/NeonGlowCursor';
import { CyberGlitchCursor } from './cursors/CyberGlitchCursor';
import { BouncyBubbleCursor } from './cursors/BouncyBubbleCursor';

export function CustomCursorWidget() {
  const { cursorType, cursorColor } = useCursorStore();
  const [activeCursor, setActiveCursor] = useState<CursorType>('native');

  useEffect(() => {
    if (cursorType === 'random') {
      const options: CursorType[] = ['dot-ring', 'pencil', 'crosshair', 'sparkle', 'neon-glow', 'cyber-glitch', 'bouncy-bubble'];
      setActiveCursor(options[Math.floor(Math.random() * options.length)]);
    } else {
      setActiveCursor(cursorType);
    }
  }, [cursorType]);

  useEffect(() => {
    // Inyectar el color seleccionado a nivel global para que todos los motores físicos puedan usarlo sin lag
    document.documentElement.style.setProperty('--dynamic-cursor-color', cursorColor);

    if (activeCursor !== 'native') {
      document.body.classList.add('custom-cursor-active');
    } else {
      document.body.classList.remove('custom-cursor-active');
    }

    return () => {
      document.body.classList.remove('custom-cursor-active');
    };
  }, [activeCursor, cursorColor]);

  if (activeCursor === 'native') return null;

  return (
    <>
      {activeCursor === 'dot-ring' && <DotRingCursor />}
      {activeCursor === 'pencil' && <PencilTrailCursor />}
      {activeCursor === 'crosshair' && <KineticCrosshairCursor />}
      {activeCursor === 'sparkle' && <ParticleSparkleCursor />}
      {activeCursor === 'neon-glow' && <NeonGlowCursor />}
      {activeCursor === 'cyber-glitch' && <CyberGlitchCursor />}
      {activeCursor === 'bouncy-bubble' && <BouncyBubbleCursor />}
    </>
  );
}

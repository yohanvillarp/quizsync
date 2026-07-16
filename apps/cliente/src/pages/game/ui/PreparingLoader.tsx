import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/entities/game/model/useGameStore';

interface PreparingLoaderProps {
  text: string;
  endTime?: number | null;
}

export const PreparingLoader: React.FC<PreparingLoaderProps> = ({ text, endTime }) => {
  const [timeLeft, setTimeLeft] = useState(4);

  useEffect(() => {
    if (!endTime) return;
    const serverTimeOffset = useGameStore.getState().serverTimeOffset;
    const updateTimer = () => {
      const now = Date.now() + serverTimeOffset;
      setTimeLeft(Math.max(0, Math.ceil((endTime - now) / 1000)));
    };
    updateTimer();
    const interval = setInterval(updateTimer, 100);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center bg-[var(--color-paper)]">
      <svg className="w-full h-full max-w-full max-h-full" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        
        {/* Washi Tape Borders */}
        <rect fill="var(--color-high-pink)" height="20" opacity="0.8" transform="rotate(-0.5, 400, 10)" width="120%" x="-10%" y="0"></rect>
        <rect fill="var(--color-high-yellow)" height="20" opacity="0.8" transform="rotate(0.3, 400, 590)" width="120%" x="-10%" y="580"></rect>
        
        {/* Background Doodles (Stars, Scribbles) */}
        <g fill="none" opacity="0.3" stroke="var(--color-ink-offset)" strokeWidth="2">
          {/* Stars */}
          <path d="M50,50 l5,10 l10,2 l-8,7 l2,10 l-9,-6 l-9,6 l2,-10 l-8,-7 l10,-2 z">
            <animate attributeName="opacity" dur="3s" repeatCount="indefinite" values="0.3;0.8;0.3"></animate>
          </path>
          <path d="M720,80 l4,8 l8,1 l-6,6 l1,8 l-7,-5 l-7,5 l1,-8 l-6,-6 l8,-1 z">
            <animate attributeName="opacity" dur="2.5s" repeatCount="indefinite" values="0.3;0.8;0.3"></animate>
          </path>
          {/* Question Marks */}
          <text fill="var(--color-ink-offset)" fontFamily="cursive" fontSize="40" opacity="0.5" x="700" y="500">?</text>
          <text fill="var(--color-ink-offset)" fontFamily="cursive" fontSize="30" opacity="0.5" x="100" y="450">!</text>
        </g>
        
        {/* Mascot Container */}
        <g id="mascot" transform="translate(400, 320)">
          {/* Body (Blob-like, imperfect) */}
          <path d="M-80,50 Q-100,-100 0,-120 Q100,-100 80,50 Q0,80 -80,50 Z" fill="var(--color-ink-offset)" stroke="var(--color-ink-offset)" strokeWidth="4">
            <animateTransform additive="sum" attributeName="transform" dur="2s" repeatCount="indefinite" type="scale" values="1,1; 1.05,0.95; 1,1"></animateTransform>
          </path>
          
          {/* Ears (Pointy, expressive) */}
          <path d="M-60,-100 L-110,-160 L-30,-110 Z" fill="var(--color-ink-offset)" stroke="var(--color-ink-offset)" strokeWidth="4">
            <animateTransform attributeName="transform" dur="2s" repeatCount="indefinite" type="rotate" values="0; -10; 0"></animateTransform>
          </path>
          <path d="M60,-100 L110,-160 L30,-110 Z" fill="var(--color-ink-offset)" stroke="var(--color-ink-offset)" strokeWidth="4">
            <animateTransform attributeName="transform" dur="2s" repeatCount="indefinite" type="rotate" values="0; 10; 0"></animateTransform>
          </path>
          
          {/* Eyes (Big, Expressive) */}
          <g id="eyes">
            {/* Left Eye */}
            <circle cx="-35" cy="-50" fill="white" r="20" stroke="var(--color-ink-offset)" strokeWidth="3">
              <animate attributeName="r" begin="0s" dur="4s" repeatCount="indefinite" values="20; 25; 20"></animate>
            </circle>
            <circle cx="-35" cy="-50" fill="var(--color-ink-offset)" r="8">
              <animate attributeName="cy" dur="4s" repeatCount="indefinite" values="-50; -55; -50"></animate>
            </circle>
            {/* Right Eye */}
            <circle cx="35" cy="-50" fill="white" r="20" stroke="var(--color-ink-offset)" strokeWidth="3">
              <animate attributeName="r" begin="0.5s" dur="4s" repeatCount="indefinite" values="20; 25; 20"></animate>
            </circle>
            <circle cx="35" cy="-50" fill="var(--color-ink-offset)" r="8">
              <animate attributeName="cy" dur="4s" repeatCount="indefinite" values="-50; -55; -50"></animate>
            </circle>
          </g>
          
          {/* Mouth (Excited/Nervous Smile) */}
          <path d="M-20,0 Q0,20 20,0" fill="none" stroke="white" strokeLinecap="round" strokeWidth="4">
            <animate attributeName="d" dur="2s" repeatCount="indefinite" values="M-20,0 Q0,20 20,0; M-25,5 Q0,25 25,5; M-20,0 Q0,20 20,0"></animate>
          </path>
          
          {/* Hands (Waving/Encouraging) */}
          <path d="M-80,-20 L-130,-60" fill="none" stroke="var(--color-ink-offset)" strokeLinecap="round" strokeWidth="8">
            <animateTransform attributeName="transform" dur="1s" repeatCount="indefinite" type="rotate" values="0; -20; 0"></animateTransform>
          </path>
          <path d="M80,-20 L130,-60" fill="none" stroke="var(--color-ink-offset)" strokeLinecap="round" strokeWidth="8">
            <animateTransform attributeName="transform" dur="1s" repeatCount="indefinite" type="rotate" values="0; 20; 0"></animateTransform>
          </path>
        </g>
        
        {/* Countdown Timer (Hand-drawn text) */}
        <g transform="translate(400, 120)">
          <rect fill="var(--color-high-yellow)" height="100" rx="10" stroke="var(--color-ink)" strokeWidth="4" transform="rotate(-2)" width="200" x="-100" y="-50"></rect>
          <text dy="30" fill="var(--color-ink)" fontFamily="var(--font-headline), sans-serif" fontSize="80" fontWeight="900" textAnchor="middle">
            <tspan x="0" className={timeLeft <= 1 ? "animate-pulse" : ""}>
              {timeLeft > 0 ? timeLeft : '¡YA!'}
            </tspan>
          </text>
        </g>
        
        {/* Dynamic Text */}
        <text fill="var(--color-ink-offset)" fontFamily="var(--font-headline), sans-serif" fontSize="40" fontWeight="900" letterSpacing="2" textAnchor="middle" x="400" y="520">
          <tspan x="400">
            {text}
          </tspan>
        </text>
      </svg>
    </div>
  );
};

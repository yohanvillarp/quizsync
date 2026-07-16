export const FoxAvatar = () => (
  <svg className="w-full h-full" viewBox="0 0 200 200">
    <path className="doodle-ink" d="M70,160 Q100,175 130,160 Q145,130 135,100 L65,100 Q55,130 70,160 Z"></path>
    <path className="doodle-ink fox-tail" d="M130,150 Q170,140 180,110 Q170,80 150,100"></path>
    <path className="doodle-ink" d="M60,100 L140,100 L100,140 Z" fill="white"></path>
    <path className="doodle-ink" d="M70,100 L60,70 L90,90 M130,100 L140,70 L110,90"></path>
    <g className="anim-eyes">
      <circle cx="85" cy="110" fill="var(--color-ink)" r="3"></circle>
      <circle cx="115" cy="110" fill="var(--color-ink)" r="3"></circle>
    </g>
    <circle cx="100" cy="125" fill="var(--color-ink)" r="4"></circle>
  </svg>
);

export const OwlAvatar = () => (
  <svg className="w-full h-full" viewBox="0 0 200 200">
    <ellipse className="doodle-ink" cx="100" cy="130" rx="45" ry="50"></ellipse>
    <g className="owl-head">
      <path className="doodle-ink" d="M60,80 Q100,60 140,80 L140,120 Q100,140 60,120 Z" fill="white"></path>
      <path className="doodle-ink" d="M70,85 L60,65 M130,85 L140,65"></path>
      <g className="anim-eyes">
        <circle className="doodle-ink" cx="80" cy="100" r="12"></circle>
        <circle className="doodle-ink" cx="120" cy="100" r="12"></circle>
        <circle cx="80" cy="100" fill="var(--color-ink)" r="4"></circle>
        <circle cx="120" cy="100" fill="var(--color-ink)" r="4"></circle>
      </g>
      <path className="doodle-ink" d="M95,110 L100,120 L105,110"></path>
    </g>
    <path className="doodle-ink" d="M55,110 Q35,130 55,160 M145,110 Q165,130 145,160"></path>
  </svg>
);

export const BearAvatar = () => (
  <svg className="w-full h-full" viewBox="0 0 200 200">
    <path className="doodle-ink" d="M70,110 Q60,180 100,185 Q140,180 130,110" fill="white"></path>
    <path className="doodle-ink bear-arm" d="M70,120 Q40,110 50,90"></path>
    <path className="doodle-ink" d="M130,120 Q160,130 150,150"></path>
    <circle className="doodle-ink" cx="100" cy="75" fill="white" r="38"></circle>
    <circle className="doodle-ink" cx="70" cy="50" r="12"></circle>
    <circle className="doodle-ink" cx="130" cy="50" r="12"></circle>
    <g className="anim-eyes">
      <circle cx="88" cy="75" fill="var(--color-ink)" r="4"></circle>
      <circle cx="112" cy="75" fill="var(--color-ink)" r="4"></circle>
    </g>
    <ellipse className="doodle-ink" cx="100" cy="90" rx="10" ry="6"></ellipse>
    <path className="doodle-ink" d="M100,96 L100,102 Q100,108 92,108 M100,102 Q100,108 108,108"></path>
  </svg>
);

export const CatAvatar = () => (
  <svg className="w-full h-full" viewBox="0 0 200 200">
    <path className="doodle-ink" d="M80,120 Q60,180 100,185 Q140,180 120,120" fill="white"></path>
    <path className="doodle-ink" d="M125,170 Q160,175 170,140 Q165,110 145,125" strokeDasharray="2 2"></path>
    <path className="doodle-ink" d="M65,110 Q60,60 100,60 Q140,60 135,110 Q100,130 65,110 Z" fill="white"></path>
    <path className="doodle-ink cat-ear" d="M75,70 L65,40 L90,65"></path>
    <path className="doodle-ink cat-ear" d="M125,70 L135,40 L110,65"></path>
    <g className="anim-eyes">
      <path className="doodle-ink" d="M85,95 Q90,90 95,95" strokeWidth="2"></path>
      <path className="doodle-ink" d="M105,95 Q110,90 115,95" strokeWidth="2"></path>
    </g>
    <path className="doodle-ink" d="M75,105 L55,100 M75,110 L55,115 M125,105 L145,100 M125,110 L145,115" opacity="0.5"></path>
    <path className="doodle-ink" d="M95,110 Q100,115 105,110"></path>
  </svg>
);

export const RabbitAvatar = () => (
  <svg className="w-full h-full" viewBox="0 0 200 200">
    <path className="doodle-ink" d="M75,130 Q60,180 100,185 Q140,180 125,130" fill="white"></path>
    <circle className="doodle-ink" cx="100" cy="100" fill="white" r="35"></circle>
    <path className="doodle-ink" d="M80,70 Q70,20 85,20 Q100,20 95,70" fill="white"></path>
    <path className="doodle-ink" d="M120,70 Q130,20 115,20 Q100,20 105,70" fill="white"></path>
    <g className="anim-eyes">
      <circle cx="88" cy="100" fill="var(--color-ink)" r="3"></circle>
      <circle cx="112" cy="100" fill="var(--color-ink)" r="3"></circle>
    </g>
    <path className="doodle-ink" d="M97,110 L100,113 L103,110"></path>
    <path className="doodle-ink" d="M95,118 Q100,122 105,118" opacity="0.7"></path>
  </svg>
);

export const DogAvatar = () => (
  <svg className="w-full h-full" viewBox="0 0 200 200">
    <path className="doodle-ink" d="M70,120 Q60,180 100,185 Q140,180 130,120" fill="white"></path>
    <path className="doodle-ink" d="M70,80 Q100,60 130,80 L135,110 Q100,130 65,110 Z" fill="white"></path>
    <path className="doodle-ink" d="M70,80 Q50,80 55,110 Q60,130 75,110" fill="white"></path>
    <path className="doodle-ink" d="M130,80 Q150,80 145,110 Q140,130 125,110" fill="white"></path>
    <g className="anim-eyes">
      <circle cx="85" cy="95" fill="var(--color-ink)" r="4"></circle>
      <circle cx="115" cy="95" fill="var(--color-ink)" r="4"></circle>
    </g>
    <circle cx="100" cy="108" fill="var(--color-ink)" r="5"></circle>
    <path className="doodle-ink" d="M100,113 L100,118 Q100,122 95,122 M100,118 Q100,122 105,122"></path>
  </svg>
);

/* TODO: Pollo para futuras implementaciones
export const PolloAvatar = () => (
  <svg className="w-full h-full" viewBox="0 0 200 200">
    <defs>
      <filter id="glow-rooster">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <radialGradient id="tail-gradient" cx="50%" cy="50%">
        <stop offset="0%" style={{stopColor:'#FF6B35', stopOpacity:1}} />
        <stop offset="50%" style={{stopColor:'#FF8C42', stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:'#FFA500', stopOpacity:0.7}} />
      </radialGradient>
      <radialGradient id="body-gradient" cx="50%" cy="50%">
        <stop offset="0%" style={{stopColor:'#FFE66D', stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:'#FFD700', stopOpacity:0.9}} />
      </radialGradient>
      <linearGradient id="crest-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{stopColor:'#FF1744', stopOpacity:1}} />
        <stop offset="50%" style={{stopColor:'#D32F2F', stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:'#C41C3B', stopOpacity:1}} />
      </linearGradient>
    </defs>
    <g className="gallo-crest" style={{animation: 'crest-bounce 0.8s ease-in-out infinite', transformOrigin: '100px 50px'}}>
      <path d="M85,30 Q90,10 100,15 Q110,8 115,30 Q110,35 100,33 Q90,35 85,30" fill="url(#crest-gradient)" stroke="#C41C3B" strokeWidth="1.5"/>
      <path d="M95,25 Q100,15 105,25" fill="none" stroke="#FF6B6B" strokeWidth="1" opacity="0.6"/>
    </g>
    <ellipse cx="100" cy="120" rx="40" ry="45" fill="url(#body-gradient)" stroke="#FFB700" strokeWidth="2" filter="url(#glow-rooster)"/>
    <ellipse cx="100" cy="110" rx="28" ry="32" fill="#FFED4E" opacity="0.6"/>
    <g className="gallo-tail" style={{animation: 'tail-swish 1.2s ease-in-out infinite', transformOrigin: '130px 110px'}}>
      <path d="M135,100 Q160,80 170,50 Q165,55 150,70" fill="url(#tail-gradient)" stroke="#FF5722" strokeWidth="2" strokeLinecap="round"/>
      <path d="M138,105 Q165,90 175,65 Q170,70 155,85" fill="url(#tail-gradient)" stroke="#FF7043" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
      <path d="M132,110 Q155,95 162,75 Q158,80 148,95" fill="#FFA500" stroke="#FF8C42" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
    </g>
    <circle cx="100" cy="70" r="28" fill="url(#body-gradient)" stroke="#FFB700" strokeWidth="2"/>
    <ellipse cx="100" cy="95" rx="8" ry="12" fill="#FF1744" stroke="#D32F2F" strokeWidth="1"/>
    <circle cx="88" cy="62" r="5" fill="white" stroke="#333" strokeWidth="1"/>
    <circle cx="88" cy="62" r="3" fill="#333"/>
    <circle cx="85" cy="60" r="1.5" fill="white" opacity="0.7"/>
    <circle cx="112" cy="62" r="5" fill="white" stroke="#333" strokeWidth="1"/>
    <circle cx="112" cy="62" r="3" fill="#333"/>
    <circle cx="109" cy="60" r="1.5" fill="white" opacity="0.7"/>
    <polygon points="120,70 135,68 120,76" fill="#FFB700" stroke="#FF9800" strokeWidth="1"/>
    <polygon points="120,71 130,70 120,75" fill="#FFED4E" opacity="0.6"/>
    <g className="gallo-wing-left" style={{animation: 'wing-flap 1s ease-in-out infinite', transformOrigin: '75px 110px'}}>
      <path d="M75,100 Q50,95 55,130 Q70,125 75,110" fill="#FFD700" stroke="#FFB700" strokeWidth="1.5" opacity="0.8"/>
      <path d="M72,105 Q55,105 60,130 Q68,120 72,110" fill="#FFED4E" opacity="0.5"/>
    </g>
    <g className="gallo-wing-right" style={{animation: 'wing-flap-reverse 1s ease-in-out infinite', transformOrigin: '125px 110px'}}>
      <path d="M125,100 Q150,95 145,130 Q130,125 125,110" fill="#FFD700" stroke="#FFB700" strokeWidth="1.5" opacity="0.8"/>
      <path d="M128,105 Q145,105 140,130 Q132,120 128,110" fill="#FFED4E" opacity="0.5"/>
    </g>
    <line x1="90" y1="160" x2="90" y2="180" stroke="#FF9800" strokeWidth="2" strokeLinecap="round"/>
    <line x1="110" y1="160" x2="110" y2="180" stroke="#FF9800" strokeWidth="2" strokeLinecap="round"/>
    <g>
      <line x1="85" y1="180" x2="95" y2="180" stroke="#FF9800" strokeWidth="2" strokeLinecap="round"/>
      <line x1="90" y1="180" x2="90" y2="185" stroke="#FF9800" strokeWidth="1.5"/>
      <line x1="87" y1="180" x2="87" y2="185" stroke="#FF9800" strokeWidth="1.5"/>
      <line x1="93" y1="180" x2="93" y2="185" stroke="#FF9800" strokeWidth="1.5"/>
    </g>
    <g>
      <line x1="105" y1="180" x2="115" y2="180" stroke="#FF9800" strokeWidth="2" strokeLinecap="round"/>
      <line x1="110" y1="180" x2="110" y2="185" stroke="#FF9800" strokeWidth="1.5"/>
      <line x1="107" y1="180" x2="107" y2="185" stroke="#FF9800" strokeWidth="1.5"/>
      <line x1="113" y1="180" x2="113" y2="185" stroke="#FF9800" strokeWidth="1.5"/>
    </g>
    <g className="gallo-sparkles">
      <circle cx="90" cy="50" r="2" fill="#FFD700" opacity="0" style={{animation: 'sparkle 1.5s ease-in-out infinite'}}/>
      <circle cx="110" cy="45" r="1.5" fill="#FFED4E" opacity="0" style={{animation: 'sparkle 1.5s ease-in-out infinite 0.3s'}}/>
      <circle cx="100" cy="30" r="2" fill="#FFB700" opacity="0" style={{animation: 'sparkle 1.5s ease-in-out infinite 0.6s'}}/>
      <circle cx="75" cy="70" r="1.5" fill="#FFD700" opacity="0" style={{animation: 'sparkle 1.5s ease-in-out infinite 0.9s'}}/>
      <circle cx="125" cy="75" r="2" fill="#FFED4E" opacity="0" style={{animation: 'sparkle 1.5s ease-in-out infinite 1.2s'}}/>
    </g>
  </svg>
);
*/

export const GalloAvatar = () => (
  <svg className="w-full h-full drop-shadow-[0_4px_10px_rgba(212,175,55,0.4)]" viewBox="0 0 200 200">
    <defs>
      <linearGradient id="majestic-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4A0E17"/>
        <stop offset="100%" stopColor="#2A050B"/>
      </linearGradient>
      <linearGradient id="majestic-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF3B0"/>
        <stop offset="50%" stopColor="#D4AF37"/>
        <stop offset="100%" stopColor="#AA7C11"/>
      </linearGradient>
      <linearGradient id="majestic-tail" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B1C5A"/>
        <stop offset="50%" stopColor="#1E325C"/>
        <stop offset="100%" stopColor="#0B4052"/>
      </linearGradient>
      <filter id="majestic-glow">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Tail feathers */}
    <g className="gallo-tail" style={{animation: 'tail-swish 2.5s ease-in-out infinite', transformOrigin: '120px 100px'}}>
      <path d="M120,90 Q170,40 185,70 Q160,95 125,110 Z" fill="url(#majestic-tail)" opacity="0.9"/>
      <path d="M115,100 Q165,60 175,90 Q150,110 120,120 Z" fill="url(#majestic-tail)" opacity="0.8"/>
      <path d="M110,110 Q150,90 155,120 Q130,125 115,130 Z" fill="url(#majestic-tail)" opacity="0.7"/>
    </g>

    {/* Body */}
    <path d="M70,70 L110,70 L135,120 Q130,170 80,165 Q40,160 55,110 Z" fill="url(#majestic-body)"/>
    
    {/* Chest accent */}
    <path d="M60,110 Q70,160 100,150 Q120,140 125,120 Q80,110 60,110 Z" fill="url(#majestic-gold)" opacity="0.2"/>

    {/* Wing */}
    <g style={{animation: 'wing-flap 2s ease-in-out infinite', transformOrigin: '70px 100px'}}>
      <path d="M70,95 L115,135 L60,145 Z" fill="url(#majestic-gold)" stroke="#AA7C11" strokeWidth="2"/>
      <path d="M75,105 L105,130" stroke="#AA7C11" strokeWidth="1.5"/>
    </g>

    {/* Neck/Collar */}
    <path d="M65,70 L115,70 L110,95 L70,95 Z" fill="url(#majestic-gold)"/>

    {/* Head */}
    <path d="M75,35 L105,35 L115,70 L65,70 Z" fill="url(#majestic-body)"/>

    {/* Crest (Crown-like) */}
    <g className="gallo-crest" style={{animation: 'crest-bounce 1.5s ease-in-out infinite', transformOrigin: '90px 40px'}} filter="url(#majestic-glow)">
      <path d="M70,40 L75,15 L85,30 L95,5 L105,30 L115,20 L110,40 Z" fill="url(#majestic-gold)"/>
    </g>
    
    {/* Beak */}
    <path d="M105,45 L145,52 L105,65 Z" fill="url(#majestic-gold)"/>

    {/* Fierce Eye */}
    <path d="M85,48 L95,51 L95,57 L85,54 Z" fill="#fff"/>
    <circle cx="92" cy="54" r="2" fill="#E63946" filter="url(#majestic-glow)"/>
    <circle cx="92" cy="54" r="1" fill="#fff"/>
    
    {/* Eyebrow */}
    <line x1="80" y1="46" x2="100" y2="50" stroke="url(#majestic-gold)" strokeWidth="3" strokeLinecap="round"/>

    {/* Wattle (under beak) */}
    <path d="M100,65 L110,85 L90,80 Z" fill="#E63946" filter="url(#majestic-glow)"/>

    {/* Legs */}
    <line x1="75" y1="160" x2="75" y2="185" stroke="url(#majestic-gold)" strokeWidth="3" strokeLinecap="round"/>
    <line x1="65" y1="185" x2="75" y2="185" stroke="url(#majestic-gold)" strokeWidth="3" strokeLinecap="round"/>
    <line x1="85" y1="185" x2="75" y2="185" stroke="url(#majestic-gold)" strokeWidth="3" strokeLinecap="round"/>

    <line x1="100" y1="160" x2="100" y2="185" stroke="url(#majestic-gold)" strokeWidth="3" strokeLinecap="round"/>
    <line x1="90" y1="185" x2="100" y2="185" stroke="url(#majestic-gold)" strokeWidth="3" strokeLinecap="round"/>
    <line x1="110" y1="185" x2="100" y2="185" stroke="url(#majestic-gold)" strokeWidth="3" strokeLinecap="round"/>
    
    <g className="gallo-sparkles">
      <circle cx="50" cy="40" r="2" fill="#D4AF37" opacity="0" style={{animation: 'sparkle 2s ease-in-out infinite'}}/>
      <circle cx="160" cy="70" r="1.5" fill="#D4AF37" opacity="0" style={{animation: 'sparkle 2s ease-in-out infinite 0.6s'}}/>
      <circle cx="40" cy="140" r="2.5" fill="#D4AF37" opacity="0" style={{animation: 'sparkle 2s ease-in-out infinite 1.2s'}}/>
    </g>
  </svg>
);

export const PeacockAvatar = () => (
  <svg className="w-full h-full drop-shadow-[0_4px_10px_rgba(0,188,212,0.5)]" viewBox="0 0 200 200">
    <defs>
      <linearGradient id="peacock-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00BCD4"/>
        <stop offset="100%" stopColor="#006064"/>
      </linearGradient>
      <linearGradient id="peacock-tail" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4CAF50"/>
        <stop offset="100%" stopColor="#1B5E20"/>
      </linearGradient>
      <linearGradient id="peacock-accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFC107"/>
        <stop offset="100%" stopColor="#FF9800"/>
      </linearGradient>
      <filter id="peacock-glow">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Tail Feathers (Hypnotic fan) */}
    <g className="animate-[spin_8s_linear_infinite]" style={{transformOrigin: '100px 100px'}}>
      <polygon points="100,100 30,30 80,10" fill="url(#peacock-tail)"/>
      <polygon points="100,100 80,10 120,10" fill="url(#peacock-body)"/>
      <polygon points="100,100 120,10 170,30" fill="url(#peacock-tail)"/>
      <polygon points="100,100 170,30 190,80" fill="url(#peacock-body)"/>
      <polygon points="100,100 190,80 190,120" fill="url(#peacock-tail)"/>
      <polygon points="100,100 190,120 170,170" fill="url(#peacock-body)"/>
      <polygon points="100,100 170,170 120,190" fill="url(#peacock-tail)"/>
      <polygon points="100,100 120,190 80,190" fill="url(#peacock-body)"/>
      <polygon points="100,100 80,190 30,170" fill="url(#peacock-tail)"/>
      <polygon points="100,100 30,170 10,120" fill="url(#peacock-body)"/>
      <polygon points="100,100 10,120 10,80" fill="url(#peacock-tail)"/>
      <polygon points="100,100 10,80 30,30" fill="url(#peacock-body)"/>
      
      {/* Eyes on feathers */}
      <polygon points="55,40 60,45 55,50 50,45" fill="url(#peacock-accent)" filter="url(#peacock-glow)"/>
      <polygon points="100,25 105,30 100,35 95,30" fill="url(#peacock-accent)" filter="url(#peacock-glow)"/>
      <polygon points="145,40 150,45 145,50 140,45" fill="url(#peacock-accent)" filter="url(#peacock-glow)"/>
      <polygon points="175,100 180,105 175,110 170,105" fill="url(#peacock-accent)" filter="url(#peacock-glow)"/>
      <polygon points="145,150 150,155 145,160 140,155" fill="url(#peacock-accent)" filter="url(#peacock-glow)"/>
      <polygon points="100,165 105,170 100,175 95,170" fill="url(#peacock-accent)" filter="url(#peacock-glow)"/>
      <polygon points="55,150 60,155 55,160 50,155" fill="url(#peacock-accent)" filter="url(#peacock-glow)"/>
      <polygon points="25,100 30,105 25,110 20,105" fill="url(#peacock-accent)" filter="url(#peacock-glow)"/>
    </g>

    {/* Body */}
    <polygon points="100,70 130,150 70,150" fill="url(#peacock-body)"/>
    
    {/* Belly accent */}
    <polygon points="100,90 120,150 80,150" fill="url(#peacock-accent)"/>

    {/* Neck & Head */}
    <polygon points="90,100 110,100 100,40" fill="url(#peacock-body)"/>
    <polygon points="85,30 115,30 100,60" fill="url(#peacock-body)"/>

    {/* Beak */}
    <polygon points="115,35 140,40 110,45" fill="url(#peacock-accent)"/>
    
    {/* Crest */}
    <polygon points="95,30 90,10 100,25" fill="url(#peacock-accent)"/>
    <polygon points="100,30 100,5 105,25" fill="url(#peacock-accent)"/>
    <polygon points="105,30 110,10 110,25" fill="url(#peacock-accent)"/>

    {/* Eye */}
    <polygon points="95,40 105,35 110,40 100,45" fill="white"/>
    <polygon points="100,38 104,39 102,42 98,41" fill="#B71C1C" filter="url(#peacock-glow)"/>

    <g className="gallo-sparkles">
      <circle cx="40" cy="40" r="2" fill="#00BCD4" opacity="0" style={{animation: 'sparkle 1.5s ease-in-out infinite'}}/>
      <circle cx="160" cy="140" r="3" fill="#4CAF50" opacity="0" style={{animation: 'sparkle 2s ease-in-out infinite 0.5s'}}/>
    </g>
  </svg>
);

export const ChameleonAvatar = () => (
  <svg className="w-full h-full drop-shadow-[0_4px_10px_rgba(76,175,80,0.5)]" viewBox="0 0 200 200">
    <defs>
      <linearGradient id="cham-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8BC34A"/>
        <stop offset="100%" stopColor="#33691E"/>
      </linearGradient>
      <linearGradient id="cham-accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#CDDC39"/>
        <stop offset="100%" stopColor="#827717"/>
      </linearGradient>
      <linearGradient id="cham-tongue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E91E63"/>
        <stop offset="100%" stopColor="#880E4F"/>
      </linearGradient>
      <filter id="cham-glow">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    {/* Tail Spiral (Geometric) */}
    <g className="animate-pulse" style={{transformOrigin: '50px 140px'}}>
      <polygon points="70,120 50,160 30,130" fill="url(#cham-body)"/>
      <polygon points="30,130 50,160 20,150" fill="url(#cham-accent)"/>
      <polygon points="20,150 50,160 40,170" fill="url(#cham-body)"/>
    </g>

    {/* Legs */}
    <polygon points="80,140 70,180 90,175" fill="url(#cham-accent)"/>
    <polygon points="120,140 110,180 130,175" fill="url(#cham-accent)"/>

    {/* Body Arch */}
    <polygon points="60,130 90,80 140,80 130,140 70,140" fill="url(#cham-body)"/>
    
    {/* Body Accent (Stripes) */}
    <polygon points="80,80 95,140 105,140 90,80" fill="url(#cham-accent)"/>
    <polygon points="110,80 120,140 130,140 120,80" fill="url(#cham-accent)"/>
    
    {/* Head */}
    <polygon points="130,80 180,80 160,130 130,120" fill="url(#cham-body)"/>
    <polygon points="180,80 190,95 160,110" fill="url(#cham-accent)"/>

    {/* Tongue (Darting animation) */}
    <g className="animate-pulse" style={{transformOrigin: '160px 110px'}}>
      <polyline points="160,110 180,105 175,115 195,110" fill="none" stroke="url(#cham-tongue)" strokeWidth="6" filter="url(#cham-glow)"/>
      <polygon points="190,105 200,110 190,115" fill="url(#cham-tongue)" filter="url(#cham-glow)"/>
    </g>

    {/* Huge Eye */}
    <g className="animate-[spin_4s_linear_infinite]" style={{transformOrigin: '145px 95px'}}>
      <polygon points="130,95 145,80 160,95 145,110" fill="white"/>
      <polygon points="140,95 145,90 150,95 145,100" fill="#B71C1C" filter="url(#cham-glow)"/>
    </g>

    <g className="gallo-sparkles">
      <circle cx="40" cy="60" r="2" fill="#8BC34A" opacity="0" style={{animation: 'sparkle 1.5s ease-in-out infinite'}}/>
      <circle cx="180" cy="150" r="3" fill="#CDDC39" opacity="0" style={{animation: 'sparkle 2s ease-in-out infinite 0.5s'}}/>
    </g>
  </svg>
);

export const BatAvatar = () => (
  <svg className="w-full h-full drop-shadow-[0_4px_10px_rgba(103,58,183,0.5)]" viewBox="0 0 200 200">
    <defs>
      <linearGradient id="bat-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#512DA8"/>
        <stop offset="100%" stopColor="#1A237E"/>
      </linearGradient>
      <linearGradient id="bat-wing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#311B92"/>
        <stop offset="100%" stopColor="#000000"/>
      </linearGradient>
      <linearGradient id="bat-accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9C27B0"/>
        <stop offset="100%" stopColor="#4A148C"/>
      </linearGradient>
      <filter id="bat-glow">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    {/* Back Wings */}
    <g style={{animation: 'wing-flap 1.5s ease-in-out infinite', transformOrigin: '100px 90px'}}>
      <polygon points="100,90 20,20 40,80 10,120 70,110" fill="url(#bat-wing)"/>
      <polygon points="100,90 180,20 160,80 190,120 130,110" fill="url(#bat-wing)"/>
    </g>

    {/* Front Wings (accented) */}
    <g style={{animation: 'wing-flap 1.5s ease-in-out infinite', transformOrigin: '100px 90px'}}>
      <polygon points="90,95 30,40 45,90 20,115 75,105" fill="url(#bat-accent)" opacity="0.6"/>
      <polygon points="110,95 170,40 155,90 180,115 125,105" fill="url(#bat-accent)" opacity="0.6"/>
    </g>

    {/* Body */}
    <polygon points="70,70 130,70 100,160" fill="url(#bat-body)"/>

    {/* Ears */}
    <polygon points="75,70 60,30 90,70" fill="url(#bat-body)"/>
    <polygon points="125,70 140,30 110,70" fill="url(#bat-body)"/>

    {/* Eyes */}
    <polygon points="80,90 90,85 85,95" fill="white" filter="url(#bat-glow)"/>
    <polygon points="120,90 110,85 115,95" fill="white" filter="url(#bat-glow)"/>
    <polygon points="82,90 88,87 86,93" fill="#FF1744"/>
    <polygon points="118,90 112,87 114,93" fill="#FF1744"/>

    {/* Fangs */}
    <polygon points="90,110 95,120 100,110" fill="white"/>
    <polygon points="110,110 105,120 100,110" fill="white"/>

    <g className="gallo-sparkles">
      <circle cx="50" cy="150" r="2" fill="#9C27B0" opacity="0" style={{animation: 'sparkle 1.5s ease-in-out infinite'}}/>
      <circle cx="150" cy="150" r="3" fill="#673AB7" opacity="0" style={{animation: 'sparkle 2s ease-in-out infinite 0.5s'}}/>
    </g>
  </svg>
);

export const DragonAvatar = () => (
  <svg className="w-full h-full drop-shadow-[0_4px_10px_rgba(255,87,34,0.5)]" viewBox="0 0 200 200">
    <defs>
      <linearGradient id="dragon-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E53935"/>
        <stop offset="100%" stopColor="#8E0000"/>
      </linearGradient>
      <linearGradient id="dragon-belly" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFCA28"/>
        <stop offset="100%" stopColor="#F57C00"/>
      </linearGradient>
      <linearGradient id="dragon-wing-back" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7F0000"/>
        <stop offset="100%" stopColor="#3E0000"/>
      </linearGradient>
      <filter id="dragon-glow">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Tail */}
    <g style={{animation: 'tail-swish 3s ease-in-out infinite', transformOrigin: '140px 140px'}}>
      <polygon points="120,130 180,90 160,140" fill="url(#dragon-body)" />
      <polygon points="180,90 200,80 190,100" fill="url(#dragon-belly)" />
    </g>

    {/* Back Wing */}
    <g style={{animation: 'wing-flap 2.5s ease-in-out infinite 0.2s', transformOrigin: '110px 100px'}}>
      <polygon points="100,80 150,15 170,35 130,65 180,75 120,90" fill="url(#dragon-wing-back)"/>
    </g>
    
    {/* Back Leg */}
    <polygon points="110,145 130,180 100,180" fill="url(#dragon-wing-back)"/>

    {/* Body */}
    <polygon points="70,140 130,150 110,80 60,90" fill="url(#dragon-body)"/>
    
    {/* Belly (Geometric Accent like Gallo) */}
    <polygon points="75,130 115,140 90,90" fill="url(#dragon-belly)"/>

    {/* Front Leg */}
    <polygon points="80,140 100,185 70,185" fill="url(#dragon-body)"/>

    {/* Front Wing */}
    <g style={{animation: 'wing-flap 2.5s ease-in-out infinite', transformOrigin: '100px 90px'}}>
      <polygon points="90,85 140,20 160,40 120,70 170,80 110,95" fill="url(#dragon-body)"/>
      <polygon points="95,85 135,28 150,42 120,68 155,75 110,88" fill="url(#dragon-belly)"/>
    </g>

    {/* Neck */}
    <polygon points="60,90 90,85 80,50 50,55" fill="url(#dragon-body)"/>

    {/* Head */}
    <polygon points="40,55 90,50 80,25 30,35" fill="url(#dragon-body)"/>

    {/* Snout/Jaw */}
    <polygon points="30,35 40,55 15,60 20,40" fill="url(#dragon-body)"/>

    {/* Horns (Geometric) */}
    <polygon points="70,25 90,5 80,25" fill="url(#dragon-belly)"/>
    <polygon points="55,30 65,10 65,25" fill="url(#dragon-belly)"/>

    {/* Spikes on back */}
    <polygon points="110,80 130,60 120,90" fill="url(#dragon-belly)"/>
    <polygon points="120,110 145,95 130,120" fill="url(#dragon-belly)"/>

    {/* Abstract Eye (Like Gallo) */}
    <polygon points="55,40 65,38 60,45 50,47" fill="white"/>
    <circle cx="58" cy="42" r="2" fill="#B71C1C" filter="url(#dragon-glow)"/>

    {/* Flame Breath (Geometric) */}
    <g style={{animation: 'sparkle 1.2s ease-in-out infinite'}} filter="url(#dragon-glow)">
      <polygon points="15,60 -10,75 5,85 -20,60 10,50" fill="#FFC107"/>
      <polygon points="10,60 -5,70 5,75 -10,60 8,55" fill="#FF5722"/>
    </g>

    <g className="gallo-sparkles">
      <circle cx="-5" cy="50" r="2" fill="#FFC107" opacity="0" style={{animation: 'sparkle 1.5s ease-in-out infinite'}}/>
      <circle cx="160" cy="30" r="3" fill="#FF5722" opacity="0" style={{animation: 'sparkle 2s ease-in-out infinite 0.5s'}}/>
    </g>
  </svg>
);

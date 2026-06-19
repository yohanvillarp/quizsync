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

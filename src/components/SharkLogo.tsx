import React from 'react';

interface SharkLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const SharkLogo: React.FC<SharkLogoProps> = ({
  className = '',
  size = 'md',
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
    >
      {/* Stylized Geometric Origami Shark Icon in Gold */}
      <div className="relative w-8 h-8 md:w-9 md:h-9 shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md group-hover:scale-105 transition-transform duration-200"
        >
          {/* Shark Body & Dorsal Fin Polygon */}
          <path
            d="M5 22L16 10L24 16L35 12L28 24L33 30L22 28L14 34L11 26L5 22Z"
            fill="url(#sharkGoldGrad)"
          />
          {/* Shark Eye / Specular highlight */}
          <polygon
            points="18,17 24,16 21,21"
            fill="#FFE885"
            opacity="0.9"
          />
          <path
            d="M10 23L16 16L18 20L12 25Z"
            fill="#B2821F"
          />
          <defs>
            <linearGradient id="sharkGoldGrad" x1="5" y1="10" x2="35" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F5D061" />
              <stop offset="0.5" stopColor="#E5A93C" />
              <stop offset="1" stopColor="#B87D1B" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <span className="font-black tracking-wider text-slate-100 text-xs sm:text-sm font-sans uppercase">
          Shark Tank
        </span>
        <span className="font-extrabold tracking-widest text-[#E5A93C] text-[9px] sm:text-[10px] uppercase font-mono mt-0.5">
          Simulator
        </span>
      </div>
    </div>
  );
};

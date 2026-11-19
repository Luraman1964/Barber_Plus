import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'sm' }) => {
  const boxSize = size === 'sm' ? 'w-10 h-10' : 'w-14 h-14';
  const innerSize = size === 'sm' ? 'inset-[2px]' : 'inset-[2.5px]';

  return (
    <div className={`relative ${boxSize} shrink-0 flex items-center justify-center`}>
      {/* Corner star sparkles */}
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="w-2.5 h-2.5 text-[#F2CA50] absolute -top-1 -right-1 z-20 animate-star-twinkle"
      >
        <path
          fill="currentColor"
          d="M8 0L9.7 6.3L16 8L9.7 9.7L8 16L6.3 9.7L0 8L6.3 6.3Z"
        />
      </svg>
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="w-2 h-2 text-[#D4AF37] absolute -bottom-0.5 -left-1 z-20 animate-star-twinkle"
        style={{ animationDelay: '1.2s' }}
      >
        <path
          fill="currentColor"
          d="M8 0L9.7 6.3L16 8L9.7 9.7L8 16L6.3 9.7L0 8L6.3 6.3Z"
        />
      </svg>

      {/* Zoom-breathing badge with rotating golden border glint */}
      <div className="relative w-full h-full rounded-full overflow-hidden animate-logo-zoom shadow-[0_0_14px_rgba(212,175,55,0.28)]">
        <div
          aria-hidden="true"
          className="absolute inset-[-40%] animate-orbit-glint"
          style={{
            background:
              'conic-gradient(from 0deg, rgba(212,175,55,0.12) 0deg, rgba(242,202,80,0.95) 55deg, rgba(255,246,204,1) 75deg, rgba(212,175,55,0.12) 130deg, rgba(212,175,55,0.15) 360deg)',
          }}
        />
        <div
          className={`absolute ${innerSize} rounded-full bg-[#131313] border border-[#D4AF37]/30 flex items-center justify-center`}
        >
          <svg
            viewBox="0 0 40 40"
            className="w-5 h-5 text-[#F2CA50]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 11L28 27" />
            <path d="M28 11L12 27" />
            <circle cx="11.5" cy="28.5" r="3" fill="#131313" />
            <circle cx="28.5" cy="28.5" r="3" fill="#131313" />
            <path d="M17 7H23" stroke="#D4AF37" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
};

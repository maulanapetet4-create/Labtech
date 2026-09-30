import React from 'react';

interface LabtechLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const LabtechLogo: React.FC<LabtechLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const dimensions = {
    sm: { width: 28, height: 42, textClass: 'text-sm' },
    md: { width: 36, height: 54, textClass: 'text-lg' },
    lg: { width: 50, height: 75, textClass: 'text-2xl' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Precision Vector recreation of the Labtech Erlenmeyer Flask logo */}
      <svg
        viewBox="0 0 100 150"
        width={dimensions.width}
        height={dimensions.height}
        className="flex-shrink-0 drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Bubbles / Dots on top (Orange) */}
        <circle cx="48" cy="18" r="9" fill="#f97316" />
        <circle cx="68" cy="27" r="6.5" fill="#f97316" />

        {/* Flask Stopper / Lip (Black) */}
        <ellipse cx="50" cy="40" rx="14" ry="5.5" fill="#0f172a" />
        <circle cx="50" cy="33" r="6" fill="#0f172a" />

        {/* Flask Neck (Black Outer Border, White Inner) */}
        <path
          d="M40 40 V65 M60 40 V65"
          stroke="#0f172a"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Flask Bulb / Round Bottom (Black Outer) */}
        <circle
          cx="50"
          cy="98"
          r="38"
          stroke="#0f172a"
          strokeWidth="8"
          fill="#ffffff"
        />

        {/* Inner Flask Neck Cutout connect */}
        <path
          d="M43 55 V72 M57 55 V72"
          stroke="#0f172a"
          strokeWidth="6"
        />
        <rect x="44" y="42" width="12" height="30" fill="#ffffff" />

        {/* Two Horizontal Measurement Lines Inside Flask */}
        {/* Top thick bar */}
        <rect
          x="19"
          y="84"
          width="40"
          height="7.5"
          rx="3.75"
          fill="#0f172a"
        />
        {/* Bottom thick bar */}
        <rect
          x="19"
          y="98"
          width="36"
          height="7.5"
          rx="3.75"
          fill="#0f172a"
        />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-black tracking-tight text-orange-500 font-sans lowercase ${dimensions.textClass}`}>
            labtech
          </span>
          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 tracking-wider uppercase">
            PT Labtech Indonesia
          </span>
        </div>
      )}
    </div>
  );
};

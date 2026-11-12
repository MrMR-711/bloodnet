import { useId } from 'react';

interface BrandMarkProps {
  size?: number;
  className?: string;
}

export function BrandMark({ size = 40, className }: BrandMarkProps) {
  const gradientId = useId().replace(/:/g, '');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="BloodNet"
    >
      <defs>
        <linearGradient id={gradientId} x1="12" y1="8" x2="52" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#b91c1c" />
          <stop offset="0.55" stopColor="#be123c" />
          <stop offset="1" stopColor="#7f1d1d" />
        </linearGradient>
      </defs>
      <path
        d="M32 5.5C32 5.5 13 26.2 13 39.1C13 49.6 21.5 58 32 58C42.5 58 51 49.6 51 39.1C51 26.2 32 5.5 32 5.5Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M32 18.5V45.5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M24 29.5L32 23L40 29.5"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d="M23 38.5L32 32L41 38.5"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.65"
      />
      <circle cx="32" cy="23" r="3.4" fill="white" />
      <circle cx="23" cy="38.5" r="2.8" fill="white" opacity="0.92" />
      <circle cx="41" cy="38.5" r="2.8" fill="white" opacity="0.92" />
      <circle cx="32" cy="47" r="2.3" fill="white" opacity="0.75" />
    </svg>
  );
}


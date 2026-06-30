interface DoodleTickProps {
  className?: string;
}

export function DoodleTick({ className = "" }: DoodleTickProps) {
  return (
    <svg
      className={`doodle-tick ${className}`.trim()}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        d="M3 13 Q6 16 9 19 Q12 14 16 9 Q19 6 21 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

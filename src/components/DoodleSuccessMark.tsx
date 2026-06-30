interface DoodleSuccessMarkProps {
  className?: string;
}

export function DoodleSuccessMark({ className = "" }: DoodleSuccessMarkProps) {
  return (
    <svg
      className={`doodle-success-mark ${className}`.trim()}
      viewBox="0 0 48 48"
      aria-hidden
    >
      <circle className="doodle-success-mark-bg" cx="24" cy="24" r="20" />
      <path className="doodle-success-mark-check" d="M14 24 L21 31 L34 17" />
    </svg>
  );
}

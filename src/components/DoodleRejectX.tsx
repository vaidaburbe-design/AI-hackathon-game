interface DoodleRejectXProps {
  className?: string;
}

export function DoodleRejectX({ className = "" }: DoodleRejectXProps) {
  return (
    <svg
      className={`doodle-reject-x ${className}`.trim()}
      viewBox="0 0 48 48"
      aria-hidden
    >
      <circle className="doodle-reject-x-bg" cx="24" cy="24" r="20" />
      <path className="doodle-reject-x-mark" d="M15 15 L33 33 M33 15 L15 33" />
    </svg>
  );
}

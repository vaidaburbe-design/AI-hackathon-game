interface NoiseMeterProps {
  noise: number;
}

export function NoiseMeter({ noise }: NoiseMeterProps) {
  const pct = Math.min(100, noise);

  return (
    <div className="noise-meter">
      <div className="mb-1 flex items-center justify-between text-sm font-medium">
        <span className="sketch-label doodle-label">Asleep</span>
        <span className="sketch-label doodle-label">Awake</span>
      </div>
      <div className="noise-track sketch-border">
        <div
          className="noise-empty transition-[left] duration-150"
          style={{
            left: `${pct}%`,
          }}
        />
      </div>
    </div>
  );
}

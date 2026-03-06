interface ConfidenceGaugeProps {
  confidence: number;
}

export function ConfidenceGauge({ confidence }: ConfidenceGaugeProps) {
  const circumference = 188.5; // 2 * PI * 30
  const offset = circumference - (confidence / 100) * circumference;
  const color =
    confidence >= 80
      ? 'var(--green)'
      : confidence >= 50
        ? 'var(--orange)'
        : 'var(--red)';

  return (
    <div className="confidence-gauge">
      <svg viewBox="0 0 64 64">
        <circle className="track" cx="32" cy="32" r="30" />
        <circle
          className="fill"
          cx="32"
          cy="32"
          r="30"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ animation: 'fadeGauge 1s ease forwards' }}
        />
      </svg>
      <div className="pct">
        {confidence}
        <span>%</span>
      </div>
    </div>
  );
}

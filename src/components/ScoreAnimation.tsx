import React, { useEffect, useState } from 'react';

interface ScoreAnimationProps {
  value: number;
  durationMs?: number;
  className?: string;
  suffix?: string;
}

export const ScoreAnimation: React.FC<ScoreAnimationProps> = ({
  value,
  durationMs = 600,
  className = '',
  suffix = ''
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const endValue = value;
    const diff = endValue - startValue;

    if (diff === 0) return;

    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + diff * easeProgress;
      setDisplayValue(Math.round(current * 10) / 10);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [value, durationMs]);

  return (
    <span className={className}>
      {displayValue}
      {suffix}
    </span>
  );
};

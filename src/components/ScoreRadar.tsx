import React from 'react';
import { ScoringParameters } from '../../types/session.ts';
import { PARAMETER_LABELS } from '../../utils/scoring.ts';

interface ScoreRadarProps {
  scores: ScoringParameters;
  size?: number;
  showLabels?: boolean;
  className?: string;
}

export const ScoreRadar: React.FC<ScoreRadarProps> = ({
  scores,
  size = 320,
  showLabels = true,
  className = ''
}) => {
  const keys: (keyof ScoringParameters)[] = [
    'problemStrength',
    'marketOpportunity',
    'solutionQuality',
    'productMarketFit',
    'businessModel',
    'competitiveAdvantage',
    'moat',
    'scalability',
    'execution',
    'traction',
    'founderPitch'
  ];

  const totalPoints = keys.length;
  const center = size / 2;
  const radius = (size / 2) - (showLabels ? 50 : 20);

  // Concentric polygon rings (20%, 40%, 60%, 80%, 100%)
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (index: number, valueFactor: number) => {
    // Angle in radians, starting at top (-pi/2)
    const angle = (Math.PI * 2 * index) / totalPoints - Math.PI / 2;
    const r = radius * valueFactor;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      angle
    };
  };

  // Build the polygon string for current scores
  const scorePolygonPoints = keys.map((key, i) => {
    const val = (scores[key] ?? 50) / 100;
    const coords = getCoordinates(i, Math.max(0.08, Math.min(1, val)));
    return `${coords.x},${coords.y}`;
  }).join(' ');

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Concentric rings */}
        {rings.map((ringFactor, rIdx) => {
          const ringPoints = keys.map((_, i) => {
            const coords = getCoordinates(i, ringFactor);
            return `${coords.x},${coords.y}`;
          }).join(' ');

          return (
            <g key={`ring-${rIdx}`}>
              <polygon
                points={ringPoints}
                fill="none"
                stroke="#334155"
                strokeWidth={rIdx === rings.length - 1 ? 1.5 : 0.8}
                strokeDasharray={rIdx === rings.length - 1 ? undefined : '2,3'}
                className="opacity-70"
              />
              {rIdx === rings.length - 1 && (
                <text
                  x={center + 4}
                  y={center - radius * ringFactor + 12}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  100
                </text>
              )}
            </g>
          );
        })}

        {/* Axis radial spokes */}
        {keys.map((_, i) => {
          const end = getCoordinates(i, 1.0);
          return (
            <line
              key={`spoke-${i}`}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray="2,3"
              className="opacity-60"
            />
          );
        })}

        {/* Data polygon with warm gold gradient */}
        <polygon
          points={scorePolygonPoints}
          fill="rgba(212, 175, 55, 0.28)"
          stroke="#D4AF37"
          strokeWidth="2.2"
          className="transition-all duration-500 ease-out drop-shadow-md"
        />

        {/* Data points */}
        {keys.map((key, i) => {
          const val = (scores[key] ?? 50) / 100;
          const coords = getCoordinates(i, Math.max(0.08, Math.min(1, val)));
          return (
            <circle
              key={`dot-${key}`}
              cx={coords.x}
              cy={coords.y}
              r="3.5"
              fill="#D4AF37"
              stroke="#0F172A"
              strokeWidth="1.5"
              className="transition-all duration-500"
            />
          );
        })}

        {/* Labels around perimeter */}
        {showLabels &&
          keys.map((key, i) => {
            const labelCoords = getCoordinates(i, 1.25);
            const scoreVal = scores[key] ?? 50;
            const shortLabel = PARAMETER_LABELS[key] || key;

            // Alignment adjustments based on horizontal position
            let textAnchor: 'middle' | 'start' | 'end' = 'middle';
            if (labelCoords.x > center + 15) textAnchor = 'start';
            else if (labelCoords.x < center - 15) textAnchor = 'end';

            return (
              <g key={`lbl-${key}`} className="text-xs">
                <text
                  x={labelCoords.x}
                  y={labelCoords.y}
                  textAnchor={textAnchor}
                  fill="#94A3B8"
                  fontSize="10"
                  fontWeight="500"
                  className="select-none tracking-tight"
                >
                  {shortLabel}
                </text>
                <text
                  x={labelCoords.x}
                  y={labelCoords.y + 12}
                  textAnchor={textAnchor}
                  fill="#D4AF37"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                  className="select-none"
                >
                  {Math.round(scoreVal)}
                </text>
              </g>
            );
          })}
      </svg>
    </div>
  );
};

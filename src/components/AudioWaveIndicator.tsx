import React from 'react';

interface AudioWaveIndicatorProps {
  isPlaying: boolean;
  colorClass?: string;
  className?: string;
  barCount?: 4 | 5;
}

export const AudioWaveIndicator: React.FC<AudioWaveIndicatorProps> = ({
  isPlaying,
  colorClass = 'bg-[#E5A93C]',
  className = '',
  barCount = 5
}) => {
  return (
    <div
      className={`inline-flex items-center gap-[2.5px] h-4.5 px-1 ${className}`}
      aria-label={isPlaying ? 'Audio playing' : 'Audio stopped'}
      title={isPlaying ? 'Speaking voice active' : 'Voice idle'}
    >
      <span
        className={`w-[2.5px] rounded-full transition-all ${colorClass} ${
          isPlaying ? 'animate-wave-1' : 'h-1 opacity-50'
        }`}
      />
      <span
        className={`w-[2.5px] rounded-full transition-all ${colorClass} ${
          isPlaying ? 'animate-wave-2' : 'h-2 opacity-50'
        }`}
      />
      <span
        className={`w-[2.5px] rounded-full transition-all ${colorClass} ${
          isPlaying ? 'animate-wave-3' : 'h-1.5 opacity-50'
        }`}
      />
      <span
        className={`w-[2.5px] rounded-full transition-all ${colorClass} ${
          isPlaying ? 'animate-wave-4' : 'h-2.5 opacity-50'
        }`}
      />
      {barCount === 5 && (
        <span
          className={`w-[2.5px] rounded-full transition-all ${colorClass} ${
            isPlaying ? 'animate-wave-5' : 'h-1 opacity-50'
          }`}
        />
      )}
    </div>
  );
};

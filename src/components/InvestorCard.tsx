import React from 'react';
import { InvestorProfile, InvestorMood, IndividualInvestorVerdict } from '../../types/investor.ts';
import { ASSETS } from '../assets/investors.ts';
import { Check } from 'lucide-react';

interface InvestorCardProps {
  investor: InvestorProfile;
  isSelected?: boolean;
  isActive?: boolean;
  mood?: InvestorMood;
  isSelectionMode?: boolean;
  isProfileMode?: boolean;
  isBoardroomMode?: boolean;
  verdict?: IndividualInvestorVerdict;
  onSelect?: () => void;
  onClick?: () => void;
}

export const InvestorCard: React.FC<InvestorCardProps> = ({
  investor,
  isSelected = false,
  isActive = false,
  mood = 'SKEPTICAL',
  isSelectionMode = false,
  isProfileMode = false,
  verdict,
  onSelect
}) => {
  const photoUrl = ASSETS[investor.photoKey];

  // 1. SELECTION MODE (Bottom-Left Screen: "Choose Your Investors")
  if (isSelectionMode) {
    return (
      <div
        onClick={onSelect}
        className={`relative flex flex-col rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden p-3 select-none ${
          isSelected
            ? 'bg-slate-900/90 border-[#E5A93C] shadow-[0_0_20px_-4px_rgba(229,169,60,0.35)]'
            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
        }`}
      >
        {/* Selection check indicator circle */}
        <div className="absolute top-4 right-4 z-10">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
              isSelected
                ? 'bg-[#E5A93C] border-[#E5A93C] text-slate-950'
                : 'border-slate-700 bg-slate-900/80 text-transparent'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>

        {/* Portrait image */}
        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-800 relative mb-3">
          <img
            src={photoUrl}
            alt={investor.name}
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col mb-2.5">
          <h3 className="font-bold text-sm text-slate-100">{investor.name}</h3>
          <p className="text-[11px] text-slate-400 font-medium">{investor.role}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {investor.focusAreas.slice(0, 4).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60 font-sans"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // 2. PROFILE MODE (Top-Right Screen: Left Column in Pitch Room)
  if (isProfileMode) {
    return (
      <div className="bg-[#121A2A] border border-slate-800 rounded-2xl p-4 flex flex-col shadow-xl select-none">
        {/* Large portrait image */}
        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-800 relative mb-4 shadow-md">
          <img
            src={photoUrl}
            alt={investor.name}
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Name & Role */}
        <h3 className="text-base font-extrabold text-slate-100">{investor.name}</h3>
        <p className="text-xs text-[#E5A93C] font-semibold mt-0.5">{investor.role}</p>

        {/* Bio / Description */}
        <p className="text-xs text-slate-300 leading-relaxed mt-3">
          {investor.description}
        </p>

        {/* Focus Tags */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap gap-1.5">
            {investor.focusAreas.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/70"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. VERDICT MODE (Results Screen Row)
  if (verdict) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-800">
            <img src={photoUrl} alt={investor.name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-100 truncate">{investor.name}</h4>
            <p className="text-[10px] text-slate-400 truncate">{investor.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="w-28 sm:w-40 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#E5A93C] to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(10, verdict.score))}%` }}
            />
          </div>
          <span className="font-mono text-sm font-bold text-slate-200 w-8 text-right">
            {verdict.score}
          </span>
        </div>
      </div>
    );
  }

  return null;
};

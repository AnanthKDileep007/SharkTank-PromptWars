import React from 'react';
import { AIBusinessVerdictCategory, FinalAIJudgment } from '../../types/session.ts';
import { CheckCircle2, AlertTriangle, XCircle, ArrowUpRight, Compass, Target } from 'lucide-react';

interface BusinessVerdictCardProps {
  category: AIBusinessVerdictCategory;
  finalJudgment: FinalAIJudgment;
  summary: string;
  whatWorks: string[];
  whatKillsIt: string[];
  whatMustBeProven: string[];
  targetCustomerMatch: string;
  actionableRoadmap: string[];
}

export const BusinessVerdictCard: React.FC<BusinessVerdictCardProps> = ({
  category,
  finalJudgment,
  summary,
  whatWorks,
  whatKillsIt,
  whatMustBeProven,
  targetCustomerMatch,
  actionableRoadmap
}) => {
  const getCategoryTheme = (cat: AIBusinessVerdictCategory) => {
    switch (cat) {
      case 'STRONG BUSINESS IDEA':
        return {
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-500',
          gradient: 'from-emerald-950/40 via-slate-900 to-slate-950',
          border: 'border-emerald-500/40'
        };
      case 'PROMISING BUT NEEDS VALIDATION':
        return {
          badge: 'bg-cyan-950 text-cyan-300 border-cyan-500',
          gradient: 'from-cyan-950/30 via-slate-900 to-slate-950',
          border: 'border-cyan-500/40'
        };
      case 'GOOD PRODUCT WEAK BUSINESS':
      case 'INTERESTING IDEA HIGH RISK':
        return {
          badge: 'bg-amber-950 text-amber-300 border-amber-500',
          gradient: 'from-amber-950/30 via-slate-900 to-slate-950',
          border: 'border-amber-500/40'
        };
      case 'NEEDS MAJOR REWORK':
      case 'NOT INVESTABLE YET':
      default:
        return {
          badge: 'bg-rose-950 text-rose-300 border-rose-500',
          gradient: 'from-rose-950/30 via-slate-900 to-slate-950',
          border: 'border-rose-500/40'
        };
    }
  };

  const getJudgmentBadge = (judgment: FinalAIJudgment) => {
    switch (judgment) {
      case 'BUILD IT':
        return { bg: 'bg-emerald-500 text-slate-950', glow: 'shadow-emerald-500/30' };
      case 'VALIDATE IT FIRST':
        return { bg: 'bg-cyan-500 text-slate-950', glow: 'shadow-cyan-500/30' };
      case 'PIVOT IT':
        return { bg: 'bg-amber-500 text-slate-950', glow: 'shadow-amber-500/30' };
      case 'REWORK THE BUSINESS MODEL':
        return { bg: 'bg-orange-500 text-slate-950', glow: 'shadow-orange-500/30' };
      case 'DO NOT PURSUE IT YET':
      default:
        return { bg: 'bg-rose-600 text-white', glow: 'shadow-rose-600/30' };
    }
  };

  const theme = getCategoryTheme(category);
  const judgmentTheme = getJudgmentBadge(finalJudgment);

  return (
    <div className={`rounded-2xl border ${theme.border} bg-gradient-to-b ${theme.gradient} p-6 shadow-2xl relative overflow-hidden`}>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              AI Panel Final Consensus
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className={`text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border uppercase ${theme.badge}`}>
              {category}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-100">
            Strategic Investment Teardown
          </h2>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Executive Directive</span>
            <span className="text-xs text-slate-300">Action Recommendation</span>
          </div>
          <span
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg ${judgmentTheme.bg} ${judgmentTheme.glow}`}
          >
            {finalJudgment}
          </span>
        </div>
      </div>

      {/* Summary Narrative */}
      <p className="mt-5 text-sm md:text-base text-slate-200 leading-relaxed font-sans">
        {summary}
      </p>

      {/* Target Customer Match Callout */}
      {targetCustomerMatch && (
        <div className="mt-5 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-3">
          <Target className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <strong className="text-slate-100 font-semibold">Target ICP Alignment: </strong>
            {targetCustomerMatch}
          </div>
        </div>
      )}

      {/* 3 Pillars Breakdown */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* What Works */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-emerald-900/40">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>What Makes It Work</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {whatWorks.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What Kills It */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-rose-900/40">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-3">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>What Could Kill It</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {whatKillsIt.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What Must Be Proven */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-amber-900/40">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>What Must Be Proven</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {whatMustBeProven.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Next Steps Roadmap */}
      {actionableRoadmap && actionableRoadmap.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-3">
            <Compass className="w-4 h-4 text-[#D4AF37]" />
            <span>Immediate Strategic Roadmap (Next 90 Days)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {actionableRoadmap.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300"
              >
                <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

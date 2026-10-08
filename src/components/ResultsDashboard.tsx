import React, { useState } from 'react';
import { FinalVerdictResponse, PitchData } from '../../types/session.ts';
import { INVESTORS } from '../../types/investor.ts';
import { InvestorCard } from './InvestorCard.tsx';
import { BusinessVerdictCard } from './BusinessVerdictCard.tsx';
import { ScoreRadar } from './ScoreRadar.tsx';
import { ScoreAnimation } from './ScoreAnimation.tsx';
import { PARAMETER_LABELS, PARAMETER_WEIGHTS } from '../../utils/scoring.ts';
import {
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Copy,
  Check,
  Award,
  Layers,
  ChevronDown
} from 'lucide-react';

interface ResultsDashboardProps {
  verdict: FinalVerdictResponse;
  originalPitch?: PitchData;
  onPitchAgain: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  verdict,
  originalPitch,
  onPitchAgain
}) => {
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'investors' | 'pitch_rewrite'>('overview');

  const handleCopyStrongerPitch = () => {
    if (verdict.strongerPitch?.restructuredPitch) {
      navigator.clipboard.writeText(verdict.strongerPitch.restructuredPitch);
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2000);
    }
  };

  const getInterpretationBadge = (interp: string) => {
    switch (interp) {
      case 'EXCEPTIONAL':
      case 'VERY STRONG':
        return 'bg-emerald-950 text-emerald-300 border-emerald-500';
      case 'PROMISING':
        return 'bg-cyan-950 text-cyan-300 border-cyan-500';
      case 'NEEDS WORK':
        return 'bg-amber-950 text-amber-300 border-amber-500';
      case 'WEAK':
      case 'HIGH RISK':
      default:
        return 'bg-rose-950 text-rose-300 border-rose-500';
    }
  };

  const dealsMade = verdict.investorVerdicts.filter((v) => v.decision === 'INVEST');

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 pb-16">
      {/* Top Banner Header */}
      <header className="bg-[#0F172A] border-b border-slate-800 px-4 md:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase text-[#D4AF37] tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                Post-Tank Deliberation Report
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="text-xs text-slate-400">
                {originalPitch?.startupName || 'Startup'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-100">
              The Tank Has Spoken
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onPitchAgain}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-400 hover:from-[#c49f2e] hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all glow-gold"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Pitch Again</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-6 flex items-center gap-2 border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Executive Consensus & Score
          </button>
          <button
            onClick={() => setActiveTab('investors')}
            className={`pb-3 px-3 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'investors'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Shark Term Sheets & Feedback ({dealsMade.length} {dealsMade.length === 1 ? 'Offer' : 'Offers'})
          </button>
          <button
            onClick={() => setActiveTab('pitch_rewrite')}
            className={`pb-3 px-3 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'pitch_rewrite'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Stronger Pitch Blueprint</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8 space-y-8">
        {/* TAB 1: OVERVIEW & SCORING */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Deals Alert Banner if any investor invested */}
            {dealsMade.length > 0 ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/50 shadow-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-900/60 border border-emerald-500 flex items-center justify-center text-2xl shrink-0">
                    🤝
                  </div>
                  <div>
                    <h3 className="font-black text-emerald-200 text-base md:text-lg">
                      Deal Alert: {dealsMade.length} Investor{dealsMade.length > 1 ? 's' : ''} Made Formal Offers!
                    </h3>
                    <p className="text-xs text-emerald-300/80">
                      {dealsMade.map((d) => d.name).join(' & ')} put capital on the table.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('investors')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shrink-0 transition-all"
                >
                  View Offers
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3 text-slate-300 text-xs">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  No formal deals closed this round, but the panel provided actionable directives on how to de-risk your business model.
                </span>
              </div>
            )}

            {/* Overall Score Hero Card & Key Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Big Score Card */}
              <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Deterministic Panel Score
                  </span>
                  <span
                    className={`text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border uppercase ${getInterpretationBadge(
                      verdict.scoreInterpretation
                    )}`}
                  >
                    {verdict.scoreInterpretation}
                  </span>
                </div>

                <div className="my-6 text-center">
                  <div className="font-mono text-6xl md:text-7xl font-black text-[#D4AF37] tracking-tight">
                    <ScoreAnimation value={verdict.overallScore} />
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Weighted Total / 100</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Potential</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {verdict.investmentPotential}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Risk</span>
                    <span className="text-sm font-bold text-rose-400 font-mono">
                      {verdict.riskScore}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Conviction</span>
                    <span className="text-sm font-bold text-cyan-400 font-mono">
                      {verdict.confidenceScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Radar Chart */}
              <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 flex flex-col items-center justify-between shadow-2xl">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 self-start">
                  Strategic Parameter Polygon
                </span>
                <ScoreRadar scores={verdict.parameterScores} size={280} showLabels={true} />
              </div>

              {/* Parameter Breakdown Bars */}
              <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between shadow-2xl">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 block">
                  Weighted Parameter Breakdown
                </span>
                <div className="space-y-2.5 overflow-y-auto max-h-[290px] pr-1">
                  {(Object.keys(PARAMETER_WEIGHTS) as (keyof typeof PARAMETER_WEIGHTS)[]).map((key) => {
                    const val = verdict.parameterScores[key] ?? 50;
                    const weightPct = Math.round(PARAMETER_WEIGHTS[key] * 100);
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300 font-medium truncate">
                            {PARAMETER_LABELS[key]} ({weightPct}%)
                          </span>
                          <span className="font-mono text-slate-200 font-bold">{Math.round(val)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-slate-600 to-[#D4AF37] rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(5, val)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AI Business Verdict Card */}
            {verdict.aiBusinessVerdict && (
              <BusinessVerdictCard
                category={verdict.aiBusinessVerdict.category}
                finalJudgment={verdict.aiBusinessVerdict.finalJudgment}
                summary={verdict.aiBusinessVerdict.summary}
                whatWorks={verdict.aiBusinessVerdict.whatWorks}
                whatKillsIt={verdict.aiBusinessVerdict.whatKillsIt}
                whatMustBeProven={verdict.aiBusinessVerdict.whatMustBeProven}
                targetCustomerMatch={verdict.aiBusinessVerdict.targetCustomerMatch}
                actionableRoadmap={verdict.aiBusinessVerdict.actionableRoadmap}
              />
            )}
          </div>
        )}

        {/* TAB 2: INVESTOR VERDICTS & TERM SHEETS */}
        {activeTab === 'investors' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100">
                  Individual Shark Votes & Term Sheets
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Every investor weighs your business according to their specific thesis and risk threshold.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {verdict.investorVerdicts.map((v) => {
                const profile = INVESTORS.find((inv) => inv.id === v.investorId) || INVESTORS[0];
                return (
                  <InvestorCard
                    key={v.investorId}
                    investor={profile}
                    verdict={v}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: STRONGER PITCH BLUEPRINT */}
        {activeTab === 'pitch_rewrite' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37] uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Data-Driven Pitch Reconstruction</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-100">
                    How The Sharks Wanted To Hear It
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Restructured without inventing fake traction or fictional numbers—focusing purely on customer outcome and defensibility.
                  </p>
                </div>

                <button
                  onClick={handleCopyStrongerPitch}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors self-start md:self-auto"
                >
                  {copiedPitch ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied Pitch</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>Copy Restructured Pitch</span>
                    </>
                  )}
                </button>
              </div>

              {/* Hook Sentence */}
              {verdict.strongerPitch?.hookSentence && (
                <div className="mt-5 p-4 rounded-xl bg-slate-900 border-l-4 border-[#D4AF37] text-slate-200">
                  <span className="text-[10px] font-mono uppercase text-[#D4AF37] tracking-wider block mb-1">
                    The Opening Punchline
                  </span>
                  <p className="text-base font-bold text-slate-100 italic">
                    &ldquo;{verdict.strongerPitch.hookSentence}&rdquo;
                  </p>
                </div>
              )}

              {/* Side by side comparison */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Pitch */}
                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                    <span>Original Pitch Delivery</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans italic">
                    &ldquo;{verdict.strongerPitch?.originalExcerpt || originalPitch?.pitch}&rdquo;
                  </p>
                </div>

                {/* Restructured Pitch */}
                <div className="p-5 rounded-xl bg-gradient-to-b from-amber-950/20 to-slate-900 border border-[#D4AF37]/50 shadow-lg">
                  <div className="flex items-center justify-between text-xs font-mono text-[#D4AF37] uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1 font-bold">
                      <Sparkles className="w-3.5 h-3.5" /> High-Conviction Reconstructed Pitch
                    </span>
                  </div>
                  <p className="text-sm text-slate-100 leading-relaxed font-sans font-medium">
                    &ldquo;{verdict.strongerPitch?.restructuredPitch}&rdquo;
                  </p>
                </div>
              </div>

              {/* Key Changes Made */}
              {verdict.strongerPitch?.keyChangesMade && verdict.strongerPitch.keyChangesMade.length > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-800">
                  <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block mb-3">
                    Why This Restructuring Converts Investors:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {verdict.strongerPitch.keyChangesMade.map((change, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                      >
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

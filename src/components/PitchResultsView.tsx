import React, { useState } from 'react';
import { FinalVerdictResponse, PitchData } from '../../types/session.ts';
import { INVESTORS, InvestorId } from '../../types/investor.ts';
import { AppSidebar, NavItemKey } from './AppSidebar.tsx';
import { CircularGauge } from './CircularGauge.tsx';
import { ASSETS } from '../assets/investors.ts';
import {
  Download,
  BarChart3,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Award,
  AlertTriangle,
  FileText
} from 'lucide-react';

interface PitchResultsViewProps {
  verdict: FinalVerdictResponse;
  originalPitch?: PitchData;
  onPitchAgain: () => void;
  onNavigateSidebar: (key: NavItemKey) => void;
}

export const PitchResultsView: React.FC<PitchResultsViewProps> = ({
  verdict,
  originalPitch,
  onPitchAgain,
  onNavigateSidebar
}) => {
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [showPitchRewrite, setShowPitchRewrite] = useState(false);
  const [savedReport, setSavedReport] = useState(false);
  const [expandedSharkId, setExpandedSharkId] = useState<InvestorId | null>(null);

  const handleCopyStrongerPitch = () => {
    if (verdict.strongerPitch?.restructuredPitch) {
      navigator.clipboard.writeText(verdict.strongerPitch.restructuredPitch);
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2000);
    }
  };

  const handleSaveReport = () => {
    const reportData = JSON.stringify(
      {
        startup: originalPitch?.startupName,
        overallScore: verdict.overallScore,
        aiVerdict: verdict.aiBusinessVerdict,
        scores: verdict.parameterScores,
        investorVerdicts: verdict.investorVerdicts,
        strongerPitch: verdict.strongerPitch
      },
      null,
      2
    );
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${originalPitch?.startupName || 'Startup'}_Shark_Tank_Evaluation.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSavedReport(true);
    setTimeout(() => setSavedReport(false), 2000);
  };

  const dealsMade = (verdict.investorVerdicts || []).filter((v) => v.decision === 'INVEST');

  // Dynamic Investment Potential calculation
  const potentialVal = verdict.investmentPotential ?? Math.round(verdict.overallScore * 0.95);
  const potentialLabel = potentialVal >= 75 ? 'High' : potentialVal >= 55 ? 'Medium' : 'Low';
  const potentialColorClass =
    potentialLabel === 'High'
      ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
      : potentialLabel === 'Medium'
      ? 'text-amber-400 bg-amber-950/60 border-amber-500/30'
      : 'text-rose-400 bg-rose-950/60 border-rose-500/30';

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'INVEST':
        return 'bg-emerald-950 text-emerald-300 border-emerald-500 font-bold';
      case 'INTERESTED':
        return 'bg-cyan-950 text-cyan-300 border-cyan-500';
      case 'WATCHLIST':
        return 'bg-amber-950 text-amber-300 border-amber-500';
      case 'HARD PASS':
        return 'bg-rose-950 text-rose-300 border-rose-600 font-bold';
      case 'PASS':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="flex h-screen max-h-screen bg-[#070D18] text-slate-100 overflow-hidden font-sans">
      {/* Left Navigation Sidebar */}
      <AppSidebar
        activeKey="results"
        onNavigate={onNavigateSidebar}
        hasActiveSession={true}
        className="hidden md:flex"
      />

      {/* Main Results Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B1120] overflow-y-auto">
        <div className="max-w-6xl w-full mx-auto p-6 md:p-8 space-y-8">
          {/* Header matching dashboard image */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold uppercase text-[#E5A93C] tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#E5A93C]" />
                  AI Investor Panel Verdict
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-xs text-slate-400">
                  {originalPitch?.startupName || 'Startup'}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
                Pitch Results
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                Here&apos;s how your startup idea performed based on your live defense with the investors.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveReport}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
              >
                {savedReport ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Download className="w-4 h-4 text-slate-400" />
                )}
                <span>{savedReport ? 'Report Saved' : 'Save Report'}</span>
              </button>

              <button
                onClick={onPitchAgain}
                className="px-5 py-2.5 rounded-xl bg-[#E5A93C] hover:bg-[#d6992d] text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all glow-gold"
              >
                <span>Pitch Again</span>
              </button>
            </div>
          </div>

          {/* Top 4 Metrics Cards Grid matching screenshot */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Overall Score */}
            <div className="bg-[#121A2A] border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center shadow-lg">
              <CircularGauge
                score={verdict.overallScore}
                label="Overall Score"
                color={
                  verdict.overallScore >= 75
                    ? 'emerald'
                    : verdict.overallScore >= 55
                    ? 'amber'
                    : 'rose'
                }
                size={95}
              />
            </div>

            {/* Card 2: Investment Potential */}
            <div className="bg-[#121A2A] border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center shadow-lg text-center">
              <div
                className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-2 ${potentialColorClass}`}
              >
                <BarChart3 className="w-6 h-6" />
              </div>
              <span className={`text-2xl font-black font-sans tracking-tight mt-1 ${potentialColorClass.split(' ')[0]}`}>
                {potentialLabel}
              </span>
              <span className="text-xs font-semibold text-slate-400 mt-1">
                Investment Potential
              </span>
            </div>

            {/* Card 3: Risk Score */}
            <div className="bg-[#121A2A] border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center shadow-lg">
              <CircularGauge
                score={verdict.riskScore ?? 38}
                label="Risk Score"
                color="rose"
                size={95}
              />
            </div>

            {/* Card 4: Confidence Score */}
            <div className="bg-[#121A2A] border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center shadow-lg">
              <CircularGauge
                score={verdict.confidenceScore ?? 74}
                label="Confidence Score"
                color="cyan"
                size={95}
              />
            </div>
          </div>

          {/* Two Main Columns Below matching dashboard image */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Investor Scores (5 Columns / 12) */}
            <div className="lg:col-span-5 bg-[#121A2A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-100">Investor Scores</h2>
                <span className="text-[11px] text-slate-500 font-mono">
                  Click shark for feedback
                </span>
              </div>

              <div className="space-y-3">
                {INVESTORS.map((inv) => {
                  const match = (verdict.investorVerdicts || []).find(
                    (v) => v.investorId === inv.id
                  );
                  const score = match ? match.score : verdict.overallScore;
                  const decision = match ? match.decision : 'PASS';
                  const isExpanded = expandedSharkId === inv.id;

                  return (
                    <div
                      key={inv.id}
                      onClick={() =>
                        setExpandedSharkId(isExpanded ? null : inv.id)
                      }
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-slate-800 border border-slate-700">
                            <img
                              src={ASSETS[inv.photoKey]}
                              alt={inv.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-100 truncate">
                              {inv.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate">
                              {inv.role}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${getDecisionBadge(
                              decision
                            )}`}
                          >
                            {decision}
                          </span>
                          {/* Progress Bar */}
                          <div className="w-16 sm:w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#E5A93C] to-emerald-400 rounded-full transition-all duration-700"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-200 w-5 text-right">
                            {score}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Shark Individual Breakdown */}
                      {isExpanded && match && (
                        <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1.5 text-slate-300 animate-fade-in">
                          <p className="italic text-slate-400">
                            &ldquo;{match.quote}&rdquo;
                          </p>
                          {match.offer && (
                            <div className="p-2 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono text-[10px]">
                              Term Sheet: {match.offer.funding} for {match.offer.equity} ({match.offer.conditions})
                            </div>
                          )}
                          <div className="text-slate-400">
                            <strong className="text-slate-200">What I Liked:</strong> {match.whatILiked}
                          </div>
                          <div className="text-slate-400">
                            <strong className="text-rose-300">Biggest Concern:</strong> {match.biggestConcern}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {dealsMade.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between">
                  <span>
                    <strong>Deals Offered:</strong> {dealsMade.length} Shark{dealsMade.length > 1 ? 's' : ''} offered investment term sheets!
                  </span>
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">
                    Deal Closed
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: AI Business Verdict (7 Columns / 12) */}
            <div className="lg:col-span-7 bg-[#121A2A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <h2 className="text-base font-bold text-slate-100">AI Business Verdict</h2>

              {/* Main Lightbulb Assessment Card */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-[#E5A93C] shrink-0 mt-0.5">
                  <Lightbulb className="w-5 h-5 text-[#E5A93C]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100">
                      {verdict.aiBusinessVerdict?.category || 'Evaluation Complete'}
                    </h3>
                    {verdict.aiBusinessVerdict?.finalJudgment && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E5A93C]/20 text-[#E5A93C] border border-[#E5A93C]/40 uppercase">
                        {verdict.aiBusinessVerdict.finalJudgment}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {verdict.aiBusinessVerdict?.summary ||
                      'Your startup was evaluated strictly based on your live defense in the tank. Defensibility, unit economics, and customer acquisition efficiency remain the critical drivers for institutional funding.'}
                  </p>
                </div>
              </div>

              {/* Two Sub-Cards Side by Side: Key Strengths & Key Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Key Strengths */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Key Strengths
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(verdict.aiBusinessVerdict?.whatWorks || [
                      'Clear problem statement',
                      'Large market opportunity',
                      'Strong technical approach',
                      'Positive social impact'
                    ]).slice(0, 4).map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Weaknesses */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    Key Weaknesses
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(verdict.aiBusinessVerdict?.whatKillsIt || [
                      'Needs stronger defensibility',
                      'Unclear unit economics',
                      'Execution risks',
                      'Requires more evidence'
                    ]).slice(0, 4).map((weak, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Stronger Pitch Drawer / Accordion */}
          {verdict.strongerPitch && (
            <div className="bg-[#121A2A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E5A93C]" />
                  <h3 className="text-sm font-bold text-slate-100">
                    Data-Driven Pitch Reconstruction Blueprint
                  </h3>
                </div>
                <button
                  onClick={() => setShowPitchRewrite(!showPitchRewrite)}
                  className="text-xs font-semibold text-[#E5A93C] hover:underline flex items-center gap-1"
                >
                  <span>{showPitchRewrite ? 'Hide Blueprint' : 'View Restructured Pitch'}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      showPitchRewrite ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {showPitchRewrite && (
                <div className="space-y-4 pt-3 border-t border-slate-800 animate-fade-in">
                  {verdict.strongerPitch.hookSentence && (
                    <div className="p-3.5 rounded-xl bg-slate-900 border-l-4 border-[#E5A93C] text-xs text-slate-200">
                      <span className="text-[10px] font-mono text-[#E5A93C] uppercase block mb-1">
                        The 1-Sentence Opening Hook:
                      </span>
                      <strong className="text-slate-100">
                        &ldquo;{verdict.strongerPitch.hookSentence}&rdquo;
                      </strong>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
                    <strong className="text-[#E5A93C] block text-[11px] font-mono uppercase mb-1">
                      High-Conviction Restructured Pitch:
                    </strong>
                    &ldquo;{verdict.strongerPitch.restructuredPitch}&rdquo;
                  </div>

                  {verdict.strongerPitch.keyChangesMade && verdict.strongerPitch.keyChangesMade.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                        Strategic Improvements Made:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {verdict.strongerPitch.keyChangesMade.map((ch, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{ch}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleCopyStrongerPitch}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-2 transition-colors"
                    >
                      {copiedPitch ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">Copied to Clipboard</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-400" />
                          <span>Copy Reconstructed Pitch</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { DifficultyLevel, StartupContextSummary } from '../../types/session.ts';
import { INVESTORS, InvestorId } from '../../types/investor.ts';
import { InvestorCard } from './InvestorCard.tsx';
import { SharkLogo } from './SharkLogo.tsx';
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Smile,
  Flame,
  Check,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface OnboardingFlowProps {
  onBackToHome: () => void;
  onComplete: (
    selectedSharks: InvestorId[],
    difficulty: DifficultyLevel,
    startupContext: StartupContextSummary
  ) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onBackToHome,
  onComplete
}) => {
  // Current step state machine (1 -> 2 -> 3)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // SCREEN 1: Active Sharks Roster
  const [selectedSharks, setSelectedSharks] = useState<InvestorId[]>([
    'tony',
    'bill',
    'priya',
    'raj',
    'maya'
  ]);
  const [sharkError, setSharkError] = useState<string | null>(null);

  // SCREEN 2: Evaluation Difficulty
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Standard VC');

  // SCREEN 3: Real-Time Startup Input Form (COMPLETELY PURGED ON INITIAL LOAD)
  const [startupForm, setStartupForm] = useState<StartupContextSummary>({
    name: '',
    niche: '',
    elevatorPitch: '',
    targetAudience: '',
    financialsAsk: '',
    founderName: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Step 1 Toggle
  const toggleShark = (id: InvestorId) => {
    setSharkError(null);
    if (selectedSharks.includes(id)) {
      if (selectedSharks.length === 1) {
        setSharkError('You must keep at least 1 Shark on the panel.');
        return;
      }
      setSelectedSharks(selectedSharks.filter((s) => s !== id));
    } else {
      setSelectedSharks([...selectedSharks, id]);
    }
  };

  const handleStep1Next = () => {
    if (selectedSharks.length === 0) {
      setSharkError('Please select at least 1 Shark to continue.');
      return;
    }
    setSharkError(null);
    setCurrentStep(2);
  };

  const handleStep2Next = () => {
    setCurrentStep(3);
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupForm.name.trim()) {
      setFormError('Please provide your Startup Name.');
      return;
    }
    if (!startupForm.niche.trim()) {
      setFormError('Please specify your Industry / Niche (e.g. B2B SaaS, D2C, Hardware).');
      return;
    }
    if (!startupForm.elevatorPitch.trim() || startupForm.elevatorPitch.trim().length < 15) {
      setFormError('Please enter a clear product summary / elevator pitch (min 15 characters).');
      return;
    }
    if (!startupForm.financialsAsk.trim()) {
      setFormError('Please provide your Financial Ask (e.g. $500,000 for 10% equity).');
      return;
    }

    setFormError(null);
    onComplete(selectedSharks, difficulty, {
      ...startupForm,
      name: startupForm.name.trim(),
      niche: startupForm.niche.trim(),
      elevatorPitch: startupForm.elevatorPitch.trim(),
      targetAudience: startupForm.targetAudience.trim() || 'General Market',
      financialsAsk: startupForm.financialsAsk.trim(),
      founderName: startupForm.founderName?.trim() || 'Founder'
    });
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col justify-between py-6 px-4 md:px-12 selection:bg-[#E5A93C]/30 selection:text-[#E5A93C] font-sans">
      {/* Top Stepper Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800/80">
        <button
          onClick={() => {
            if (currentStep === 1) onBackToHome();
            else setCurrentStep((currentStep - 1) as 1 | 2);
          }}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentStep === 1 ? 'Back to Home' : 'Back'}</span>
        </button>

        <SharkLogo onClick={onBackToHome} />

        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <span className="text-[#E5A93C] font-bold">Step {currentStep}</span>
          <span>/ 3</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto my-8 flex-1 flex flex-col justify-center">
        {/* ========================================================= */}
        {/* SCREEN 1: SHARK SELECTION PAGE */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#E5A93C] block mb-1">
                  SCREEN 1 &bull; PANEL ASSEMBLY
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
                  Choose Your Sharks
                </h1>
                <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Select or deselect who sits on the investment panel. Each Shark challenges different aspects of your business.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[#E5A93C] font-bold">
                  {selectedSharks.length} of {INVESTORS.length} Active
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSharks(['tony', 'bill', 'priya', 'raj', 'maya'])}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Select All
                </button>
              </div>
            </div>

            {sharkError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/60 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{sharkError}</span>
              </div>
            )}

            {/* 5 Investor Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {INVESTORS.map((inv) => (
                <InvestorCard
                  key={inv.id}
                  investor={inv}
                  isSelected={selectedSharks.includes(inv.id)}
                  isSelectionMode={true}
                  onSelect={() => toggleShark(inv.id)}
                />
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleStep1Next}
                className="px-8 py-3.5 rounded-xl bg-[#E5A93C] hover:bg-[#d6992d] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all glow-gold"
              >
                <span>Next: Choose Difficulty</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 2: PITCH DIFFICULTY SELECTION */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto w-full">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E5A93C] block mb-1">
                SCREEN 2 &bull; EVALUATION SCRUTINY
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
                Pitch Difficulty Selection
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
                Difficulty directly modulates the Sharks&apos; counter-questioning aggressiveness, valuation pushback, and tolerance for incomplete data.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Friendly Angel */}
              <div
                onClick={() => setDifficulty('Friendly Angel')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  difficulty === 'Friendly Angel'
                    ? 'bg-slate-900/90 border-[#E5A93C] shadow-[0_0_20px_-4px_rgba(229,169,60,0.35)]'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Smile className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                    0.7 Temp
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-100">Friendly Angel</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Supportive, constructive tone. Inquisitive about your vision, patient with early-stage unknowns, and focuses on helping you refine your pitch.
                </p>
              </div>

              {/* Standard VC */}
              <div
                onClick={() => setDifficulty('Standard VC')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all relative ${
                  difficulty === 'Standard VC'
                    ? 'bg-slate-900/90 border-[#E5A93C] shadow-[0_0_20px_-4px_rgba(229,169,60,0.35)]'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                {difficulty === 'Standard VC' && (
                  <div className="absolute top-4 right-4 text-[#E5A93C]">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-[#E5A93C]">
                    <Shield className="w-5 h-5 text-[#E5A93C]" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-[#E5A93C] border border-amber-800/80 font-bold">
                    0.85 Temp
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-100">Standard VC</h3>
                  <span className="text-[10px] font-mono text-[#E5A93C] uppercase font-bold">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Realistic venture capital rigor. Sharks demand concrete unit economics, challenge customer acquisition costs, and stress-test your defensibility.
                </p>
              </div>

              {/* Hardcore Shark */}
              <div
                onClick={() => setDifficulty('Hardcore Shark')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  difficulty === 'Hardcore Shark'
                    ? 'bg-slate-900/90 border-[#E5A93C] shadow-[0_0_20px_-4px_rgba(229,169,60,0.35)]'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <Flame className="w-5 h-5 text-rose-500" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/80">
                    1.0 Temp
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-100">Hardcore Shark</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Cutthroat Shark Tank pressure. Zero tolerance for hand-waving or missing metrics. Aggressive counter-questioning, ruthless valuation cuts, and fast exits.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                ← Back to Sharks
              </button>

              <button
                type="button"
                onClick={handleStep2Next}
                className="px-8 py-3.5 rounded-xl bg-[#E5A93C] hover:bg-[#d6992d] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all glow-gold"
              >
                <span>Next: Startup Pitch Form</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 3: REAL-TIME PITCH INPUT FORM (NO MOCK DATA) */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <form onSubmit={handleStep3Submit} className="space-y-6 animate-fade-in max-w-3xl mx-auto w-full">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E5A93C] block mb-1">
                SCREEN 3 &bull; REAL-TIME PITCH BLUEPRINT
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
                Enter Your Live Startup Details
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed">
                All mock and pre-filled data has been purged. The Sharks will evaluate you strictly based on what you submit below.
              </p>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-600/70 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="bg-[#121A2A] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Startup Name <span className="text-[#E5A93C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={startupForm.name}
                    onChange={(e) => setStartupForm({ ...startupForm, name: e.target.value })}
                    placeholder="e.g. ApexLogistics, HealthScan AI, Koko Beverage"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070D18] border border-slate-700/80 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#E5A93C]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Niche / Industry <span className="text-[#E5A93C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={startupForm.niche}
                    onChange={(e) => setStartupForm({ ...startupForm, niche: e.target.value })}
                    placeholder="e.g. B2B SaaS, D2C Consumer Goods, Fintech API, CleanTech"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070D18] border border-slate-700/80 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#E5A93C]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Product Summary & Core Problem <span className="text-[#E5A93C]">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={startupForm.elevatorPitch}
                  onChange={(e) => setStartupForm({ ...startupForm, elevatorPitch: e.target.value })}
                  placeholder="What does your product do, what acute customer pain does it eliminate, and why is it 10x better?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070D18] border border-slate-700/80 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#E5A93C] leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Target Audience / Ideal Customer Profile <span className="text-[#E5A93C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={startupForm.targetAudience}
                    onChange={(e) => setStartupForm({ ...startupForm, targetAudience: e.target.value })}
                    placeholder="e.g. Mid-market CFOs, Gen-Z runners, Independent dentists"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070D18] border border-slate-700/80 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#E5A93C]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Financials & Funding Ask <span className="text-[#E5A93C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={startupForm.financialsAsk}
                    onChange={(e) => setStartupForm({ ...startupForm, financialsAsk: e.target.value })}
                    placeholder="e.g. $500,000 for 10% equity ($20k MRR, 80% margins)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070D18] border border-slate-700/80 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#E5A93C]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Founder Name <span className="text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={startupForm.founderName}
                  onChange={(e) => setStartupForm({ ...startupForm, founderName: e.target.value })}
                  placeholder="e.g. Alex Chen"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070D18] border border-slate-700/80 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#E5A93C]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                ← Back to Difficulty
              </button>

              <button
                type="submit"
                className="px-10 py-3.5 rounded-xl bg-[#E5A93C] hover:bg-[#d6992d] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all glow-gold"
              >
                <span>Start Pitching</span>
                <Sparkles className="w-4 h-4 fill-slate-950" />
              </button>
            </div>
          </form>
        )}
      </main>

      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 py-4 border-t border-slate-800/80">
        <span>Shark Tank Simulator &bull; Context Boundary Locked &bull; Zero Mock Data</span>
      </footer>
    </div>
  );
};

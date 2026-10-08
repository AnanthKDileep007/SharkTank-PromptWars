import React from 'react';
import { SharkLogo } from './SharkLogo.tsx';
import { ASSETS } from '../assets/investors.ts';
import {
  ArrowRight,
  Sparkles,
  HelpCircle,
  Cpu,
  Briefcase,
  TrendingUp,
  Play
} from 'lucide-react';

interface LandingPageViewProps {
  onStartPitching: () => void;
  onTryDemo: () => void;
  onOpenInvestors: () => void;
  onOpenHowItWorks?: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onStartPitching,
  onTryDemo,
  onOpenInvestors,
  onOpenHowItWorks
}) => {
  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col justify-between selection:bg-[#E5A93C]/30 selection:text-[#E5A93C] font-sans">
      {/* Top Navbar matching screenshot */}
      <nav className="border-b border-slate-800/80 bg-[#070D18]/90 backdrop-blur-md px-6 md:px-12 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <SharkLogo />

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <button className="text-slate-100 hover:text-[#E5A93C] transition-colors">
              Home
            </button>
            <button
              onClick={onOpenHowItWorks}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              How it works
            </button>
            <button
              onClick={onOpenInvestors}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Investors
            </button>
            <a href="#features" className="text-slate-400 hover:text-slate-200 transition-colors">
              Features
            </a>
          </div>

          <button
            onClick={onStartPitching}
            className="px-4 py-2 rounded-xl bg-[#E5A93C] hover:bg-[#d6992d] text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all glow-gold"
          >
            <span>Start Pitching</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </nav>

      {/* Hero Section matching screenshot */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-10 md:py-16 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400 block">
              AI POWERED STARTUP PITCH SIMULATION
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-100 leading-[1.08]">
              Pitch it.
              <br />
              Defend it.
              <br />
              <span className="text-[#E5A93C]">Survive the Tank.</span>
            </h1>

            <p className="text-sm md:text-base text-slate-400 max-w-md leading-relaxed font-sans">
              Face a panel of AI investors, get real feedback, find the flaws, and make your idea stronger.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onStartPitching}
                className="px-6 py-3.5 rounded-xl bg-[#E5A93C] hover:bg-[#d6992d] text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all glow-gold"
              >
                <span>Start Pitching</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={onTryDemo}
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
              >
                <span>Try Demo</span>
              </button>
            </div>
          </div>

          {/* Right Hero Image Column (7 cols) */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800/90 shadow-2xl bg-slate-900 group">
              <img
                src={ASSETS.heroPanel}
                alt="Shark Tank AI Investor Panel"
                className="w-full h-auto object-cover rounded-2xl transform group-hover:scale-[1.01] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070D18]/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 4 Bottom Feature Cards matching screenshot */}
        <div id="features" className="mt-16 md:mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Feature 1 */}
          <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-[#E5A93C]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100">Realistic Questions</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Challenging and adaptive</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5 text-[#E5A93C]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100">AI Powered Analysis</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Detailed feedback</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-[#E5A93C]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100">Professional Experience</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Like a real pitch</p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-[#E5A93C]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100">Improve Your Idea</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Stronger pitch every time</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070D18] py-6 px-6 text-center text-xs text-slate-500">
        <p>Shark Tank Simulator &bull; Powered by Google Gemini AI</p>
      </footer>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { INVESTORS, InvestorProfile } from '../../types/investor.ts';
import { X, ShieldAlert, Award, Lightbulb, Sparkles, Volume2 } from 'lucide-react';
import { speechService, AudioPlaybackState } from '../services/speechService.ts';
import { getSharkVoiceProfile } from '../services/sharkVoiceConfig.ts';
import { AudioWaveIndicator } from './AudioWaveIndicator.tsx';

interface MeetInvestorsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MeetInvestorsModal: React.FC<MeetInvestorsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [audioState, setAudioState] = useState<AudioPlaybackState>(speechService.getState());

  useEffect(() => {
    const unsub = speechService.subscribe(setAudioState);
    return () => {
      unsub();
      speechService.stop();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#1E293B] border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Executive Investment Panel</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-100 mt-1">
              The 5 AI Sharks In The Tank
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Each investor evaluates your business model through a fundamentally different lens. They do not give automatic praise—they will stress-test your unit economics, challenge your tech moat, interrogate your customer retention, and expose unproven assumptions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {INVESTORS.map((inv) => (
              <div
                key={inv.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
                      {inv.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-base">{inv.name}</h3>
                      <p className="text-xs font-medium text-[#D4AF37]">{inv.role}</p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs italic text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                    &ldquo;{inv.quote}&rdquo;
                  </p>

                  {/* Voice Preview Button */}
                  <div className="mt-2.5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        speechService.speak({
                          sharkIdentifier: inv.name,
                          text: inv.quote,
                          forcePlay: true
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-[#D4AF37] transition-all"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Hear Voice Sample</span>
                      {audioState.isPlaying && audioState.activeSharkName === inv.name && (
                        <AudioWaveIndicator isPlaying={true} colorClass="bg-[#D4AF37]" className="h-3 ml-0.5" />
                      )}
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {getSharkVoiceProfile(inv.name).gender === 'female' ? 'Female Voice' : 'Male Voice'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1.5">
                      Key Interrogation Vectors:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {inv.focusAreas.map((area, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
          >
            Got It, Prepare Pitch
          </button>
        </div>
      </div>
    </div>
  );
};

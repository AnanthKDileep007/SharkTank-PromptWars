import React, { useState, useRef, useEffect } from 'react';
import {
  ChatMessage,
  DifficultyLevel,
  SharkReactionType,
  StartupContextSummary
} from '../../types/session.ts';
import { INVESTORS, InvestorId, InvestorProfile } from '../../types/investor.ts';
import { AppSidebar, NavItemKey } from './AppSidebar.tsx';
import { ASSETS } from '../assets/investors.ts';
import { speechService, AudioPlaybackState } from '../services/speechService.ts';
import { getSharkVoiceProfile } from '../services/sharkVoiceConfig.ts';
import { AudioWaveIndicator } from './AudioWaveIndicator.tsx';
import {
  Send,
  Gavel,
  Loader2,
  Sparkles,
  Info,
  X,
  Radio,
  Flame,
  Volume2,
  VolumeX,
  Square,
  Play
} from 'lucide-react';

interface PitchRoomViewProps {
  roomId: string;
  startupContext: StartupContextSummary;
  selectedSharkIds: InvestorId[];
  difficulty: DifficultyLevel;
  messages: ChatMessage[];
  isThinking: boolean;
  currentSpeakingSharkId: InvestorId;
  onSendUserMessage: (text: string) => void;
  onRequestFinalVerdict: () => void;
  onNavigateSidebar: (key: NavItemKey) => void;
}

export const PitchRoomView: React.FC<PitchRoomViewProps> = ({
  roomId,
  startupContext,
  selectedSharkIds,
  difficulty,
  messages,
  isThinking,
  currentSpeakingSharkId,
  onSendUserMessage,
  onRequestFinalVerdict,
  onNavigateSidebar
}) => {
  const [inputText, setInputText] = useState('');
  const [inspectingShark, setInspectingShark] = useState<InvestorProfile | null>(null);
  const [audioState, setAudioState] = useState<AudioPlaybackState>(speechService.getState());
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Subscribe to speech synthesis state changes
  useEffect(() => {
    const unsubscribe = speechService.subscribe(setAudioState);
    return () => {
      unsubscribe();
    };
  }, []);

  // Filter selected sharks in current room
  const activeSharks = INVESTORS.filter((s) => selectedSharkIds.includes(s.id));

  // Active speaking shark profile
  const speakingShark =
    INVESTORS.find((s) => s.id === currentSpeakingSharkId) ||
    activeSharks[0] ||
    INVESTORS[0];

  const handleToggleMessageAudio = (m: ChatMessage, sharkNameFallback: string) => {
    if (audioState.isPlaying && audioState.activeMessageId === m.id) {
      speechService.stop();
    } else {
      speechService.speak({
        sharkIdentifier: m.sharkName || m.sharkId || sharkNameFallback,
        text: m.text,
        messageId: m.id,
        forcePlay: true
      });
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    if (!isThinking) {
      textareaRef.current?.focus();
    }
  }, [isThinking]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isThinking) return;

    onSendUserMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const insertQuickPrompt = (promptText: string) => {
    setInputText((prev) => (prev ? `${prev} ${promptText}` : promptText));
    textareaRef.current?.focus();
  };

  const getReactionBadgeStyle = (reaction?: SharkReactionType) => {
    switch (reaction) {
      case 'Interested':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
      case 'Curious':
        return 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.2)]';
      case 'Challenging':
        return 'bg-amber-950/90 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
      case 'Out':
        return 'bg-rose-950/90 text-rose-300 border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
      case 'Skeptical':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="flex h-screen max-h-screen bg-[#070D18] text-slate-100 overflow-hidden font-sans">
      {/* Left Navigation Sidebar */}
      <AppSidebar
        activeKey="pitch_room"
        onNavigate={onNavigateSidebar}
        hasActiveSession={true}
        className="hidden md:flex"
      />

      {/* Main Pitch Room Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B1120] overflow-hidden">
        {/* Top Header Bar */}
        <header className="px-5 py-3 bg-[#080E1A] border-b border-slate-800 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E5A93C] to-amber-600 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-md">
              🦈
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-extrabold text-slate-100 truncate">
                  {startupContext.name}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/90 text-[#E5A93C] border border-[#E5A93C]/30 uppercase font-bold">
                  {difficulty}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-2">
                <span className="text-slate-300">{startupContext.niche}</span>
                <span>•</span>
                <span className="text-[#E5A93C] font-mono font-medium">{startupContext.financialsAsk}</span>
                <span>•</span>
                <span className="text-slate-500 font-mono text-[10px]">Room #{roomId.slice(0, 8)}</span>
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Shark Voice Speech Synthesis Control */}
            <button
              type="button"
              onClick={() => speechService.toggleMute()}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-mono transition-all ${
                audioState.isMuted
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/40'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
              title={audioState.isMuted ? 'Shark Voice: Muted (Click to unmute)' : 'Shark Voice: Auto Playing (Click to mute)'}
            >
              {audioState.isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Voice:</span>
                  <span className="text-rose-400 font-bold">Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#E5A93C]" />
                  <span className="hidden sm:inline">Voice:</span>
                  <span className="text-amber-400 font-bold">Active</span>
                  <AudioWaveIndicator
                    isPlaying={audioState.isPlaying}
                    colorClass="bg-amber-400"
                    className="h-3"
                  />
                </>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Live AI Session</span>
            </div>

            <button
              onClick={onRequestFinalVerdict}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E5A93C] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(229,169,60,0.3)] hover:scale-[1.02] active:scale-[0.98]"
              title="End pitch and receive formal investment term sheets & score analysis"
            >
              <Gavel className="w-4 h-4" />
              <span>Final Verdict</span>
            </button>
          </div>
        </header>

        {/* =========================================================================
            TOP SHARK PANEL WITH DYNAMIC ACTIVE SPEAKER GLOW EFFECT & AUDIO WAVE
            ========================================================================= */}
        <div className="bg-[#090F1C] border-b border-slate-800 px-4 md:px-6 py-3 shrink-0 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
              <span className="uppercase tracking-wider text-[11px] font-mono text-[#E5A93C]">Active Shark Panel</span>
              <span className="text-slate-500 text-[11px]">({activeSharks.length} Investors Seated)</span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Click any Shark card to inspect bio, investment thesis & voice profile
            </span>
          </div>

          {/* Horizontal Grid / Flex Container of Sharks across Top */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 md:gap-3">
            {activeSharks.map((shark) => {
              const isSpeakingNow = shark.id === currentSpeakingSharkId;
              const isAudioPlayingForShark =
                audioState.isPlaying &&
                (audioState.activeSharkName === shark.name ||
                  (isSpeakingNow && !audioState.activeSharkName));
              const photo = ASSETS[shark.photoKey];

              return (
                <div
                  key={shark.id}
                  onClick={() => setInspectingShark(shark)}
                  className={`relative group rounded-xl p-2.5 transition-all duration-300 cursor-pointer select-none ${
                    isSpeakingNow
                      ? 'speaker-active-glow bg-gradient-to-b from-[#E5A93C]/20 via-[#1A253A] to-[#0F172A] border-[#E5A93C] ring-2 ring-[#E5A93C]/50 z-10'
                      : 'bg-[#0E1626]/80 hover:bg-[#131D31] border border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Active Indicator Top Tag with Audio Wave */}
                  {isSpeakingNow && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#E5A93C] text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-md uppercase tracking-wider whitespace-nowrap">
                      {isThinking ? (
                        <>
                          <Loader2 className="w-2.5 h-2.5 animate-spin text-slate-950" />
                          <span>Grilling...</span>
                        </>
                      ) : isAudioPlayingForShark ? (
                        <>
                          <AudioWaveIndicator isPlaying={true} colorClass="bg-slate-950" className="h-3" />
                          <span>Voice Speaking</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-2.5 h-2.5 animate-pulse text-slate-950" />
                          <span>Has The Floor</span>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2.5">
                    {/* Portrait Avatar with Halo Ring */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-11 h-11 md:w-12 md:h-12 rounded-xl overflow-hidden bg-slate-900 transition-all ${
                          isSpeakingNow
                            ? 'ring-2 ring-[#E5A93C] shadow-[0_0_15px_rgba(229,169,60,0.4)]'
                            : 'ring-1 ring-slate-700'
                        }`}
                      >
                        <img
                          src={photo}
                          alt={shark.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Small Active Dot */}
                      {isSpeakingNow && (
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E5A93C] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E5A93C]"></span>
                        </span>
                      )}
                    </div>

                    {/* Shark Meta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-xs font-bold truncate ${
                            isSpeakingNow ? 'text-[#E5A93C]' : 'text-slate-200'
                          }`}
                        >
                          {shark.name}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                        {shark.role}
                      </p>
                      <div className="flex items-center justify-between gap-1 mt-1">
                        <span
                          className="text-[9px] font-mono px-1.5 py-0.2 rounded border truncate max-w-[80px]"
                          style={{
                            borderColor: `${shark.accentColor}40`,
                            color: isSpeakingNow ? '#F59E0B' : shark.accentColor,
                            backgroundColor: `${shark.accentColor}15`
                          }}
                        >
                          {shark.focusAreas[0]}
                        </span>

                        {/* Subtle Audio Wave Animation on Active Shark Card */}
                        {isSpeakingNow && (
                          <div className="flex items-center gap-0.5 ml-auto">
                            <AudioWaveIndicator
                              isPlaying={isAudioPlayingForShark}
                              colorClass={isAudioPlayingForShark ? 'bg-amber-400' : 'bg-slate-500'}
                              className="h-3.5"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            EXPANDED MAIN CHAT ROOM CONTAINER (BIGGER CHAT AREA)
            ========================================================================= */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#070D18] overflow-hidden">
          {/* Scrollable Message Feed */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-12 py-6 space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Pitch Brief Banner at conversation top */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0E1626] to-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-start gap-3 shadow-md">
                <Sparkles className="w-5 h-5 text-[#E5A93C] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-200">Pitch Synopsis Delivered to Panel:</span>
                    <span className="font-mono text-[10px] text-slate-500">{startupContext.financialsAsk}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed italic">
                    &ldquo;{startupContext.elevatorPitch}&rdquo;
                  </p>
                </div>
              </div>

              {/* Messages Thread */}
              {messages.map((m) => {
                if (m.sender === 'user') {
                  // User / Founder Bubble (Right Aligned)
                  return (
                    <div key={m.id} className="flex items-start justify-end gap-3 ml-auto max-w-2xl">
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-end gap-2 mb-1.5">
                          <span className="text-[10px] text-slate-500 font-mono">{m.timestamp}</span>
                          <span className="text-xs font-bold text-slate-300">
                            {startupContext.founderName || 'Founder'} (You)
                          </span>
                        </div>

                        <div className="bg-gradient-to-br from-[#1E293B] to-[#152033] border border-slate-700/80 text-slate-100 text-sm p-4 md:p-5 rounded-2xl rounded-tr-sm text-left leading-relaxed shadow-lg">
                          {m.text}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Shark Bubble (Left Aligned)
                const sharkProfile =
                  INVESTORS.find((s) => s.id === m.sharkId || s.name === m.sharkName) || speakingShark;
                const photo = ASSETS[sharkProfile.photoKey];

                return (
                  <div key={m.id} className="flex items-start gap-3.5 max-w-3xl">
                    {/* Shark Avatar */}
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-700 shadow-md mt-1">
                      <img
                        src={photo}
                        alt={sharkProfile.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      {/* Name & Badge Header */}
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs md:text-sm font-extrabold text-slate-100">
                          {m.sharkName || sharkProfile.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({sharkProfile.role})
                        </span>

                        {m.reactionType && (
                          <span
                            className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getReactionBadgeStyle(
                              m.reactionType
                            )}`}
                          >
                            {m.reactionType}
                          </span>
                        )}

                        <span className="text-[10px] text-slate-500 font-mono ml-auto">
                          {m.timestamp}
                        </span>
                      </div>

                      {/* Bubble Text */}
                      <div className="bg-[#0D1628] border border-slate-700/80 rounded-2xl rounded-tl-sm p-4 md:p-5 text-slate-100 text-sm leading-relaxed shadow-xl whitespace-pre-line border-l-4 border-l-[#E5A93C]">
                        {m.text}

                        {/* Message Action Footer: Replay Audio & Voice Persona */}
                        <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleToggleMessageAudio(m, sharkProfile.name)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md select-none ${
                              audioState.isPlaying && audioState.activeMessageId === m.id
                                ? 'bg-[#E5A93C] text-slate-950 ring-2 ring-[#E5A93C]/50 hover:bg-amber-400'
                                : 'bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 hover:text-white'
                            }`}
                            title="Replay Shark Voice Audio using individual AI voice profile"
                          >
                            {audioState.isPlaying && audioState.activeMessageId === m.id ? (
                              <>
                                <AudioWaveIndicator isPlaying={true} colorClass="bg-slate-950" className="h-3" />
                                <span>Playing Audio...</span>
                                <Square className="w-2.5 h-2.5 fill-slate-950 text-slate-950 ml-0.5" />
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-[#E5A93C]" />
                                <span>Replay Audio</span>
                              </>
                            )}
                          </button>

                          {/* Shark Voice Persona Badge */}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C]" />
                            <span className="truncate max-w-[220px] sm:max-w-none text-slate-300">
                              {getSharkVoiceProfile(m.sharkName || sharkProfile.name).toneDescription}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Live Deliberation / Thinking State */}
              {isThinking && (
                <div className="flex items-start gap-3.5 max-w-2xl animate-pulse">
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-[#E5A93C] ring-2 ring-[#E5A93C]/40 mt-1">
                    <img
                      src={ASSETS[speakingShark.photoKey]}
                      alt={speakingShark.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="bg-[#0D1628] border border-[#E5A93C]/40 rounded-2xl rounded-tl-sm px-5 py-4 text-slate-300 flex items-center gap-3 shadow-lg">
                    <Loader2 className="w-4 h-4 animate-spin text-[#E5A93C]" />
                    <span className="text-xs md:text-sm font-medium">
                      The Sharks are scrutinizing your claim and preparing their counter-argument...
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>
          </div>

          {/* =========================================================================
              BOTTOM STICKY INPUT CONSOLE
              ========================================================================= */}
          <div className="bg-[#090F1C] border-t border-slate-800 p-4 md:px-8 shrink-0 shadow-2xl">
            <div className="max-w-4xl mx-auto space-y-2.5">
              {/* Quick Defense Strategy Starters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-slate-400 text-[11px]">
                <span className="shrink-0 flex items-center gap-1 font-mono text-[10px] text-[#E5A93C]">
                  <Flame className="w-3 h-3 text-[#E5A93C]" />
                  Defense Quick-Starters:
                </span>
                <button
                  type="button"
                  onClick={() => insertQuickPrompt('Our blended CAC is $ and payback period is months.')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-all"
                >
                  📊 Cite Unit Economics
                </button>
                <button
                  type="button"
                  onClick={() => insertQuickPrompt('Our proprietary technical moat is protected by')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-all"
                >
                  🛡️ Defend Moat & IP
                </button>
                <button
                  type="button"
                  onClick={() => insertQuickPrompt('Compared to incumbents, our user retention rate is %.')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-all"
                >
                  📈 Retention & Traction
                </button>
              </div>

              {/* Text Input Row */}
              <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
                <div className="flex-1 relative flex items-center bg-[#070D18] border border-slate-700/80 rounded-2xl px-4 py-3 focus-within:border-[#E5A93C] focus-within:ring-2 focus-within:ring-[#E5A93C]/20 transition-all shadow-inner">
                  <textarea
                    ref={textareaRef}
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isThinking}
                    maxLength={1500}
                    placeholder="Defend your business model, metrics, and customer validation to the Sharks... (Enter to send)"
                    className="w-full bg-transparent text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim() || isThinking}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E5A93C] to-amber-500 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 flex items-center justify-center shrink-0 shadow-lg transition-all hover:scale-105 active:scale-95"
                  title="Send Answer to Panel"
                >
                  <Send className="w-5 h-5 fill-slate-950" />
                </button>
              </form>

              {/* Status info */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
                <span>Multi-turn memory enabled • Sharks grill based on live startup context</span>
                <span>{inputText.length} / 1500 chars</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          QUICK SHARK PROFILE INSPECTOR MODAL
          ========================================================================= */}
      {inspectingShark && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setInspectingShark(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-[#E5A93C] shrink-0 shadow-md">
                <img
                  src={ASSETS[inspectingShark.photoKey]}
                  alt={inspectingShark.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">{inspectingShark.name}</h3>
                <p className="text-xs text-[#E5A93C] font-semibold">{inspectingShark.role}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{inspectingShark.archetype}</p>
              </div>
            </div>

            <blockquote className="italic text-xs text-slate-300 p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 mb-3 leading-relaxed">
              &ldquo;{inspectingShark.quote}&rdquo;
            </blockquote>

            {/* Voice Preview Button */}
            <button
              type="button"
              onClick={() => {
                speechService.speak({
                  sharkIdentifier: inspectingShark.name,
                  text: inspectingShark.quote,
                  forcePlay: true
                });
              }}
              className="w-full mb-4 py-2 px-3 rounded-xl bg-[#090F1C] hover:bg-slate-900 border border-[#E5A93C]/40 hover:border-[#E5A93C] text-xs font-semibold text-[#E5A93C] flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span>Preview {inspectingShark.name}&apos;s Voice</span>
              {audioState.isPlaying && audioState.activeSharkName === inspectingShark.name && (
                <AudioWaveIndicator isPlaying={true} colorClass="bg-amber-400" className="h-3 ml-1" />
              )}
            </button>

            <div className="space-y-3">
              <div>
                <h5 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Investment Focus Areas:
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {inspectingShark.focusAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  What Grills Founders:
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {inspectingShark.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => setInspectingShark(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all"
            >
              Back to Pitch Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

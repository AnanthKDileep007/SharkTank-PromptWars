import React, { useState, useEffect } from 'react';
import {
  ChatMessage,
  DifficultyLevel,
  FinalVerdictResponse,
  InvestorId,
  StartupContextSummary
} from '../types/session.ts';
import { INVESTORS } from '../types/investor.ts';
import {
  apiSendChatMessage,
  apiFinalVerdict,
  fetchApiStatus,
  ApiStatus
} from './services/api.ts';
import { speechService } from './services/speechService.ts';
import { LandingPageView } from './components/LandingPageView.tsx';
import { OnboardingFlow } from './components/OnboardingFlow.tsx';
import { PitchRoomView } from './components/PitchRoomView.tsx';
import { PitchResultsView } from './components/PitchResultsView.tsx';
import { MeetInvestorsModal } from './components/MeetInvestorsModal.tsx';
import { PitchHistory, SavedPitchRecord } from './components/PitchHistory.tsx';
import { NavItemKey } from './components/AppSidebar.tsx';

const STORAGE_KEY_HISTORY = 'shark_tank_pitch_history_v3';

export default function App() {
  const [view, setView] = useState<'landing' | 'onboarding' | 'pitch_room' | 'results' | 'history'>('landing');

  // Modals
  const [isMeetInvestorsOpen, setIsMeetInvestorsOpen] = useState(false);

  // Active Unified Pitch Session State
  const [roomId, setRoomId] = useState<string>('');
  const [startupContext, setStartupContext] = useState<StartupContextSummary | null>(null);
  const [selectedSharkIds, setSelectedSharkIds] = useState<InvestorId[]>([
    'tony',
    'bill',
    'priya',
    'raj',
    'maya'
  ]);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Standard VC');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSpeakingSharkId, setCurrentSpeakingSharkId] = useState<InvestorId>('tony');

  // Loading & Final Verdict
  const [isThinking, setIsThinking] = useState(false);
  const [isInitializingRoom, setIsInitializingRoom] = useState(false);
  const [finalVerdict, setFinalVerdict] = useState<FinalVerdictResponse | null>(null);

  // History & API Status
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [pitchHistory, setPitchHistory] = useState<SavedPitchRecord[]>([]);

  useEffect(() => {
    fetchApiStatus().then(setApiStatus).catch(console.error);

    try {
      const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (stored) {
        setPitchHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to parse history:', e);
    }
  }, []);

  const savePitchToHistory = (
    context: StartupContextSummary,
    verdict: FinalVerdictResponse,
    diff: DifficultyLevel
  ) => {
    const record: SavedPitchRecord = {
      id: `pitch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      startupName: context.name || 'Startup',
      founderName: context.founderName || 'Founder',
      difficulty: diff,
      overallScore: verdict.overallScore,
      verdictCategory: verdict.aiBusinessVerdict?.category || 'EVALUATION COMPLETE',
      finalJudgment: verdict.aiBusinessVerdict?.finalJudgment || 'VALIDATE IT FIRST',
      totalContradictions: verdict.totalContradictionsFound || 0,
      pitchData: {
        founderName: context.founderName || 'Founder',
        startupName: context.name,
        pitch: context.elevatorPitch,
        funding: context.financialsAsk,
        equity: '10%'
      },
      verdict
    };

    const updated = [record, ...pitchHistory.slice(0, 9)];
    setPitchHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    } catch (e) {}
  };

  /**
   * Called when Screen 3 of the Onboarding Flow is submitted
   */
  const handleStartPitchFromOnboarding = async (
    sharks: InvestorId[],
    diff: DifficultyLevel,
    context: StartupContextSummary
  ) => {
    const newRoomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setRoomId(newRoomId);
    setSelectedSharkIds(sharks);
    setDifficulty(diff);
    setStartupContext(context);
    setMessages([]);
    setIsInitializingRoom(true);
    setView('pitch_room');

    try {
      // Trigger initial Shark opening question using Unified Chat Protocol
      const initialSharkTurn = await apiSendChatMessage({
        roomId: newRoomId,
        selectedSharks: sharks,
        difficulty: diff,
        startupContext: context,
        messages: [],
        userMessage: undefined
      });

      const initialMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        sender: 'shark',
        sharkId: initialSharkTurn.responding_shark_id,
        sharkName: initialSharkTurn.shark_name,
        reactionType: initialSharkTurn.reaction_type,
        text: initialSharkTurn.message_text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages([initialMessage]);
      setCurrentSpeakingSharkId(initialSharkTurn.responding_shark_id);

      // Auto-play Shark Voice Audio using distinct persona settings
      speechService
        .speak({
          sharkIdentifier: initialSharkTurn.shark_name || initialSharkTurn.responding_shark_id,
          text: initialSharkTurn.message_text,
          messageId: initialMessage.id
        })
        .catch((err) => console.warn('Opening speech auto-play note:', err));
    } catch (err) {
      console.error('Failed to initialize opening shark question:', err);
    } finally {
      setIsInitializingRoom(false);
    }
  };

  /**
   * Called when user sends a message in the unified chat room
   */
  const handleSendUserMessage = async (userText: string) => {
    if (!startupContext || isThinking) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setIsThinking(true);

    try {
      // Send full message history & context summary to backend
      const sharkResponse = await apiSendChatMessage({
        roomId,
        selectedSharks: selectedSharkIds,
        difficulty,
        startupContext,
        messages: updatedHistory,
        userMessage: userText
      });

      const sharkMsg: ChatMessage = {
        id: `msg_shark_${Date.now()}`,
        sender: 'shark',
        sharkId: sharkResponse.responding_shark_id,
        sharkName: sharkResponse.shark_name,
        reactionType: sharkResponse.reaction_type,
        text: sharkResponse.message_text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages([...updatedHistory, sharkMsg]);
      setCurrentSpeakingSharkId(sharkResponse.responding_shark_id);

      // Auto-play Shark Voice Audio using distinct persona settings
      speechService
        .speak({
          sharkIdentifier: sharkResponse.shark_name || sharkResponse.responding_shark_id,
          text: sharkResponse.message_text,
          messageId: sharkMsg.id
        })
        .catch((err) => console.warn('Reply speech auto-play note:', err));
    } catch (err) {
      console.error('Error in handleSendUserMessage:', err);
    } finally {
      setIsThinking(false);
    }
  };

  /**
   * Request final verdict
   */
  const handleRequestFinalVerdict = async () => {
    if (!startupContext || isThinking) return;
    speechService.stop();
    setIsThinking(true);

    try {
      const verdict = await apiFinalVerdict(
        {
          startupName: startupContext.name,
          difficulty,
          messages
        },
        {
          founderName: startupContext.founderName || 'Founder',
          startupName: startupContext.name,
          pitch: startupContext.elevatorPitch,
          revenueAsk: startupContext.financialsAsk
        }
      );

      setFinalVerdict(verdict);
      savePitchToHistory(startupContext, verdict, difficulty);
      setView('results');
    } catch (err) {
      console.error('Error generating final verdict:', err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSidebarNavigate = (key: NavItemKey) => {
    if (key === 'dashboard') setView('landing');
    else if (key === 'pitch_room' && startupContext) setView('pitch_room');
    else if (key === 'results' && finalVerdict) setView('results');
    else if (key === 'history') setView('history');
  };

  // 1. INITIALIZING ROOM SCREEN
  if (isInitializingRoom) {
    return (
      <div className="h-screen w-screen bg-[#070D18] flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E5A93C] to-amber-600 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(229,169,60,0.4)] animate-bounce mb-6">
          🦈
        </div>
        <h2 className="text-xl md:text-2xl font-black text-slate-100 mb-2 text-center">
          The Sharks Are Entering The Room
        </h2>
        <p className="text-xs md:text-sm text-slate-400 text-center max-w-md leading-relaxed">
          The panel is parsing your live pitch details, checking the niche mechanics, and preparing the opening question...
        </p>
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden mt-6">
          <div className="h-full bg-[#E5A93C] animate-pulse w-full" />
        </div>
      </div>
    );
  }

  // 2. ONBOARDING & SETUP FLOW (STRICT 3-SCREEN SEQUENCE)
  if (view === 'onboarding') {
    return (
      <OnboardingFlow
        onBackToHome={() => setView('landing')}
        onComplete={handleStartPitchFromOnboarding}
      />
    );
  }

  // 3. UNIFIED CHAT ROOM VIEW
  if (view === 'pitch_room' && startupContext) {
    return (
      <PitchRoomView
        roomId={roomId}
        startupContext={startupContext}
        selectedSharkIds={selectedSharkIds}
        difficulty={difficulty}
        messages={messages}
        isThinking={isThinking}
        currentSpeakingSharkId={currentSpeakingSharkId}
        onSendUserMessage={handleSendUserMessage}
        onRequestFinalVerdict={handleRequestFinalVerdict}
        onNavigateSidebar={handleSidebarNavigate}
      />
    );
  }

  // 4. PITCH RESULTS VIEW
  if (view === 'results' && finalVerdict) {
    return (
      <PitchResultsView
        verdict={finalVerdict}
        originalPitch={
          startupContext
            ? {
                founderName: startupContext.founderName || 'Founder',
                startupName: startupContext.name,
                pitch: startupContext.elevatorPitch,
                funding: startupContext.financialsAsk,
                equity: '10%'
              }
            : undefined
        }
        onPitchAgain={() => setView('onboarding')}
        onNavigateSidebar={handleSidebarNavigate}
      />
    );
  }

  // 5. HISTORY VIEW
  if (view === 'history') {
    return (
      <div className="min-h-screen bg-[#070D18] text-slate-100 p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <button
            onClick={() => setView('landing')}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            ← Back to Home
          </button>
          <PitchHistory
            history={pitchHistory}
            onSelectAttempt={(rec) => {
              setFinalVerdict(rec.verdict);
              setView('results');
            }}
            onClearHistory={() => {
              setPitchHistory([]);
              localStorage.removeItem(STORAGE_KEY_HISTORY);
            }}
          />
        </div>
      </div>
    );
  }

  // 6. LANDING PAGE VIEW (Default)
  return (
    <>
      <LandingPageView
        onStartPitching={() => setView('onboarding')}
        onTryDemo={() => setView('onboarding')}
        onOpenInvestors={() => setIsMeetInvestorsOpen(true)}
      />

      <MeetInvestorsModal
        isOpen={isMeetInvestorsOpen}
        onClose={() => setIsMeetInvestorsOpen(false)}
      />
    </>
  );
}

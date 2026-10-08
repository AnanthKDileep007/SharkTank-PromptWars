import {
  ChatMessage,
  ChatTurnResponse,
  DifficultyLevel,
  FinalVerdictResponse,
  InvestorId,
  StartupContextSummary
} from '../../types/session.ts';

export interface ApiStatus {
  status: string;
  hasGeminiKey: boolean;
  model: string;
  mode: 'live' | 'demo_fallback';
}

export async function fetchApiStatus(): Promise<ApiStatus> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Status fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('API status check error, fallback active:', err);
    return {
      status: 'fallback',
      hasGeminiKey: false,
      model: 'fallback',
      mode: 'demo_fallback'
    };
  }
}

export async function apiPitchTurn(params: {
  startupData: {
    startupName: string;
    startupNiche: string;
    startupPitch: string;
    targetAudience?: string;
    revenueAsk?: string;
  };
  chatHistory?: Array<{
    sender: 'user' | 'shark';
    text: string;
    sharkName?: string;
    sharkId?: string;
    reactionType?: string;
  }>;
  userLatestMessage?: string;
  selectedSharks?: InvestorId[];
  difficulty?: DifficultyLevel;
}): Promise<ChatTurnResponse> {
  const res = await fetch('/api/pitch/turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Pitch turn generation failed with status ${res.status}`);
  }

  return await res.json();
}

export async function apiSendChatMessage(params: {
  roomId: string;
  selectedSharks: InvestorId[];
  difficulty: DifficultyLevel;
  startupContext: StartupContextSummary;
  messages: ChatMessage[];
  userMessage?: string;
}): Promise<ChatTurnResponse> {
  const res = await fetch('/api/chat/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Shark message generation failed with status ${res.status}`);
  }

  return await res.json();
}

export async function apiFinalVerdict(
  state: any,
  pitch?: any
): Promise<FinalVerdictResponse> {
  const res = await fetch('/api/pitch/final-verdict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state, pitch }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Final verdict failed with status ${res.status}`);
  }

  return await res.json();
}

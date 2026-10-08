import { InvestorId } from '../../types/investor.ts';

export interface SharkVoiceProfile {
  sharkId: InvestorId;
  sharkName: string;
  pitch: number;        // SpeechSynthesisUtterance.pitch: 0.1 to 2.0 (1.0 default)
  rate: number;         // SpeechSynthesisUtterance.rate: 0.1 to 10 (1.0 default)
  volume: number;       // SpeechSynthesisUtterance.volume: 0 to 1 (1.0 default)
  gender: 'male' | 'female';
  toneDescription: string;
  voiceNamePreferences: string[];
}

/**
 * FRONTEND AUDIO MAP
 * Distinct voice profiles mapped to each Shark's persona and investor archetype.
 */
export const SHARK_VOICE_MAP: Record<string, SharkVoiceProfile> = {
  'Tony Starks': {
    sharkId: 'tony',
    sharkName: 'Tony Starks',
    pitch: 0.92,        // Authoritative, commanding, slightly lower resonance
    rate: 1.08,         // Fast, high-energy tech visionary tempo
    volume: 1.0,
    gender: 'male',
    toneDescription: 'Direct, commanding tech visionary baritone',
    voiceNamePreferences: [
      'Google US English',
      'Daniel',
      'David',
      'Alex',
      'Microsoft David',
      'en-US-Standard-B',
      'en-US-Standard-D',
      'en-US-Neural2-D'
    ]
  },
  'Bill Gator': {
    sharkId: 'bill',
    sharkName: 'Bill Gator',
    pitch: 0.98,        // Analytical, clinical, pragmatic
    rate: 0.94,         // Deliberate, calculating pacing
    volume: 1.0,
    gender: 'male',
    toneDescription: 'Methodical, measured, analytical cadence',
    voiceNamePreferences: [
      'Google UK English Male',
      'Fred',
      'George',
      'Microsoft Mark',
      'en-GB-Standard-B',
      'en-US-Standard-I',
      'en-US-Neural2-A'
    ]
  },
  'Priya Capital': {
    sharkId: 'priya',
    sharkName: 'Priya Capital',
    pitch: 1.18,        // Warm, crisp, engaging consumer pitch
    rate: 1.05,         // Dynamic consumer-growth cadence
    volume: 1.0,
    gender: 'female',
    toneDescription: 'Sharp, vibrant, energetic consumer maven',
    voiceNamePreferences: [
      'Google US English Female',
      'Samantha',
      'Victoria',
      'Karen',
      'Microsoft Zira',
      'en-US-Standard-C',
      'en-US-Standard-F',
      'en-US-Neural2-F'
    ]
  },
  'Raj Growth': {
    sharkId: 'raj',
    sharkName: 'Raj Growth',
    pitch: 0.82,        // Deep, grounded, no-nonsense operator
    rate: 0.98,         // Steady, firm execution rhythm
    volume: 1.0,
    gender: 'male',
    toneDescription: 'Grounded, gritty, operational baritone',
    voiceNamePreferences: [
      'Google UK English Male',
      'Rishi',
      'Oliver',
      'Microsoft James',
      'en-IN-Standard-B',
      'en-GB-Standard-D',
      'en-US-Standard-J'
    ]
  },
  'Maya Impact': {
    sharkId: 'maya',
    sharkName: 'Maya Impact',
    pitch: 1.06,        // Thoughtful, passionate, empathetic yet firm
    rate: 0.96,         // Clear, contemplative pacing
    volume: 1.0,
    gender: 'female',
    toneDescription: 'Passionate, articulate, mission-driven resonance',
    voiceNamePreferences: [
      'Google UK English Female',
      'Moira',
      'Fiona',
      'Microsoft Susan',
      'en-GB-Standard-A',
      'en-US-Standard-E',
      'en-US-Neural2-G'
    ]
  }
};

/**
 * Normalizes input identifier (name or id) and returns the matching Shark voice configuration.
 */
export function getSharkVoiceProfile(identifier?: string): SharkVoiceProfile {
  if (!identifier) {
    return SHARK_VOICE_MAP['Tony Starks'];
  }

  const clean = identifier.trim().toLowerCase();

  // Direct name match
  for (const [key, profile] of Object.entries(SHARK_VOICE_MAP)) {
    if (key.toLowerCase() === clean) return profile;
    if (profile.sharkId.toLowerCase() === clean) return profile;
  }

  // Partial name match (e.g. "tony", "priya", "bill", "raj", "maya")
  if (clean.includes('tony')) return SHARK_VOICE_MAP['Tony Starks'];
  if (clean.includes('bill')) return SHARK_VOICE_MAP['Bill Gator'];
  if (clean.includes('priya')) return SHARK_VOICE_MAP['Priya Capital'];
  if (clean.includes('raj')) return SHARK_VOICE_MAP['Raj Growth'];
  if (clean.includes('maya')) return SHARK_VOICE_MAP['Maya Impact'];

  // Default fallback
  return SHARK_VOICE_MAP['Tony Starks'];
}

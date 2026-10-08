import { getSharkVoiceProfile, SharkVoiceProfile } from './sharkVoiceConfig.ts';

export interface AudioPlaybackState {
  isPlaying: boolean;
  activeSharkName: string | null;
  activeMessageId: string | null;
  isMuted: boolean;
}

type AudioStateListener = (state: AudioPlaybackState) => void;

class SharkSpeechService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isMutedState: boolean = false;
  private currentActiveSharkName: string | null = null;
  private currentActiveMessageId: string | null = null;
  private isAudioPlayingState: boolean = false;
  private listeners: Set<AudioStateListener> = new Set();
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.initVoices();
        };
      }

      // Check saved mute state from localStorage
      try {
        const savedMute = localStorage.getItem('shark_audio_muted');
        if (savedMute !== null) {
          this.isMutedState = savedMute === 'true';
        }
      } catch (e) {
        // Ignore localStorage error
      }
    }
  }

  private initVoices(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.availableVoices = window.speechSynthesis.getVoices();
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  public isMuted(): boolean {
    return this.isMutedState;
  }

  public setMuted(muted: boolean): void {
    this.isMutedState = muted;
    try {
      localStorage.setItem('shark_audio_muted', String(muted));
    } catch (e) {
      // Ignore
    }

    if (muted && this.isAudioPlayingState) {
      this.stop();
    } else {
      this.notifyListeners();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMutedState);
    return this.isMutedState;
  }

  public getState(): AudioPlaybackState {
    return {
      isPlaying: this.isAudioPlayingState,
      activeSharkName: this.currentActiveSharkName,
      activeMessageId: this.currentActiveMessageId,
      isMuted: this.isMutedState
    };
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    // Call immediately with current state
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Error in speech listener:', err);
      }
    });
  }

  /**
   * Cleans text to prepare for speech synthesis
   * Strips markdown tokens, emojis, excessive asterisks, and brackets.
   */
  private cleanTextForSpeech(text: string): string {
    return text
      .replace(/[*#_~`]/g, '') // Strip Markdown symbols
      .replace(/\[.*?\]/g, '') // Strip brackets
      .replace(/https?:\/\/\S+/g, 'link') // Strip raw links
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Strip emojis
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Resolves the best matching SpeechSynthesisVoice for the Shark profile
   */
  private selectVoice(profile: SharkVoiceProfile): SpeechSynthesisVoice | null {
    if (!this.availableVoices || this.availableVoices.length === 0) {
      this.initVoices();
    }

    if (!this.availableVoices || this.availableVoices.length === 0) {
      return null;
    }

    // 1. Try matching preferred voice names
    for (const pref of profile.voiceNamePreferences) {
      const match = this.availableVoices.find((v) =>
        v.name.toLowerCase().includes(pref.toLowerCase())
      );
      if (match) return match;
    }

    // 2. Filter English voices
    const englishVoices = this.availableVoices.filter((v) =>
      v.lang.toLowerCase().startsWith('en')
    );

    const candidatePool = englishVoices.length > 0 ? englishVoices : this.availableVoices;

    // 3. Match gender hints in voice name
    if (profile.gender === 'female') {
      const femaleKeywords = ['female', 'zira', 'samantha', 'victoria', 'karen', 'susan', 'fiona', 'moira', 'woman'];
      const match = candidatePool.find((v) =>
        femaleKeywords.some((k) => v.name.toLowerCase().includes(k))
      );
      if (match) return match;
    } else {
      const maleKeywords = ['male', 'david', 'mark', 'daniel', 'alex', 'george', 'fred', 'james', 'guy', 'man'];
      const match = candidatePool.find((v) =>
        maleKeywords.some((k) => v.name.toLowerCase().includes(k))
      );
      if (match) return match;
    }

    // 4. Default fallback to first English voice or first voice
    return candidatePool[0] || this.availableVoices[0] || null;
  }

  /**
   * Plays shark speech for a given text and shark name/id.
   * Cancels any ongoing speech automatically.
   */
  public speak(params: {
    sharkIdentifier: string;
    text: string;
    messageId?: string;
    forcePlay?: boolean;
  }): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isSupported()) {
        resolve();
        return;
      }

      // If muted and not forced, do not play
      if (this.isMutedState && !params.forcePlay) {
        resolve();
        return;
      }

      // Stop any current utterance
      this.stop();

      const voiceProfile = getSharkVoiceProfile(params.sharkIdentifier);
      const cleanedText = this.cleanTextForSpeech(params.text);

      if (!cleanedText) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.pitch = voiceProfile.pitch;
      utterance.rate = voiceProfile.rate;
      utterance.volume = voiceProfile.volume;

      const selectedVoice = this.selectVoice(voiceProfile);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        this.isAudioPlayingState = true;
        this.currentActiveSharkName = voiceProfile.sharkName;
        this.currentActiveMessageId = params.messageId || null;
        this.notifyListeners();
      };

      utterance.onend = () => {
        this.isAudioPlayingState = false;
        this.currentActiveSharkName = null;
        this.currentActiveMessageId = null;
        this.currentUtterance = null;
        this.notifyListeners();
        resolve();
      };

      utterance.onerror = (err) => {
        // Cancelation can trigger 'interrupted' or 'canceled', which is expected
        this.isAudioPlayingState = false;
        this.currentActiveSharkName = null;
        this.currentActiveMessageId = null;
        this.currentUtterance = null;
        this.notifyListeners();
        resolve();
      };

      this.currentUtterance = utterance;

      // Small delay prevents some browser utterance drop bugs
      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn('Speech synthesis playback error:', e);
          resolve();
        }
      }, 50);
    });
  }

  /**
   * Stops currently playing speech
   */
  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // Ignore
      }
    }
    this.isAudioPlayingState = false;
    this.currentActiveSharkName = null;
    this.currentActiveMessageId = null;
    this.currentUtterance = null;
    this.notifyListeners();
  }
}

export const speechService = new SharkSpeechService();

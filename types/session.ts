import { IndividualInvestorVerdict, InvestorId, InvestorMood } from './investor.ts';

export type { InvestorId };

export type DifficultyLevel = 'Friendly Angel' | 'Standard VC' | 'Hardcore Shark';

export interface StartupContextSummary {
  name: string;
  niche: string;
  elevatorPitch: string;
  targetAudience: string;
  financialsAsk: string;
  founderName?: string;
}

export type SharkReactionType = 'Challenging' | 'Curious' | 'Skeptical' | 'Interested' | 'Out';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'shark';
  sharkId?: InvestorId;
  sharkName?: string;
  reactionType?: SharkReactionType;
  text: string;
  timestamp: string;
}

export interface ChatTurnResponse {
  responding_shark_id: InvestorId;
  shark_name: string;
  reaction_type: SharkReactionType;
  message_text: string;
  detected_evasion?: boolean;
  detected_missing_info?: string | null;
  score_adjustments?: Partial<Record<string, number>>;
}

export interface ScoringParameters {
  problemStrength: number;       // 15%
  marketOpportunity: number;     // 15%
  solutionQuality: number;       // 10%
  productMarketFit: number;      // 10%
  businessModel: number;         // 10%
  competitiveAdvantage: number;  // 10%
  moat: number;                  // 10%
  scalability: number;           // 5%
  execution: number;             // 5%
  traction: number;              // 5%
  founderPitch: number;          // 5%
}

export type Difficulty = 'FRIENDLY' | 'REALISTIC' | 'BRUTAL' | DifficultyLevel;

export interface CompactSessionState {
  founderName: string;
  startupName: string;
  difficulty: Difficulty;
  currentRound?: number;
  currentInvestorId?: InvestorId;
  selectedSharks?: InvestorId[];
  roomId?: string;
  keyClaims: string[];
  knownNumbers: Record<string, string | number>;
  investorConcerns: string[];
  previousQuestions?: string[];
  previousAnswers?: string[];
  contradictions?: string[];
  parameterScores: ScoringParameters;
  confidenceScore: number;
  riskScore: number;
}

export interface PitchData {
  founderName: string;
  founderRole?: string;
  startupName: string;
  niche?: string;
  pitch: string;
  problem?: string;
  solution?: string;
  targetCustomer?: string;
  businessModel?: string;
  competitors?: string;
  funding?: string;
  equity?: string;
  revenueAsk?: string;
}

export type ClaimClassification = 'CLAIM' | 'ASSUMPTION' | 'EVIDENCE' | 'PROVEN_FACT';

export interface DialogueTurn {
  id: string;
  round: number;
  investorId: InvestorId;
  investorName: string;
  investorQuestion: string;
  investorMood: InvestorMood;
  reactionType?: SharkReactionType;
  founderAnswer?: string;
  claimClassification?: ClaimClassification;
  detectedContradiction?: string | null;
  scoreAdjustments?: Partial<Record<keyof ScoringParameters, number>>;
  timestamp: number;
}

export interface AnalyzePitchResponse {
  initialAnalysis: {
    summary: string;
    strengths: string[];
    criticalVulnerabilities: string[];
    extractedNumbers: Record<string, string | number>;
  };
  baselineScores: ScoringParameters;
  firstInvestorId: InvestorId;
  initialQuestion: string;
  investorMood: InvestorMood;
  updatedState: CompactSessionState;
}

export interface EvaluateAnswerResponse {
  investorQuestion: string;
  nextInvestorId: InvestorId;
  investorMood: InvestorMood;
  reactionType?: SharkReactionType;
  scoreAdjustments: Partial<Record<keyof ScoringParameters, number>>;
  detectedContradiction: string | null;
  claimClassification: ClaimClassification;
  coachingTip?: string;
  updatedState: CompactSessionState;
}

export type AIBusinessVerdictCategory =
  | 'STRONG BUSINESS IDEA'
  | 'PROMISING BUT NEEDS VALIDATION'
  | 'GOOD PRODUCT WEAK BUSINESS'
  | 'INTERESTING IDEA HIGH RISK'
  | 'NEEDS MAJOR REWORK'
  | 'NOT INVESTABLE YET';

export type FinalAIJudgment =
  | 'BUILD IT'
  | 'VALIDATE IT FIRST'
  | 'PIVOT IT'
  | 'REWORK THE BUSINESS MODEL'
  | 'DO NOT PURSUE IT YET';

export interface FinalVerdictResponse {
  overallScore: number;
  investmentPotential: number; // 0-100
  riskScore: number;           // 0-100
  confidenceScore: number;     // 0-100%
  scoreInterpretation: 'EXCEPTIONAL' | 'VERY STRONG' | 'PROMISING' | 'NEEDS WORK' | 'WEAK' | 'HIGH RISK';
  parameterScores: ScoringParameters;
  investorVerdicts: IndividualInvestorVerdict[];
  aiBusinessVerdict: {
    category: AIBusinessVerdictCategory;
    finalJudgment: FinalAIJudgment;
    summary: string;
    whatWorks: string[];
    whatKillsIt: string[];
    whatMustBeProven: string[];
    targetCustomerMatch: string;
    actionableRoadmap: string[];
  };
  strongerPitch: {
    originalExcerpt: string;
    restructuredPitch: string;
    keyChangesMade: string[];
    hookSentence: string;
  };
  totalContradictionsFound: number;
  pitchDurationRounds: number;
}

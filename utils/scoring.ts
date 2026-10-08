import { ScoringParameters } from '../types/session.ts';

export const PARAMETER_WEIGHTS: Record<keyof ScoringParameters, number> = {
  problemStrength: 0.15,
  marketOpportunity: 0.15,
  solutionQuality: 0.10,
  productMarketFit: 0.10,
  businessModel: 0.10,
  competitiveAdvantage: 0.10,
  moat: 0.10,
  scalability: 0.05,
  execution: 0.05,
  traction: 0.05,
  founderPitch: 0.05,
};

export const PARAMETER_LABELS: Record<keyof ScoringParameters, string> = {
  problemStrength: 'Problem Strength',
  marketOpportunity: 'Market Opportunity',
  solutionQuality: 'Solution Quality',
  productMarketFit: 'Product-Market Fit',
  businessModel: 'Business Model',
  competitiveAdvantage: 'Competitive Edge',
  moat: 'Defensive Moat',
  scalability: 'Scalability',
  execution: 'Execution Ability',
  traction: 'Traction & Numbers',
  founderPitch: 'Pitch Delivery',
};

export function clamp(value: number, min: number = 0, max: number = 100): number {
  return Math.max(min, Math.min(max, Math.round(value * 10) / 10));
}

/**
 * Deterministically computes the weighted overall score (0 - 100)
 */
export function calculateOverallScore(scores: ScoringParameters): number {
  let weightedSum = 0;
  for (const key of Object.keys(PARAMETER_WEIGHTS) as (keyof ScoringParameters)[]) {
    const rawScore = scores[key] ?? 50;
    const clampedScore = Math.max(0, Math.min(100, rawScore));
    weightedSum += clampedScore * PARAMETER_WEIGHTS[key];
  }
  return Math.round(weightedSum * 10) / 10;
}

/**
 * Calculates Risk Score (0 - 100).
 * Lower moat, businessModel, traction, or high contradictions elevate the risk score.
 */
export function calculateRiskScore(
  scores: ScoringParameters,
  contradictionsCount: number = 0,
  difficulty: 'FRIENDLY' | 'REALISTIC' | 'BRUTAL' = 'REALISTIC'
): number {
  const defensiveDeficit = (100 - (scores.moat ?? 50)) * 0.35;
  const unitDeficit = (100 - (scores.businessModel ?? 50)) * 0.30;
  const tractionDeficit = (100 - (scores.traction ?? 50)) * 0.20;
  const executionDeficit = (100 - (scores.execution ?? 50)) * 0.15;

  let baseRisk = defensiveDeficit + unitDeficit + tractionDeficit + executionDeficit;

  // Contradiction penalties
  baseRisk += contradictionsCount * 12;

  // Difficulty adjustment
  if (difficulty === 'BRUTAL') baseRisk += 8;
  if (difficulty === 'FRIENDLY') baseRisk -= 6;

  return Math.min(100, Math.max(5, Math.round(baseRisk)));
}

/**
 * Calculates Confidence Score (0 - 100%).
 * Evaluates the panel's conviction in their assessment based on rounds completed,
 * evidence collected, and lack of contradictions.
 */
export function calculateConfidenceScore(
  roundsCompleted: number,
  knownNumbersCount: number,
  contradictionsCount: number
): number {
  // Base grows with rounds (up to 8 rounds = 60 pts)
  const roundProgression = Math.min(8, roundsCompleted) * 7.5;
  // Specificity / numbers provide up to 25 pts
  const dataDepth = Math.min(5, knownNumbersCount) * 5;
  // Baseline confidence
  let confidence = 20 + roundProgression + dataDepth;

  // Contradictions reduce confidence
  confidence -= contradictionsCount * 8;

  return Math.min(100, Math.max(15, Math.round(confidence)));
}

/**
 * Maps numerical overall score to verbal interpretation band
 */
export function getScoreInterpretation(
  overallScore: number
): 'EXCEPTIONAL' | 'VERY STRONG' | 'PROMISING' | 'NEEDS WORK' | 'WEAK' | 'HIGH RISK' {
  if (overallScore >= 88) return 'EXCEPTIONAL';
  if (overallScore >= 78) return 'VERY STRONG';
  if (overallScore >= 65) return 'PROMISING';
  if (overallScore >= 50) return 'NEEDS WORK';
  if (overallScore >= 38) return 'WEAK';
  return 'HIGH RISK';
}

/**
 * Applies delta adjustments safely to parameter scores
 */
export function applyScoreAdjustments(
  current: ScoringParameters,
  adjustments: Partial<Record<keyof ScoringParameters, number>>
): ScoringParameters {
  const updated: ScoringParameters = { ...current };
  for (const [param, delta] of Object.entries(adjustments)) {
    const key = param as keyof ScoringParameters;
    if (key in updated && typeof delta === 'number') {
      updated[key] = clamp(updated[key] + delta, 0, 100);
    }
  }
  return updated;
}

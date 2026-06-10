export interface Profile {
  id: string;
  intent?: string;
  values?: string[];
  quality_score?: number;
}

export function getIntentScore(viewerIntent: string, candidateIntent: string): number {
  if (!viewerIntent || !candidateIntent) return 0.5;
  if (viewerIntent === candidateIntent) return 1.0;
  return 0.5;
}

export function getValuesScore(viewerValues: string[], candidateValues: string[]): number {
  if (!viewerValues?.length || !candidateValues?.length) return 0.5;

  const shared = viewerValues.filter(v => candidateValues.includes(v)).length;
  const maxPossible = Math.max(viewerValues.length, candidateValues.length);

  return Math.min(shared / maxPossible, 1.0);
}

export function getQualityMultiplier(qualityScore: number = 100): number {
  // Normalize quality score to 0.8 - 1.2 range
  // 0 score = 0.8x, 100 score = 1.0x, 150+ score = 1.2x
  return Math.max(0.8, Math.min(1.2, qualityScore / 100));
}

export function scoreMatch(viewer: Profile, candidate: Profile): number {
  // Intent score (0–1, multiplied by 0.5 weight)
  const intentScore = getIntentScore(viewer.intent, candidate.intent);

  // Values score (0–1, multiplied by 0.3 weight)
  const valuesScore = getValuesScore(viewer.values || [], candidate.values || []);

  // Quality score multiplier (0.8–1.2)
  const qualityMultiplier = getQualityMultiplier(candidate.quality_score);

  // Weighted average: intent 50% + values 30%, then apply quality multiplier
  const baseScore = intentScore * 0.5 + valuesScore * 0.3;
  const finalScore = baseScore * qualityMultiplier;

  return finalScore;
}

export function rankProfiles(viewer: Profile, candidates: Profile[]): Profile[] {
  const scored = candidates.map(candidate => ({
    ...candidate,
    _score: scoreMatch(viewer, candidate)
  }));

  return scored.sort((a, b) => (b._score || 0) - (a._score || 0));
}

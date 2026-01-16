// lib/dpEngine.ts

import type {
  Story,
  UserAnswer,
  CategoryId,
  CategoryScore,
  DecisionProfile,
  RiskColor,
  ProxyFitCategoryComparison,
  ProxyFitResult,
} from '@/types/dp';

// Egyszerű (MVP) szabály: nyers pontszám -> szín
function computeRiskColor(score: number): RiskColor {
  if (score <= -2) {
    return 'red';
  }
  if (score <= 1) {
    return 'yellow';
  }
  return 'green';
}

/**
 * Alap DP-engine:
 * - végigmegy a válaszokon,
 * - összeadja a kategória-pontszámokat,
 * - minden kategóriára kiszámolja a színt.
 */
export function computeDecisionProfile(
  story: Story,
  answers: UserAnswer[],
): DecisionProfile {
  // Fix 3 kategória az MVP-ben:
  const totals: Record<CategoryId, number> = {
    autonomy: 0,
    family: 0,
    risk_tolerance: 0,
  };

  for (const answer of answers) {
    const question = story.questions.find((q) => q.id === answer.questionId);
    if (!question) continue;

    const option = question.options.find((o) => o.id === answer.optionId);
    if (!option) continue;

    // option.scores: pl. { autonomy: +2, family: -1 }
    for (const [category, delta] of Object.entries(option.scores) as [
      CategoryId,
      number,
    ][]) {
      totals[category] += delta;
    }
  }

  const totalScores: CategoryScore[] = (Object.keys(totals) as CategoryId[]).map(
    (category) => {
      const score = totals[category];
      return {
        category,
        score,
        color: computeRiskColor(score),
      };
    },
  );

  return { totalScores };
}

/**
 * ProxyFit engine (MVP):
 * - bemenet: két már kiszámolt profil (self + proxy),
 * - kimenet: kategória szintű összehasonlítás + egy összesített "mismatch" szám.
 *
 * Jelenlegi definíció:
 * - difference = proxyScore - selfScore (előjeles)
 * - overallDifference = átlag abszolút eltérés a kategóriákra.
 */
export function computeProxyFit(
  selfProfile: DecisionProfile,
  proxyProfile: DecisionProfile,
): ProxyFitResult {
  // Proxy profil gyors lookup táblába
  const proxyScoresByCategory: Record<CategoryId, number> = {
    autonomy: 0,
    family: 0,
    risk_tolerance: 0,
  };

  for (const cat of proxyProfile.totalScores) {
    proxyScoresByCategory[cat.category] = cat.score;
  }

  const comparisons: ProxyFitCategoryComparison[] =
    selfProfile.totalScores.map((selfCat) => {
      const proxyScore = proxyScoresByCategory[selfCat.category] ?? 0;
      const difference = proxyScore - selfCat.score;

      return {
        category: selfCat.category,
        selfScore: selfCat.score,
        proxyScore,
        difference,
      };
    });

  const overallDifference =
    comparisons.length === 0
      ? 0
      : comparisons.reduce(
          (sum, c) => sum + Math.abs(c.difference),
          0,
        ) / comparisons.length;

  return {
    categories: comparisons,
    overallDifference,
  };
}

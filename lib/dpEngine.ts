// lib/dpEngine.ts

import type {
  Story,
  UserAnswer,
  DecisionProfile,
  CategoryScore,
  RiskColor,
} from '@/types/dp';

interface Thresholds {
  red: number;    // <= red  => red
  yellow: number; // <= yellow => yellow, above => green
}

// MVP: single global threshold configuration
const DEFAULT_THRESHOLDS: Thresholds = {
  red: 0,
  yellow: 3,
};

function scoreToColor(score: number, thresholds: Thresholds = DEFAULT_THRESHOLDS): RiskColor {
  if (score <= thresholds.red) return 'red';
  if (score <= thresholds.yellow) return 'yellow';
  return 'green';
}

// Compute aggregated category scores and assign a traffic-light color
export function computeDecisionProfile(story: Story, answers: UserAnswer[]): DecisionProfile {
  const categoryTotals: Record<string, number> = {};

  for (const answer of answers) {
    const question = story.questions.find((q) => q.id === answer.questionId);
    if (!question) continue;

    const option = question.options.find((o) => o.id === answer.optionId);
    if (!option) continue;

    for (const [category, value] of Object.entries(option.scores)) {
      categoryTotals[category] = (categoryTotals[category] ?? 0) + value;
    }
  }

  const totalScores: CategoryScore[] = Object.entries(categoryTotals).map(
    ([category, score]) => ({
      category: category as any, // CategoryId by design
      score,
      color: scoreToColor(score),
    }),
  );

  return { totalScores };
}

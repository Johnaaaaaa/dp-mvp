// lib/dpEngine.ts
// DP-engine: DecisionProfile + ProxyFit számítás
// Spec szerint (PDF): k = 15, 0–50 low, 50–80 medium, 80–100 high.

import type {
  Answer,
  Story,
  DecisionProfile,
  CategoryScore,
  ColorCode,
  ProxyFitResult,
  ProxyFitCategoryDiff,
  FitLevel,
} from '@/types/dp';


// Szín meghatározása egy kategória-score-hoz.
// Feltételezett skála: 0–10 körüli értékek.
function getColorForScore(score: number): ColorCode {
  if (score <= 3) return 'red';
  if (score <= 7) return 'yellow';
  return 'green';
}

// Helper: numerikus érték kinyerése egy opcióból.
// 1) value / score / weight mezők, ha léteznek és numerikusak
// 2) ha nincs semmi, fallback: opció indexét képezzük le 0–10 skálára
function getOptionNumericValue(
  question: Story['questions'][number],
  option: any,
): number | null {
  const rawCandidates = [
    (option as any).value,
    (option as any).score,
    (option as any).weight,
  ];

  for (const raw of rawCandidates) {
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      return raw;
    }
    if (typeof raw === 'string' && raw.trim() !== '') {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  // Fallback: ordinal index → 0..10 skála
  const options = (question as any).options as any[];
  if (!Array.isArray(options) || options.length === 0) {
    return null;
  }

  const idx = options.findIndex((o) => o.id === option.id);
  if (idx === -1) return null;

  if (options.length === 1) {
    return 5; // egyetlen opció esetén középérték
  }

  const maxIndex = options.length - 1;
  const value = (idx / maxIndex) * 10; // 0..10 skála

  return Number.isFinite(value) ? value : null;
}

// DecisionProfile számítás:
// - story kérdései alapján,
// - a megadott válaszokból (option value-k aggregálása kategóriánként).
export function calculateDecisionProfile(
  story: Story,
  answers: Answer[],
): DecisionProfile {

  const categoryValues: Map<string, number[]> = new Map();

  for (const question of story.questions as any[]) {
    const answer = answers.find((a) => a.questionId === question.id);
    if (!answer) continue;

    const option = question.options.find((o: any) => o.id === answer.optionId);
    if (!option) continue;

    const value = getOptionNumericValue(question, option);
    if (value == null || !Number.isFinite(value)) {
      continue;
    }

    const arr = categoryValues.get(question.category) ?? [];
    arr.push(value);
    categoryValues.set(question.category, arr);
  }

  const categoryScores: CategoryScore[] = [];

  for (const [category, values] of categoryValues.entries()) {
    const numericValues = values.filter(
      (v) => typeof v === 'number' && Number.isFinite(v),
    );
    if (!numericValues.length) continue;

    const sum = numericValues.reduce((acc, v) => acc + v, 0);
    const avg = sum / numericValues.length;

    const score = Math.round(avg * 10) / 10; // egy tizedesre kerekítve
    const color = getColorForScore(score);

    categoryScores.push({
      category,
      score,
      color,
    });
  }

  // Rendezés kategórianév szerint, hogy stabil legyen az UI
  categoryScores.sort((a, b) => a.category.localeCompare(b.category));

  return {
    storyId: story.id,
    domain: story.domain,
    categoryScores,
  };
}

// ProxyFit V1 – Self vs Proxy profil összevetése
// - kategória-szintű eltérések
// - fitIndex 0–100 között
// - low / medium / high sávok
export function calculateProxyFit(
  selfProfile: DecisionProfile,
  proxyProfile: DecisionProfile,
): ProxyFitResult {
  const diffs: ProxyFitCategoryDiff[] = [];

  for (const selfCat of selfProfile.categoryScores) {
    const proxyCat = proxyProfile.categoryScores.find(
      (c) => c.category === selfCat.category,
    );
    if (!proxyCat) continue;

    const absDifference = Math.abs(selfCat.score - proxyCat.score);
    if (!Number.isFinite(absDifference)) {
      continue;
    }

    diffs.push({
      category: selfCat.category,
      selfScore: selfCat.score,
      proxyScore: proxyCat.score,
      absDifference,
    });
  }

  if (!diffs.length) {
    return {
      fitIndex: 0,
      fitLevel: 'low',
      categories: [],
    };
  }

  const sumDiff = diffs.reduce((acc, d) => acc + d.absDifference, 0);
  const overallDifference = sumDiff / diffs.length;

  // Spec szerinti tuningparaméter
  const k = 15;

  const raw = 100 - k * overallDifference;
  const clamped =
    typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;

  const fitIndex = Math.max(0, Math.min(100, Math.round(clamped)));
  const fitLevel = getFitLevel(fitIndex);

  diffs.sort((a, b) => a.category.localeCompare(b.category));

  return {
    fitIndex,
    fitLevel,
    categories: diffs,
  };
}

function getFitLevel(fitIndex: number): FitLevel {
  if (fitIndex < 50) return 'low';
  if (fitIndex < 80) return 'medium';
  return 'high';
}

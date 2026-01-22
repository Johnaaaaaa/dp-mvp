// data/matchStory.ts

import type { CategoryId, LocalizedText } from '@/types/dp';

type MatchQuestion = {
  id: string;
  category: CategoryId;
  text: LocalizedText;
  options: {
    id: string;
    label: LocalizedText;
    // Ezt nézi a dpEngine: value / score / weight közül az első értelmes számot veszi.
    // Itt a value lesz a fő forrás (0–10 skála).
    value: number;
    // Extra domain-spec pontszámok – a jelenlegi engine ezt nem használja,
    // de később jól jöhet tuningra / más view-khoz.
    scores: Partial<Record<CategoryId, number>>;
  }[];
};

// egyszerű helper a szövegekhez
const t = (de: string, en: string): LocalizedText => ({ de, en });

// Match-story 3 dimenzióval dolgozik:
// - autonomy
// - family
// - risk_tolerance
export const MATCH_CATEGORIES: CategoryId[] = [
  'autonomy',
  'family',
  'risk_tolerance',
];

// FŐ STORY OBJEKTUM – ezt használja a Match Self / Proxy / Session
export const matchStoryV1 = {
  id: 'match-v1',
  domain: 'match' as const,
  title: t(
    'Life Decisions – Proxy Match Demo',
    'Life Decisions – Proxy Match Demo',
  ),
  description: t(
    'Kurzer Demo-Story für den Vergleich von Self- und Proxy-Einschätzungen.',
    'Short demo story for comparing self and proxy assessments.',
  ),
  categories: MATCH_CATEGORIES,
  questions: [
    {
      id: 'match_autonomy',
      category: 'autonomy',
      text: t(
        'In wichtigen Lebensentscheidungen – wie stark soll die Person selbstbestimmt entscheiden können?',
        'In major life decisions – how strongly should the person decide autonomously?',
      ),
      options: [
        {
          id: 'autonomy_low',
          label: t(
            'Starke Einbindung anderer, wenig Eigenentscheidung',
            'Strong involvement of others, little self-decision',
          ),
          // 0–10 skála: low
          value: 2,
          scores: {
            autonomy: 20,
          },
        },
        {
          id: 'autonomy_medium',
          label: t(
            'Balance zwischen eigener Entscheidung und Rücksprache',
            'Balance between own decisions and consultation',
          ),
          value: 5,
          scores: {
            autonomy: 50,
          },
        },
        {
          id: 'autonomy_high',
          label: t(
            'Hohe Autonomie, nur minimale Rücksprache',
            'High autonomy, minimal consultation',
          ),
          value: 8,
          scores: {
            autonomy: 85,
          },
        },
      ],
    },
    {
      id: 'match_family',
      category: 'family',
      text: t(
        'Wie stark sollen Familie / nahe Bezugspersonen in schwierige Entscheidungen eingebunden sein?',
        'How strongly should family / close persons be involved in difficult decisions?',
      ),
      options: [
        {
          id: 'family_low',
          label: t(
            'Familie nur informiert, aber keine Entscheidungsrolle',
            'Family is only informed, but has no decision role',
          ),
          value: 2,
          scores: {
            family: 20,
          },
        },
        {
          id: 'family_medium',
          label: t(
            'Familie wird gehört, aber die Person entscheidet letztlich selbst',
            'Family is heard, but the person decides in the end',
          ),
          value: 5,
          scores: {
            family: 55,
          },
        },
        {
          id: 'family_high',
          label: t(
            'Familie soll aktiv mitentscheiden',
            'Family should actively co-decide',
          ),
          value: 8,
          scores: {
            family: 85,
          },
        },
      ],
    },
    {
      id: 'match_risk',
      category: 'risk_tolerance',
      text: t(
        'Wie risikobereit ist die Person bei unsicheren, aber potenziell vorteilhaften Entscheidungen?',
        'How risk-tolerant is the person in uncertain but potentially beneficial decisions?',
      ),
      options: [
        {
          id: 'risk_low',
          label: t(
            'Risikovermeidend, lieber konservative / sichere Optionen',
            'Risk-avoiding, prefers conservative / safe options',
          ),
          value: 2,
          scores: {
            risk_tolerance: 20,
          },
        },
        {
          id: 'risk_medium',
          label: t(
            'Abgewogene Risikobereitschaft, je nach Situation',
            'Balanced risk-taking, depending on the situation',
          ),
          value: 5,
          scores: {
            risk_tolerance: 55,
          },
        },
        {
          id: 'risk_high',
          label: t(
            'Hohe Risikobereitschaft, auch bei Unsicherheit',
            'High risk-taking, even under uncertainty',
          ),
          value: 8,
          scores: {
            risk_tolerance: 85,
          },
        },
      ],
    },
  ] as MatchQuestion[],
};


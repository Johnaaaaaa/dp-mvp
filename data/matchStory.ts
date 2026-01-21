// data/matchStory.ts

import type { Story } from '@/types/dp';

// Egyszerű, dummy life-decisions story – a tartalmat később a content-chat adja
export const matchStoryV1: Story = {
  id: 'match_v1',
  title: {
    de: 'Life Decisions – Demo',
    en: 'Life decisions – demo',
  },
  description: {
    de: 'Kurzer Demo-Test zu grossen Lebensentscheidungen (Karriere, Wohnort, Lebensstil).',
    en: 'Short demo test about big life decisions (career, location, lifestyle).',
  },
  questions: [
    {
      id: 'q1',
      text: {
        de: 'Du bekommst ein Jobangebot in einer anderen Stadt. Was ist dir am wichtigsten?',
        en: 'You get a job offer in another city. What matters most to you?',
      },
      options: [
        {
          id: 'opt_a',
          label: {
            de: 'Maximale Freiheit, ich kann später jederzeit wieder wechseln.',
            en: 'Maximum freedom, I can always switch again later.',
          },
          scores: {
            autonomy: 2,
            family: -1,
            risk_tolerance: 1,
          },
        },
        {
          id: 'opt_b',
          label: {
            de: 'Stabile Umgebung für Familie und Umfeld ist wichtiger als der Jobtitel.',
            en: 'Stable environment for family and surroundings is more important than the job title.',
          },
          scores: {
            autonomy: -1,
            family: 2,
            risk_tolerance: -1,
          },
        },
        {
          id: 'opt_c',
          label: {
            de: 'Ich entscheide pragmatisch: Gehalt, Arbeitsweg, Rahmenbedingungen.',
            en: 'I decide pragmatically: salary, commute, conditions.',
          },
          scores: {
            autonomy: 0,
            family: 1,
            risk_tolerance: 0,
          },
        },
      ],
    },
    {
      id: 'q2',
      text: {
        de: 'Wie gehst du mit finanziellen Risiken bei einem grösseren Lebensschritt um?',
        en: 'How do you deal with financial risk in a big life step?',
      },
      options: [
        {
          id: 'opt_a',
          label: {
            de: 'Lieber vorsichtig – ich verzichte eher auf Chancen als auf Sicherheit.',
            en: 'Prefer cautious – I would rather miss opportunities than lose security.',
          },
          scores: {
            autonomy: -1,
            family: 1,
            risk_tolerance: -2,
          },
        },
        {
          id: 'opt_b',
          label: {
            de: 'Mittelweg – ich gehe Risiken ein, aber mit Plan B.',
            en: 'Middle way – I take risks, but with a Plan B.',
          },
          scores: {
            autonomy: 1,
            family: 0,
            risk_tolerance: 0,
          },
        },
        {
          id: 'opt_c',
          label: {
            de: 'Hohe Risikobereitschaft, wenn die Upside gross ist.',
            en: 'High risk appetite if the upside is big.',
          },
          scores: {
            autonomy: 2,
            family: -1,
            risk_tolerance: 2,
          },
        },
      ],
    },
    {
      id: 'q3',
      text: {
        de: 'Wie wichtig ist dir langfristige Planbarkeit vs. spontane Freiheit?',
        en: 'How important is long-term planning vs. spontaneous freedom?',
      },
      options: [
        {
          id: 'opt_a',
          label: {
            de: 'Klare, langfristige Pläne geben mir Sicherheit.',
            en: 'Clear long-term plans give me security.',
          },
          scores: {
            autonomy: -1,
            family: 1,
            risk_tolerance: -1,
          },
        },
        {
          id: 'opt_b',
          label: {
            de: 'Mix aus Plan und Flexibilität.',
            en: 'Mix of planning and flexibility.',
          },
          scores: {
            autonomy: 1,
            family: 0,
            risk_tolerance: 0,
          },
        },
        {
          id: 'opt_c',
          label: {
            de: 'Spontane Freiheit ist wichtiger als ein fixer Plan.',
            en: 'Spontaneous freedom is more important than a fixed plan.',
          },
          scores: {
            autonomy: 2,
            family: -1,
            risk_tolerance: 1,
          },
        },
      ],
    },
  ],
};

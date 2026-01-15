// data/stories.ts
import { Story } from '@/types/dp';

export const demoStory: Story = {
  id: 'end_of_life_demo',
  title: {
    de: 'Demo: Entscheidungssituation am Lebensende',
    en: 'Demo: End-of-life decision scenario',
  },
  description: {
    de: 'Einfache Demo-Story für den MVP der Definitive Protocol Engine.',
    en: 'Simple demo story for the Definitive Protocol MVP engine.',
  },
  questions: [
    {
      id: 'q1',
      text: {
        de: 'Wenn nach einem unerwarteten Unfall keine realistische Chance auf eine vollständige Erholung besteht: Wie wichtig ist dir die Wahrung deiner Selbständigkeit?',
        en: 'If after an unexpected accident there is no realistic chance of full recovery, how important is it for you to maintain your independence?',
      },
      options: [
        {
          id: 'q1_opt1',
          label: {
            de: 'Sehr wichtig – ich möchte nicht in einer vollständigen Abhängigkeit leben.',
            en: 'Extremely important – I do not want to live in full dependence.',
          },
          scores: { autonomy: 3, family: 0, risk_tolerance: 0 },
        },
        {
          id: 'q1_opt2',
          label: {
            de: 'Ich bin kompromissbereit, wenn es für meine Familie so einfacher ist.',
            en: 'I am willing to compromise if this makes things easier for my family.',
          },
          scores: { autonomy: 1, family: 2, risk_tolerance: 0 },
        },
      ],
    },
    {
      id: 'q2',
      text: {
        de: 'Wie akzeptabel findest du aggressive, lebensverlängernde Behandlungen mit starken Nebenwirkungen?',
        en: 'How acceptable are aggressive, life-prolonging treatments with strong side effects for you?',
      },
      options: [
        {
          id: 'q2_opt1',
          label: {
            de: 'Nur, wenn eine realistische Chance auf eine gute Lebensqualität besteht.',
            en: 'Only if there is a realistic chance of good quality of life.',
          },
          scores: { autonomy: 0, family: 0, risk_tolerance: 1 },
        },
        {
          id: 'q2_opt2',
          label: {
            de: 'Ich würde sie auch dann in Betracht ziehen, wenn die Chance klein ist, aber ich dadurch etwas länger leben kann.',
            en: 'I would still consider them even if the chance is small, as long as I might live a bit longer.',
          },
          scores: { autonomy: 0, family: 0, risk_tolerance: 3 },
        },
        {
          id: 'q2_opt3',
          label: {
            de: 'Ich möchte keine aggressiven Behandlungen – Komfort ist wichtiger als maximale Lebensverlängerung.',
            en: 'I do not want aggressive treatments – comfort is more important than maximal life extension.',
          },
          scores: { autonomy: 0, family: 0, risk_tolerance: -1 },
        },
      ],
    },
  ],
};

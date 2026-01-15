// data/categories.ts

import type { CategoryDefinition } from '@/types/dp';

// Central registry of all categories used in the DP engine (MVP)
export const categoryDefinitions: CategoryDefinition[] = [
  {
    id: 'autonomy',
    label: {
      de: 'Selbständigkeit / Autonomie',
      en: 'Independence / Autonomy',
    },
    description: {
      de: 'Wie wichtig ist es dir, eigene Entscheidungen zu treffen und nicht vollständig von anderen abhängig zu sein?',
      en: 'How important it is for you to make your own decisions and not be fully dependent on others?',
    },
  },
  {
    id: 'family',
    label: {
      de: 'Rolle der Angehörigen',
      en: 'Role of relatives',
    },
    description: {
      de: 'Welche Bedeutung hat es für dich, Belastungen oder Entlastungen für deine Familie zu berücksichtigen?',
      en: 'How important it is for you to consider burden or relief for your family?',
    },
  },
  {
    id: 'risk_tolerance',
    label: {
      de: 'Umgang mit Risiko / belastenden Behandlungen',
      en: 'Risk tolerance / burden of treatments',
    },
    description: {
      de: 'Wie bereit bist du, belastende oder riskante Behandlungen in Kauf zu nehmen, um das Leben zu verlängern?',
      en: 'How willing you are to accept burdensome or risky treatments in order to prolong life?',
    },
  },
];

// Helper map for quick lookups by ID
export const categoryDefinitionsById: Record<string, CategoryDefinition> =
  categoryDefinitions.reduce((acc, def) => {
    acc[def.id] = def;
    return acc;
  }, {} as Record<string, CategoryDefinition>);

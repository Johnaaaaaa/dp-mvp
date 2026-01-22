// types/dp.ts
// DP core types – domain-agnostikus modell

// Nyelvi kódok
export type Lang = 'de' | 'en';

// Domain-ek – most health az aktív, a többi későbbi modulhoz
export type Domain = 'health' | 'match' | 'sandbox';

// Lokalizált szöveg: DE + EN mindig együtt
export type LocalizedText = {
  de: string;
  en: string;
};

// Kategória azonosító – health-ben pl. autonómia, Belastung, Risiko, stb.
// MVP-ben string, később lehet string union (literal típusok).
export type CategoryId = string;

// Kategória definíció UI-nak (label + magyarázat)
export type CategoryDefinition = {
  id: CategoryId;
  label: LocalizedText;
  description: LocalizedText;
};

// Story / Question / AnswerOption / Answer – domain-agnosztikus kérdésmodell

export type StoryId = string;
export type QuestionId = string;
export type AnswerOptionId = string;

export type Story = {
  id: StoryId;
  domain: Domain;
  title: LocalizedText;
  description: LocalizedText;
  questions: Question[];
};

export type Question = {
  id: QuestionId;
  category: CategoryId;
  title: LocalizedText;
  description: LocalizedText;
  options: AnswerOption[];
[key: string]: unknown;
};

export type AnswerOption = {
  id: string;
  label: LocalizedText;

  // Numerikus mezők, amiket a dpEngine figyel:
  // getOptionNumericValue() először ezeket próbálja.
  value?: number;
  score?: number;
  weight?: number;

  // Domain-spec többdimenziós pontszámok (health, match stb.).
  // A jelenlegi engine NEM használja, de a story-kban lehet.
  scores?: Partial<Record<CategoryId, number>>;

  // Engedjük meg, hogy legyenek extra mezők is (helper text, flags, bármi),
  // így nem fog sírni a TS, ha máshol bővíted.
  [key: string]: unknown;
};

// Egy konkrét válasz: melyik kérdésre melyik opció
export type Answer = {
  questionId: QuestionId;
  optionId: AnswerOptionId;
};

// DP-output: DecisionProfile

export type ColorCode = 'red' | 'yellow' | 'green';

export type CategoryScore = {
  category: CategoryId;
  score: number;
  color: ColorCode;
};

export type DecisionProfile = {
  storyId: StoryId;
  domain: Domain;
  categoryScores: CategoryScore[];
};

// ProxyFit – Self vs Proxy eltérés + fitIndex

export type FitLevel = 'low' | 'medium' | 'high';

export type ProxyFitCategoryDiff = {
  category: CategoryId;
  selfScore: number;
  proxyScore: number;
  absDifference: number;
};

export type ProxyFitResult = {
  fitIndex: number; // 0–100
  fitLevel: FitLevel;
  categories: ProxyFitCategoryDiff[];
};

// Session állapotgép – in-memory store + későbbi persistens DB-hez

export type SessionStatus =
  | 'open'
  | 'proxy_pending'
  | 'completed'
  | 'closed';

export type SessionId = string;

export type Session = {
  id: SessionId;
  domain: Domain;
  storyId: StoryId;
  selfAnswers: Answer[];
  proxyAnswers?: Answer[];
  selfLabel?: string | null;
  proxyLabel?: string | null;
  status: SessionStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
};

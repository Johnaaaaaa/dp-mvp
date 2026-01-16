// types/dp.ts

// Supported languages for UI text
export type Lang = 'de' | 'en';

// A piece of text in two languages (de/en)
export interface LocalizedText {
  de: string;
  en: string;
}

// Category identifiers (MVP: fixed 3)
export type CategoryId = 'autonomy' | 'family' | 'risk_tolerance';

// Traffic light colors for risk/result display
export type RiskColor = 'red' | 'yellow' | 'green';

// Human-friendly metadata for a category (used for UI labels & descriptions)
export interface CategoryDefinition {
  id: CategoryId;
  label: LocalizedText;
  description: LocalizedText;
}

// One answer option within a question
export interface AnswerOption {
  id: string;
  label: LocalizedText;               // de/en label for the option
  scores: Record<CategoryId, number>; // contribution to each category
}

// One question within a story
export interface Question {
  id: string;
  text: LocalizedText;                // de/en question text
  options: AnswerOption[];
}

// A story (scenario) with multiple questions
export interface Story {
  id: string;
  title: LocalizedText;               // de/en title
  description?: LocalizedText;        // de/en description
  questions: Question[];
}

// This is how we store a user's choice for a question
export interface UserAnswer {
  questionId: string;
  optionId: string;
}

// Aggregated score for a single category
export interface CategoryScore {
  category: CategoryId;
  score: number;
  color: RiskColor;
}

// Result profile that the engine returns
export interface DecisionProfile {
  totalScores: CategoryScore[];
}
// Comparison between self profile and proxy profile for one category
export interface ProxyFitCategoryComparison {
  category: CategoryId;
  selfScore: number;
  proxyScore: number;
  /**
   * proxyScore - selfScore (pozitív = proxy többet "tol" az adott irányba)
   */
  difference: number;
}

// Aggregated ProxyFit result for all categories
export interface ProxyFitResult {
  categories: ProxyFitCategoryComparison[];
  /**
   * Átlagos abszolút eltérés a kategóriák között
   * (0 = teljes egyezés, minél nagyobb, annál nagyobb a mismatch)
   */
  overallDifference: number;
}

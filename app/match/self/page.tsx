'use client';

// app/match/self/page.tsx

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { matchStoryV1 } from '@/data/matchStory';
import { calculateDecisionProfile } from '@/lib/dpEngine';
import type { Answer, CategoryScore } from '@/types/dp';
import { categoryDefinitionsById } from '@/data/categories';

const LANG = 'de' as const;

type Phase = 'question' | 'summary';

export default function MatchSelfPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [phase, setPhase] = useState<Phase>('question');
  const [profile, setProfile] = useState<CategoryScore[] | null>(null);

  const totalQuestions = matchStoryV1.questions.length;
  const currentQuestion = matchStoryV1.questions[currentIndex];

  const currentAnswer = useMemo(() => {
    return answers.find((a) => a.questionId === currentQuestion.id) ?? null;
  }, [answers, currentQuestion.id]);

  function handleSelectOption(optionId: string) {
    setAnswers((prev) => {
      const withoutCurrent = prev.filter(
        (a) => a.questionId !== currentQuestion.id,
      );
      return [
        ...withoutCurrent,
        {
          questionId: currentQuestion.id,
          optionId,
        },
      ];
    });
  }

  const allAnswered = answers.length === totalQuestions;

  function handleNext() {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((idx) => idx + 1);
    } else {
      // utolsó kérdés után számolunk profilt
      const decisionProfile = calculateDecisionProfile(
        matchStoryV1,
        answers,
        'match',
      );
      setProfile(decisionProfile.categoryScores);
      setPhase('summary');
    }
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
    }
  }

  function getColorClasses(color: CategoryScore['color']): string {
    switch (color) {
      case 'red':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'yellow':
        return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40';
      case 'green':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-8 py-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-emerald-400">
            Match · Self-Demo
          </p>
          <h1 className="text-xl font-semibold text-slate-50">
            Life Decisions – kurzer Self-Test
          </h1>
          <p className="text-xs text-slate-400">
            3 Fragen zu grossen Lebensentscheidungen (Karriere, Wohnort,
            Lebensstil). Am Ende siehst du dein Demo-Profil in denselben
            Dimensionen wie im Health-Case.
          </p>
        </header>

        {phase === 'question' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>
                Frage {currentIndex + 1} von {totalQuestions}
              </span>
              <span>
                Beantwortet: {answers.length}/{totalQuestions}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-slate-100">
                {currentQuestion.text[LANG]}
              </h2>
              <div className="space-y-2">
                {currentQuestion.options.map((opt) => {
                  const selected = currentAnswer?.optionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full text-left text-xs rounded-lg border px-3 py-2 transition
                        ${
                          selected
                            ? 'border-emerald-400 bg-emerald-500/10 text-emerald-100'
                            : 'border-slate-700 bg-slate-950/60 text-slate-100 hover:border-slate-500'
                        }`}
                    >
                      {opt.label[LANG]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={`text-xs px-3 py-1.5 rounded-md border ${
                  currentIndex === 0
                    ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                    : 'border-slate-700 text-slate-200 hover:border-slate-500'
                }`}
              >
                Zurück
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!currentAnswer}
                className={`text-xs px-4 py-1.5 rounded-md border ${
                  currentAnswer
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20'
                    : 'border-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                {currentIndex === totalQuestions - 1
                  ? 'Fertig – Profil anzeigen'
                  : 'Weiter'}
              </button>
            </div>
          </section>
        )}

        {phase === 'summary' && profile && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">
              Dein Demo-Match-Profil
            </h2>
            <p className="text-xs text-slate-400">
              Die Scores und Farben werden mit derselben Logik berechnet wie im
              Health-Modul. Später können Self- und Proxy-Profile im selben
              DP-Raum verglichen werden.
            </p>
            <ul className="space-y-2">
              {profile.map((cat) => {
                const def = categoryDefinitionsById[cat.category];
                const label = def?.label[LANG] ?? cat.category;
                const description = def?.description?.[LANG];

                const colorClasses = getColorClasses(cat.color);

                return (
                  <li
                    key={cat.category}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-100">
                        {label}
                      </p>
                      {description && (
                        <p className="text-[11px] text-slate-400">
                          {description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] ${colorClasses}`}
                      >
                        Score: {cat.score.toFixed(1)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                className="text-xs text-slate-300 hover:text-emerald-300 underline underline-offset-4"
                onClick={() => {
                  setPhase('question');
                  setCurrentIndex(0);
                }}
              >
                Test neu starten
              </button>
              <Link
                href="/"
                className="text-xs text-slate-300 hover:text-emerald-300 underline underline-offset-4"
              >
                Zurück zur Übersicht
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

'use client';

// app/match/self/page.tsx

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { matchStoryV1 } from '@/data/matchStory';
import type { Answer, CategoryScore, CategoryId } from '@/types/dp';
import { categoryDefinitionsById } from '@/data/categories';

const LANG = 'de' as const;
type Phase = 'question' | 'summary';

// Lokális kategória-ID a Match storyhoz
type LocalCategoryId = 'autonomy' | 'family' | 'risk_tolerance';

// Score -> szín (ugyanaz a logika, mint Health-ben)
function colorFromScore(score: number): CategoryScore['color'] {
  if (score <= -2) return 'red';
  if (score >= 2) return 'green';
  return 'yellow';
}

// Lokális profil-számítás a matchStoryV1-re
function calculateMatchProfile(answers: Answer[]): CategoryScore[] {
  const totals: Record<LocalCategoryId, number> = {
    autonomy: 0,
    family: 0,
    risk_tolerance: 0,
  };

  matchStoryV1.questions.forEach((q) => {
    const answer = answers.find((a) => a.questionId === q.id);
    if (!answer) return;

    const option = q.options.find((o) => o.id === answer.optionId);
    if (!option) return;

    (Object.keys(option.scores) as LocalCategoryId[]).forEach((cat) => {
      totals[cat] += option.scores[cat] ?? 0;
    });
  });

  return (Object.keys(totals) as LocalCategoryId[]).map((cat) => {
    const score = totals[cat];
    return {
      category: cat as CategoryId,
      score,
      color: colorFromScore(score),
    };
  });
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

export default function MatchSelfPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [phase, setPhase] = useState<Phase>('question');
  const [profile, setProfile] = useState<CategoryScore[] | null>(null);

  // ÚJ: Session backend state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [proxyLink, setProxyLink] = useState<string | null>(null);
  const [creatingSession, setCreatingSession] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Utolsó kérdésnél:
  // 1) lokális profil-számítás
  // 2) Session létrehozása a /api/match/session-en
  async function handleNext() {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((idx) => idx + 1);
      return;
    }

    // 1) Profil kiszámítása
    const decisionProfile = calculateMatchProfile(answers);
    setProfile(decisionProfile);
    setPhase('summary');

    // 2) Session létrehozás backendben
    try {
      setCreatingSession(true);
      setErrorMessage(null);

      const response = await fetch('/api/match/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: matchStoryV1.id,
          selfAnswers: answers,
          // selfLabel / proxyLabel most nem kötelező, később ráérünk.
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const msg =
          (data && (data.error as string | undefined)) ||
          'Fehler beim Erstellen der Match-Session.';
        setErrorMessage(msg);
        return;
      }

      const data = (await response.json()) as { sessionId: string };
      setSessionId(data.sessionId);

      if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        setProxyLink(`${origin}/match/proxy/${data.sessionId}`);
      }
    } catch (error) {
      console.error('POST /api/match/session error', error);
      setErrorMessage('Unerwarteter Fehler beim Erstellen der Match-Session.');
    } finally {
      setCreatingSession(false);
    }
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
    }
  }

  function handleRestart() {
    setPhase('question');
    setCurrentIndex(0);
    setAnswers([]);
    setProfile(null);
    setSessionId(null);
    setProxyLink(null);
    setErrorMessage(null);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-8 py-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-emerald-400">
            Match · Self
          </p>
          <h1 className="text-xl font-semibold text-slate-50">
            Life Decisions – kurzer Self-Test
          </h1>
          <p className="text-xs text-slate-400">
            3 Fragen zu grossen Lebensentscheidungen (Karriere, Wohnort,
            Lebensstil). Am Ende siehst du dein Demo-Profil – und kannst einen
            Proxy-Link erzeugen, damit jemand anders dich einschätzt.
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
                  ? 'Fertig – Profil & Link'
                  : 'Weiter'}
              </button>
            </div>
          </section>
        )}

        {phase === 'summary' && profile && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-200">
              Dein Demo-Match-Profil
            </h2>
            <p className="text-xs text-slate-400">
              Die Scores und Farben werden mit derselben Logik berechnet wie im
              Health-Modul – nur hier für Lebensentscheidungen.
            </p>

            <ul className="space-y-2">
              {profile.map((cat, index) => {
                const def = categoryDefinitionsById[cat.category];
                const label = def?.label[LANG] ?? cat.category;
                const description = def?.description?.[LANG];
                const colorClasses = getColorClasses(cat.color);

                return (
                  <li
                    key={`${cat.category}-${index}`}
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

            {/* Session + Proxy-link blokk */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 text-xs">
              <h3 className="font-semibold text-slate-100">
                Proxy-Link für deinen Match-Test
              </h3>

              {creatingSession && (
                <p className="text-slate-400">
                  Match-Session wird erstellt&nbsp;…
                </p>
              )}

              {errorMessage && (
                <p className="text-red-400 text-xs">{errorMessage}</p>
              )}

              {sessionId && (
                <div className="space-y-1">
                  <p className="text-slate-400 break-all">
                    Session-ID:{' '}
                    <span className="font-mono text-slate-100">
                      {sessionId}
                    </span>
                  </p>
                  {proxyLink && (
                    <p className="text-slate-400 break-all">
                      Proxy-Link:{' '}
                      <span className="font-mono text-slate-100">
                        {proxyLink}
                      </span>
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500">
                    Teile den Link mit jemandem (Mentor:in, Partner:in, etc.),
                    der/die einschätzen soll, wie du in solchen Situationen
                    entscheiden würdest.
                  </p>
                </div>
              )}

              {!creatingSession && !sessionId && !errorMessage && (
                <p className="text-[11px] text-slate-500">
                  Hinweis: Wenn keine Session-ID erscheint, konnte die
                  Match-Session nicht erstellt werden.
                </p>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                className="text-xs text-slate-300 hover:text-emerald-300 underline underline-offset-4"
                onClick={handleRestart}
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

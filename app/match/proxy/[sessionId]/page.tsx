'use client';

// app/match/proxy/[sessionId]/page.tsx

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { matchStoryV1 } from '@/data/matchStory';
import type { Answer } from '@/types/dp';

const LANG = 'de' as const;

type Phase = 'loading' | 'question' | 'done' | 'error';

export default function MatchProxyPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params?.sessionId;

  const [phase, setPhase] = useState<Phase>('loading');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const totalQuestions = matchStoryV1.questions.length;
  const currentQuestion = matchStoryV1.questions[currentIndex];

  const currentAnswer = useMemo(() => {
    return answers.find((a) => a.questionId === currentQuestion.id) ?? null;
  }, [answers, currentQuestion.id]);

  // Session ellenőrzése a backendnél (létezik-e, domain = match)
  useEffect(() => {
    if (typeof sessionId !== 'string') {
      setErrorMessage('Ungültige Session-ID.');
      setPhase('error');
      return;
    }

    async function checkSession() {
      try {
        const res = await fetch(`/api/match/session?id=${sessionId}`);
        if (!res.ok) {
          setErrorMessage('Session nicht gefunden oder nicht mehr aktiv.');
          setPhase('error');
          return;
        }

        setPhase('question');
      } catch (error) {
        console.error('GET /api/match/session error', error);
        setErrorMessage('Fehler beim Laden der Session.');
        setPhase('error');
      }
    }

    checkSession();
  }, [sessionId]);

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

  async function handleNext() {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((idx) => idx + 1);
      return;
    }

    // Utolsó kérdés → proxy válaszok mentése
    if (typeof sessionId !== 'string') {
      setErrorMessage('Ungültige Session-ID.');
      setPhase('error');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);

      const response = await fetch('/api/match/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          proxyAnswers: answers,
          // proxyLabel később; most optional, backend elbírja.
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const msg =
          (data && (data.error as string | undefined)) ||
          'Fehler beim Speichern der Proxy-Antworten.';
        setErrorMessage(msg);
        return;
      }

      setPhase('done');
    } catch (error) {
      console.error('PUT /api/match/session error', error);
      setErrorMessage('Unerwarteter Fehler beim Speichern.');
    } finally {
      setSaving(false);
    }
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
    }
  }

  // UI

  if (phase === 'loading') {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <p className="text-xs text-slate-300">
          Session wird geladen&nbsp;…
        </p>
      </main>
    );
  }

  if (phase === 'error') {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-3">
          <h1 className="text-sm font-semibold text-red-400">
            Problem mit der Match-Session
          </h1>
          <p className="text-xs text-slate-300">{errorMessage}</p>
          <Link
            href="/"
            className="text-xs text-slate-300 hover:text-emerald-300 underline underline-offset-4"
          >
            Zurück zur Übersicht
          </Link>
        </div>
      </main>
    );
  }

  if (phase === 'done') {
    const summaryLink =
      typeof window !== 'undefined' && typeof sessionId === 'string'
        ? `${window.location.origin}/match/session?sessionId=${sessionId}`
        : null;

    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4 py-8">
          <h1 className="text-sm font-semibold text-slate-50">
            Danke für deine Einschätzung.
          </h1>
          <p className="text-xs text-slate-400">
            Deine Antworten wurden für diese Match-Session gespeichert. Die
            auswertende Person kann das Self- und Proxy-Profil im Session-View
            vergleichen.
          </p>
          {summaryLink && (
            <p className="text-xs text-slate-400 break-all">
              Session-Ansicht:{' '}
              <span className="font-mono text-slate-100">{summaryLink}</span>
            </p>
          )}
          <Link
            href="/"
            className="text-xs text-slate-300 hover:text-emerald-300 underline underline-offset-4"
          >
            Zurück zur Übersicht
          </Link>
        </div>
      </main>
    );
  }

  // phase === 'question'
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-8 py-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-emerald-400">
            Match · Proxy
          </p>
          <h1 className="text-xl font-semibold text-slate-50">
            Wie würde diese Person entscheiden?
          </h1>
          <p className="text-xs text-slate-400">
            Beantworte die Fragen so, wie du glaubst, dass die andere Person in
            diesen Lebenssituationen entscheiden würde.
          </p>
        </header>

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
              disabled={!currentAnswer || saving}
              className={`text-xs px-4 py-1.5 rounded-md border ${
                currentAnswer && !saving
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20'
                  : 'border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              {currentIndex === totalQuestions - 1
                ? saving
                  ? 'Speichern …'
                  : 'Fertig – speichern'
                : 'Weiter'}
            </button>
          </div>

          {errorMessage && (
            <p className="text-xs text-red-400">{errorMessage}</p>
          )}
        </section>
      </div>
    </main>
  );
}

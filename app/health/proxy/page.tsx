'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { demoStory } from '@/data/stories';
import type { Answer, Lang } from '@/types/dp';

const LANG: Lang = 'de';

type Phase = 'questions' | 'submit' | 'done';

export default function HealthProxyPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [phase, setPhase] = useState<Phase>('questions');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
    function copyToClipboard(value: string | null) {
    if (!value) return;
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      console.warn('Clipboard API not available');
      return;
    }
    navigator.clipboard.writeText(value).catch((err) => {
      console.error('Failed to copy to clipboard', err);
    });
  }

  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : '';
  const sessionViewLink =
    baseUrl && sessionId
      ? `${baseUrl}/health/session?sessionId=${sessionId}`
      : null;

  // Ha nincs sessionId a URL-ben → hibaképernyő
  if (!sessionId) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-2xl font-semibold">Health – Proxy</h1>
          <p className="text-sm text-slate-300">
            Fehler: Session-ID fehlt im Link. Bitte überprüfe den zugesendeten
            Proxy-Link.
          </p>
        </div>
      </main>
    );
  }

  const totalQuestions = demoStory.questions.length;
  const currentQuestion = demoStory.questions[currentIndex];

  function handleAnswer(optionId: string) {
    const questionId = currentQuestion.id;
    const answer: Answer = { questionId, optionId };
    const updated = [...answers, answer];
    setAnswers(updated);

    const nextIndex = currentIndex + 1;
    if (nextIndex < totalQuestions) {
      setCurrentIndex(nextIndex);
    } else {
      setPhase('submit');
    }
  }

  async function handleSubmit() {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/health/session', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          proxyAnswers: answers,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const msg =
          (data && (data.error as string | undefined)) ||
          'Unerwarteter Fehler beim Speichern der Proxy-Antworten.';
        setErrorMessage(msg);
        return;
      }

      setPhase('done');
    } catch (error) {
      console.error(
        'Error updating health session with proxy answers',
        error,
      );
      setErrorMessage('Fehler beim Speichern der Proxy-Antworten.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleRestart() {
    setPhase('questions');
    setCurrentIndex(0);
    setAnswers([]);
    setErrorMessage(null);
  }

  if (phase === 'submit') {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl space-y-6">
          <header className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-slate-400">
              Health – Proxy
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Antworten abschließen
            </h1>
            <p className="text-sm text-slate-300">
              Du hast alle Fragen beantwortet. Mit einem Klick werden deine
              Antworten in der Session gespeichert.
            </p>
          </header>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 text-sm text-slate-300">
            <p>
              Session-ID:{' '}
              <span className="font-mono text-slate-100 text-xs">
                {sessionId}
              </span>
            </p>

            {sessionViewLink && (
              <div className="space-y-1 text-xs">
                <p className="text-slate-400">
                  Session-Ansicht (Doctor View):
                </p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={sessionViewLink}
                    className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1 text-[11px] font-mono text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(sessionViewLink)}
                    className="shrink-0 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-800"
                  >
                    Copy
                  </button>
                  <a
                    href={sessionViewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-800"
                  >
                    Öffnen
                  </a>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500">
              In einer späteren Version wird hier eine detaillierte Doctor-View
              mit Self vs Proxy und ProxyFit eingebunden.
            </p>
          </div>

          {errorMessage && (
            <p className="text-xs text-red-400">{errorMessage}</p>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleRestart}
              className="text-xs underline underline-offset-2 hover:text-slate-300"
            >
              Antworten neu starten
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Wird gespeichert...' : 'Antworten speichern'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (phase === 'done') {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl space-y-6">
          <header className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-slate-400">
              Health – Proxy
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Danke für deine Einschätzung
            </h1>
            <p className="text-sm text-slate-300">
              Deine Antworten wurden gespeichert. Die Person, für die du
              geantwortet hast (oder die Fachperson), kann die Session mit dem
              entsprechenden Link einsehen.
            </p>
          </header>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 text-sm text-slate-300">
            <p>
              Session-ID:{' '}
              <span className="font-mono text-slate-100 text-xs">
                {sessionId}
              </span>
            </p>
            <p className="text-xs text-slate-500">
              In einer späteren Version wird hier eine Arzt/Ärztin- oder
              „Doctor View“-Sicht mit Self vs Proxy vs ProxyFit angezeigt.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRestart}
            className="text-xs underline underline-offset-2 hover:text-slate-300"
          >
            Nochmals als Proxy ausfüllen
          </button>
        </div>
      </main>
    );
  }

  // questions phase
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-slate-400">
            Health – Proxy
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold">
            Teil 2: Als Stellvertreter:in
          </h1>
          <p className="text-sm text-slate-300">
            Antworte so, als ob du für eine andere Person entscheiden würdest.
            Es geht nicht um deine eigenen Präferenzen, sondern darum, was du
            für diese Person für angemessen hältst.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{demoStory.title[LANG]}</span>
            <span>
              Frage {currentIndex + 1} / {totalQuestions}
            </span>
          </div>

          <h2 className="text-sm font-semibold text-slate-100">
              {t(currentQuestion.title)}
            </h2>
            <p className="text-xs text-slate-300">
              {t(currentQuestion.description)}
            </p>

          <div className="space-y-2">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleAnswer(option.id)}
                className="w-full text-left rounded-xl border border-slate-700/80 bg-slate-900/80 px-4 py-3 text-sm hover:border-slate-400 hover:bg-slate-900 transition"
              >
                {option.label[LANG]}
              </button>
            ))}
          </div>
        </section>

        <div className="flex justify-between items-center text-xs text-slate-500">
          <p>
            Phase:{' '}
            <span className="font-medium text-slate-300">Proxy (Health)</span>
          </p>
          <button
            type="button"
            onClick={handleRestart}
            className="underline underline-offset-2 hover:text-slate-300"
          >
            Flow zurücksetzen
          </button>
        </div>
      </div>
    </main>
  );
}

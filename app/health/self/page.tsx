'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Answer, Lang } from '@/types/dp';
import { demoStory } from '@/data/stories';

const LANG: Lang = 'de';

// Nagyon egyszerű lokalizációs helper – ugyanaz, mint a /test oldalon
function t(localized: any): string {
  if (localized == null) return '';
  if (typeof localized === 'string') return localized;

  if (typeof localized === 'object') {
    const byLang = (localized as Record<string, unknown>)[LANG];
    if (typeof byLang === 'string') return byLang;

    const deVal = (localized as Record<string, unknown>)['de'];
    if (typeof deVal === 'string') return deVal;

    const enVal = (localized as Record<string, unknown>)['en'];
    if (typeof enVal === 'string') return enVal;
  }

  return '';
}

export default function HealthSelfPage() {
  const story = demoStory as any;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const [selfLabel, setSelfLabel] = useState('');
  const [proxyLabel, setProxyLabel] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [finished, setFinished] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [proxyLink, setProxyLink] = useState<string | null>(null);
  const [doctorLink, setDoctorLink] = useState<string | null>(null);

  const questions = story.questions as any[];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  // adott kérdésre adott válasz lekérése
  const currentAnswer = answers.find(
    (a) => a.questionId === currentQuestion?.id,
  );

  const allAnswered = questions.every((q) =>
    answers.some((a) => a.questionId === q.id),
  );

  function handleSelect(optionId: string) {
    if (!currentQuestion) return;

    setAnswers((prev) => {
      const existingIndex = prev.findIndex(
        (a) => a.questionId === currentQuestion.id,
      );
      const updated: Answer = {
        questionId: currentQuestion.id,
        optionId,
      };

      if (existingIndex === -1) {
        return [...prev, updated];
      }

      const clone = [...prev];
      clone[existingIndex] = updated;
      return clone;
    });
  }

  function handlePrev() {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
  }

  async function handleNextOrSubmit() {
    setErrorMessage(null);

    // ha nem az utolsó kérdésen vagyunk → csak léptetünk
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    // utolsó kérdés → session létrehozás
    if (!allAnswered) {
      setErrorMessage(
        'Bitte alle Fragen beantworten, bevor die Session erstellt wird.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        storyId: story.id as string,
        selfAnswers: answers,
        selfLabel: selfLabel.trim() || undefined,
        proxyLabel: proxyLabel.trim() || undefined,
      };

      const response = await fetch('/api/health/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let msg = 'Fehler beim Erstellen der Session.';
        try {
          const data = await response.json();
          if (typeof data.error === 'string') {
            msg = data.error;
          }
        } catch {
          // ignore
        }
        setErrorMessage(msg);
        return;
      }

      const data = await response.json();
      const newSessionId = data.sessionId as string | undefined;

      if (!newSessionId) {
        setErrorMessage('Unerwartete Antwort: Session ID fehlt.');
        return;
      }

      setSessionId(newSessionId);

      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const baseUrl = origin || '';

      const proxyUrl = `${baseUrl}/health/proxy?sessionId=${newSessionId}`;
      const doctorUrl = `${baseUrl}/health/session?sessionId=${newSessionId}`;

      setProxyLink(proxyUrl);
      setDoctorLink(doctorUrl);
      setFinished(true);
    } catch (error) {
      console.error('Error creating health session', error);
      setErrorMessage('Interner Fehler beim Erstellen der Session.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyProxyLink() {
    if (!proxyLink) return;
    try {
      await navigator.clipboard.writeText(proxyLink);
      // Semmi toast, semmi extra – MVP, csak a logika kell.
    } catch (error) {
      console.error('Clipboard error', error);
    }
  }

  if (!currentQuestion && !finished) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="max-w-lg text-center space-y-4">
          <h1 className="text-2xl font-semibold">
            Keine Fragen für diese Story gefunden.
          </h1>
          <p className="text-sm text-slate-300">
            Die Health-Story ist momentan leer oder fehlerhaft konfiguriert.
          </p>
          <Link
            href="/health"
            className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-sm"
          >
            Zurück zur Health-Übersicht
          </Link>
        </div>
      </main>
    );
  }

  // KÉSZ, SESSION LÉTREJÖTT → SUMMARY + LINK-EK
  if (finished && sessionId) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl space-y-6 py-8">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Health / Self
            </p>
            <h1 className="text-2xl font-semibold">
              Danke für deine Angaben.
            </h1>
            <p className="text-sm text-slate-300">
              Die Session wurde erstellt. Du kannst den Proxy-Link an deine
              Stellvertreter:in weitergeben und die Session-ID bzw. Doctor
              View-URL für die Besprechung verwenden.
            </p>
          </header>

          <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-slate-100">
                Session-ID
              </h2>
              <p className="text-xs text-slate-400">
                Diese ID kann in der Doctor-Ansicht verwendet werden.
              </p>
              <p className="font-mono text-sm bg-slate-950/70 rounded-md px-3 py-2 border border-slate-800 inline-block">
                {sessionId}
              </p>
            </div>

            {proxyLink && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-slate-100">
                  Proxy-Link
                </h2>
                <p className="text-xs text-slate-400">
                  Diesen Link kannst du direkt an die Stellvertreter:in
                  weitergeben. Der Link öffnet den Proxy-Flow für diese Session.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    readOnly
                    value={proxyLink}
                    className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleCopyProxyLink}
                    className="mt-1 sm:mt-0 inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-xs"
                  >
                    Proxy-Link kopieren
                  </button>
                </div>
              </div>
            )}

            {doctorLink && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-slate-100">
                  Doctor View
                </h2>
                <p className="text-xs text-slate-400">
                  In der Doctor-Ansicht werden Self- und Proxy-Profil sowie der
                  ProxyFit angezeigt (sobald Proxy-Antworten vorliegen).
                </p>
                <Link
                  href={doctorLink}
                  className="inline-flex items-center justify-center rounded-md border border-emerald-500/60 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-200"
                >
                  Doctor View öffnen
                </Link>
              </div>
            )}
          </section>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <Link href="/health" className="hover:text-slate-200 underline">
              Zurück zur Health-Übersicht
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ALAP FLOW – kérdések egyesével

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-6 py-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Health / Self
          </p>
          <h1 className="text-2xl font-semibold">
            Health Story – deine eigene Sicht
          </h1>
          <p className="text-sm text-slate-300">
            Beantworte die folgenden Fragen aus deiner eigenen Perspektive. Am
            Ende wird eine Session erstellt, die du mit einer Stellvertreter:in
            und in der Doctor-Ansicht nutzen kannst.
          </p>
        </header>

        {/* Meta: SelfLabel / ProxyLabel */}
        <section className="grid md:grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-200">
              Wie soll der Fall / die Person bezeichnet werden?
            </label>
            <input
              type="text"
              value={selfLabel}
              onChange={(e) => setSelfLabel(e.target.value)}
              placeholder="z.B. Ich, Patient A ..."
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-200">
              Wie soll die Stellvertreter:in bezeichnet werden?
            </label>
            <input
              type="text"
              value={proxyLabel}
              onChange={(e) => setProxyLabel(e.target.value)}
              placeholder="z.B. Mutter, Partnerin ..."
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100"
            />
          </div>
        </section>

        {/* Kérdés blokk */}
        <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Frage {currentIndex + 1} von {totalQuestions}
            </span>
            <span>Story: {t(story.title)}</span>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              {currentQuestion.category}
            </p>
            <h2 className="text-sm font-semibold text-slate-100">
              {t(currentQuestion.title)}
            </h2>
            <p className="text-xs text-slate-300">
              {t(currentQuestion.description)}
            </p>
          </div>

          <div className="space-y-1">
            {(currentQuestion.options as any[]).map((opt) => {
              const isSelected = currentAnswer?.optionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full text-left rounded-md border px-3 py-1.5 text-xs ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-50'
                      : 'border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-medium">{t(opt.label)}</div>
                  {opt.description && (
                    <div className="text-[11px] text-slate-300">
                      {t(opt.description)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Navigáció + error */}
        <section className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0 || isSubmitting}
            className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs disabled:opacity-40"
          >
            Zurück
          </button>

          <div className="flex flex-col items-end gap-1">
            {errorMessage && (
              <p className="text-[11px] text-red-400 max-w-xs text-right">
                {errorMessage}
              </p>
            )}
            <button
              type="button"
              onClick={handleNextOrSubmit}
              disabled={isSubmitting || !currentAnswer}
              className="inline-flex items-center justify-center rounded-md border border-emerald-500/70 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-200 disabled:opacity-40"
            >
              {currentIndex < totalQuestions - 1
                ? 'Weiter'
                : 'Session erstellen'}
            </button>
          </div>
        </section>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link href="/health" className="hover:text-slate-200 underline">
            Zurück zur Health-Übersicht
          </Link>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { demoStory } from '@/data/stories';
import { categoryDefinitionsById } from '@/data/categories';
import type { Lang, UserAnswer } from '@/types/dp';
import { computeDecisionProfile, computeProxyFit } from '@/lib/dpEngine';

const LANG: Lang = 'de';

// Milyen "fázisban" van a teszt?
type Phase = 'self' | 'proxy' | 'summary';

export default function TestPage() {
  const [phase, setPhase] = useState<Phase>('self');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selfAnswers, setSelfAnswers] = useState<UserAnswer[]>([]);
  const [proxyAnswers, setProxyAnswers] = useState<UserAnswer[]>([]);

  const totalQuestions = demoStory.questions.length;
  const currentQuestion = demoStory.questions[currentIndex];

  // Egy válasz kezelése – attól függően, hogy self vagy proxy fázisban vagyunk
  function handleAnswer(optionId: string) {
    const questionId = currentQuestion.id;
    const answer: UserAnswer = { questionId, optionId };

    if (phase === 'self') {
      const updated = [...selfAnswers, answer];
      setSelfAnswers(updated);

      const nextIndex = currentIndex + 1;
      if (nextIndex < totalQuestions) {
        setCurrentIndex(nextIndex);
      } else {
        // Self kör kész → indul a Proxy kör
        setPhase('proxy');
        setCurrentIndex(0);
      }
    } else if (phase === 'proxy') {
      const updated = [...proxyAnswers, answer];
      setProxyAnswers(updated);

      const nextIndex = currentIndex + 1;
      if (nextIndex < totalQuestions) {
        setCurrentIndex(nextIndex);
      } else {
        // Proxy kör kész → Summary (ProxyFit)
        setPhase('summary');
      }
    }
  }

  // Mindent nulláz, újrakezdjük az egész kétkörös tesztet
  function handleRestart() {
    setPhase('self');
    setCurrentIndex(0);
    setSelfAnswers([]);
    setProxyAnswers([]);
  }

  // SUMMARY – csak akkor, ha mindkét kör lefutott
  if (phase === 'summary') {
    const selfProfile = computeDecisionProfile(demoStory, selfAnswers);
    const proxyProfile = computeDecisionProfile(demoStory, proxyAnswers);
    const proxyFit = computeProxyFit(selfProfile, proxyProfile);

    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-4xl space-y-8">
          <header className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-slate-400">
              Technisches Demo – Ergebnisübersicht
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Vergleich: Dein Profil &amp; Proxy-Profil
            </h1>
            <p className="text-sm text-slate-300">
              Diese Ansicht zeigt nebeneinander, wie du selbst geantwortet hast
              und wie die Stellvertreter:in geantwortet hat – plus eine einfache
              ProxyFit-Abweichung pro Kategorie.
            </p>
          </header>

          <section className="grid md:grid-cols-3 gap-6">
            {/* Self profil blokk */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-slate-200">
                Dein Profil
              </h2>
              <ul className="space-y-2 text-sm">
                {selfProfile.totalScores.map((cat) => {
                  const def = categoryDefinitionsById[cat.category];
                  const label = def?.label[LANG] ?? cat.category;
                  const colorClass =
                    cat.color === 'red'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : cat.color === 'yellow'
                      ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                  return (
                    <li
                      key={`self-${cat.category}`}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-slate-200">{label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs border ${colorClass}`}
                      >
                        Score {cat.score}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Proxy profil blokk */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-slate-200">
                Proxy-Profil
              </h2>
              <ul className="space-y-2 text-sm">
                {proxyProfile.totalScores.map((cat) => {
                  const def = categoryDefinitionsById[cat.category];
                  const label = def?.label[LANG] ?? cat.category;
                  const colorClass =
                    cat.color === 'red'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : cat.color === 'yellow'
                      ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                  return (
                    <li
                      key={`proxy-${cat.category}`}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-slate-200">{label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs border ${colorClass}`}
                      >
                        Score {cat.score}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* ProxyFit összehasonlítás blokk */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-slate-200">
                ProxyFit – Abweichung
              </h2>
              <ul className="space-y-2 text-sm">
                {proxyFit.categories.map((c) => {
                  const def = categoryDefinitionsById[c.category];
                  const label = def?.label[LANG] ?? c.category;
                  const absDiff = Math.abs(c.difference);

                  return (
                    <li
                      key={`fit-${c.category}`}
                      className="flex flex-col gap-1 rounded-lg bg-slate-950/60 px-2 py-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-200">{label}</span>
                        <span className="text-xs text-slate-400">
                          Δ {c.difference >= 0 ? '+' : ''}
                          {c.difference}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Du: {c.selfScore}</span>
                        <span>Proxy: {c.proxyScore}</span>
                        <span>Abw.: {absDiff}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="text-xs text-slate-400 pt-2 border-t border-slate-800/80 mt-2">
                Durchschnittliche Abweichung (ProxyFit-Index):{' '}
                <span className="font-semibold text-slate-200">
                  {proxyFit.overallDifference.toFixed(2)}
                </span>
              </p>
            </div>
          </section>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <p className="text-xs text-slate-500 max-w-md">
              Technische Demo: Die Logik und Schwellenwerte sind bewusst
              vereinfacht. In einem echten klinischen Setting würden Skalen und
              Kategorien validiert und mit Fachpersonen abgestimmt.
            </p>
            <button
              type="button"
              onClick={handleRestart}
              className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
            >
              Neuen ProxyFit-Test starten
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Kérdésfázis (self vagy proxy)
  const questionPhaseTitle =
    phase === 'self'
      ? 'Teil 1: Deine Perspektive'
      : 'Teil 2: Als Stellvertreter:in';

  const questionPhaseSubtitle =
    phase === 'self'
      ? 'Antworte aus deiner eigenen Sicht.'
      : 'Antworte so, als ob du für eine andere Person entscheiden würdest.';

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-slate-400">
            Technisches Demo – ProxyFit
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold">
            {questionPhaseTitle}
          </h1>
          <p className="text-sm text-slate-300">{questionPhaseSubtitle}</p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{demoStory.title[LANG]}</span>
            <span>
              Frage {currentIndex + 1} / {totalQuestions}
            </span>
          </div>

          <h2 className="text-lg font-medium text-slate-50">
            {currentQuestion.text[LANG]}
          </h2>

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
            <span className="font-medium text-slate-300">
              {phase === 'self' ? 'Du selbst' : 'Proxy'}
            </span>
          </p>
          <button
            type="button"
            onClick={handleRestart}
            className="underline underline-offset-2 hover:text-slate-300"
          >
            Test zurücksetzen
          </button>
        </div>
      </div>
    </main>
  );
}

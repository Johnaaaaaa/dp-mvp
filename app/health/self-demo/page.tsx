'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Answer, Lang } from '@/types/dp';
import { demoStory } from '@/data/stories';
import { categoryDefinitionsById } from '@/data/categories';
import { calculateDecisionProfile } from '@/lib/dpEngine';

const LANG: Lang = 'de';

// Egyszerű lokalizációs helper – ugyanaz az elv, mint máshol
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

export default function HealthSelfDemoPage() {
  const story = demoStory as any;
  const questions = story.questions as any[];

  const [answers, setAnswers] = useState<Answer[]>([]);

  const profile =
    answers.length > 0 ? calculateDecisionProfile(story, answers) : null;

  function handleSelect(questionId: string, optionId: string) {
    setAnswers((prev) => {
      const existingIndex = prev.findIndex(
        (a) => a.questionId === questionId,
      );
      const updated: Answer = { questionId, optionId };

      if (existingIndex === -1) {
        return [...prev, updated];
      }

      const clone = [...prev];
      clone[existingIndex] = updated;
      return clone;
    });
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl space-y-8 py-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Health / Self-Demo
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold">
            Self-Demo – Entscheidungsprofil
          </h1>
          <p className="text-sm text-slate-300">
            Interaktive Demo: alle Fragen werden auf einer Seite angezeigt. Mit
            jeder Antwort wird das Self-Profil neu berechnet.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-6">
          {/* KÉRDÉSEK BLOKK */}
          <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold text-slate-200">
              Fragen (Self-Perspektive)
            </h2>
            <div className="space-y-4">
              {questions.map((question: any) => {
                const currentAnswer = answers.find(
                  (a) => a.questionId === question.id,
                );
                return (
                  <div
                    key={question.id}
                    className="space-y-2 border-b border-slate-800 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">
                        {question.category}
                      </p>
                      <h3 className="text-sm font-semibold text-slate-100">
                        {t(question.title)}
                      </h3>
                      <p className="text-xs text-slate-300">
                        {t(question.description)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {(question.options as any[]).map((opt, optIndex) => {
                        const isSelected = currentAnswer?.optionId === opt.id;
                        return (
                          <button
                            key={`${question.id}-${opt.id}-${optIndex}`}
                            type="button"
                            onClick={() => handleSelect(question.id, opt.id)}
                            className={`w-full text-left rounded-md border px-3 py-1.5 text-xs ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-50'
                                : 'border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-800'
                            }`}
                          >
                            <div className="font-medium">
                              {t(opt.label)}
                            </div>
                            {opt.description && (
                              <div className="text-[11px] text-slate-300">
                                {t(opt.description)}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PROFIL BLOKK */}
          <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold text-slate-200">
              Entscheidungsprofil (Self)
            </h2>
            {!profile && (
              <p className="text-xs text-slate-400">
                Noch keine Antworten. Wähle links Optionen, um das Profil
                aufzubauen.
              </p>
            )}
            {profile && (
              <ul className="space-y-2 text-xs">
                {profile.categoryScores.map((cat, index) => {
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
                      key={`${cat.category}-${index}`}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-slate-200">{label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full border ${colorClass}`}
                      >
                        {cat.score.toFixed(1)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link href="/health" className="hover:text-slate-200 underline">
            Zurück zur Health-Übersicht
          </Link>
          <span>Demo-Ansicht – keine Session, keine Proxy-Daten.</span>
        </div>
      </div>
    </main>
  );
}


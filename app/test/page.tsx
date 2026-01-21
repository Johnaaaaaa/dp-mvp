'use client';

import { useState } from 'react';
import type { Answer, Lang } from '@/types/dp';
import { demoStory } from '@/data/stories';
import { categoryDefinitionsById } from '@/data/categories';
import { calculateDecisionProfile, calculateProxyFit } from '@/lib/dpEngine';

const LANG: Lang = 'de';

export default function TestPage() {
  // story – ha a demoStory nincs szigorúan típusegyeztetve, any-ként kezeljük
  const story = demoStory as any;

  const [selfAnswers, setSelfAnswers] = useState<Answer[]>([]);
  const [proxyAnswers, setProxyAnswers] = useState<Answer[]>([]);

  // Lokalizált szöveg helper – elviseli a rosszul típusozott adatot is
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

  function handleSelect(
    who: 'self' | 'proxy',
    questionId: string,
    optionId: string,
  ) {
    const setter = who === 'self' ? setSelfAnswers : setProxyAnswers;

    setter((prev) => {
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

  // DP-engine hívások – NaN ellen védekezünk később a megjelenítésnél is
  const selfProfile =
    selfAnswers.length > 0
      ? calculateDecisionProfile(story, selfAnswers)
      : null;

  const proxyProfile =
    proxyAnswers.length > 0
      ? calculateDecisionProfile(story, proxyAnswers)
      : null;

  const proxyFit =
    selfProfile && proxyProfile
      ? calculateProxyFit(selfProfile, proxyProfile)
      : null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl space-y-8 py-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-slate-400">
            DP Engine / ProxyFit – Test
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold">
            Self vs Proxy – Sandbox
          </h1>
          <p className="text-sm text-slate-300">
            Diese Testseite verwendet dieselbe Story und denselben DP-Engine
            wie der Health-Flow. Links beantwortest du die Fragen aus deiner
            eigenen Sicht (Self), rechts so, wie eine Stellvertreterin oder ein
            Stellvertreter entscheiden würde (Proxy). Unten werden die beiden
            Profile und der ProxyFit berechnet.
          </p>
        </header>

        {/* Kérdések – Self / Proxy egymás mellett */}
        <section className="grid md:grid-cols-2 gap-4">
          {/* Self oszlop */}
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold text-slate-100">
              Self – deine eigene Sicht
            </h2>
            <p className="text-xs text-slate-400">
              Beantworte jede Frage so, wie du selbst die Situation einschätzt.
            </p>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {story.questions.map((q: any) => {
                const selected = selfAnswers.find(
                  (a) => a.questionId === q.id,
                );
                return (
                  <div
                    key={q.id}
                    className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 space-y-2"
                  >
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">
                        {q.category}
                      </p>
                      <h3 className="text-sm font-medium text-slate-100">
                        {t(q.title)}
                      </h3>
                      <p className="text-xs text-slate-300">
                        {t(q.description)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {q.options.map((opt: any) => {
                        const isSelected = selected?.optionId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              handleSelect('self', q.id, opt.id)
                            }
                            className={`w-full text-left rounded-md border px-3 py-1.5 text-xs ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-50'
                                : 'border-slate-700 bg-slate-900/60 text-slate-100 hover:bg-slate-800'
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
                  </div>
                );
              })}
            </div>
          </div>

          {/* Proxy oszlop */}
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold text-slate-100">
              Proxy – Sicht der Stellvertreter:in
            </h2>
            <p className="text-xs text-slate-400">
              Beantworte dieselben Fragen so, als ob du für eine andere Person
              entscheiden würdest.
            </p>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {story.questions.map((q: any) => {
                const selected = proxyAnswers.find(
                  (a) => a.questionId === q.id,
                );
                return (
                  <div
                    key={q.id}
                    className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 space-y-2"
                  >
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">
                        {q.category}
                      </p>
                      <h3 className="text-sm font-medium text-slate-100">
                        {t(q.title)}
                      </h3>
                      <p className="text-xs text-slate-300">
                        {t(q.description)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {q.options.map((opt: any) => {
                        const isSelected = selected?.optionId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              handleSelect('proxy', q.id, opt.id)
                            }
                            className={`w-full text-left rounded-md border px-3 py-1.5 text-xs ${
                              isSelected
                                ? 'border-sky-500 bg-sky-500/20 text-sky-50'
                                : 'border-slate-700 bg-slate-900/60 text-slate-100 hover:bg-slate-800'
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
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Eredmények – Self / Proxy profil + ProxyFit */}
        <section className="grid md:grid-cols-3 gap-4">
          {/* Self-Profil */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Self-Profil
            </h2>
            {!selfProfile && (
              <p className="text-xs text-slate-400">
                Noch keine Self-Antworten vollständig – bitte Fragen oben
                ausfüllen.
              </p>
            )}
            {selfProfile && (
              <ul className="space-y-1 text-xs">
                {selfProfile.categoryScores.map((cat, index) => {
                  const def = categoryDefinitionsById[cat.category];
                  const label = def?.label[LANG] ?? cat.category;

                  const colorClass =
                    cat.color === 'red'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : cat.color === 'yellow'
                      ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                  const score =
                    typeof cat.score === 'number' &&
                    Number.isFinite(cat.score)
                      ? cat.score.toFixed(1)
                      : '-';

                  return (
                    <li
                      key={`${cat.category}-${index}`}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-slate-200">{label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full border ${colorClass}`}
                      >
                        {score}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Proxy-Profil */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Proxy-Profil
            </h2>
            {!proxyProfile && (
              <p className="text-xs text-slate-400">
                Noch keine Proxy-Antworten vollständig – bitte Fragen oben
                ausfüllen.
              </p>
            )}
            {proxyProfile && (
              <ul className="space-y-1 text-xs">
                {proxyProfile.categoryScores.map((cat, index) => {
                  const def = categoryDefinitionsById[cat.category];
                  const label = def?.label[LANG] ?? cat.category;

                  const colorClass =
                    cat.color === 'red'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : cat.color === 'yellow'
                      ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                  const score =
                    typeof cat.score === 'number' &&
                    Number.isFinite(cat.score)
                      ? cat.score.toFixed(1)
                      : '-';

                  return (
                    <li
                      key={`${cat.category}-${index}`}
                      className="flex items-center justify_between gap-2"
                    >
                      <span className="text-slate-200">{label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full border ${colorClass}`}
                      >
                        {score}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* ProxyFit */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-100">ProxyFit</h2>
            {!proxyFit && (
              <p className="text-xs text-slate-400">
                ProxyFit wird berechnet, sobald sowohl Self- als auch
                Proxy-Profil vorliegen.
              </p>
            )}
            {proxyFit && (
              <div className="space-y-2 text-xs">
                <p>
                  Gesamt-FitIndex:{' '}
                  <span className="font-mono text-slate-100">
                    {Number.isFinite(proxyFit.fitIndex)
                      ? proxyFit.fitIndex.toFixed(0)
                      : '-'}
                  </span>{' '}
                  ({proxyFit.fitLevel})
                </p>
                <ul className="space-y-1">
                  {proxyFit.categories.map((diff, index) => {
                    const def = categoryDefinitionsById[diff.category];
                    const label = def?.label[LANG] ?? diff.category;

                    const diffValue =
                      typeof diff.absDifference === 'number' &&
                      Number.isFinite(diff.absDifference)
                        ? diff.absDifference.toFixed(1)
                        : '-';

                    return (
                      <li
                        key={`${diff.category}-${index}`}
                        className="flex items_center justify-between gap-2"
                      >
                        <span className="text-slate-200">{label}</span>
                        <span className="text-slate-300">
                          Self {diff.selfScore} | Proxy {diff.proxyScore} | Diff{' '}
                          {diffValue}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

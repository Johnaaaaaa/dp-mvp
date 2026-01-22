'use client';

import { useMemo } from 'react';
import type { Answer } from '@/types/dp';
import { calculateDecisionProfile, calculateProxyFit } from '@/lib/dpEngine';
import { demoStory } from '@/data/stories';
import { categoryDefinitionsById } from '@/data/categories';

const LANG = 'de' as const;

// Fix demo-válaszok – csak health-demo, nem session-alapú
const demoSelfAnswers: Answer[] = [
  { questionId: 'q1', optionId: 'q1_opt1' },
  { questionId: 'q2', optionId: 'q2_opt1' },
];

const demoProxyAnswers: Answer[] = [
  { questionId: 'q1', optionId: 'q1_opt2' },
  { questionId: 'q2', optionId: 'q2_opt3' },
];

function getFitLevelLabel(fitIndex: number): string {
  if (fitIndex < 50) return 'Low Fit';
  if (fitIndex < 80) return 'Medium Fit';
  return 'High Fit';
}

export default function HealthSessionDemoPage() {
  // Demo-profilt számolunk a demoStory + fix válaszok alapján
  const selfProfile = useMemo(
    () => calculateDecisionProfile(demoStory as any, demoSelfAnswers),
    [],
  );

  const proxyProfile = useMemo(
    () => calculateDecisionProfile(demoStory as any, demoProxyAnswers),
    [],
  );

  const proxyFit = useMemo(
    () =>
      selfProfile && proxyProfile
        ? calculateProxyFit(selfProfile, proxyProfile)
        : null,
    [selfProfile, proxyProfile],
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl space-y-8 py-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-emerald-400">
            Demo · Health Session View
          </p>
          <h1 className="text-xl font-semibold">
            {demoStory.title[LANG]}
          </h1>
          <p className="text-sm text-slate-300">
            {demoStory.description[LANG]}
          </p>
        </header>

        <section className="grid md:grid-cols-3 gap-6">
          {/* Self-Profil */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">
              Self-Profil (Demo)
            </h2>
            {!selfProfile && (
              <p className="text-xs text-slate-400">
                Kein Self-Profil berechnet.
              </p>
            )}
            {selfProfile && (
              <ul className="space-y-2 text-xs">
                {selfProfile.categoryScores.map((cat, idx) => {
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
                      key={`self-${cat.category}-${idx}`}
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

          {/* Proxy-Profil */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">
              Proxy-Profil (Demo)
            </h2>
            {!proxyProfile && (
              <p className="text-xs text-slate-400">
                Kein Proxy-Profil berechnet.
              </p>
            )}
            {proxyProfile && (
              <ul className="space-y-2 text-xs">
                {proxyProfile.categoryScores.map((cat, idx) => {
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
                      key={`proxy-${cat.category}-${idx}`}
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

          {/* ProxyFit */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">
              ProxyFit (Demo)
            </h2>
            {!proxyFit && (
              <p className="text-xs text-slate-400">
                ProxyFit wird berechnet, sobald Self- und Proxy-Profil vorhanden sind.
              </p>
            )}
            {proxyFit && (
              <div className="space-y-3 text-xs">
                <p>
                  Gesamt-FitIndex:{' '}
                  <span className="font-mono text-slate-100">
                    {proxyFit.fitIndex.toFixed(0)}
                  </span>{' '}
                  ({getFitLevelLabel(proxyFit.fitIndex)})
                </p>
                <ul className="space-y-1">
                  {proxyFit.categories.map((diff, idx) => {
                    const def = categoryDefinitionsById[diff.category];
                    const label = def?.label[LANG] ?? diff.category;
                    return (
                      <li
                        key={`fit-${diff.category}-${idx}`}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="text-slate-200">{label}</span>
                        <span className="text-slate-300">
                          Self {diff.selfScore.toFixed(1)} | Proxy{' '}
                          {diff.proxyScore.toFixed(1)} | Diff{' '}
                          {diff.absDifference.toFixed(1)}
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

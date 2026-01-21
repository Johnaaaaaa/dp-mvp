// app/health/session/demo-1/page.tsx

import { demoStory } from '@/data/stories';
import { categoryDefinitionsById } from '@/data/categories';
import { calculateDecisionProfile, calculateProxyFit } from '@/lib/dpEngine';

const LANG = 'de' as const;

function buildDemoAnswers() {
  const questions = demoStory.questions as any[];

  if (!questions || questions.length === 0) {
    return { selfAnswers: [], proxyAnswers: [] };
  }

  const selfAnswers: any[] = [];
  const proxyAnswers: any[] = [];

  const maxQuestions = Math.min(questions.length, 5); // max 5 kérdés a demóban

  for (let i = 0; i < maxQuestions; i++) {
    const q = questions[i];
    if (!q || !q.options || q.options.length === 0) continue;

    const selfOption = q.options[0];
    const proxyOption =
      q.options.length > 1 ? q.options[1] : q.options[0]; // ha nincs 2. opció, marad az első

    selfAnswers.push({
      questionId: q.id,
      optionId: selfOption.id,
    });

    proxyAnswers.push({
      questionId: q.id,
      optionId: proxyOption.id,
    });
  }

  return { selfAnswers, proxyAnswers };
}

function buildDemoSession() {
  const { selfAnswers, proxyAnswers } = buildDemoAnswers();

  const selfProfile: any = calculateDecisionProfile(
    demoStory as any,
    selfAnswers,
  );
  const proxyProfile: any = calculateDecisionProfile(
    demoStory as any,
    proxyAnswers,
  );

  let proxyFit: any = null;
  if (proxyAnswers.length > 0) {
    proxyFit = calculateProxyFit(selfProfile, proxyProfile);
  }

  return { selfProfile, proxyProfile, proxyFit };
}

// Fix, előre kiszámolt demo-eredmény
const DEMO = buildDemoSession();

export default function HealthSessionDemoPage() {
  const { selfProfile, proxyProfile, proxyFit } = DEMO;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl space-y-8 py-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-emerald-400">
            Health · Demo-Session
          </p>
          <h1 className="text-xl font-semibold text-slate-50">
            Self · Proxy · ProxyFit – Demo-Fall
          </h1>
          <p className="text-xs text-slate-400">
            Fixes, vorab berechnetes Beispiel. Dient nur zur Illustration der
            Logik – keine echten Patientendaten.
          </p>
        </header>

        <section className="grid md:grid-cols-3 gap-6">
          {/* Self-Profil */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">
              Profil – Patient:in / Selbstbild
            </h2>
            {!selfProfile || !selfProfile.categoryScores?.length ? (
              <p className="text-xs text-slate-400">
                Keine Antworten im Demo-Fall vorhanden.
              </p>
            ) : (
              <ul className="space-y-2 text-xs">
                {selfProfile.categoryScores.map((cat: any, index: number) => {
                  const def = categoryDefinitionsById[cat.category];
                  const label = def?.label?.[LANG] ?? cat.category;
                  const colorClass = getRiskColorClasses(cat.color);

                  return (
                    <li
                      key={`${cat.category}-${index}`}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-slate-200">{label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full border ${colorClass}`}
                      >
                        {Number(cat.score).toFixed(1)}
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
              Profil – Stellvertreter:in
            </h2>
            {!proxyProfile || !proxyProfile.categoryScores?.length ? (
              <p className="text-xs text-slate-400">
                Keine Proxy-Antworten im Demo-Fall vorhanden.
              </p>
            ) : (
              <ul className="space-y-2 text-xs">
                {proxyProfile.categoryScores.map((cat: any, index: number) => {
                  const def = categoryDefinitionsById[cat.category];
                  const label = def?.label?.[LANG] ?? cat.category;
                  const colorClass = getRiskColorClasses(cat.color);

                  return (
                    <li
                      key={`${cat.category}-${index}`}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-slate-200">{label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full border ${colorClass}`}
                      >
                        {Number(cat.score).toFixed(1)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* ProxyFit */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">ProxyFit</h2>
            {!proxyFit ? (
              <p className="text-xs text-slate-400">
                ProxyFit wird berechnet, sobald Self- und Proxy-Profil
                vorhanden sind.
              </p>
            ) : (
              <div className="space-y-3 text-xs">
                <p>
                  Gesamt-FitIndex:{' '}
                  <span className="font-mono text-slate-100">
                    {Number(proxyFit.fitIndex).toFixed(0)}
                  </span>{' '}
                  ({getFitLevelLabel(Number(proxyFit.fitIndex))})
                </p>
                <ul className="space-y-1">
                  {proxyFit.categories?.map((diff: any, index: number) => {
                    const def = categoryDefinitionsById[diff.category];
                    const label = def?.label?.[LANG] ?? diff.category;
                    return (
                      <li
                        key={`${diff.category}-${index}`}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="text-slate-200">{label}</span>
                        <span className="text-slate-300">
                          Self {Number(diff.selfScore).toFixed(1)} | Proxy{' '}
                          {Number(diff.proxyScore).toFixed(1)} | Diff{' '}
                          {Number(diff.absDifference).toFixed(1)}
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

function getRiskColorClasses(color: any): string {
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

function getFitLevelLabel(fitIndex: number): string {
  if (fitIndex < 40) return 'niedriger Fit (hohe Abweichung)';
  if (fitIndex < 70) return 'mittlerer Fit';
  return 'hoher Fit';
}

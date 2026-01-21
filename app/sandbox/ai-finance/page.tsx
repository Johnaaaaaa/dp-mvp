// app/sandbox/ai-finance/page.tsx

import Link from 'next/link';
import { calculateProxyFit } from '@/lib/dpEngine';

// Lokális kategória-ID-k a Sandbox-hoz
type FinanceCategoryId = 'risk' | 'liquidity' | 'time_horizon';

type RiskColor = 'red' | 'yellow' | 'green';

type FinanceCategory = {
  id: FinanceCategoryId;
  label: string;
  description: string;
};

type SimpleProfile = {
  id: string;
  name: string;
  role: string;
  categories: {
    id: FinanceCategoryId;
    score: number; // -3..+3 skála
    color: RiskColor;
  }[];
  note?: string;
};

const CATEGORIES: FinanceCategory[] = [
  {
    id: 'risk',
    label: 'Risikobereitschaft',
    description: 'Wie wohl fühlt sich die Person mit Schwankungen / Verlusten?',
  },
  {
    id: 'liquidity',
    label: 'Liquiditätsbedarf',
    description:
      'Wie wichtig ist es, jederzeit auf das Geld zugreifen zu können?',
  },
  {
    id: 'time_horizon',
    label: 'Zeithorizont',
    description: 'Wie lange kann das Geld angelegt bleiben?',
  },
];

// Dummy User-Profil – itt lehet majd később Health/Match DP-re rádrótozni
const USER_PROFILE: SimpleProfile = {
  id: 'user',
  name: 'Du',
  role: 'Investor:in',
  categories: [
    {
      id: 'risk',
      score: -1,
      color: 'yellow',
    },
    {
      id: 'liquidity',
      score: 1,
      color: 'green',
    },
    {
      id: 'time_horizon',
      score: 0,
      color: 'yellow',
    },
  ],
  note: 'Vorsichtig, aber nicht komplett risikoavers. Liquidität ist moderat wichtig.',
};

// Három fiktív AI-Agent
const AGENT_PROFILES: SimpleProfile[] = [
  {
    id: 'insurance_ai',
    name: 'InsuranceAI',
    role: 'Konservativer Versicherungs-/Anlage-Roboadvisor',
    categories: [
      { id: 'risk', score: -2, color: 'green' },
      { id: 'liquidity', score: 0, color: 'yellow' },
      { id: 'time_horizon', score: -1, color: 'yellow' },
    ],
    note: 'Stark risikoarm, leicht illiquide Produkte sind ok, Fokus auf Kapitalerhalt.',
  },
  {
    id: 'turbo_trader_ai',
    name: 'TurboTraderAI',
    role: 'High-Risk Trading Bot',
    categories: [
      { id: 'risk', score: 3, color: 'red' },
      { id: 'liquidity', score: 2, color: 'green' },
      { id: 'time_horizon', score: -1, color: 'yellow' },
    ],
    note: 'Sehr hohe Volatilität, starker Fokus auf kurzfristige Chancen.',
  },
  {
    id: 'balanced_planner_ai',
    name: 'BalancedPlannerAI',
    role: 'Ausgewogener Finanzplanungs-Agent',
    categories: [
      { id: 'risk', score: 1, color: 'yellow' },
      { id: 'liquidity', score: 1, color: 'green' },
      { id: 'time_horizon', score: 2, color: 'green' },
    ],
    note: 'Moderates Risiko, ausgewogener Mix aus Liquidität und langfristigem Aufbau.',
  },
];

// Lokális helper: SimpleProfile → DecisionProfile (any), hogy a DP-engine-nel tudjunk számolni
function toDecisionProfile(profile: SimpleProfile): any {
  return {
    domain: 'match', // Sandbox: nem health, de a ProxyFit-nek mindegy, csak kategória+score kell
    storyId: 'ai_finance_demo_v1',
    categoryScores: profile.categories.map((c) => ({
      category: c.id,
      score: c.score,
      color: c.color,
    })),
  };
}

// Előre kiszámoljuk az Agent Fit-eket
const USER_DP = toDecisionProfile(USER_PROFILE);

const AGENTS_WITH_FIT = AGENT_PROFILES.map((agent) => {
  const agentDp = toDecisionProfile(agent);
  const fit: any = calculateProxyFit(USER_DP, agentDp);

  return {
    agent,
    fit,
  };
});

function getFitLabel(fitIndex: number): string {
  if (fitIndex < 40) return 'niedriger Fit (hohe Abweichung)';
  if (fitIndex < 70) return 'mittlerer Fit';
  return 'hoher Fit';
}

function formatScore(score: number): string {
  return score.toFixed(1);
}

export default function AiFinanceSandboxPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl space-y-8 py-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-emerald-400">
            Sandbox · AI-Finance
          </p>
          <h1 className="text-xl font-semibold text-slate-50">
            20k CHF – AI-Agent Vorschläge im DP-Raum
          </h1>
          <p className="text-xs text-slate-400">
            Demo: Ein fiktives 20k CHF Szenario. Ein statischer User-Profil wird
            mit drei AI-Agenten verglichen. Die Logik (Fit-Berechnung) ist
            dieselbe DP-Engine wie im Health-Use-Case – nur hier auf
            Finanz-/Agentenprofile angewendet.
          </p>
        </header>

        {/* User-Profil */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">
            Dein Profil – Demo-Annahme
          </h2>
          <p className="text-xs text-slate-400">
            Dieses Profil ist eine fixe Demo-Annahme. Später kann es aus einem
            echten DP-Test kommen (Health oder Match).
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-2">
            {CATEGORIES.map((cat) => {
              const value = USER_PROFILE.categories.find(
                (c) => c.id === cat.id,
              );
              if (!value) return null;

              const colorClass = getRiskColorClasses(value.color);

              return (
                <div
                  key={cat.id}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-1"
                >
                  <p className="text-xs font-semibold text-slate-100">
                    {cat.label}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {cat.description}
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Score:{' '}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] ${colorClass}`}
                    >
                      {formatScore(value.score)}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Agentek + Fit-ek */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">
            AI-Agenten – Fit im Überblick
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {AGENTS_WITH_FIT.map(({ agent, fit }) => {
              const fitIndex = Number(fit?.fitIndex ?? 0);
              const fitLabel = getFitLabel(fitIndex);

              return (
                <div
                  key={agent.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3"
                >
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      AI-Agent
                    </p>
                    <h3 className="text-sm font-semibold text-slate-100">
                      {agent.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">{agent.role}</p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-slate-300">
                      FitIndex:{' '}
                      <span className="font-mono text-slate-50">
                        {fitIndex.toFixed(0)}%
                      </span>{' '}
                      ({fitLabel})
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Berechnet aus denselben DP-Dimensionen wie im Health-Case
                      – hier angewendet auf Agentenprofile.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-slate-300">
                      Dimensionen (Self vs. Agent):
                    </p>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {fit?.categories?.map((diff: any, index: number) => {
                        const catMeta = CATEGORIES.find(
                          (c) => c.id === diff.category,
                        );
                        const label = catMeta?.label ?? diff.category;
                        return (
                          <li
                            key={`${agent.id}-${diff.category}-${index}`}
                            className="flex items-center justify-between gap-2"
                          >
                            <span className="text-slate-200">{label}</span>
                            <span className="text-slate-300">
                              Self {formatScore(diff.selfScore)} | Agent{' '}
                              {formatScore(diff.proxyScore)} | Diff{' '}
                              {formatScore(diff.absDifference)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {agent.note && (
                    <p className="text-[11px] text-slate-400">{agent.note}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <footer className="flex justify-between items-center pt-2">
          <Link
            href="/"
            className="text-xs text-slate-300 hover:text-emerald-300 underline underline-offset-4"
          >
            Zurück zur Übersicht
          </Link>
          <p className="text-[11px] text-slate-500">
            Demo-only: keine echten Finanzempfehlungen, nur DP-Engine-Illustration.
          </p>
        </footer>
      </div>
    </main>
  );
}

function getRiskColorClasses(color: RiskColor): string {
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

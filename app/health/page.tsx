import Link from 'next/link';

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-8 py-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-slate-400">
            Health – Prototyp
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold">
            Entscheidungsunterstützung im Gesundheitskontext
          </h1>
          <p className="text-sm text-slate-300">
            Dieser Prototyp zeigt einen einfachen &quot;Self + Proxy + Doctor
            View&quot;-Flow für gesundheitliche Entscheidungssituationen. Im
            ersten Schritt beantwortet die betroffene Person Fragen
            (Self-Sicht), im zweiten Schritt eine Stellvertreterin oder ein
            Stellvertreter (Proxy-Sicht). In der Session-Ansicht werden beide
            Profile und eine ProxyFit-Metrik angezeigt.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Self-Demo (ohne Session)
            </h2>
            <p className="text-xs text-slate-300">
              Kurzer Flow, in dem nur deine eigene Sicht erfasst und ein
              Self-Profil berechnet wird. Es wird keine Session angelegt, kein
              Proxy-Link erzeugt.
            </p>
            <Link
              href="/health/self-demo"
              className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-800"
            >
              Self-Demo starten
            </Link>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Self + Proxy + Session
            </h2>
            <p className="text-xs text-slate-300">
              Voller Prototyp-Flow: Zuerst Self-Antworten, dann Session mit
              Proxy-Link &amp; Doctor-View-Link. Im Anschluss kann eine
              Stellvertreterin oder ein Stellvertreter den Proxy-Teil
              ausfüllen, und die Session-Ansicht zeigt Self vs Proxy und
              ProxyFit.
            </p>
            <Link
              href="/health/self"
              className="inline-flex items-center justify-center rounded-md border border-emerald-500 bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
            >
              Self-Flow starten
            </Link>
          </div>
        </section>

        <footer className="text-[11px] text-slate-500 border-t border-slate-800 pt-3">
          <p>
            Hinweis: Dies ist ein technischer Prototyp. Es werden keine
            personenbezogenen Daten persistent gespeichert; die Sessions liegen
            nur im temporären Speicher der Anwendung.
          </p>
        </footer>
      </div>
    </main>
  );
}

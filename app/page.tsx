// app/page.tsx

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl mx-auto p-6 space-y-4 border rounded">
        <h1 className="text-3xl font-bold">
          Definitive Protocol – technisches Demo
        </h1>

        <p className="text-sm text-gray-600">
          Dieses MVP zeigt einen einfachen, story-basierten Entscheidungsprozess am Lebensende.
          Die Logik ist aktuell rein technisch – kein medizinischer oder juristischer Entscheid
          und keine Empfehlung.
        </p>

        <div className="text-sm text-gray-700 space-y-1">
          <p>Im Demo kannst du:</p>
          <ul className="list-disc pl-5">
            <li>zwei Fragen zu Präferenzen beantworten,</li>
            <li>ein vorläufiges Profil mit Scores &amp; Farben sehen,</li>
            <li>den Test beliebig oft neu starten.</li>
          </ul>
        </div>

        <div className="pt-2">
          <a
            href="/test"
            className="inline-flex items-center px-4 py-2 rounded bg-black text-white text-sm hover:bg-gray-900"
          >
            Zum Demo-Test
          </a>
        </div>

        <p className="text-xs text-gray-500">
          Hinweis: Dieses Projekt ist ein technischer Prototyp der Entscheidungs-Engine (Definitive Protocol).
          Es ersetzt keine Patientenverfügung, keine Beratung und keine klinische Entscheidung.
        </p>
      </div>
    </main>
  );
}

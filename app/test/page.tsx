'use client';

import { useState } from 'react';
import { demoStory } from '@/data/stories';
import { categoryDefinitionsById } from '@/data/categories';
import type { Lang, UserAnswer } from '@/types/dp';
import { computeDecisionProfile } from '@/lib/dpEngine';



const LANG: Lang = 'de'; // MVP: fixed German UI

export default function TestPage() {
  // index of the current question (0 = first question)
  const [currentIndex, setCurrentIndex] = useState(0);
  // collected answers: one entry per question
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  // true when user has answered the last question
  const [isFinished, setIsFinished] = useState(false);

  function handleRestart() {
    setCurrentIndex(0);
    setAnswers([]);
    setIsFinished(false);
  }

  const currentQuestion = demoStory.questions[currentIndex];


  function handleAnswer(optionId: string) {
    if (!currentQuestion) return;

    const questionId = currentQuestion.id;

    // remove any previous answer for this question, then add the new one
    const updatedAnswers: UserAnswer[] = [
      ...answers.filter((a) => a.questionId !== questionId),
      { questionId, optionId },
    ];

    setAnswers(updatedAnswers);

    // go to next question if there is one
    if (currentIndex + 1 < demoStory.questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // no more questions → show summary
      setIsFinished(true);
    }
  }

  // fallback: no current question and not finished
  if (!currentQuestion && !isFinished) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="max-w-xl p-6 border rounded">
          <p className="text-sm text-gray-600">
            Es sind keine Fragen verfügbar.
          </p>
        </div>
      </main>
    );
  }

  // finished: show simple summary screen of the choices
    if (isFinished) {
    const profile = computeDecisionProfile(demoStory, answers);

    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="max-w-xl p-6 border rounded space-y-4">
          <h1 className="text-2xl font-bold">
            {demoStory.title[LANG]}
          </h1>
          <p className="text-sm text-gray-600">
            Vielen Dank – dies ist eine einfache Demo-Übersicht deiner Antworten.
          </p>

                    {/* Profile summary: categories with scores and colors */}
          <div className="space-y-2 pt-4 border-t">
            <div className="text-sm font-semibold">
              Vorläufiges Profil (Demo – Kategorien, Scores &amp; Farben)
            </div>
            {profile.totalScores.map((cat) => {
              const def = categoryDefinitionsById[cat.category];
              return (
                <div
                  key={cat.category}
                  className="border rounded px-3 py-2 text-sm space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {def ? def.label[LANG] : cat.category}
                      </div>
                      <div className="text-xs text-gray-500">
                        Score: {cat.score}
                      </div>
                    </div>
                    <span
                      className={
                        'px-2 py-1 text-xs rounded-full uppercase ' +
                        (cat.color === 'red'
                          ? 'bg-red-100 text-red-700'
                          : cat.color === 'yellow'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700')
                      }
                    >
                      {cat.color}
                    </span>
                  </div>
                  {def && (
                    <div className="text-xs text-gray-600">
                      {def.description[LANG]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>


          {/* Detailed answer recap */}
          <div className="space-y-3 pt-4 border-t">
            {demoStory.questions.map((question) => {
              const answer = answers.find(
                (a) => a.questionId === question.id,
              );
              if (!answer) return null;

              const option = question.options.find(
                (o) => o.id === answer.optionId,
              );
              if (!option) return null;

              return (
                <div key={question.id} className="space-y-1">
                  <div className="text-sm font-semibold">
                    {question.text[LANG]}
                  </div>
                  <div className="text-sm text-gray-700">
                    Deine Antwort:{' '}
                    <span className="font-medium">
                      {option.label[LANG]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-gray-500">
            Hinweis: Dies ist ein technisches MVP – die Scores und Farben sind noch nicht medizinisch/juristisch validiert.
          </p>

          <div className="pt-2">
            <button
              onClick={handleRestart}
              className="inline-flex items-center px-4 py-2 border rounded text-sm hover:bg-gray-50"
            >
              Neuen Test starten
            </button>
          </div>
        </div>
      </main>
    );
  }



  // default: question screen with answer buttons
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl p-6 border rounded space-y-4">
        <h1 className="text-2xl font-bold">
          {demoStory.title[LANG]}
        </h1>

        {demoStory.description && (
          <p className="text-sm text-gray-600">
            {demoStory.description[LANG]}
          </p>
        )}

        <div className="pt-4 border-t">
          <div className="text-xs text-gray-500 mb-2">
            Frage {currentIndex + 1} / {demoStory.questions.length}
          </div>
          {currentQuestion && (
            <>
              <div className="text-lg font-semibold mb-4">
                {currentQuestion.text[LANG]}
              </div>
              <div className="space-y-2">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.id)}
                    className="w-full text-left border rounded p-3 hover:bg-gray-50 text-sm"
                  >
                    {option.label[LANG]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}


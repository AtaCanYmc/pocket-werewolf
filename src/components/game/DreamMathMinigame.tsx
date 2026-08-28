import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { sound } from '@/utils/audio';
import { Sparkles, Brain, Check, X, Award } from 'lucide-react';

interface MathQuestion {
  questionText: string;
  correctAnswer: number;
  options: number[];
}

/**
 * Generates an intermediate level arithmetic question with plausible multiple-choice options.
 */
function generateQuestion(): MathQuestion {
  const operations = ['+', '-', '*', '/'] as const;
  const op = operations[Math.floor(Math.random() * operations.length)];

  let a = 0;
  let b = 0;
  let correctAnswer = 0;
  let questionText = '';

  switch (op) {
    case '+': {
      a = Math.floor(Math.random() * 60) + 15; // 15 to 74
      b = Math.floor(Math.random() * 60) + 15; // 15 to 74
      correctAnswer = a + b;
      questionText = `${a} + ${b}`;
      break;
    }
    case '-': {
      a = Math.floor(Math.random() * 80) + 35; // 35 to 114
      b = Math.floor(Math.random() * (a - 10)) + 10;
      correctAnswer = a - b;
      questionText = `${a} - ${b}`;
      break;
    }
    case '*': {
      a = Math.floor(Math.random() * 12) + 6; // 6 to 17
      b = Math.floor(Math.random() * 14) + 4; // 4 to 17
      correctAnswer = a * b;
      questionText = `${a} × ${b}`;
      break;
    }
    case '/': {
      b = Math.floor(Math.random() * 8) + 3; // 3 to 10
      correctAnswer = Math.floor(Math.random() * 15) + 4; // 4 to 18
      a = b * correctAnswer;
      questionText = `${a} ÷ ${b}`;
      break;
    }
  }

  // Generate 3 plausible distractors
  const distractors = new Set<number>();
  distractors.add(correctAnswer);

  const deltas = [-10, 10, -2, 2, -1, 1, -5, 5, -20, 20, -3, 3];
  // Shuffle deltas
  const shuffledDeltas = [...deltas].sort(() => Math.random() - 0.5);

  for (const delta of shuffledDeltas) {
    const candidate = correctAnswer + delta;
    if (candidate > 0 && candidate !== correctAnswer) {
      distractors.add(candidate);
    }
    if (distractors.size === 4) break;
  }

  // If still fewer than 4, generate random offsets
  let offset = 1;
  while (distractors.size < 4) {
    distractors.add(Math.max(1, correctAnswer + (offset % 2 === 0 ? offset : -offset)));
    offset++;
  }

  const options = Array.from(distractors).sort(() => Math.random() - 0.5);

  return { questionText, correctAnswer, options };
}

export default function DreamMathMinigame() {
  const { t } = useTranslation();
  const [question, setQuestion] = useState<MathQuestion>(() => generateQuestion());
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSelect = (option: number) => {
    if (selectedOption !== null) return; // Prevent spamming while animating

    sound.playClick();
    setSelectedOption(option);

    const correct = option === question.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    // Auto advance to next question after 400ms
    setTimeout(() => {
      setQuestion(generateQuestion());
      setSelectedOption(null);
      setIsCorrect(null);
    }, 450);
  };

  return (
    <div className="bg-surface border border-indigo-500/30 dark:border-indigo-900/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 animate-fade-in">
      {/* Header & Dream Badge */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500">
            <Brain className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <h3 className="font-gothic font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                {t('night.dreamMinigameTitle')}
              </h3>
              <span className="text-xs">💤</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('night.dreamMinigameSubtitle')}
            </p>
          </div>
        </div>

        {/* Score Counter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 shadow-sm">
          <Award className="w-4 h-4 text-amber-500" />
          <span>{t('night.dreamScore')}: {score}</span>
          {streak > 2 && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[10px]">
              🔥 x{streak}
            </span>
          )}
        </div>
      </div>

      {/* Question Card */}
      <div className="p-5 sm:p-6 bg-surface-light border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-4 shadow-inner relative overflow-hidden">
        <div className="text-[11px] uppercase tracking-widest font-mono text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('night.dreamQuestionPrompt')}</span>
        </div>

        {/* Math Operation Expression */}
        <div className="font-mono text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-wider py-1 select-none">
          {question.questionText} = ?
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 max-w-md mx-auto pt-1">
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isTargetCorrect = option === question.correctAnswer;

            let buttonStyle = 'bg-surface border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800/80';

            if (selectedOption !== null) {
              if (isSelected && isCorrect) {
                buttonStyle = 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-glow scale-102';
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'bg-red-600 text-white border-red-500 shadow-blood-glow animate-shake';
              } else if (isTargetCorrect) {
                buttonStyle = 'bg-emerald-700/80 text-white border-emerald-600';
              } else {
                buttonStyle = 'bg-surface opacity-40 border-slate-300 dark:border-slate-800 text-slate-500';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(option)}
                disabled={selectedOption !== null}
                className={`py-3 px-4 rounded-xl border font-mono font-bold text-lg sm:text-xl transition-all duration-150 flex items-center justify-center gap-2 active:scale-95 shadow-sm ${buttonStyle}`}
              >
                <span>{option}</span>
                {isSelected && isCorrect && <Check className="w-4 h-4" />}
                {isSelected && !isCorrect && <X className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Camouflage Strategy Notice */}
      <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 italic">
        🤫 {t('night.dreamCamouflageHint')}
      </p>
    </div>
  );
}

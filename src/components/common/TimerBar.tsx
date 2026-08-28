import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Clock } from 'lucide-react';

interface TimerBarProps {
  initialSeconds?: number;
  onTimeUp?: () => void;
  isPaused?: boolean;
}

export default function TimerBar({ initialSeconds = 60, onTimeUp, isPaused = false }: TimerBarProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const { t } = useTranslation();

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isPaused || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, secondsLeft, onTimeUp]);

  const percentage = Math.max(0, Math.min(100, (secondsLeft / initialSeconds) * 100));
  const isUrgent = secondsLeft <= 10 && secondsLeft > 0;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="w-full max-w-md mx-auto my-3 px-2">
      <div className="flex items-center justify-between text-xs font-mono mb-1.5">
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-red-500 animate-spin' : ''}`} />
          <span>{t('day.timeRemaining') || 'TIME REMAINING'}</span>
        </span>
        <span
          className={`font-bold text-sm tracking-wider ${
            isUrgent ? 'text-red-500 animate-pulse font-black' : 'text-slate-900 dark:text-slate-200'
          }`}
        >
          {formattedTime}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/50 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isUrgent
              ? 'bg-red-500 shadow-blood-glow'
              : percentage < 40
              ? 'bg-amber-500'
              : 'bg-indigo-500 shadow-mystic-glow'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

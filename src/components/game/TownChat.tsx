import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useTranslation } from '@/context/LanguageContext';
import { Send, MessageSquare, Sparkles, Ghost, ShieldAlert } from 'lucide-react';
import { sound } from '@/utils/audio';

const QUICK_EMOJIS = ['🐺', '🤫', '👀', '⚖️', '💀', '🛡️', '🤥', '😱'];

export default function TownChat() {
  const { room, logs, me, sendChatMessage } = useGame();
  const { t } = useTranslation();
  const [inputText, setInputText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isAlive = me?.is_alive;

  // Auto-scroll to bottom of chat on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await sendChatMessage(trimmed);
      setInputText('');
    } finally {
      setSending(false);
    }
  };

  const handleQuickEmoji = (emoji: string) => {
    sound.playClick();
    sendChatMessage(emoji);
  };

  if (!room || !me) return null;

  return (
    <div className="bg-surface border border-surface-border rounded-2xl shadow-xl flex flex-col h-[320px] sm:h-[460px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-surface-light/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-gothic font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>{t('chat.title')}</span>
              {!isAlive && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold flex items-center gap-0.5">
                  <Ghost className="w-3 h-3" /> {t('chat.ghostBadge')}
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {t('chat.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
            <Sparkles className="w-8 h-8 text-indigo-400 mb-2 opacity-50" />
            <p className="text-xs">{t('chat.empty')}</p>
          </div>
        ) : (
          logs.map((log) => {
            if (log.type === 'chat') {
              const isMe = log.sender_id === me.id;

              return (
                <div
                  key={log.id}
                  className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                      {log.sender_avatar || '👤'}
                    </div>
                  )}

                  <div className={`max-w-[78%] space-y-0.5 ${isMe ? 'items-end text-right' : 'items-start text-left'}`}>
                    <div className="flex items-center gap-1.5 px-1">
                      <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                        {log.sender_name || 'Player'}
                      </span>
                    </div>

                    <div
                      className={`p-2.5 sm:p-3 rounded-2xl text-xs sm:text-sm break-words shadow-sm ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-500/20'
                          : 'bg-surface-light border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none'
                      }`}
                    >
                      {log.message}
                    </div>
                  </div>

                  {isMe && (
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                      {log.sender_avatar || me.avatar || '👤'}
                    </div>
                  )}
                </div>
              );
            }

            // System narrative logs
            return (
              <div
                key={log.id}
                className="my-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-[11px] font-mono text-center text-slate-600 dark:text-slate-400 shadow-inner"
              >
                {log.message}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reaction Emojis */}
      <div className="px-3 py-1.5 border-t border-slate-200/60 dark:border-slate-800/60 bg-surface-light/40 flex items-center gap-1 overflow-x-auto">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleQuickEmoji(emoji)}
            className="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-sm transition-all active:scale-90 flex-shrink-0"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-2.5 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-surface-light flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={!isAlive ? t('chat.ghostPlaceholder') : t('chat.placeholder')}
          maxLength={280}
          className="flex-1 px-3.5 py-2 rounded-xl bg-surface border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner"
        />

        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all shadow-md active:scale-95 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

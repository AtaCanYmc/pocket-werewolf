import React, { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { X, BookOpen, Shield, Skull, Sparkles } from 'lucide-react';
import { ROLES } from '@/config/roles';

interface RoleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoleGuideModal({ isOpen, onClose }: RoleGuideModalProps) {
  const { t } = useTranslation();
  const [filterTeam, setFilterTeam] = useState<'all' | 'good' | 'evil'>('all');

  if (!isOpen) return null;

  const roleList = Object.values(ROLES).filter((r) => {
    if (filterTeam === 'all') return true;
    return r.team === filterTeam;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header & Filters */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-border bg-surface-light">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <h2 className="font-gothic font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">{t('modals.guideTitle')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Team Filter Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-surface-border bg-surface/50 overflow-x-auto">
          <button
            onClick={() => setFilterTeam('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterTeam === 'all'
                ? 'bg-slate-800 text-white dark:bg-slate-700'
                : 'bg-surface-light text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t('modals.allRoles')} ({Object.keys(ROLES).length})
          </button>
          <button
            onClick={() => setFilterTeam('good')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              filterTeam === 'good'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-400 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300'
                : 'bg-surface-light text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t('modals.goodTeamFilter')}</span>
          </button>
          <button
            onClick={() => setFilterTeam('evil')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              filterTeam === 'evil'
                ? 'bg-red-100 dark:bg-red-950/60 border border-red-400 dark:border-red-500/50 text-red-800 dark:text-red-300'
                : 'bg-surface-light text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            <span>{t('modals.evilTeamFilter')}</span>
          </button>
        </div>

        {/* Role Cards List */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roleList.map((role) => {
              const isEvil = role.team === 'evil';
              const localizedRoleName = t(`roles.${role.id}.name`) || role.name;
              const localizedRoleDesc = t(`roles.${role.id}.desc`) || role.description;

              return (
                <div
                  key={role.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    isEvil
                      ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 hover:border-red-500'
                      : 'bg-surface-light border-slate-200 dark:border-slate-800 hover:border-indigo-500'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img
                            src={role.image}
                            alt={localizedRoleName}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLElement;
                              target.style.display = 'none';
                              if (target.nextSibling) {
                                (target.nextSibling as HTMLElement).style.display = 'block';
                              }
                            }}
                          />
                          <span className="hidden text-xl">{role.fallbackIcon}</span>
                        </div>
                        <div>
                          <h4 className="font-gothic font-bold text-slate-900 dark:text-slate-100">{localizedRoleName}</h4>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                              isEvil
                                ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                                : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                            }`}
                          >
                            {isEvil ? <Skull className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                            {isEvil ? t('modals.evilTeamFilter') : t('modals.goodTeamFilter')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{localizedRoleDesc}</p>
                  </div>

                  {role.hasNightAction && (
                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      <Sparkles className="w-3 h-3" />
                      <span>{t('modals.hasNightAction')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-surface-border bg-surface-light flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
          <span>{t('modals.guideObjective')}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium transition-colors"
          >
            {t('modals.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

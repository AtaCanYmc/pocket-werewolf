import React, { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { X, BookOpen, Shield, Skull, Sparkles, Search } from 'lucide-react';
import { ROLES } from '@/config/roles';
import { haptics } from '@/utils/haptics';

interface RoleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoleGuideModal({ isOpen, onClose }: RoleGuideModalProps) {
  const { t } = useTranslation();
  const [filterTeam, setFilterTeam] = useState<'all' | 'good' | 'evil'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const roleList = Object.values(ROLES).filter((r) => {
    const matchesTeam = filterTeam === 'all' || r.team === filterTeam;
    const localizedName = (t(`roles.${r.id}.name`) || r.name).toLowerCase();
    const localizedDesc = (t(`roles.${r.id}.desc`) || r.description).toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || localizedName.includes(query) || localizedDesc.includes(query);
    return matchesTeam && matchesSearch;
  });

  const handleClose = () => {
    haptics.tap();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 sm:py-3.5 border-b border-surface-border bg-surface-light flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="font-gothic font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
              {t('modals.guideTitle')}
            </h2>
          </div>
          <button
            onClick={handleClose}
            aria-label={t('modals.close')}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-surface-light border border-transparent hover:border-surface-border transition-colors active:scale-90 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs & Search Bar (Mobile-Friendly Header) */}
        <div className="px-3.5 sm:px-5 py-2.5 border-b border-surface-border bg-surface space-y-2 flex-shrink-0">
          {/* Team Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <button
              onClick={() => {
                haptics.tap();
                setFilterTeam('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                filterTeam === 'all'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-flat-sm'
                  : 'bg-surface-light border border-surface-border text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('modals.allRoles')} ({Object.keys(ROLES).length})
            </button>
            <button
              onClick={() => {
                haptics.tap();
                setFilterTeam('good');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all active:scale-95 ${
                filterTeam === 'good'
                  ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 shadow-flat-sm'
                  : 'bg-surface-light border border-surface-border text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('modals.goodTeamFilter')}</span>
            </button>
            <button
              onClick={() => {
                haptics.tap();
                setFilterTeam('evil');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all active:scale-95 ${
                filterTeam === 'evil'
                  ? 'bg-rose-950/40 border border-rose-500/40 text-rose-300 shadow-flat-sm'
                  : 'bg-surface-light border border-surface-border text-slate-400 hover:text-slate-200'
              }`}
            >
              <Skull className="w-3.5 h-3.5 text-rose-400" />
              <span>{t('modals.evilTeamFilter')}</span>
            </button>
          </div>

          {/* Search Filter Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rol veya yetenek ara..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-light border border-surface-border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:border-slate-500"
            />
          </div>
        </div>

        {/* Scrollable Role Cards List */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-2.5 flex-1 overscroll-contain">
          {roleList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {roleList.map((role) => {
                const isEvil = role.team === 'evil';
                const localizedRoleName = t(`roles.${role.id}.name`) || role.name;
                const localizedRoleDesc = t(`roles.${role.id}.desc`) || role.description;

                return (
                  <div
                    key={role.id}
                    className={`p-3 sm:p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isEvil
                        ? 'bg-rose-950/15 border-rose-500/30'
                        : 'bg-surface-light border-surface-border'
                    }`}
                  >
                    <div>
                      {/* Card Header: Role Image + Name + Badge */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-surface border border-surface-border p-0.5 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-flat-sm">
                          <img
                            src={role.image}
                            alt={localizedRoleName}
                            className="w-full h-full object-cover rounded-lg"
                            loading="lazy"
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
                        <div className="min-w-0">
                          <h4 className="font-gothic font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
                            {localizedRoleName}
                          </h4>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md mt-0.5 border ${
                              isEvil
                                ? 'bg-rose-950/40 border-rose-500/30 text-rose-400'
                                : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                            }`}
                          >
                            {isEvil ? <Skull className="w-2.5 h-2.5" /> : <Shield className="w-2.5 h-2.5" />}
                            {isEvil ? t('modals.evilTeamFilter') : t('modals.goodTeamFilter')}
                          </span>
                        </div>
                      </div>

                      {/* Role Ability Description */}
                      <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {localizedRoleDesc}
                      </p>
                    </div>

                    {/* Night Action Indicator */}
                    {role.hasNightAction && (
                      <div className="mt-2.5 pt-2 border-t border-surface-border flex items-center gap-1.5 text-[10px] sm:text-[11px] text-indigo-400 font-medium">
                        <Sparkles className="w-3 h-3" />
                        <span>{t('modals.hasNightAction')}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Aramanızla eşleşen bir rol bulunamadı.
            </div>
          )}
        </div>

        {/* Modal Footer (Sticky Bottom) */}
        <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-t border-surface-border bg-surface-light flex items-center justify-between gap-2 flex-shrink-0">
          <span className="text-[10px] sm:text-xs text-slate-400 line-clamp-1">
            {t('modals.guideObjective')}
          </span>
          <button
            onClick={handleClose}
            className="px-4 py-1.5 rounded-xl bg-surface border border-surface-border hover:border-slate-500 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors active:scale-95 flex-shrink-0"
          >
            {t('modals.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

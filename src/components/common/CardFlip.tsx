import React, { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Eye, EyeOff, Shield, Skull } from 'lucide-react';
import { ROLES } from '@/config/roles';
import { RoleId, Team } from '@/types/game';

interface CardFlipProps {
  roleId: RoleId | null;
  team: Team | null;
  playerName: string;
  onReveal?: () => void;
}

export default function CardFlip({ roleId, team, playerName, onReveal }: CardFlipProps) {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const { t } = useTranslation();
  const role = (roleId && ROLES[roleId]) ? ROLES[roleId] : ROLES.Villager;

  const handleToggleFlip = () => {
    const nextState = !isFlipped;
    setIsFlipped(nextState);
    if (nextState && onReveal) {
      onReveal();
    }
  };

  const isEvil = team === 'evil' || role.team === 'evil';
  const localizedRoleName = t(`roles.${role.id}.name`) || role.name;
  const localizedRoleDesc = t(`roles.${role.id}.desc`) || role.description;

  return (
    <div className="flex flex-col items-center justify-center my-4">
      <div
        onClick={handleToggleFlip}
        className="w-[17rem] xs:w-72 sm:w-80 h-[23rem] sm:h-96 cursor-pointer perspective-1000 group select-none transition-transform active:scale-[0.99]"
      >
        <div
          className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Back (Hidden secret identity) */}
          <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-b from-[#161c2e] to-[#0b0f19] border-2 border-slate-700/80 shadow-2xl p-6 flex flex-col items-center justify-between backface-hidden group-hover:border-slate-500 transition-colors">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400">{t('roleReveal.secretIdentity')}</span>
              <span className="text-xl">🌙</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-slate-800/80 border border-slate-600 flex items-center justify-center text-4xl shadow-inner mb-4 animate-pulse">
                ❓
              </div>
              <h3 className="font-gothic text-xl font-bold text-slate-200">{playerName}</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-[200px]">
                {t('roleReveal.subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-blood py-2 px-4 rounded-xl bg-blood/10 border border-blood/20">
              <Eye className="w-4 h-4" />
              <span>{t('roleReveal.tapToReveal')}</span>
            </div>
          </div>

          {/* Card Front (Revealed role card) */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col items-center justify-between backface-hidden rotate-y-180 shadow-2xl border-2 ${
              isEvil
                ? 'bg-gradient-to-b from-red-950/60 via-slate-900 to-[#07090e] border-red-600/70 shadow-blood-glow'
                : 'bg-gradient-to-b from-indigo-950/60 via-slate-900 to-[#07090e] border-indigo-500/70 shadow-mystic-glow'
            }`}
          >
            {/* Header & Team Badge */}
            <div className="flex items-center justify-between w-full">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                  isEvil ? 'bg-red-600/30 text-red-400 border border-red-500/40' : 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {isEvil ? <Skull className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                {isEvil ? t('roleReveal.evilBadge') : t('roleReveal.goodBadge')}
              </span>
              <span className="text-xl">{role.fallbackIcon}</span>
            </div>

            {/* Role Image and Title */}
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-900/80 border border-slate-700/80 p-2 flex items-center justify-center mb-3 shadow-lg">
                <img
                  src={role.image}
                  alt={localizedRoleName}
                  className="w-full h-full object-contain filter drop-shadow-md"
                  onError={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.display = 'none';
                    if (target.nextSibling) {
                      (target.nextSibling as HTMLElement).style.display = 'block';
                    }
                  }}
                />
                <span className="hidden text-5xl">{role.fallbackIcon}</span>
              </div>
              <h2 className="font-gothic text-2xl font-black text-slate-100">{localizedRoleName}</h2>
              <p className="text-xs text-slate-300 mt-2 px-2 leading-relaxed">
                {localizedRoleDesc}
              </p>
            </div>

            {/* Hide Card Button */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 py-1.5 px-3 rounded-lg bg-surface/60 border border-slate-700/50">
              <EyeOff className="w-3.5 h-3.5" />
              <span>{t('roleReveal.tapToConceal')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

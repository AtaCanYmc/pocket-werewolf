import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useTranslation } from '@/context/LanguageContext';
import Header from '@/components/common/Header';
import Home from '@/components/Home';
import LobbyView from '@/components/lobby/LobbyView';
import RoleRevealPhase from '@/components/game/RoleRevealPhase';
import NightPhase from '@/components/game/NightPhase';
import DawnPhase from '@/components/game/DawnPhase';
import DayPhase from '@/components/game/DayPhase';
import VotingPhase from '@/components/game/VotingPhase';
import GameOverPhase from '@/components/game/GameOverPhase';
import SettingsModal from '@/components/modals/SettingsModal';
import RoleGuideModal from '@/components/modals/RoleGuideModal';
import ShareModal from '@/components/modals/ShareModal';

export default function App() {
  const { room } = useGame();
  const { t } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  // Dynamic phase renderer based on active room status
  const renderGameContent = () => {
    if (!room) {
      return (
        <Home
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
        />
      );
    }

    switch (room.status) {
      case 'lobby':
        return <LobbyView onOpenShare={() => setIsShareOpen(true)} />;
      case 'role_reveal':
        return <RoleRevealPhase />;
      case 'night':
        return <NightPhase />;
      case 'dawn':
        return <DawnPhase />;
      case 'day':
        return <DayPhase />;
      case 'voting':
        return <VotingPhase />;
      case 'ended':
        return <GameOverPhase />;
      default:
        return <LobbyView onOpenShare={() => setIsShareOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-slate-900 dark:text-slate-100 selection:bg-blood selection:text-white transition-colors duration-300">
      {/* Top Header Navigation */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
      />

      {/* Main Game Phase Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-2 sm:px-6 py-2 sm:py-6 flex flex-col justify-center">
        {renderGameContent()}
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 dark:text-slate-500 border-t border-surface-border">
        <p>{t('app.footer')}</p>
      </footer>

      {/* Modals */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <RoleGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </div>
  );
}

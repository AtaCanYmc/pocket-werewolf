import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useGame } from '@/context/GameContext';
import { useTranslation } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import Header from '@/components/common/Header';
import PhaseLoader from '@/components/common/PhaseLoader';
import ToastContainer from '@/components/common/ToastContainer';

// Code Splitting & Dynamic Imports for Phase & Modal Components
const Home = lazy(() => import('@/components/Home'));
const LobbyView = lazy(() => import('@/components/lobby/LobbyView'));
const RoleRevealPhase = lazy(() => import('@/components/game/RoleRevealPhase'));
const NightPhase = lazy(() => import('@/components/game/NightPhase'));
const DawnPhase = lazy(() => import('@/components/game/DawnPhase'));
const DayPhase = lazy(() => import('@/components/game/DayPhase'));
const VotingPhase = lazy(() => import('@/components/game/VotingPhase'));
const GameOverPhase = lazy(() => import('@/components/game/GameOverPhase'));
const SettingsModal = lazy(() => import('@/components/modals/SettingsModal'));
const RoleGuideModal = lazy(() => import('@/components/modals/RoleGuideModal'));
const ShareModal = lazy(() => import('@/components/modals/ShareModal'));

export default function App() {
  const { room, error } = useGame();
  const { t } = useTranslation();
  const { showError } = useToast();
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  // Sync game engine / network errors with Toast notification system
  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

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
    <div className="min-h-screen min-h-[100dvh] flex flex-col justify-between bg-background text-slate-900 dark:text-slate-100 selection:bg-blood selection:text-white transition-colors duration-300">
      {/* Global Toast Notifications */}
      <ToastContainer />

      {/* Top Header Navigation */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
      />

      {/* Main Game Phase Content with Suspense Loading */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-2.5 sm:px-6 py-2.5 sm:py-6 flex flex-col">
        <Suspense fallback={<PhaseLoader />}>
          {renderGameContent()}
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="w-full py-3 sm:py-4 text-center text-[11px] sm:text-xs text-slate-500 dark:text-slate-500 border-t border-surface-border">
        <p>{t('app.footer')}</p>
      </footer>

      {/* Modals wrapped in Suspense */}
      <Suspense fallback={null}>
        {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
        {isGuideOpen && <RoleGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />}
        {isShareOpen && <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />}
      </Suspense>
    </div>
  );
}

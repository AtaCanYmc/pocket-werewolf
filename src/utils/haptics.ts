/**
 * Pocket Werewolf - Haptic Feedback Engine
 * Provides subtle, tactile vibrations on supported mobile devices.
 */

class HapticsEngine {
  private isSupported(): boolean {
    return typeof window !== 'undefined' && 'navigator' in window && Boolean(window.navigator.vibrate);
  }

  /**
   * Subtle tick for normal button taps and toggles (10ms)
   */
  tap(): void {
    if (this.isSupported()) {
      try {
        window.navigator.vibrate(10);
      } catch {
        // Ignore haptics errors on unsupported browsers
      }
    }
  }

  /**
   * Crisp feedback for selecting a target or voting (25ms)
   */
  selection(): void {
    if (this.isSupported()) {
      try {
        window.navigator.vibrate(25);
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Positive feedback on successful actions (e.g. ready toggle, successful vote)
   */
  success(): void {
    if (this.isSupported()) {
      try {
        window.navigator.vibrate([15, 40, 25]);
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Alert or critical action feedback (e.g. lynch execution, night attack target)
   */
  impact(): void {
    if (this.isSupported()) {
      try {
        window.navigator.vibrate([30, 30, 45]);
      } catch {
        // Ignore
      }
    }
  }
}

export const haptics = new HapticsEngine();

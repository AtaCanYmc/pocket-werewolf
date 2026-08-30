/**
 * Web Audio API Procedural Sound Effects Synthesizer
 * Zero-dependency, offline-ready dynamic procedural audio with automatic mobile unlock.
 */

class SoundFX {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isUnlocked: boolean = false;
  public enabled: boolean = true;

  constructor() {
    const saved = localStorage.getItem('PW_SOUND_ENABLED');
    if (saved !== null) {
      this.enabled = saved === 'true';
    }

    // Attach global user interaction listeners to unlock AudioContext on first tap/click
    if (typeof window !== 'undefined') {
      const unlockEvents = ['pointerdown', 'touchstart', 'click', 'keydown'];
      const unlockHandler = () => {
        this.unlockAudio();
        unlockEvents.forEach((ev) => window.removeEventListener(ev, unlockHandler));
      };
      unlockEvents.forEach((ev) => window.addEventListener(ev, unlockHandler, { passive: true, once: true }));
    }
  }

  /**
   * Initializes or returns the current AudioContext and master gain node.
   */
  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Unlocks Web Audio on mobile/Safari via user gesture.
   */
  public unlockAudio(): void {
    const ctx = this.getContext();
    if (!ctx || this.isUnlocked) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        this.isUnlocked = true;
      }).catch(() => {});
    } else if (ctx.state === 'running') {
      this.isUnlocked = true;
    }

    // Play a tiny silent buffer to warm up audio hardware (iOS Safari requirement)
    try {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch {}
  }

  public toggleSound(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem('PW_SOUND_ENABLED', String(this.enabled));
    if (this.enabled) {
      this.unlockAudio();
      this.playClick();
    }
    return this.enabled;
  }

  // 🐺 Wolf Howl Sound Effect
  public playWolfHowl(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      // Pitch bend: rising and descending eerie howl
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.8);
      osc.frequency.exponentialRampToValueAtTime(380, now + 1.4);
      osc.frequency.exponentialRampToValueAtTime(110, now + 2.8);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(700, now + 1.2);
      filter.frequency.exponentialRampToValueAtTime(300, now + 2.8);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 3.1);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // 🌙 Night Fall Ambient Tone
  public playNightFall(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 1.5);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 1.8);
    } catch (e) {}
  }

  // ☀️ Morning Bell / Dawn Chime
  public playMorningBell(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio
      freqs.forEach((f, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.12);

        gain.gain.setValueAtTime(0.2, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(this.masterGain || ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 1.3);
      });
    } catch (e) {}
  }

  // ⚡ Click / Vote Ping
  public playClick(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  // 💀 Execution / Death Gong
  public playDeathGong(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 2.0);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 2.2);
    } catch (e) {}
  }

  // 🏆 Victory Fanfare
  public playVictory(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.15);

        gain.gain.setValueAtTime(0.25, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.8);

        osc.connect(gain);
        gain.connect(this.masterGain || ctx.destination);

        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.9);
      });
    } catch (e) {}
  }
}

export const sound = new SoundFX();

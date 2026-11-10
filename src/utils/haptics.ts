// Safe haptics & audio engine for Android Chrome & iOS

const SETTINGS_STORAGE_KEY = 'ios18_gift_settings';

let soundEnabled = true;
let hapticsEnabled = true;

// Load persisted switches on initial evaluation if present
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.soundEnabled === 'boolean') {
        soundEnabled = parsed.soundEnabled;
      }
      if (typeof parsed.hapticsEnabled === 'boolean') {
        hapticsEnabled = parsed.hapticsEnabled;
      }
    }
  }
} catch {
  // Ignore localStorage parsing error
}

export const setGlobalSound = (enabled: boolean) => {
  soundEnabled = enabled;
};

export const setGlobalHaptics = (enabled: boolean) => {
  hapticsEnabled = enabled;
};

export const getGlobalSound = () => soundEnabled;
export const getGlobalHaptics = () => hapticsEnabled;

export const vibrate = (pattern: number | number[] = 25) => {
  if (!hapticsEnabled) return;
  try {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Ignore unsupported vibration
  }
};

export const requestFullscreenMode = () => {
  try {
    const docEl = document.documentElement as HTMLElement & {
      requestFullscreen?: () => Promise<void>;
      webkitRequestFullscreen?: () => Promise<void>;
      mozRequestFullScreen?: () => Promise<void>;
      msRequestFullscreen?: () => Promise<void>;
    };

    if (!document.fullscreenElement) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen().catch(() => {});
      }
    }
  } catch {
    // Ignore fullscreen failure
  }
};

// Web Audio API Sound Synthesizer for zero-latency, 100% reliable SFX
let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

export const primeAudioContext = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    // Play a 1-sample silent buffer synchronously on user gesture
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch {
    // Ignore audio priming error
  }
};

export const playTapSound = (freq = 440, duration = 0.04) => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio context may not be ready
  }
};

export const playGlitchSound = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.45;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.Q.setValueAtTime(3, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  } catch {
    // Ignore
  }
};

export const playNotificationSound = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Elegant two-tone Apple-like glass ping
    [
      { freq: 587.33, start: 0, dur: 0.12 }, // D5
      { freq: 880.00, start: 0.08, dur: 0.35 } // A5
    ].forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + start);

      gain.gain.setValueAtTime(0.12, now + start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + dur);
    });
  } catch {
    // Ignore
  }
};

export const playUnlockSound = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [400, 600, 900, 1200].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.15, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.2);
    });
  } catch {
    // Ignore
  }
};

export const playScratchSound = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200 + Math.random() * 300, ctx.currentTime);

    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch {
    // Ignore
  }
};

// Short playful frog "ква" (ribbit/croak) sound synthesizer
export const playFrogCroakSound = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Primary vocal croak ("ква"): resonant sawtooth chirp with formant filter
    const osc1 = ctx.createOscillator();
    const filter1 = ctx.createBiquadFilter();
    const gain1 = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(145, now);
    osc1.frequency.exponentialRampToValueAtTime(310, now + 0.065);
    osc1.frequency.exponentialRampToValueAtTime(195, now + 0.115);

    filter1.type = 'bandpass';
    filter1.Q.setValueAtTime(4.5, now);
    filter1.frequency.setValueAtTime(420, now);
    filter1.frequency.exponentialRampToValueAtTime(920, now + 0.06);
    filter1.frequency.exponentialRampToValueAtTime(540, now + 0.115);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.22, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.125);

    // Subtle throat harmonic pop for natural frog timbre
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(290, now + 0.02);
    osc2.frequency.exponentialRampToValueAtTime(520, now + 0.075);

    gain2.gain.setValueAtTime(0.001, now + 0.02);
    gain2.gain.linearRampToValueAtTime(0.09, now + 0.035);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.02);
    osc2.stop(now + 0.1);
  } catch {
    // Ignore audio context errors
  }
};

// Heavy mechanical vault airlock & pneumatic seal release sound
export const playAirlockOpenSound = (stage: 'door' | 'gears' = 'door') => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Heavy metallic bolt/latch release thud (sub-bass sweep)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(stage === 'door' ? 145 : 185, now);
    subOsc.frequency.exponentialRampToValueAtTime(stage === 'door' ? 38 : 52, now + 0.36);

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.26, now + 0.02);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.4);

    // 2. Metallic resonance clank
    const clangOsc = ctx.createOscillator();
    const clangGain = ctx.createGain();
    clangOsc.type = 'sawtooth';
    clangOsc.frequency.setValueAtTime(stage === 'door' ? 310 : 420, now + 0.015);
    clangOsc.frequency.exponentialRampToValueAtTime(stage === 'door' ? 95 : 140, now + 0.22);

    clangGain.gain.setValueAtTime(0.11, now + 0.015);
    clangGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    clangOsc.connect(clangGain);
    clangGain.connect(ctx.destination);
    clangOsc.start(now + 0.015);
    clangOsc.stop(now + 0.25);

    // 3. Pressurized pneumatic airlock hiss (filtered noise burst)
    const duration = stage === 'door' ? 0.55 : 0.45;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.sin((Math.PI * i) / bufferSize);
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.Q.setValueAtTime(2.2, now + 0.03);
    bandpass.frequency.setValueAtTime(stage === 'door' ? 1900 : 2400, now + 0.03);
    bandpass.frequency.exponentialRampToValueAtTime(480, now + duration);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now + 0.03);
    noiseGain.gain.linearRampToValueAtTime(0.18, now + 0.09);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now + 0.03);
  } catch {
    // Ignore audio context errors
  }
};

// Crisp iOS-style camera shutter / screenshot click sound
export const playCameraShutterSound = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const createShutterClick = (offset: number, pitch: number, gainPeak: number) => {
      // Short mechanical noise burst
      const dur = 0.028;
      const bufSize = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.006));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(pitch, now + offset);
      filter.Q.setValueAtTime(1.8, now + offset);

      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(gainPeak, now + offset);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + offset + dur);

      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(ctx.destination);
      noise.start(now + offset);

      // Subtle metallic body transient
      const osc = ctx.createOscillator();
      const oGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch * 0.65, now + offset);
      osc.frequency.exponentialRampToValueAtTime(180, now + offset + 0.022);
      oGain.gain.setValueAtTime(gainPeak * 0.55, now + offset);
      oGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.022);
      osc.connect(oGain);
      oGain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.024);
    };

    // First curtain open click + second curtain close click (classic iOS shutter)
    createShutterClick(0, 2600, 0.28);
    createShutterClick(0.055, 1950, 0.22);
  } catch {
    // Ignore audio context errors
  }
};




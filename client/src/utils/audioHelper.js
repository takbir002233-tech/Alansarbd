// Reliable Audio Notification Player with Browser Autoplay Policy Unlock
let sharedAudioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

// Global unlock on user gestures (click, touch, keydown) to guarantee audio playback
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
          // Play silent 1-sample buffer to unlock iOS/Safari WebAudio pipeline
          try {
            const buffer = ctx.createBuffer(1, 1, 22050);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(0);
          } catch (err) {}
        }).catch(() => {});
      }
    } catch (e) {}
  };

  ['click', 'touchstart', 'touchend', 'keydown'].forEach(evt => {
    window.addEventListener(evt, unlockAudio, { passive: true, once: false });
  });
}

/**
 * Plays a rich, clear 3-tone melodic chime for incoming orders, status changes, and admin alerts.
 */
export function playNotificationChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => playTones(ctx)).catch(() => {});
    } else {
      playTones(ctx);
    }
  } catch (e) {
    console.error('Audio chime error:', e);
  }
}

function playTones(ctx) {
  try {
    const now = ctx.currentTime;
    
    // Tone 1: 587.33 Hz (D5) - warm entrance
    // Tone 2: 880.00 Hz (A5) - uplifting middle
    // Tone 3: 1174.66 Hz (D6) - clear sparkling crest
    const tones = [
      { freq: 587.33, start: 0, dur: 0.20 },
      { freq: 880.00, start: 0.12, dur: 0.24 },
      { freq: 1174.66, start: 0.24, dur: 0.40 }
    ];

    tones.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      gain.gain.setValueAtTime(0.001, now + start);
      gain.gain.linearRampToValueAtTime(0.55, now + start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + dur);
    });
  } catch (e) {}
}

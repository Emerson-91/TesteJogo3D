// Sistema de Áudio Procedural estilo Zelda (Web Audio API)
window.GameAudio = (() => {
  let ctx = null;
  let muted = false;
  let bgmTimer = null;
  let bgmStep = 0;

  // Melodia suave de aventura (em Hz)
  const bgmNotes = [
    392.0, 0, 493.88, 587.33, 523.25, 0, 493.88, 440.0,
    392.0, 0, 329.63, 392.0, 440.0, 0, 392.0, 0,
    523.25, 0, 587.33, 659.25, 587.33, 0, 523.25, 493.88,
    440.0, 493.88, 523.25, 440.0, 392.0, 0, 0, 0
  ];

  function ensureContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function playTone(freq, duration, type = 'triangle', volume = 0.12, slideTo = null, delay = 0) {
    if (muted) return;
    const audio = ensureContext();
    if (!audio) return;

    const now = audio.currentTime + delay;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function playNoise(duration, volume = 0.1, delay = 0) {
    if (muted) return;
    const audio = ensureContext();
    if (!audio) return;

    const bufferSize = Math.floor(audio.sampleRate * duration);
    const buffer = audio.createBuffer(1, bufferSize, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = audio.createBufferSource();
    noise.buffer = buffer;

    const filter = audio.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1100;

    const gain = audio.createGain();
    const now = audio.currentTime + delay;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);
    noise.start(now);
  }

  function startBGM() {
    if (bgmTimer) return;
    ensureContext();
    bgmTimer = setInterval(() => {
      if (muted || !ctx || ctx.state !== 'running') return;
      const note = bgmNotes[bgmStep % bgmNotes.length];
      if (note > 0) {
        playTone(note, 0.24, 'triangle', 0.032);
        if (bgmStep % 4 === 0) {
          playTone(note * 0.5, 0.34, 'sine', 0.025);
        }
      }
      bgmStep++;
    }, 260);
  }

  function stopBGM() {
    if (bgmTimer) {
      clearInterval(bgmTimer);
      bgmTimer = null;
    }
  }

  return {
    init() {
      ensureContext();
      startBGM();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() {
      return muted;
    },
    stopBGM,
    slash() {
      playNoise(0.09, 0.14);
      playTone(540, 0.11, 'sawtooth', 0.07, 160);
    },
    spin() {
      playNoise(0.22, 0.16);
      playTone(320, 0.16, 'sawtooth', 0.08, 780);
      playTone(780, 0.18, 'triangle', 0.07, 260, 0.12);
    },
    powerThunder() {
      playNoise(0.28, 0.18);
      playTone(920, 0.12, 'sawtooth', 0.09, 220);
      playTone(180, 0.28, 'square', 0.1, 65, 0.05);
    },
    powerCyclone() {
      playNoise(0.26, 0.15);
      playTone(280, 0.22, 'triangle', 0.09, 860);
      playTone(860, 0.2, 'sine', 0.07, 420, 0.14);
    },
    powerFire() {
      playNoise(0.24, 0.16);
      playTone(420, 0.14, 'sawtooth', 0.09, 140);
      playTone(540, 0.14, 'sawtooth', 0.08, 170, 0.07);
      playTone(660, 0.16, 'triangle', 0.08, 210, 0.14);
    },
    powerKiBeam() {
      playTone(220, 0.14, 'sine', 0.09, 680);
      playTone(680, 0.34, 'sawtooth', 0.1, 440, 0.1);
      playNoise(0.32, 0.14, 0.1);
    },
    dash() {
      playNoise(0.11, 0.09);
      playTone(220, 0.12, 'sine', 0.07, 420);
    },
    shieldBlock() {
      playTone(720, 0.08, 'square', 0.08, 1080);
      playTone(1080, 0.12, 'triangle', 0.07, 880, 0.06);
    },
    cutBush() {
      playNoise(0.08, 0.12);
      playTone(300, 0.07, 'triangle', 0.06, 150);
    },
    smashPot() {
      playNoise(0.12, 0.15);
      playTone(460, 0.07, 'square', 0.06, 180);
      playTone(280, 0.09, 'triangle', 0.06, 110, 0.05);
    },
    rupee() {
      playTone(880, 0.09, 'square', 0.065);
      playTone(1318.5, 0.16, 'square', 0.065, null, 0.07);
    },
    heart() {
      playTone(523.25, 0.09, 'triangle', 0.09);
      playTone(659.25, 0.09, 'triangle', 0.09, null, 0.07);
      playTone(783.99, 0.18, 'triangle', 0.09, null, 0.14);
    },
    enemyHit() {
      playTone(210, 0.1, 'sawtooth', 0.11, 80);
      playNoise(0.07, 0.1);
    },
    enemyDefeat() {
      playTone(360, 0.08, 'square', 0.08, 220);
      playTone(220, 0.15, 'sawtooth', 0.09, 75, 0.07);
    },
    playerHurt() {
      playTone(190, 0.16, 'sawtooth', 0.13, 90);
      playTone(130, 0.18, 'square', 0.09, 65, 0.08);
    },
    switchHero() {
      playTone(440, 0.08, 'triangle', 0.09, 660);
      playTone(660, 0.12, 'triangle', 0.09, 880, 0.06);
    },
    chestFanfare() {
      const seq = [523.25, 587.33, 659.25, 783.99, 1046.5];
      seq.forEach((f, i) => {
        playTone(f, i === seq.length - 1 ? 0.45 : 0.13, 'square', 0.08, null, i * 0.11);
        playTone(f * 0.5, i === seq.length - 1 ? 0.45 : 0.13, 'triangle', 0.07, null, i * 0.11);
      });
    },
    victory() {
      const melody = [
        [523.25, 0.14, 0.0],
        [659.25, 0.14, 0.14],
        [783.99, 0.14, 0.28],
        [1046.5, 0.3, 0.42],
        [880.0, 0.16, 0.74],
        [1046.5, 0.55, 0.92]
      ];
      melody.forEach(([f, d, t]) => {
        playTone(f, d, 'square', 0.085, null, t);
        playTone(f * 0.5, d, 'triangle', 0.07, null, t);
      });
    },
    dialogue() {
      playTone(620, 0.06, 'triangle', 0.07, 740);
    },
    heal() {
      playTone(587.33, 0.12, 'sine', 0.07);
      playTone(880, 0.18, 'sine', 0.07, null, 0.08);
    }
  };
})();

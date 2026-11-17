// The score: a warm four-chord loop synthesised live with Web Audio, so there is
// no licensed track to clear. Layers come and go with the chapters, and the mix
// ducks under the narrator. If audio/manifest.json names a "music" file, that
// track is looped instead.

const BPM = 108;
const STEP = 60 / BPM / 4; // one sixteenth note
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

// D major: Dmaj9, Bm7, Gmaj7, A6. One bar each.
const CHORDS = [
  { bass: 38, pad: [62, 66, 69, 73], arp: [74, 78, 81, 85, 81, 78, 76, 78] },
  { bass: 47, pad: [59, 62, 66, 69], arp: [74, 78, 81, 86, 81, 78, 74, 78] },
  { bass: 43, pad: [55, 59, 62, 66], arp: [74, 79, 83, 86, 83, 79, 78, 79] },
  { bass: 45, pad: [57, 61, 64, 66], arp: [73, 76, 81, 85, 81, 76, 78, 76] },
];

export function createMusic(ac, destination) {
  const bus = ac.createGain();
  bus.gain.value = 0;
  bus.connect(destination);

  const duck = ac.createGain();
  duck.connect(bus);

  const echo = ac.createDelay(1);
  echo.delayTime.value = STEP * 3;
  const feedback = ac.createGain();
  feedback.gain.value = 0.34;
  const wet = ac.createGain();
  wet.gain.value = 0.3;
  echo.connect(feedback).connect(echo);
  echo.connect(wet).connect(duck);

  const noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const data = noise.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;

  let level = 0;
  let timer = null;
  let nextTime = 0;
  let step = 0;
  let track = null;
  let trackSource = null;

  const env = (peak, at, attack, release) => {
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + attack + release);
    return gain;
  };

  const tone = (type, frequency, at, length, out, detune = 0) => {
    const osc = ac.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, at);
    osc.detune.value = detune;
    osc.connect(out);
    osc.start(at);
    osc.stop(at + length);
    return osc;
  };

  function pad(chord, at) {
    const length = STEP * 16;
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 0.6;
    filter.frequency.setValueAtTime(620, at);
    filter.frequency.linearRampToValueAtTime(1500, at + length * 0.6);
    filter.frequency.linearRampToValueAtTime(700, at + length + 0.6);
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.03, at + 0.45);
    gain.gain.setValueAtTime(0.03, at + length - 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length + 0.7);
    filter.connect(gain).connect(duck);
    for (const note of chord.pad) {
      tone("sawtooth", hz(note), at, length + 0.8, filter, -7);
      tone("sawtooth", hz(note), at, length + 0.8, filter, 7);
    }
    tone("sine", hz(chord.bass), at, length + 0.8, filter);
  }

  function pluck(note, at) {
    const gain = env(0.05, at, 0.006, 0.3);
    gain.connect(duck);
    gain.connect(echo);
    tone("triangle", hz(note), at, 0.36, gain);
    tone("sine", hz(note) * 2, at, 0.36, gain).detune.value = 4;
  }

  function bass(note, at) {
    const gain = env(0.2, at, 0.01, 0.34);
    gain.connect(duck);
    tone("sine", hz(note), at, 0.4, gain);
    tone("triangle", hz(note), at, 0.4, gain);
  }

  function kick(at) {
    const gain = env(0.34, at, 0.004, 0.2);
    gain.connect(duck);
    const osc = tone("sine", 130, at, 0.24, gain);
    osc.frequency.exponentialRampToValueAtTime(46, at + 0.12);
  }

  function noiseHit(at, type, frequency, peak, release) {
    const source = ac.createBufferSource();
    source.buffer = noise;
    const filter = ac.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    const gain = env(peak, at, 0.002, release);
    source.connect(filter).connect(gain).connect(duck);
    source.start(at, Math.random() * 0.5);
    source.stop(at + release + 0.05);
  }

  function schedule(index, at) {
    const chord = CHORDS[Math.floor(index / 16) % CHORDS.length];
    const beat = index % 16;
    if (beat === 0) pad(chord, at);
    if (level >= 1 && beat % 2 === 0) pluck(chord.arp[(index / 2) % chord.arp.length], at);
    if (level >= 2) {
      if (beat % 4 === 0) kick(at);
      if (beat % 4 === 2) noiseHit(at, "highpass", 7500, 0.035, 0.04);
      if (beat === 4 || beat === 12) noiseHit(at, "bandpass", 1900, 0.06, 0.13);
      if (beat === 0 || beat === 6 || beat === 10) bass(chord.bass, at);
      if (beat === 14) bass(chord.bass + 7, at);
    }
  }

  function pump() {
    if (nextTime < ac.currentTime) nextTime = ac.currentTime + 0.06;
    while (nextTime < ac.currentTime + 0.25) {
      schedule(step, nextTime);
      nextTime += STEP;
      step += 1;
    }
  }

  return {
    useTrack(buffer) {
      track = buffer;
    },
    start() {
      const now = ac.currentTime;
      bus.gain.cancelScheduledValues(now);
      bus.gain.setTargetAtTime(track ? 0.32 : 0.6, now, 0.6);
      if (track) {
        if (trackSource) return;
        trackSource = ac.createBufferSource();
        trackSource.buffer = track;
        trackSource.loop = true;
        trackSource.connect(duck);
        trackSource.start();
        return;
      }
      if (timer) return;
      step = 0;
      nextTime = now + 0.08;
      pump();
      timer = setInterval(pump, 90);
    },
    setLevel(value) {
      level = value;
    },
    duck(on) {
      duck.gain.setTargetAtTime(on ? 0.42 : 1, ac.currentTime, on ? 0.08 : 0.35);
    },
    fadeOut(seconds = 6) {
      bus.gain.setTargetAtTime(0.0001, ac.currentTime, seconds / 4);
      setTimeout(() => {
        if (bus.gain.value > 0.01) return;
        clearInterval(timer);
        timer = null;
        try {
          trackSource?.stop();
        } catch {
          // Already stopped.
        }
        trackSource = null;
      }, seconds * 1000);
    },
  };
}

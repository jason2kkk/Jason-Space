const STORAGE_KEY = 'jason-space-aqua-volume';
const DEFAULT_VOLUME = 20;
const AUDIBLE_FLAG = 'jason-space-aqua-volume-audible-v1';

let level = readStored();
const listeners = new Set();
const boundMedia = new WeakSet();

let audioCtx = null;
let masterGain = null;
let mediaPatched = false;
let nodePatched = false;
let lastTickAt = 0;

function clamp(value) {
  return Math.min(100, Math.max(0, Math.round(Number(value) || 0)));
}

function readStored() {
  if (typeof window === 'undefined') return DEFAULT_VOLUME;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const stored = raw == null ? null : clamp(raw);

    if (window.localStorage.getItem(AUDIBLE_FLAG) !== '1') {
      window.localStorage.setItem(AUDIBLE_FLAG, '1');
      if (stored == null || stored === 0) {
        window.localStorage.setItem(STORAGE_KEY, String(DEFAULT_VOLUME));
        return DEFAULT_VOLUME;
      }
      return stored;
    }

    if (raw == null) return DEFAULT_VOLUME;
    return clamp(raw);
  } catch {
    return DEFAULT_VOLUME;
  }
}

function persist(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // private mode / quota
  }
}

function linear() {
  return level / 100;
}

function applyMedia(node) {
  if (!node) return;
  node.volume = linear();
  boundMedia.add(node);
}

function applyAllMedia(root = typeof document === 'undefined' ? null : document) {
  root?.querySelectorAll?.('audio, video').forEach(applyMedia);
}

function notify() {
  listeners.forEach((fn) => {
    try {
      fn(level);
    } catch {
      // keep other subscribers alive
    }
  });
}

function applyVolume() {
  applyAllMedia();
  if (masterGain && audioCtx) {
    masterGain.gain.setTargetAtTime(linear(), audioCtx.currentTime, 0.012);
  }
}

export function getVolume() {
  return level;
}

export function setVolume(next) {
  const value = clamp(next);
  const changed = value !== level;
  level = value;
  persist(level);
  applyVolume();
  if (changed) notify();
  return level;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAudioContext() {
  return ensureGraph()?.context ?? null;
}

export function getMasterGain() {
  return ensureGraph()?.gain ?? null;
}

export function connectToMaster(node) {
  const gain = getMasterGain();
  if (gain && node) node.connect(gain);
  return gain;
}

export function unlockAudio() {
  ensureGraph();
}

function ensureGraph() {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;

  if (!audioCtx) {
    audioCtx = new Ctx();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = linear();
    masterGain.connect(audioCtx.destination);
    patchAudioNodes();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return { context: audioCtx, gain: masterGain };
}

export function playVolumeTick() {
  const graph = ensureGraph();
  if (!graph || level <= 0) return;

  const now = Date.now();
  if (now - lastTickAt < 90) return;
  lastTickAt = now;

  const { context, gain } = graph;
  const osc = context.createOscillator();
  const env = context.createGain();
  osc.type = 'sine';
  osc.frequency.value = 880;
  env.gain.value = 0.0001;
  osc.connect(env);
  env.connect(gain);

  const t = context.currentTime;
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(0.16, t + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  osc.start(t);
  osc.stop(t + 0.14);
}

function patchAudioNodes() {
  if (nodePatched || typeof AudioNode === 'undefined') return;
  nodePatched = true;

  const originalConnect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function aquaConnect(dest, ...rest) {
    if (masterGain && audioCtx && dest === audioCtx.destination && this !== masterGain) {
      return originalConnect.call(this, masterGain, ...rest);
    }
    return originalConnect.call(this, dest, ...rest);
  };
}

function patchMedia() {
  if (mediaPatched || typeof window === 'undefined') return;
  mediaPatched = true;

  const mediaProto = window.HTMLMediaElement?.prototype;
  if (mediaProto?.play) {
    const originalPlay = mediaProto.play;
    mediaProto.play = function aquaPlay(...args) {
      applyMedia(this);
      return originalPlay.apply(this, args);
    };
  }

  if (typeof MutationObserver !== 'undefined' && document.documentElement) {
    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches('audio, video')) applyMedia(node);
          applyAllMedia(node);
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  applyAllMedia();
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchMedia, { once: true });
  } else {
    patchMedia();
  }
}

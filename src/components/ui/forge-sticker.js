import React, { useEffect, useRef, useState } from 'react';

let stickerForgeLoader;
let stickerEnterWave = 0;
let stickerEnterWaveAt = 0;

const emptyForgeOptions = {};

const nextStickerEnterDelay = () => {
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (now - stickerEnterWaveAt > 480) stickerEnterWave = 0;
  stickerEnterWaveAt = now;
  const delay = stickerEnterWave * 56;
  stickerEnterWave += 1;
  return delay;
};

export const aquaStickerForgeOptions = {
  outline: { width: 11, color: '#f2eee8' },
  edge: { width: 1.8, strength: 0.58 },
  shadow: { color: '#191823', opacity: 0.18, blur: 12, distance: 7, angle: 42 },
  lighting: {
    direction: { x: -0.38, y: 0.52, z: 0.76 },
    intensity: 0.74,
    ambient: 0.36,
    softness: 0.64,
  },
  peel: {
    radius: 0.12,
    stiffness: 0.72,
    grabWidth: 16,
    maxAngle: 3.55,
    release: 'snap',
  },
  sound: { enabled: true, volume: 0.56 },
  back: { color: '#eeeae4', gloss: 0.6, roughness: 0.4 },
  material: {
    type: 'original',
    intensity: 0.76,
    scale: 1,
    holographicGrain: 0.68,
    seed: 0.37,
    holographicColors: ['#f2a7c5', '#8edfd5', '#9db4ea'],
  },
  wind: 0.22,
  quality: 'high',
};

export const ipodStickerForgeOptions = {
  ...aquaStickerForgeOptions,
  outline: { width: 7, color: '#f0ece6' },
  edge: { width: 1.3, strength: 0.48 },
  shadow: { color: '#191823', opacity: 0.14, blur: 6, distance: 3, angle: 42 },
  peel: {
    ...aquaStickerForgeOptions.peel,
    grabWidth: 12,
    radius: 0.14,
  },
  sound: { enabled: true, volume: 0.48 },
  material: { ...aquaStickerForgeOptions.material, intensity: 0.7 },
};

export const loadStickerForge = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if (window.StickerForge) return Promise.resolve(window.StickerForge);
  if (stickerForgeLoader) return stickerForgeLoader;

  stickerForgeLoader = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-sticker-forge]');
    const script = existingScript || document.createElement('script');

    const handleLoad = () => {
      if (window.StickerForge) resolve(window.StickerForge);
      else reject(new Error('Sticker Forge loaded without exposing its API.'));
    };

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', () => reject(new Error('Sticker Forge failed to load.')), { once: true });

    if (!existingScript) {
      script.src = '/vendor/sticker-forge/sticker-forge.iife.js';
      script.async = true;
      script.dataset.stickerForge = 'true';
      document.head.appendChild(script);
    } else if (window.StickerForge) {
      resolve(window.StickerForge);
    }
  });

  return stickerForgeLoader;
};

const markDecoded = (image, onReady) => {
  if (typeof image.decode === 'function') {
    image.decode().then(onReady).catch(onReady);
    return;
  }
  onReady();
};

export const ForgeSticker = ({
  src,
  alt = '',
  tilt = 0,
  aspect,
  enabled = true,
  className = '',
  style,
  forgeOptions = emptyForgeOptions,
  renderScale = 2,
  surfaceFilter = 'none',
}) => {
  const frameRef = useRef(null);
  const mountRef = useRef(null);
  const peelResetTimerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [enterDelayMs, setEnterDelayMs] = useState(0);
  const [fallbackSrc, setFallbackSrc] = useState(null);
  const [isPeeling, setIsPeeling] = useState(false);

  useEffect(() => {
    let disposed = false;
    const image = new Image();
    setFallbackSrc(null);

    image.decoding = 'async';
    image.onload = () => {
      markDecoded(image, () => {
        if (!disposed) setFallbackSrc(src);
      });
    };
    image.onerror = () => {
      if (!disposed) setFallbackSrc(null);
    };
    image.src = src;
    if (image.complete && image.naturalWidth > 0) {
      markDecoded(image, () => {
        if (!disposed) setFallbackSrc(src);
      });
    }

    return () => {
      disposed = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [src]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const handlePeelStart = () => {
      window.clearTimeout(peelResetTimerRef.current);
      setIsPeeling(true);
    };
    const handlePeelEnd = () => {
      window.clearTimeout(peelResetTimerRef.current);
      peelResetTimerRef.current = window.setTimeout(() => setIsPeeling(false), 950);
    };

    mount.addEventListener('peelstart', handlePeelStart);
    mount.addEventListener('peelend', handlePeelEnd);

    return () => {
      window.clearTimeout(peelResetTimerRef.current);
      mount.removeEventListener('peelstart', handlePeelStart);
      mount.removeEventListener('peelend', handlePeelEnd);
    };
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    const frame = frameRef.current;
    if (!enabled || !mount || !frame) {
      setIsReady(false);
      return undefined;
    }

    let disposed = false;
    let instance;
    let resizeObserver;

    const getDisplayOptions = () => {
      const width = Math.max(1, frame.clientWidth);
      const height = aspect ? width / aspect : Math.max(1, frame.clientHeight || width);
      const shortest = Math.min(width, height);
      return {
        display: { width, height },
        outline: {
          width: Math.max(5, Math.round(shortest * 0.09)),
          color: '#f2eee8',
          ...forgeOptions.outline,
        },
        peel: {
          radius: 0.12,
          stiffness: 0.72,
          grabWidth: Math.max(10, Math.round(shortest * 0.22)),
          maxAngle: 3.55,
          surfaceShadow: true,
          release: 'snap',
          ...forgeOptions.peel,
          residue: false,
        },
      };
    };

    loadStickerForge()
      .then((api) => api.createSticker(mount, {
        source: { type: 'image', src, name: alt || src },
        outline: { width: 8, color: '#f8f8f6', ...forgeOptions.outline },
        edge: { width: 1.4, strength: 0.5, ...forgeOptions.edge },
        shadow: {
          color: '#050505',
          opacity: 0.22,
          blur: 8,
          distance: 4,
          ...forgeOptions.shadow,
        },
        lighting: {
          direction: { x: -0.42, y: 0.56, z: 0.72 },
          intensity: 0.72,
          ambient: 0.42,
          softness: 0.72,
          ...forgeOptions.lighting,
        },
        peel: {
          radius: 0.1,
          stiffness: 0.68,
          grabWidth: 16,
          maxAngle: 3.35,
          surfaceShadow: true,
          release: 'reset',
          ...forgeOptions.peel,
          residue: false,
        },
        back: { color: '#f1f0eb', gloss: 0.42, roughness: 0.58, ...forgeOptions.back },
        material: { type: 'original', intensity: 0, ...forgeOptions.material },
        sound: { enabled: false, volume: 0, ...forgeOptions.sound },
        tilt: forgeOptions.tilt ?? tilt,
        wind: forgeOptions.wind ?? 0.08,
        quality: forgeOptions.quality ?? 'medium',
        ...getDisplayOptions(),
      }))
      .then((createdSticker) => {
        instance = createdSticker;
        if (disposed) {
          createdSticker.destroy();
          return;
        }
        createdSticker.setRenderScale(renderScale);
        mount.querySelector('canvas')?.style.setProperty('outline', 'none');
        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => {
            createdSticker.setOptions(getDisplayOptions());
            createdSticker.resize();
          });
          resizeObserver.observe(frame);
        }
        setEnterDelayMs(nextStickerEnterDelay());
        setIsReady(true);
      })
      .catch((error) => {
        if (!disposed) console.error(error);
      });

    return () => {
      disposed = true;
      setIsReady(false);
      resizeObserver?.disconnect();
      instance?.destroy();
    };
  }, [alt, aspect, enabled, forgeOptions, renderScale, src, tilt]);

  return (
    <div
      ref={frameRef}
      className={`aqua-forge-sticker${enabled ? ' is-forge-on' : ''}${isReady ? ' is-ready' : ''}${isPeeling ? ' is-peeling' : ''}${className ? ` ${className}` : ''}`}
      style={{
        ...style,
        '--sticker-enter-delay': `${enterDelayMs}ms`,
      }}
      aria-hidden={alt ? undefined : true}
      aria-label={alt || undefined}
    >
      {fallbackSrc && (
        <img
          src={fallbackSrc}
          alt=""
          aria-hidden="true"
          className={`aqua-forge-sticker__fallback${isReady ? ' is-ready' : ''}`}
          style={{ filter: surfaceFilter }}
          draggable={false}
          decoding="async"
        />
      )}
      <div
        ref={mountRef}
        data-sticker-peel
        className={`aqua-forge-sticker__mount${isPeeling ? ' is-peeling' : ''}${isReady ? ' is-ready' : ''}`}
        style={{ filter: surfaceFilter }}
      />
    </div>
  );
};

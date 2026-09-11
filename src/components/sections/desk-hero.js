import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  Bluetooth,
  Headphones,
  Wifi,
} from 'lucide-react';
import DecryptedText from '../ui/DecryptedText';
import WarpText from '../ui/WarpText';
import { MorphCurveWipe } from '../ui/morph-curve-wipe';
import ClassicMacScreenModel from '../three/ClassicMacScreenModel';
import { OsDesktop } from './os-desktop';

class MacRevealBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <p className="classic-mac-model__status classic-mac-model__status--error">
          3D model unavailable
        </p>
      );
    }
    return this.props.children;
  }
}

const deskEntrance = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
};

let stickerForgeLoader;

const emptyForgeOptions = {};

const sharedStickerForgeOptions = {
  outline: { width: 16, color: '#f2eee8' },
  edge: { width: 2.3, strength: 0.65 },
  shadow: { color: '#191823', opacity: 0.2, blur: 20, distance: 14, angle: 42 },
  lighting: {
    direction: { x: -0.38, y: 0.52, z: 0.76 },
    intensity: 0.76,
    ambient: 0.34,
    softness: 0.62,
  },
  peel: {
    radius: 0.12,
    stiffness: 0.72,
    grabWidth: 22,
    maxAngle: 3.55,
    release: 'snap',
  },
  sound: { enabled: true, volume: 0.68 },
  back: { color: '#eeeae4', gloss: 0.62, roughness: 0.38 },
  material: {
    type: 'original',
    intensity: 0.8,
    scale: 1,
    holographicGrain: 0.72,
    seed: 0.37,
    holographicColors: ['#f2a7c5', '#8edfd5', '#9db4ea'],
  },
  wind: 0.25,
  quality: 'high',
};

const macBookStickerForgeOptions = {
  ...sharedStickerForgeOptions,
  edge: { ...sharedStickerForgeOptions.edge, width: 1.4, strength: 0.38 },
  shadow: { ...sharedStickerForgeOptions.shadow, opacity: 0.1, blur: 5, distance: 2 },
};

const headphoneStickerForgeOptions = {
  ...sharedStickerForgeOptions,
  outline: { ...sharedStickerForgeOptions.outline, width: 15, color: '#eae5dd' },
  edge: { ...sharedStickerForgeOptions.edge, width: 2.2, strength: 0.6 },
  shadow: { ...sharedStickerForgeOptions.shadow, opacity: 0.18, blur: 18, distance: 12 },
  lighting: { ...sharedStickerForgeOptions.lighting, intensity: 0.72, ambient: 0.32, softness: 0.66 },
  back: { ...sharedStickerForgeOptions.back, color: '#e7e2da', gloss: 0.56, roughness: 0.44 },
  material: { ...sharedStickerForgeOptions.material, intensity: 0.74 },
};

const deskStickerSurfaceFilter = 'brightness(0.98) saturate(0.96) contrast(0.99) sepia(0.01)';
const headphoneStickerSurfaceFilter = 'brightness(0.93) saturate(0.88) contrast(0.98) sepia(0.03)';

const stickerPreviews = [
  { src: '/images/desk/stickers/preview/origin-tattoo.png', alt: 'Origin Tattoo Killer sticker', aspect: 624 / 507, scale: 0.74, tilt: -5 },
  { src: '/images/desk/stickers/preview/chill.png', alt: 'Chill sticker', aspect: 718 / 517, scale: 0.78, tilt: 4 },
  { src: '/images/desk/stickers/preview/gojira.png', alt: 'Gojira sticker', aspect: 587 / 626, scale: 0.67, tilt: -3 },
  { src: '/images/desk/stickers/preview/nasa-meatball.png', alt: 'NASA meatball sticker', aspect: 415 / 343, scale: 0.7, tilt: 5 },
  { src: '/images/desk/stickers/preview/nasa-retro.png', alt: 'Retro NASA sticker', aspect: 1, scale: 0.68, tilt: -4 },
  { src: '/images/desk/stickers/preview/nasa-wordmark.png', alt: 'NASA wordmark sticker', aspect: 416 / 319, scale: 0.76, tilt: 3 },
  { src: '/images/desk/stickers/preview/ares.png', alt: 'Ares mission sticker', aspect: 384 / 340, scale: 0.7, tilt: -5 },
  { src: '/images/desk/stickers/preview/nasa-rocket.png', alt: 'NASA rocket sticker', aspect: 342 / 397, scale: 0.64, tilt: 4 },
];

const headphoneStickerPlacements = [
  { ...stickerPreviews[0], displayScale: 0.68, tilt: -7, zIndex: 31, className: 'left-[15%] top-[52%] w-[31%]' },
  { src: '/images/desk/stickers/preview/phone-dogs.png', alt: 'Double phone dogs sticker', aspect: 452 / 302, displayScale: 0.67, tilt: 5, zIndex: 32, className: 'left-[23%] top-[58%] w-[30%]' },
  { ...stickerPreviews[1], displayScale: 0.62, tilt: -4, zIndex: 33, className: 'left-[20%] top-[66%] w-[29.1%]' },
  { ...stickerPreviews[2], displayScale: 0.64, tilt: 7, zIndex: 34, className: 'left-[16%] top-[63%] w-[24.25%]' },
  { ...stickerPreviews[4], displayScale: 0.72, tilt: 6, zIndex: 31, className: 'left-[55%] top-[60%] w-[23.28%]' },
  { src: '/images/desk/stickers/preview/red-spike-head.png', alt: 'Red spike head sticker', aspect: 453 / 351, displayScale: 0.68, tilt: -5, zIndex: 35, className: 'left-[52%] top-[63%] w-[27.16%]' },
  { ...stickerPreviews[6], displayScale: 0.65, tilt: 3, zIndex: 33, className: 'left-[60%] top-[69%] w-[26.19%]' },
  { ...stickerPreviews[7], displayScale: 0.68, tilt: -7, zIndex: 34, className: 'left-[69%] top-[62%] w-[24.25%]' },
];

const DESK_MACBOOK_SRC = '/images/desk/processed/macbook-clean.png';
const DESK_IPAD_SRC = '/images/desk/reference/ipad-pro-dark-clock.webp';
const DESK_PENCIL_SRC = '/images/desk/reference/apple-pencil-pro.png';
const DESK_HEADPHONES_SRC = '/images/desk/reference/headphones.png';
const DESK_MOUSE_SRC = '/images/desk/reference/pencil.png';
const DESK_HELLO_STICKER_SRC = '/images/desk/stickers/hello-workbench-original.png';
const DESK_MAC_STICKER_SRC = '/images/desk/stickers/mac-sticker.png';
const STICKER_FORGE_SRC = '/vendor/sticker-forge/sticker-forge.iife.js';
const LAYER_EASE = [0.22, 1, 0.36, 1];
const LAYER_FADE = 0.38;

const deskHeroImageSrcs = Array.from(new Set([
  DESK_MACBOOK_SRC,
  DESK_IPAD_SRC,
  DESK_PENCIL_SRC,
  DESK_HEADPHONES_SRC,
  DESK_MOUSE_SRC,
  DESK_HELLO_STICKER_SRC,
  DESK_MAC_STICKER_SRC,
  ...stickerPreviews.map((item) => item.src),
  ...headphoneStickerPlacements.map((item) => item.src),
]));

const deskSpotlightPositions = {
  ipad: { x: 14, y: 36 },
  pencil: { x: 28, y: 26 },
  macbook: { x: 50, y: 30 },
  mouse: { x: 72, y: 38 },
  headphones: { x: 86, y: 29 },
};

const hudLines = [
  'Independent Studio',
  'Product Direction_',
  'HQ://Jason.Space',
];

const loadStickerForge = () => {
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
    }
  });

  return stickerForgeLoader;
};

const injectPreload = (href, as, fetchPriority) => {
  if (typeof document === 'undefined') return;
  if (document.querySelector(`link[rel="preload"][href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = href;
  if (fetchPriority) link.fetchPriority = fetchPriority;
  document.head.appendChild(link);
};

const kickoffDeskHeroPreload = () => {
  if (typeof window === 'undefined') return;
  injectPreload(DESK_MACBOOK_SRC, 'image', 'high');
  injectPreload(DESK_IPAD_SRC, 'image');
  injectPreload(DESK_HEADPHONES_SRC, 'image');
  injectPreload(DESK_PENCIL_SRC, 'image');
  injectPreload(STICKER_FORGE_SRC, 'script');
  injectPreload('/models/Mac1-screen-updated.glb', 'fetch');
  deskHeroImageSrcs.forEach((src) => {
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
  });
  loadStickerForge();
};

kickoffDeskHeroPreload();

const markDecoded = (image, onReady) => {
  if (typeof image.decode === 'function') {
    image.decode().then(onReady).catch(onReady);
    return;
  }
  onReady();
};

const useImageReady = (src) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    const image = new Image();
    const finish = () => {
      if (!disposed) setReady(true);
    };

    image.decoding = 'async';
    image.onload = () => markDecoded(image, finish);
    image.onerror = finish;
    image.src = src;
    if (image.complete && image.naturalWidth > 0) markDecoded(image, finish);

    return () => {
      disposed = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [src]);

  return ready;
};

const DeskPhoto = ({
  src,
  alt,
  className,
  style,
  poseHidden,
  poseShown,
  fadeDuration = LAYER_FADE,
  fetchPriority,
  whileHover,
  onHoverStart,
  onHoverEnd,
  ...rest
}) => {
  const ready = useImageReady(src);

  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      initial={{ opacity: 0, ...poseHidden }}
      animate={ready ? { opacity: 1, ...poseShown } : { opacity: 0, ...poseHidden }}
      transition={{ duration: fadeDuration, ease: LAYER_EASE }}
      whileHover={whileHover}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      draggable={false}
      decoding="async"
      fetchPriority={fetchPriority}
    />
  );
};

const ForgeSticker = ({
  src,
  alt,
  className,
  delay = 0.45,
  tilt = 0,
  forgeOptions = emptyForgeOptions,
  displayScale,
  displayAspect,
  renderScale = 2,
  zIndex = 30,
  surfaceFilter = 'none',
}) => {
  const frameRef = useRef(null);
  const mountRef = useRef(null);
  const peelResetTimerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
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
    let disposed = false;
    let instance;
    let resizeObserver;
    const frame = frameRef.current;
    const mount = mountRef.current;
    const getDisplayOptions = () => {
      if (!frame || !displayScale || !displayAspect) return {};
      const width = Math.max(1, frame.clientWidth * displayScale);
      return { display: { width, height: width / displayAspect } };
    };

    loadStickerForge()
      .then((api) => api.createSticker(mount, {
        source: { type: 'image', src, name: alt },
        outline: { width: 2, color: '#f8f8f6', ...forgeOptions.outline },
        edge: { width: 1.4, strength: 0.5, ...forgeOptions.edge },
        shadow: {
          color: '#050505',
          opacity: 0.25,
          blur: 9,
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
        if (frame && displayScale && displayAspect && typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => {
            createdSticker.setOptions(getDisplayOptions());
            createdSticker.resize();
          });
          resizeObserver.observe(frame);
        }
        setIsReady(true);
      })
      .catch((error) => {
        if (!disposed) console.error(error);
      });

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      instance?.destroy();
    };
  }, [alt, displayAspect, displayScale, forgeOptions, renderScale, src, tilt]);

  const mountScale = 2.2;
  const restingPadding = 0.16;
  const restingWidth = (displayScale || 0.58) + restingPadding;
  const restingHeight = (displayAspect ? (displayScale || 0.58) / displayAspect : (displayScale || 0.58)) + restingPadding;
  const restingInsetX = Math.max(0, (1 - Math.min(mountScale, restingWidth) / mountScale) * 50);
  const restingInsetY = Math.max(0, (1 - Math.min(mountScale, restingHeight) / mountScale) * 50);
  const visible = Boolean(fallbackSrc);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.96 }}
      transition={{ duration: LAYER_FADE, delay: visible ? Math.min(delay * 0.18, 0.1) : 0, ease: LAYER_EASE }}
      ref={frameRef}
      className={`pointer-events-auto absolute z-30 aspect-square overflow-visible ${className}`}
      style={{ zIndex }}
      aria-label={alt}
    >
      {fallbackSrc && (
        <img
          src={fallbackSrc}
          alt=""
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 m-auto h-auto select-none object-contain transition-opacity duration-300 ${isReady ? 'opacity-0' : 'opacity-100'}`}
          style={{
            width: displayScale ? `${displayScale * 100}%` : '58%',
            filter: surfaceFilter,
          }}
          draggable={false}
          decoding="async"
        />
      )}
      <div
        ref={mountRef}
        className={`absolute inset-[-60%] overflow-visible transition-opacity duration-300 [&_canvas]:outline-none ${isReady ? 'opacity-100' : 'opacity-0'}`}
        style={{
          clipPath: isPeeling ? 'inset(0)' : `inset(${restingInsetY}% ${restingInsetX}%)`,
          filter: surfaceFilter,
        }}
      />
    </motion.div>
  );
};

const MacBookLayer = ({ isFocused, onFocus, onBlur }) => {
  const macbookReady = useImageReady(DESK_MACBOOK_SRC);

  return (
  <div
    className="pointer-events-none absolute left-1/2 top-[23.5%] z-10 w-[64vw] max-w-[535px] -translate-x-1/2 -translate-y-1/2 sm:top-[27%] sm:w-[58vw] lg:left-[49.3%] lg:top-[32%] lg:w-[535px]"
    style={{ zIndex: isFocused ? 24 : 10 }}
  >
    <motion.div
      className="pointer-events-auto relative w-full aspect-[833/801]"
      onHoverStart={onFocus}
      onHoverEnd={onBlur}
      whileHover={{
        y: -4,
        scale: 1.04,
        filter: 'brightness(1.055) saturate(1.02) drop-shadow(0 14px 20px rgba(0,0,0,0.3))',
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
      }}
      style={{ transformOrigin: '50% 52%' }}
    >
      <motion.img
        src={DESK_MACBOOK_SRC}
        alt="MacBook Pro"
        className="pointer-events-auto absolute inset-0 z-10 h-full w-full object-contain"
        initial={{ opacity: 0 }}
        animate={{ opacity: macbookReady ? 1 : 0 }}
        transition={{ duration: 0.34, ease: LAYER_EASE }}
        decoding="async"
        fetchPriority="high"
        draggable={false}
      />
      <ForgeSticker
        src={DESK_HELLO_STICKER_SRC}
        alt="Peelable hello sticker"
        delay={0.52}
        tilt={-3}
        displayScale={0.82}
        displayAspect={1}
        forgeOptions={macBookStickerForgeOptions}
        surfaceFilter={deskStickerSurfaceFilter}
        className="left-[-3%] top-[62%] w-[45%]"
      />
      <ForgeSticker
        src={DESK_MAC_STICKER_SRC}
        alt="Peelable classic Mac sticker"
        delay={0.6}
        tilt={6}
        displayScale={0.58}
        displayAspect={1}
        forgeOptions={sharedStickerForgeOptions}
        surfaceFilter={deskStickerSurfaceFilter}
        className="right-[9%] top-[74%] w-[21%]"
      />
    </motion.div>
  </div>
  );
};

const formatDeskTime = (date) => new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
}).format(date);

const DeskStatusBar = () => {
  const [now, setNow] = useState(() => new Date());
  const [isOnline, setIsOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine);
  const [battery, setBattery] = useState({ level: null, charging: null });

  useEffect(() => {
    const clock = window.setInterval(() => setNow(new Date()), 1000);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.clearInterval(clock);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    let batteryManager;
    let syncBattery;

    if (typeof navigator === 'undefined' || typeof navigator.getBattery !== 'function') return undefined;

    navigator.getBattery().then((manager) => {
      if (disposed) return;
      batteryManager = manager;
      syncBattery = () => setBattery({ level: manager.level, charging: manager.charging });
      syncBattery();
      manager.addEventListener('levelchange', syncBattery);
      manager.addEventListener('chargingchange', syncBattery);
    }).catch(() => {});

    return () => {
      disposed = true;
      if (!batteryManager || !syncBattery) return;
      batteryManager.removeEventListener('levelchange', syncBattery);
      batteryManager.removeEventListener('chargingchange', syncBattery);
    };
  }, []);

  const batteryPercent = battery.level === null ? null : Math.round(battery.level * 100);
  const BatteryIcon = battery.charging
    ? BatteryCharging
    : batteryPercent === null
      ? Battery
      : batteryPercent >= 67
        ? BatteryFull
        : batteryPercent >= 30
          ? BatteryMedium
          : BatteryLow;
  const batteryLabel = batteryPercent === null
    ? 'Battery status unavailable in this browser'
    : `${batteryPercent}%${battery.charging ? ' · Charging' : ''}`;

  return (
    <div className="pointer-events-none absolute right-5 top-4 z-[60] flex items-center gap-3 text-white/60 sm:right-7 sm:top-5 sm:gap-4">
      <Wifi className={`h-[15px] w-[15px] sm:h-4 sm:w-4 ${isOnline ? 'text-white/65' : 'text-white/25'}`} aria-label={isOnline ? 'Online' : 'Offline'} />
      <Headphones className="h-[15px] w-[15px] sm:h-4 sm:w-4" aria-hidden="true" />
      <Bluetooth className="h-[15px] w-[15px] sm:h-4 sm:w-4" aria-hidden="true" />
      <div className="flex items-center gap-1" title={batteryLabel} aria-label={batteryLabel}>
        <BatteryIcon className="h-[18px] w-[18px] sm:h-[19px] sm:w-[19px]" />
        {batteryPercent !== null && <span className="text-[11px] font-medium tabular-nums text-white/65 sm:text-xs">{batteryPercent}%</span>}
      </div>
      <time dateTime={now.toISOString()} className="whitespace-nowrap text-[13px] font-medium tabular-nums text-white/65 sm:text-sm">
        {formatDeskTime(now)}
      </time>
    </div>
  );
};

const ENTER_MODEL = 0.34;
const START_WIPE = 0.72;
const ENTER_DESKTOP = 0.9;
const MODEL_REST = (ENTER_MODEL + START_WIPE) / 2;

const prefersReducedMotion = () => (
  typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

export const DeskHero = () => {
  const [focusedObject, setFocusedObject] = useState(null);
  const [spotlightObject, setSpotlightObject] = useState('macbook');
  const [progress, setProgress] = useState(0);
  const [desktopLocked, setDesktopLocked] = useState(false);
  const [modelMounted, setModelMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const focusClearTimerRef = useRef(null);
  const leaveDesktopRef = useRef(false);
  const desktopLockedRef = useRef(false);
  const pendingScrollRef = useRef(null);
  const leaveToModelRef = useRef(() => {});
  const spotlightPosition = deskSpotlightPositions[spotlightObject];
  const headphonesReady = useImageReady(DESK_HEADPHONES_SRC);

  useEffect(() => () => window.clearTimeout(focusClearTimerRef.current), []);

  useEffect(() => {
    setReduceMotion(prefersReducedMotion());
  }, []);

  const focusObject = (objectName) => {
    window.clearTimeout(focusClearTimerRef.current);
    setSpotlightObject(objectName);
    setFocusedObject(objectName);
  };
  const clearFocus = (objectName) => {
    window.clearTimeout(focusClearTimerRef.current);
    focusClearTimerRef.current = window.setTimeout(() => {
      setFocusedObject((currentObject) => (currentObject === objectName ? null : currentObject));
    }, 80);
  };

  useLayoutEffect(() => {
    if (reduceMotion) return undefined;

    const syncProgress = () => {
      if (leaveDesktopRef.current || desktopLockedRef.current) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const next = max <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max));
      setProgress(next);
    };

    const jump = Number(new URLSearchParams(window.location.search).get('enter'));
    if (jump > 0) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.min(1, jump) * Math.max(max, 0));
      setProgress(Math.min(1, jump));
    } else {
      syncProgress();
    }

    window.addEventListener('scroll', syncProgress, { passive: true });
    window.addEventListener('resize', syncProgress);
    return () => {
      window.removeEventListener('scroll', syncProgress);
      window.removeEventListener('resize', syncProgress);
    };
  }, [reduceMotion]);

  desktopLockedRef.current = desktopLocked;
  const entered = desktopLocked || progress >= ENTER_DESKTOP;
  const deskOpacity = entered ? 0 : Math.max(0, 1 - progress / ENTER_MODEL);
  const modelOpacity = entered
    ? 0
    : progress <= 0.06
      ? 0
      : progress < ENTER_MODEL
        ? (progress - 0.06) / (ENTER_MODEL - 0.06)
        : progress <= START_WIPE
          ? 1
          : Math.max(0, 1 - (progress - START_WIPE) / (ENTER_DESKTOP - START_WIPE));
  const morphProgress = entered
    ? 1
    : Math.min(1, Math.max(0, (progress - START_WIPE) / (ENTER_DESKTOP - START_WIPE)));

  useEffect(() => {
    if (progress >= ENTER_DESKTOP) setDesktopLocked(true);
  }, [progress]);

  useEffect(() => {
    if (progress > 0.04 && !entered) setModelMounted(true);
  }, [entered, progress]);

  useEffect(() => {
    if (!entered) return undefined;
    const timer = window.setTimeout(() => setModelMounted(false), 480);
    return () => window.clearTimeout(timer);
  }, [entered]);

  const leaveToModel = () => {
    leaveDesktopRef.current = true;
    pendingScrollRef.current = MODEL_REST;
    setDesktopLocked(false);
    setProgress(MODEL_REST);
    setModelMounted(true);
  };
  leaveToModelRef.current = leaveToModel;

  useLayoutEffect(() => {
    if (pendingScrollRef.current == null) return;
    const target = pendingScrollRef.current;
    pendingScrollRef.current = null;
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, target * Math.max(max, 0));
    window.requestAnimationFrame(() => {
      leaveDesktopRef.current = false;
    });
  }, [desktopLocked]);

  useEffect(() => {
    if (!entered) return undefined;

    let touchStartY = 0;
    const pin = () => {
      if (leaveDesktopRef.current) return;
      if (window.scrollY > 0) window.scrollTo(0, 0);
    };
    const prevent = (event) => {
      if (event.deltaY < -12) {
        event.preventDefault();
        leaveToModelRef.current();
        return;
      }
      event.preventDefault();
      pin();
    };
    const onTouchStart = (event) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event) => {
      const dy = (event.touches[0]?.clientY ?? touchStartY) - touchStartY;
      if (dy > 24) {
        event.preventDefault();
        leaveToModelRef.current();
        return;
      }
      event.preventDefault();
      pin();
    };
    const onKey = (event) => {
      if (['ArrowUp', 'PageUp', 'Home'].includes(event.key)) {
        event.preventDefault();
        leaveToModelRef.current();
        return;
      }
      if (['ArrowDown', 'PageDown', 'End', ' '].includes(event.key)) {
        event.preventDefault();
      }
    };

    pin();
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('wheel', prevent, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('scroll', pin);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener('wheel', prevent);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('scroll', pin);
      window.removeEventListener('keydown', onKey);
    };
  }, [entered]);

  const chromeOpacity = Math.max(0, 1 - progress / (ENTER_MODEL * 0.62));
  const hintOpacity = Math.max(0, 1 - progress / (ENTER_MODEL * 0.5));
  const deskLayerStyle = entered || deskOpacity < 0.02
    ? { opacity: 0, visibility: 'hidden', pointerEvents: 'none' }
    : { opacity: deskOpacity };

  return (
    <div className={reduceMotion ? 'relative' : `relative ${entered ? 'h-[100svh] overflow-hidden' : 'h-[360vh]'}`}>
      <div className={`${reduceMotion ? 'relative' : 'fixed inset-0'} z-10 overflow-hidden text-white ${entered ? 'bg-[#f5f5f5]' : 'bg-black'}`}>
        <div className="desk-intro-stage relative isolate h-full min-h-[100svh] w-full">
          <div data-desk-layer className="absolute inset-0 z-[2] translate-y-[15vh] sm:translate-y-[16vh]" style={deskLayerStyle}>
          <div data-desk-mat className="pointer-events-none absolute left-1/2 top-[12%] z-[2] h-[48%] w-[95%] max-w-[1320px] -translate-x-1/2 overflow-hidden rounded-[16px] border-2 border-[#121110] bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03),inset_0_0_0_3px_rgba(0,0,0,0.4)] sm:top-[13%] sm:h-[52%] sm:w-[95%]">
            <div
              className="absolute inset-[5px] rounded-[11px] border border-dashed border-white/[0.04] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.5),inset_0_0_18px_rgba(0,0,0,0.35)]"
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 54%, rgba(48,32,28,0.18) 0%, rgba(12,11,11,0.55) 34%, rgba(0,0,0,0.92) 78%), repeating-linear-gradient(0deg, rgba(255,255,255,0.006) 0px, rgba(255,255,255,0.006) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 4px)',
              }}
            />
          </div>
          </div>
          <div data-desk-layer className="absolute inset-0 z-10 translate-y-[15vh] sm:translate-y-[16vh]" style={deskLayerStyle}>
          <div className="relative z-10 mx-auto h-full w-full max-w-[1440px] overflow-visible">
            <motion.div
              aria-hidden="true"
              data-desk-fade
              className="pointer-events-none absolute inset-0 z-20"
              initial={{
                opacity: 0,
                background: `radial-gradient(ellipse 31% 42% at ${deskSpotlightPositions.macbook.x}% ${deskSpotlightPositions.macbook.y}%, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.012) 28%, rgba(0,0,0,0.055) 58%, rgba(0,0,0,0.25) 100%)`,
              }}
              animate={{
                opacity: focusedObject ? chromeOpacity : 0,
                background: `radial-gradient(ellipse 31% 42% at ${spotlightPosition.x}% ${spotlightPosition.y}%, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.012) 28%, rgba(0,0,0,0.055) 58%, rgba(0,0,0,0.25) 100%)`,
              }}
              transition={{
                opacity: focusedObject
                  ? { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                  : { duration: 0.72, delay: 0.04, ease: [0.4, 0, 0.2, 1] },
                background: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
              }}
            />

            <DeskPhoto
              data-desk-fade
              src={DESK_IPAD_SRC}
              alt="iPad Pro showing a dark editorial clock screen"
              poseHidden={{ rotate: -44, scale: 0.94 }}
              poseShown={{ rotate: -38, scale: 1 }}
              fadeDuration={0.4}
              onHoverStart={() => focusObject('ipad')}
              onHoverEnd={() => clearFocus('ipad')}
              whileHover={{
                y: -4,
                scale: 1.05,
                rotate: -36.5,
                filter: 'brightness(1.065) saturate(1.025) drop-shadow(0 14px 18px rgba(0,0,0,0.32))',
                transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
              }}
              className="pointer-events-auto absolute left-[-4%] top-[32%] z-[8] w-[38%] select-none object-contain drop-shadow-[0_18px_18px_rgba(0,0,0,0.32)] sm:left-[0%] sm:top-[26%] sm:w-[27.5%] lg:left-[3%] lg:top-[25%] lg:w-[22.8%]"
              style={{ zIndex: focusedObject === 'ipad' ? 24 : 8 }}
            />

            <DeskPhoto
              data-desk-fade
              src={DESK_PENCIL_SRC}
              alt="Apple Pencil Pro"
              poseHidden={{ rotate: -22, scale: 0.9 }}
              poseShown={{ rotate: -17, scale: 1 }}
              fadeDuration={0.36}
              onHoverStart={() => focusObject('pencil')}
              onHoverEnd={() => clearFocus('pencil')}
              whileHover={{
                y: -4,
                scale: 1.06,
                rotate: -15.5,
                filter: 'brightness(1.07) drop-shadow(0 11px 14px rgba(0,0,0,0.32))',
                transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
              }}
              className="pointer-events-auto absolute left-[25%] top-[21%] z-[9] hidden h-[17%] w-auto select-none object-contain drop-shadow-[0_8px_8px_rgba(0,0,0,0.3)] sm:block lg:left-[26.5%] lg:top-[20%] lg:h-[18%]"
              style={{ zIndex: focusedObject === 'pencil' ? 24 : 9 }}
            />

            <motion.div
              data-desk-fade
              initial={{ opacity: 0, rotate: 18, scale: 0.9 }}
              animate={{
                opacity: headphonesReady ? 1 : 0,
                rotate: headphonesReady ? 25 : 18,
                scale: headphonesReady ? 1 : 0.9,
              }}
              onHoverStart={() => focusObject('headphones')}
              onHoverEnd={() => clearFocus('headphones')}
              transition={{ duration: 0.4, ease: LAYER_EASE }}
              whileHover={{
                y: -4,
                rotate: 22,
                scale: 1.04,
                filter: 'brightness(1.065) saturate(1.02) drop-shadow(0 14px 18px rgba(0,0,0,0.32))',
                transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
              }}
              className="absolute right-[-2.8%] top-[18%] z-[9] w-[33.4%] select-none lg:right-[3.4%] lg:top-[12%] lg:w-[19.86%]"
              style={{ zIndex: focusedObject === 'headphones' ? 24 : 9 }}
            >
              <img
                src={DESK_HEADPHONES_SRC}
                alt="AirPods Max"
                className="pointer-events-none h-auto w-full object-contain"
                draggable={false}
                decoding="async"
              />
              {headphoneStickerPlacements.map((sticker, index) => (
                <ForgeSticker
                  key={sticker.src}
                  src={sticker.src}
                  alt={`${sticker.alt} on AirPods Max`}
                  delay={0.68 + index * 0.045}
                  tilt={sticker.tilt}
                  displayScale={sticker.displayScale}
                  displayAspect={sticker.aspect}
                  forgeOptions={headphoneStickerForgeOptions}
                  surfaceFilter={headphoneStickerSurfaceFilter}
                  zIndex={sticker.zIndex}
                  className={sticker.className}
                />
              ))}
            </motion.div>

            <MacBookLayer
              isFocused={focusedObject === 'macbook'}
              onFocus={() => focusObject('macbook')}
              onBlur={() => clearFocus('macbook')}
            />

            <DeskPhoto
              data-desk-fade
              src={DESK_MOUSE_SRC}
              alt="Magic Mouse"
              poseHidden={{ rotate: -8, y: -20 }}
              poseShown={{ rotate: -16, y: 0 }}
              fadeDuration={0.34}
              onHoverStart={() => focusObject('mouse')}
              onHoverEnd={() => clearFocus('mouse')}
              whileHover={{
                y: -4,
                scale: 1.06,
                rotate: -14.5,
                filter: 'brightness(1.075) drop-shadow(0 11px 15px rgba(0,0,0,0.33))',
                transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
              }}
              className="pointer-events-auto absolute right-[28%] top-[33%] z-[18] w-[6%] select-none object-contain lg:right-[27.2%] lg:top-[34.2%] lg:w-[4%]"
              style={{ zIndex: focusedObject === 'mouse' ? 24 : 18 }}
            />
          </div>
          </div>

          <div
            data-desk-layer
            style={{
              opacity: entered ? 0 : chromeOpacity,
              visibility: entered ? 'hidden' : 'visible',
              pointerEvents: entered || chromeOpacity < 0.2 ? 'none' : 'auto',
            }}
          >
            <DeskStatusBar />
          </div>
        </div>

        <div
          data-desk-hud
          data-desk-layer
          className="pointer-events-none absolute inset-0 z-[70]"
          style={{
            opacity: entered ? 0 : chromeOpacity,
            visibility: entered ? 'hidden' : 'visible',
          }}
        >
          <div className="pointer-events-auto absolute left-4 top-3 w-[min(90vw,36rem)] cursor-pointer sm:left-6 sm:top-4">
            <WarpText
              text="Jason's Space"
              color="#f4f1ea"
              align="left"
              warpStrength={0.08}
              warpScale={1.7}
              speed={0.55}
              pointerInfluence={0.42}
              pointerStrength={0.38}
              refraction={0.018}
              fontFamily="'Geist Pixel', 'ZhengGe DianHei', 'PingFang SC', sans-serif"
              fontSize="clamp(2.4rem, 4.8vw, 3.75rem)"
              fontWeight={800}
              letterSpacing="-0.06em"
              lineHeight={0.9}
              className="h-[clamp(3.2rem,6.4vw,4.8rem)] w-full"
            />
          </div>
          <div className="absolute bottom-6 right-4 text-right sm:bottom-8 sm:right-7">
            <div className="flex flex-col items-end gap-0 text-[22px] leading-8 tracking-[-0.012em] text-white/92 sm:text-[24px] sm:leading-9">
              {hudLines.map((line, index) => (
                <DecryptedText
                  key={line}
                  text={line}
                  speed={32}
                  maxIterations={10}
                  sequential
                  revealDirection="start"
                  animateOn="loop"
                  startDelay={index * 220}
                  loopHold={5600}
                  characters="ABCDEFGHJKLMNPQRSTUVWXYZ0123456789@#$%&*"
                  parentClassName="block whitespace-nowrap"
                  className="text-white/90"
                  encryptedClassName="text-white/30"
                />
              ))}
            </div>
          </div>
        </div>

        {!reduceMotion && (
          <div
            data-scroll-hint
            data-desk-layer
            className="pointer-events-none absolute bottom-[5.5%] left-1/2 z-[80] flex -translate-x-1/2 flex-col items-center gap-2 text-[11px] tracking-[0.18em] text-white/55 sm:bottom-[6%] sm:text-xs"
            style={{
              opacity: entered ? 0 : hintOpacity,
              visibility: entered ? 'hidden' : 'visible',
            }}
          >
            <span>SCROLL DOWN TO ENTER</span>
            <svg
              className="desk-scroll-hint__mouse"
              width="18"
              height="28"
              viewBox="0 0 18 28"
              fill="none"
              aria-hidden="true"
            >
              <rect x="1" y="1" width="16" height="26" rx="8" stroke="currentColor" strokeWidth="1.4" />
              <rect x="8" y="6" width="2" height="6" rx="1" fill="currentColor" />
            </svg>
          </div>
        )}

        {!reduceMotion && (
          <div
            className="absolute inset-0 z-[50] bg-[#050505]"
            style={{
              opacity: modelOpacity,
              visibility: modelOpacity < 0.01 ? 'hidden' : 'visible',
              pointerEvents: modelOpacity > 0.45 && !entered ? 'auto' : 'none',
            }}
            aria-hidden={modelOpacity < 0.01}
          >
            {modelMounted && (
              <MacRevealBoundary>
                <ClassicMacScreenModel className="h-full w-full" />
              </MacRevealBoundary>
            )}
            <div
              className="pointer-events-none absolute bottom-[5.5%] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[11px] tracking-[0.18em] text-white/45 sm:bottom-[6%] sm:text-xs"
              style={{ opacity: progress >= ENTER_MODEL && progress < START_WIPE ? 1 : 0 }}
            >
              <span>SCROLL TO ENTER DESKTOP</span>
              <svg
                className="desk-scroll-hint__mouse"
                width="18"
                height="28"
                viewBox="0 0 18 28"
                fill="none"
                aria-hidden="true"
              >
                <rect x="1" y="1" width="16" height="26" rx="8" stroke="currentColor" strokeWidth="1.4" />
                <rect x="8" y="6" width="2" height="6" rx="1" fill="currentColor" />
              </svg>
            </div>
          </div>
        )}

        {!reduceMotion && (
          <MorphCurveWipe
            className="z-[90]"
            progress={morphProgress}
            entered={entered}
          >
            <OsDesktop
              className="absolute inset-0 h-full w-full"
              interactive={entered}
              onBack={leaveToModel}
              scanlineOpacity={entered ? 0 : 1}
              style={{
                opacity: 1,
                transform: 'none',
                transformOrigin: '50% 50%',
                pointerEvents: entered ? 'auto' : 'none',
              }}
            />
          </MorphCurveWipe>
        )}
      </div>
    </div>
  );
};

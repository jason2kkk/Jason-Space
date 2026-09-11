import React, { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import DecryptedText from '../ui/DecryptedText';
import Shuffle from '../ui/Shuffle';
import ClassicMacScreenModel from '../three/ClassicMacScreenModel';
import SideRays from '../ui/SideRays';
import { loadStickerForge } from '../ui/forge-sticker';
import { createPageScrollGuard } from '../../lib/page-scroll-lock';

const loadOsDesktop = () => import('./os-desktop');
const OsDesktop = lazy(() => loadOsDesktop().then((mod) => ({ default: mod.OsDesktop })));

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

const hudLines = [
  'AI Product Manager · Indie Developer',
  'Chasing taste and experience',
  'Exploring more interaction',
];

const OVERVIEW_ART_SRC = '/images/素材1.png';
const FALLING_STICKERS = [
  { src: '/images/aqua/stickers/figure.png', left: '8%', size: 58, duration: 18, delay: -3, sway: 34, spin: 13, swayHz: 0.21, spinHz: 0.17 },
  { src: '/images/aqua/stickers/star.png', left: '22%', size: 46, duration: 21, delay: -11, sway: -30, spin: -15, swayHz: 0.24, spinHz: 0.19 },
  { src: '/images/aqua/stickers/snoopy-stamp.png', left: '36%', size: 72, duration: 24, delay: -6, sway: 36, spin: 11, swayHz: 0.18, spinHz: 0.15 },
  { src: '/images/aqua/stickers/bulb.png', left: '51%', size: 40, duration: 16, delay: -14, sway: -32, spin: 14, swayHz: 0.26, spinHz: 0.21 },
  { src: '/images/aqua/stickers/camera.png', left: '64%', size: 54, duration: 20, delay: -8, sway: 31, spin: -12, swayHz: 0.20, spinHz: 0.16 },
  { src: '/images/aqua/stickers/oh-wait.png', left: '78%', size: 88, duration: 22, delay: -16, sway: -33, spin: 10, swayHz: 0.19, spinHz: 0.14 },
  { src: '/images/aqua/stickers/star.png', left: '14%', size: 34, duration: 19, delay: -19, sway: 28, spin: -12, swayHz: 0.23, spinHz: 0.18 },
  { src: '/images/aqua/stickers/figure.png', left: '88%', size: 48, duration: 17, delay: -4, sway: -29, spin: 14, swayHz: 0.25, spinHz: 0.20 },
];
const FALLING_STICKER_SIZE_SCALE = 1.2;
const HUD_DECRYPT_SPEED = 32;
const HUD_LOOP_HOLD = 5600;
const HUD_MAX_LEN = Math.max(...hudLines.map((line) => line.length));
const TWO_PI = Math.PI * 2;
const START_ZOOM = 0.03;
const FILL_SCREEN = 0.70;
const HOME_HIDE_ZOOM = 0.40;
const HOME_SHOW_ZOOM = 0.26;
const HYDRATE_ZOOM = 0.58;
const UNHYDRATE_ZOOM = 0.50;
const FADE_START_ZOOM = 0.70;
const LOCK_ZOOM = 0.96;
const LATE_GAIN = 2.15;
const SETTLE_MS = 120;

const linearZoomFromProgress = (p) => (
  (p - START_ZOOM) / (FILL_SCREEN - START_ZOOM)
);

const zoomFromProgress = (p) => {
  const linear = linearZoomFromProgress(p);
  if (linear <= FADE_START_ZOOM) {
    return Math.min(1, Math.max(0, linear));
  }
  return Math.min(1, FADE_START_ZOOM + (linear - FADE_START_ZOOM) * LATE_GAIN);
};

const easeInOutCubic = (t) => (
  t < 0.5
    ? 4 * t * t * t
    : 1 - (((-2 * t + 2) ** 3) / 2)
);

const fadeFromZoom = (zoom) => {
  if (zoom <= FADE_START_ZOOM) return 0;
  const span = Math.max(0.001, 1 - FADE_START_ZOOM);
  return easeInOutCubic(Math.min(1, (zoom - FADE_START_ZOOM) / span));
};

const prefersReducedMotion = () => (
  typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

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

if (typeof window !== 'undefined') {
  injectPreload('/models/Mac1-screen-updated.glb', 'fetch', 'high');
  injectPreload(OVERVIEW_ART_SRC, 'image');
}

const FallingStickers = ({ reduceMotion }) => {
  const layerRef = useRef(null);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const layer = layerRef.current;
    if (!layer) return undefined;
    const nodes = Array.from(layer.querySelectorAll('[data-flake]'));
    let raf = 0;
    const origin = performance.now();

    const tick = (now) => {
      const t = (now - origin) / 1000;
      nodes.forEach((node, index) => {
        const flake = FALLING_STICKERS[index];
        if (!flake) return;
        const cycle = ((t - flake.delay) % flake.duration + flake.duration) % flake.duration;
        const p = cycle / flake.duration;
        const fall = p * (0.88 + 0.12 * p);
        const y = -16 + 132 * fall;
        const phase = flake.delay * 0.55;
        const swayPhase = t * TWO_PI * flake.swayHz + phase;
        const x = Math.sin(swayPhase) * flake.sway
          + Math.sin(swayPhase * 0.53 + 1.15) * flake.sway * 0.2;
        const rot = Math.sin(t * TWO_PI * flake.spinHz + phase * 0.7) * flake.spin
          + Math.cos(t * TWO_PI * flake.spinHz * 0.64 + 0.9) * flake.spin * 0.22;
        node.style.transform = `translate3d(${x}px, ${y}vh, 0) rotate(${rot}deg)`;
      });
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [reduceMotion]);

  if (reduceMotion) return null;
  return (
    <div ref={layerRef} className="mac-hero__fall" aria-hidden>
      {FALLING_STICKERS.map((flake, index) => (
        <div
          key={`${flake.src}-${index}`}
          data-flake
          className="mac-hero__flake"
          style={{
            left: flake.left,
            width: flake.size * FALLING_STICKER_SIZE_SCALE,
          }}
        >
          <img
            className="mac-hero__flake-face"
            src={flake.src}
            alt=""
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
};

const ScrollHint = ({ layerRef, label }) => (
  <div
    ref={layerRef}
    data-scroll-hint
    className="mac-hero__scroll-hint pointer-events-none absolute bottom-[5%] left-1/2 z-[80] flex -translate-x-1/2 flex-col items-center gap-2.5 text-[12px] font-bold tracking-[0.18em] text-white/55 sm:bottom-[4%] sm:text-[13px]"
  >
    <span className="font-bold">{label}</span>
    <svg
      className="desk-scroll-hint__mouse mac-hero__scroll-icon"
      width="28"
      height="44"
      viewBox="0 0 18 28"
      fill="none"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="16" height="26" rx="8" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8" y="6" width="2" height="6" rx="1" fill="currentColor" />
    </svg>
  </div>
);

const applyLayerFade = (node, value, pointerAt) => {
  if (!node) return;
  node.style.opacity = String(value);
  node.style.visibility = value < 0.01 ? 'hidden' : 'visible';
  if (pointerAt != null) {
    node.style.pointerEvents = value > pointerAt ? 'auto' : 'none';
  }
};

export const MacHero = () => {
  const [desktopLocked, setDesktopLocked] = useState(false);
  const [modelMounted, setModelMounted] = useState(true);
  const [desktopReady, setDesktopReady] = useState(false);
  const [desktopSettled, setDesktopSettled] = useState(false);
  const [homeLive, setHomeLive] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const leaveDesktopRef = useRef(false);
  const desktopLockedRef = useRef(false);
  const desktopReadyRef = useRef(false);
  const homeLiveRef = useRef(true);
  const progressRef = useRef(0);
  const pendingScrollRef = useRef(null);
  const zoomDriveRef = useRef(0);
  const liteRef = useRef(false);
  const desktopLayerRef = useRef(null);
  const modelLayerRef = useRef(null);
  const hudLayerRef = useRef(null);
  const hintLayerRef = useRef(null);
  const desktopFadeRef = useRef(0);
  const modelFadeRef = useRef(1);
  const hudFadeRef = useRef(1);
  const desktopPrefetchedRef = useRef(false);
  const lockScrollYRef = useRef(0);
  const pageGuardRef = useRef(null);
  const commitDesktopLockRef = useRef(() => {});

  const applyDesktopFade = (value) => {
    desktopFadeRef.current = value;
    applyLayerFade(desktopLayerRef.current, value, desktopLockedRef.current ? -1 : 0.55);
  };

  const applyPageScrollLock = () => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
    document.documentElement.classList.add('mac-hero-locked');
  };

  const pinPageScroll = () => {
    if (leaveDesktopRef.current || !desktopLockedRef.current) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const target = max > 8 ? Math.min(lockScrollYRef.current, Math.max(0, max)) : 0;
    if (Math.abs(window.scrollY - target) > 0.5) {
      window.scrollTo(0, target);
    }
  };

  const ensurePageGuard = () => {
    if (pageGuardRef.current) return;
    const guard = createPageScrollGuard({ onBlock: pinPageScroll });
    guard.attach();
    pageGuardRef.current = guard;
  };

  const releasePageGuard = () => {
    pageGuardRef.current?.detach();
    pageGuardRef.current = null;
  };

  const commitDesktopLock = () => {
    if (desktopLockedRef.current) return;
    desktopLockedRef.current = true;
    desktopReadyRef.current = true;
    homeLiveRef.current = false;
    lockScrollYRef.current = window.scrollY;
    applyPageScrollLock();
    ensurePageGuard();
    pinPageScroll();
    zoomDriveRef.current = 1;
    applyDesktopFade(1);
    applyModelFade(0);
    applyHudFade(0);
    setDesktopReady(true);
    setDesktopSettled(true);
    setDesktopLocked(true);
    setHomeLive(false);
  };
  commitDesktopLockRef.current = commitDesktopLock;

  const applyModelFade = (value) => {
    modelFadeRef.current = value;
    applyLayerFade(modelLayerRef.current, value);
  };

  const setDesktopLayer = (node) => {
    desktopLayerRef.current = node;
    if (node) applyLayerFade(node, desktopFadeRef.current, desktopLockedRef.current ? -1 : 0.55);
  };

  const setModelLayer = (node) => {
    modelLayerRef.current = node;
    if (node) applyLayerFade(node, modelFadeRef.current);
  };

  const applyHudFade = (value) => {
    hudFadeRef.current = value;
    applyLayerFade(hudLayerRef.current, value);
    applyLayerFade(hintLayerRef.current, value);
  };

  const setHudLayer = (node) => {
    hudLayerRef.current = node;
    if (node) applyLayerFade(node, hudFadeRef.current);
  };

  const setHintLayer = (node) => {
    hintLayerRef.current = node;
    if (node) applyLayerFade(node, hudFadeRef.current);
  };

  const prefetchDesktop = () => {
    if (desktopPrefetchedRef.current) return;
    desktopPrefetchedRef.current = true;
    loadOsDesktop();
  };

  useEffect(() => {
    setReduceMotion(prefersReducedMotion());
  }, []);

  useEffect(() => {
    const warm = () => {
      prefetchDesktop();
      loadStickerForge().catch(() => {});
    };
    if (typeof window.requestIdleCallback === 'function') {
      const idle = window.requestIdleCallback(warm, { timeout: 1800 });
      return () => window.cancelIdleCallback(idle);
    }
    const timer = window.setTimeout(warm, 800);
    return () => window.clearTimeout(timer);
  }, []);

  useLayoutEffect(() => {
    if (reduceMotion) return undefined;

    const syncProgress = () => {
      if (leaveDesktopRef.current || desktopLockedRef.current) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const next = max <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max));
      const zoom = zoomFromProgress(next);
      progressRef.current = next;
      zoomDriveRef.current = zoom;
      liteRef.current = zoom >= 0.40;

      const fade = fadeFromZoom(zoom);
      applyDesktopFade(fade);
      applyModelFade(1 - fade);

      if (zoom >= 0.30) prefetchDesktop();

      const hideHud = !homeLiveRef.current || desktopReadyRef.current || desktopLockedRef.current;
      applyHudFade(hideHud ? 0 : Math.max(0, 1 - zoom / 0.32));

      if (homeLiveRef.current && zoom >= HOME_HIDE_ZOOM) {
        homeLiveRef.current = false;
        setHomeLive(false);
      } else if (!homeLiveRef.current && zoom < HOME_SHOW_ZOOM) {
        homeLiveRef.current = true;
        setHomeLive(true);
      }

      if (!desktopReadyRef.current && zoom >= HYDRATE_ZOOM) {
        desktopReadyRef.current = true;
        setDesktopReady(true);
      } else if (desktopReadyRef.current && zoom < UNHYDRATE_ZOOM) {
        desktopReadyRef.current = false;
        setDesktopReady(false);
        applyDesktopFade(0);
        applyModelFade(1);
      }

      if (zoom >= LOCK_ZOOM) {
        commitDesktopLockRef.current();
      }
    };

    syncProgress();
    window.addEventListener('scroll', syncProgress, { passive: true });
    window.addEventListener('resize', syncProgress);
    return () => {
      window.removeEventListener('scroll', syncProgress);
      window.removeEventListener('resize', syncProgress);
    };
  }, [reduceMotion]);

  if (desktopLocked) desktopLockedRef.current = true;
  const hideHomeChrome = !homeLive || desktopReady || desktopLocked;
  const showHomeFx = !reduceMotion && !hideHomeChrome;

  useEffect(() => {
    if (desktopLocked) return undefined;
    setDesktopReady(false);
    setDesktopSettled(false);
    desktopReadyRef.current = false;
    applyDesktopFade(0);
    applyModelFade(1);
    liteRef.current = false;
    return undefined;
  }, [desktopLocked]);

  useEffect(() => () => {
    releasePageGuard();
    document.documentElement.classList.remove('mac-hero-locked');
  }, []);

  useEffect(() => {
    if (!desktopSettled) return undefined;
    const timer = window.setTimeout(() => setModelMounted(false), SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [desktopSettled]);

  const leaveToModel = useCallback(() => {
    releasePageGuard();
    leaveDesktopRef.current = true;
    desktopLockedRef.current = false;
    pendingScrollRef.current = 0;
    liteRef.current = false;
    zoomDriveRef.current = 0;
    desktopReadyRef.current = false;
    homeLiveRef.current = true;
    applyDesktopFade(0);
    applyModelFade(1);
    setHomeLive(true);
    setDesktopLocked(false);
    setDesktopReady(false);
    setDesktopSettled(false);
    progressRef.current = 0;
    applyHudFade(1);
    setModelMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (pendingScrollRef.current == null) return;
    pendingScrollRef.current = null;
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    window.scrollTo(0, 0);
    window.requestAnimationFrame(() => {
      leaveDesktopRef.current = false;
    });
  }, [desktopLocked]);

  useLayoutEffect(() => {
    if (!desktopLocked) {
      releasePageGuard();
      return undefined;
    }

    applyPageScrollLock();
    if (!pageGuardRef.current) {
      const guard = createPageScrollGuard({ onBlock: pinPageScroll });
      guard.attach();
      pageGuardRef.current = guard;
    }
    pinPageScroll();
    window.addEventListener('scroll', pinPageScroll);
    return () => {
      window.removeEventListener('scroll', pinPageScroll);
      if (leaveDesktopRef.current || !desktopLockedRef.current) {
        releasePageGuard();
        document.documentElement.classList.remove('mac-hero-locked');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.style.overscrollBehavior = '';
        document.documentElement.style.overscrollBehavior = '';
      }
    };
  }, [desktopLocked]);

  return (
    <div className={reduceMotion ? 'relative' : `relative ${desktopSettled && !modelMounted ? 'h-[100svh] overflow-hidden' : 'h-[380vh]'}`}>
      <div className={`${reduceMotion ? 'relative' : 'fixed inset-0'} z-10 overflow-hidden bg-[#050505] text-white`}>
        {!desktopReady && <div className="mac-hero__grain" aria-hidden />}
        {(reduceMotion || showHomeFx) && (
          <div
            className="pointer-events-none absolute inset-0 z-0"
            aria-hidden
          >
            <SideRays
              speed={2.5}
              rayColor1="#e0d3a8"
              rayColor2="#b0d2f8"
              intensity={2}
              spread={2.65}
              origin="top-right"
              tilt={0}
              saturation={1.5}
              blend={0.75}
              falloff={1.32}
              opacity={1.0}
            />
          </div>
        )}

        {showHomeFx && (
          <div
            className="pointer-events-none absolute inset-0 z-[20]"
            aria-hidden
          >
            <FallingStickers reduceMotion={reduceMotion} />
          </div>
        )}

        <div
          ref={setModelLayer}
          className="mac-hero__model-layer"
          aria-hidden={!reduceMotion && modelFadeRef.current < 0.01}
        >
          {modelMounted && (
            <MacRevealBoundary>
              <ClassicMacScreenModel
                className="h-full w-full"
                zoomProgress={0}
                zoomDriveRef={zoomDriveRef}
                liteRef={liteRef}
                transparentBackground
              />
            </MacRevealBoundary>
          )}
        </div>

        {!hideHomeChrome && (
          <div
            ref={setHudLayer}
            data-mac-hud
            className="desk-intro-stage pointer-events-none absolute inset-0 z-[70]"
          >
            <div className="pointer-events-auto absolute left-4 top-8 w-[min(94vw,52rem)] cursor-pointer sm:left-6 sm:top-10">
              <Shuffle
                text="Jason's Space"
                shuffleDirection="right"
                duration={0.35}
                animationMode="evenodd"
                shuffleTimes={1}
                ease="power3.out"
                stagger={0.03}
                threshold={0.1}
                triggerOnce
                triggerOnHover
                respectReducedMotion
                textAlign="left"
                className="mac-hero__title"
              />
            </div>
            <div className="absolute bottom-6 left-4 text-left sm:bottom-8 sm:left-7">
              <div className="flex flex-col items-start gap-0 text-[22px] leading-8 tracking-[-0.012em] text-white/92 sm:text-[24px] sm:leading-9">
                {hudLines.map((line) => (
                  <DecryptedText
                    key={line}
                    text={line}
                    speed={HUD_DECRYPT_SPEED}
                    maxIterations={10}
                    sequential
                    revealDirection="start"
                    animateOn="loop"
                    startDelay={0}
                    loopHold={HUD_LOOP_HOLD + (HUD_MAX_LEN - line.length) * HUD_DECRYPT_SPEED}
                    characters="ABCDEFGHJKLMNPQRSTUVWXYZ0123456789@#$%&*"
                    parentClassName="block whitespace-nowrap"
                    className="text-white/90"
                    encryptedClassName="text-white/30"
                  />
                ))}
              </div>
            </div>
            <img
              className="mac-hero__art"
              src={OVERVIEW_ART_SRC}
              alt=""
              draggable={false}
            />
          </div>
        )}

        {!reduceMotion && !hideHomeChrome && (
          <ScrollHint
            layerRef={setHintLayer}
            label="SCROLL TO ENTER DESKTOP"
          />
        )}

        {!reduceMotion && desktopReady && (
          <div
            ref={setDesktopLayer}
            className="mac-hero__desktop-layer"
          >
            <Suspense fallback={null}>
              <OsDesktop
                className="absolute inset-0 h-full w-full"
                interactive={desktopSettled}
                onBack={leaveToModel}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

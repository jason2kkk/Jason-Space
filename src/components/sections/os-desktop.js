import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { CrtScreen } from '../ui/crt-screen';
import { getVolume, playVolumeTick, setVolume, subscribe, unlockAudio } from '../../lib/aqua-volume';
import { AquaIpod } from './aqua-ipod';
import { ForgeSticker, aquaStickerForgeOptions } from '../ui/forge-sticker';
import { BrowserWindowBody, WORK_APPS, browserSectionLabel } from '../ui/aqua-browser';

const DOCK_ICON = 56;
const DOCK_ICON_MAX = 88;
const BROWSER_MIN_W = 480;
const BROWSER_MIN_H = 360;
const BROWSER_DIM_Z = 85;

const windowCatalog = {
  finder: {
    title: "Jason's Space",
    x: 16,
    y: 12,
    w: 36,
    h: 44,
  },
  notes: {
    title: 'Profile',
    x: 42,
    y: 16,
    w: 280,
    card: true,
  },
  about: {
    title: 'About Me',
    x: 55,
    y: 41,
    w: 536,
    h: 368,
    card: true,
    center: true,
  },
  computer: {
    title: 'About This Computer',
    left: 10,
    top: 40,
    w: 360,
    card: true,
  },
  projects: {
    title: 'My Design',
    x: 16,
    y: 8,
    w: 720,
    h: 580,
    card: true,
  },
  textedit: {
    title: 'TextEdit',
    x: 28,
    y: 22,
    w: 300,
    card: true,
  },
  contacts: {
    title: 'Address Book',
    x: 46,
    y: 28,
    w: 280,
    card: true,
  },
  calendar: {
    title: 'iCal',
    x: 54,
    y: 14,
    w: 260,
    card: true,
  },
  trash: {
    title: 'Trash',
    x: 58,
    y: 18,
    w: 260,
    card: true,
  },
  apps: {
    title: 'My Products',
    left: 48,
    top: 106,
    strip: true,
  },
  browser: {
    title: 'Safari',
    left: 250,
    top: 40,
    w: 1000,
    h: 700,
    card: true,
    browser: true,
  },
  xiaohongshu: {
    title: 'Xiaohongshu',
    left: 22,
    bottom: 110,
    w: 445,
    card: true,
  },
};

const dockItems = [
  { id: 'finder', label: 'Finder', src: '/images/aqua/mac.png' },
  { id: 'appstore', label: 'App Store', src: '/images/aqua/appstore.png' },
  { id: 'notes', label: 'Profile', src: '/images/aqua/stickies.png' },
  { id: 'projects', label: 'My Design', src: '/images/aqua/folder.png' },
  { id: 'xiaohongshu', label: 'Xiaohongshu', src: '/images/aqua/ie-dock.png' },
  { id: 'separator' },
  { id: 'ipod', label: 'iPod', src: '/images/aqua/ipod-dock.png' },
  { id: 'trash', label: 'Trash', src: '/images/aqua/trash-empty.png' },
];

const desktopIcons = [
  { id: 'appstore', label: 'App Store', src: '/images/aqua/appstore.png' },
  { id: 'notes', label: 'Profile', src: '/images/aqua/stickies.png' },
  { id: 'projects', label: 'My Design', src: '/images/aqua/folder.png' },
];

const desktopStickers = [
  { id: 'figure', src: '/images/aqua/stickers/figure.png', left: '0.35%', bottom: '6.5%', width: 96, rotate: -11, z: 5, aspect: 501 / 537 },
  { id: 'camera', src: '/images/aqua/stickers/camera.png', left: '14.8%', bottom: '0.2%', width: 93, rotate: 13, z: 6, aspect: 657 / 915 },
  { id: 'star', src: '/images/aqua/stickers/star.png', left: '74%', top: '126px', width: 70, rotate: -15, z: 7, aspect: 624 / 747 },
  { id: 'bulb', src: '/images/aqua/stickers/bulb.png', left: '81%', top: '31%', width: 43, rotate: 18, z: 8, aspect: 196 / 334 },
];

const RESUME_PDF = '/assets/resume.pdf';
const RESUME_DOWNLOAD_NAME = '何鹏伟的简历.pdf';

const DOCK_TO_WINDOW = {
  finder: 'about',
  notes: 'notes',
  textedit: 'textedit',
  contacts: 'contacts',
  calendar: 'calendar',
  appstore: 'apps',
  projects: 'projects',
  xiaohongshu: 'xiaohongshu',
  ipod: 'ipod',
  trash: 'trash',
};

const WINDOW_TO_DOCK = Object.fromEntries(
  Object.entries(DOCK_TO_WINDOW).map(([dockId, windowId]) => [windowId, dockId]),
);

const ALWAYS_OPEN = ['ipod'];

const volumeIconFor = (value) => {
  if (value <= 0) return 'mute';
  if (value < 34) return 'low';
  if (value < 67) return 'mid';
  return 'high';
};

const VolumeSpeakerIcon = ({ className, size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <path
      fill="currentColor"
      d="M4 9.1h3.2L12 5.4v13.2L7.2 14.9H4c-.6 0-1.1-.5-1.1-1.1v-3.6C2.9 9.6 3.4 9.1 4 9.1Z"
    />
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      d="M15.1 8.6c1.7 1.6 1.7 5.2 0 6.8"
    />
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      d="M17.8 6.4c3.1 2.9 3.1 8.3 0 11.2"
    />
  </svg>
);

const MenubarSpeakerIcon = ({ level }) => {
  const kind = volumeIconFor(level);
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden>
      <path fill="currentColor" d="M2.2 6.1h2.1L7.2 4v8L4.3 9.9H2.2c-.4 0-.7-.3-.7-.7V6.8c0-.4.3-.7.7-.7Z" />
      {kind === 'mute' ? (
        <path fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" d="M10.1 6.2 13.4 9.5M13.4 6.2 10.1 9.5" />
      ) : (
        <>
          {kind !== 'low' ? null : <path fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" d="M9.3 6.6c.8.7.8 2.1 0 2.8" />}
          {kind === 'mid' || kind === 'high' ? <path fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" d="M9.3 6.6c.8.7.8 2.1 0 2.8" /> : null}
          {kind === 'high' ? <path fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" d="M11.2 5.3c1.6 1.5 1.6 4.9 0 6.4" /> : null}
        </>
      )}
    </svg>
  );
};

const VolumeGearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="currentColor"
      d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.5.5 0 0 0-.49-.43h-3.84a.5.5 0 0 0-.49.43l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.84a.49.49 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.64l1.92 3.32c.14.24.4.34.6.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.25.26.43.49.43h3.84a.5.5 0 0 0 .49-.43l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.1.46 0 .6-.22l1.92-3.32a.49.49 0 0 0-.12-.64l-2.03-1.58ZM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2Z"
    />
  </svg>
);

const VOLUME_KNOB = 20;

const AquaVolumeExtra = ({ interactive = false, open, onToggle, onClose }) => {
  const [level, setLevel] = useState(getVolume);
  const sliderRef = useRef(null);
  const draggingRef = useRef(false);

  useEffect(() => subscribe(setLevel), []);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (event.target.closest('[data-volume-extra]')) return;
      onClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, onClose]);

  const applyFromClientY = (clientY) => {
    const track = sliderRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const travel = Math.max(1, rect.height - VOLUME_KNOB);
    const y = clientY - rect.top - VOLUME_KNOB / 2;
    const next = setVolume((1 - y / travel) * 100);
    playVolumeTick();
    return next;
  };

  const onSliderPointerDown = (event) => {
    if (!interactive) return;
    event.preventDefault();
    unlockAudio();
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    applyFromClientY(event.clientY);
  };

  const onSliderPointerMove = (event) => {
    if (!draggingRef.current) return;
    applyFromClientY(event.clientY);
  };

  const endDrag = () => {
    draggingRef.current = false;
  };

  return (
    <div data-volume-extra className={`aqua-volume${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className={`aqua-volume__btn${open ? ' is-open' : ''}`}
        aria-label="Volume"
        aria-expanded={open}
        disabled={!interactive}
        onClick={() => {
          unlockAudio();
          onToggle();
        }}
      >
        <MenubarSpeakerIcon level={level} />
      </button>

      {open && (
        <div className="aqua-volume__popover" role="dialog" aria-label="Volume">
          <span className="aqua-volume__glyph aqua-volume__glyph--speaker">
            <VolumeSpeakerIcon size={16} />
          </span>
          <div
            ref={sliderRef}
            className="aqua-volume__slider"
            role="slider"
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={level}
            onPointerDown={onSliderPointerDown}
            onPointerMove={onSliderPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <span
              className="aqua-volume__track"
              aria-hidden
              style={{ '--volume-pct': `${level}%` }}
            >
              <span className="aqua-volume__fill" />
            </span>
            <img
              className="aqua-volume__knob"
              src="/images/aqua/volume-knob.png"
              alt=""
              draggable={false}
              style={{ top: `calc((100% - ${VOLUME_KNOB}px) * ${((100 - level) / 100).toFixed(4)})` }}
            />
          </div>
          <span className="aqua-volume__glyph aqua-volume__glyph--gear">
            <VolumeGearIcon />
          </span>
        </div>
      )}
    </div>
  );
};

/** Shared Aqua chrome. New desktop windows should use this wrapper. iPod stays chrome-less. */
const AquaWindow = ({
  as: Component = 'article',
  windowId,
  title,
  titleId,
  children,
  className = '',
  interactive = false,
  draggable = false,
  resizable = false,
  canClose = true,
  canMinimize = true,
  onClose,
  onMinimize,
  onTitlePointerDown,
  onResizePointerDown,
  ...rest
}) => (
  <Component data-os-window={windowId} className={`aqua-window ${className}`.trim()} {...rest}>
    <div
      className={`aqua-titlebar${draggable && interactive ? ' cursor-grab active:cursor-grabbing' : ''}`}
      onPointerDown={onTitlePointerDown}
    >
      <div data-window-chrome className="aqua-lights">
        {canClose ? (
          <button
            type="button"
            aria-label={`Close ${title}`}
            className="aqua-light aqua-light--close"
            disabled={!interactive}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onClose?.();
            }}
          >
            <span className="aqua-light__mark" aria-hidden>×</span>
          </button>
        ) : (
          <span className="aqua-light aqua-light--close">
            <span className="aqua-light__mark" aria-hidden>×</span>
          </span>
        )}
        {canMinimize ? (
          <button
            type="button"
            aria-label={`Hide ${title}`}
            className="aqua-light aqua-light--min"
            disabled={!interactive}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onMinimize?.();
            }}
          >
            <span className="aqua-light__mark" aria-hidden>−</span>
          </button>
        ) : (
          <span className="aqua-light aqua-light--min">
            <span className="aqua-light__mark" aria-hidden>−</span>
          </span>
        )}
        <span className="aqua-light aqua-light--zoom">
          <span className="aqua-light__mark" aria-hidden>+</span>
        </span>
      </div>
      <span id={titleId} className="aqua-title">{title}</span>
    </div>
    <div className="aqua-content">{children}</div>
    {resizable && interactive
      ? ['nw', 'ne', 'sw', 'se'].map((corner) => (
          <div
            key={corner}
            className={`aqua-window__resize aqua-window__resize--${corner}`}
            aria-hidden
            onPointerDown={(event) => onResizePointerDown?.(event, corner)}
          />
        ))
      : null}
  </Component>
);

const restMotion = (centered) => ({
  x: centered ? '-50%' : 0,
  y: centered ? '-50%' : 0,
  scale: 1,
  opacity: 1,
});

const riseMotion = (centered) => ({
  x: centered ? '-50%' : 0,
  y: centered ? 'calc(-50% + 56px)' : 56,
  scale: 1,
  opacity: 0,
});

const dockMotion = (centered, delta = { x: 0, y: 140, scale: 0.14 }) => ({
  x: centered ? `calc(-50% + ${delta.x}px)` : delta.x,
  y: centered ? `calc(-50% + ${delta.y}px)` : delta.y,
  scale: delta.scale ?? 0.14,
  opacity: 0,
});

const formatMenuTime = (date) => new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}).format(date);

const DockIcon = ({ item, interactive, active, onOpen, mouseX }) => {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (value) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return value - bounds.x - bounds.width / 2;
  });
  const sizeTransform = useTransform(distance, [-150, 0, 150], [DOCK_ICON, DOCK_ICON_MAX, DOCK_ICON]);
  const size = useSpring(sizeTransform, { mass: 0.12, stiffness: 160, damping: 14 });

  useEffect(() => {
    const hide = () => setHovered(false);
    const onVis = () => {
      if (document.hidden) hide();
    };
    window.addEventListener('blur', hide);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('blur', hide);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const shared = {
    'aria-label': item.label,
    'data-dock-item': item.id,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false),
    className: 'aqua-dock__hit',
  };

  const face = (
    <span className="aqua-dock__stack">
      <AnimatePresence>
        {hovered && interactive && (
          <span className="aqua-dock__tip">
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 3 }}
              className="aqua-dock__tip-label"
            >
              {item.label}
            </motion.span>
          </span>
        )}
      </AnimatePresence>
      <motion.span className="aqua-dock__icon" style={{ width: size, height: size }}>
        <img className="aqua-dock__face" src={item.src} alt="" decoding="sync" draggable={false} />
        {active && <span className="aqua-dock__marker" aria-hidden />}
      </motion.span>
    </span>
  );

  return item.href ? (
    <a
      {...shared}
      ref={ref}
      href={interactive ? item.href : undefined}
      target={item.external ? '_blank' : undefined}
      rel={item.external ? 'noopener noreferrer' : undefined}
      onClick={(event) => {
        if (!interactive) event.preventDefault();
      }}
    >
      {face}
    </a>
  ) : (
    <button ref={ref} {...shared} type="button" disabled={!interactive} onClick={() => onOpen(item.id)}>
      {face}
    </button>
  );
};

const DockGroup = ({ items, interactive, runningIds, onOpen, mouseX }) => (
  <div className="aqua-dock__group">
    {items.map((item) => (
      <DockIcon
        key={item.id}
        item={item}
        interactive={interactive}
        active={runningIds.includes(DOCK_TO_WINDOW[item.id] || item.id)}
        onOpen={onOpen}
        mouseX={mouseX}
      />
    ))}
  </div>
);

const DesktopIcons = ({ interactive, selectedId, onSelect, onOpen }) => (
  <div className="aqua-desktop-icons" aria-label="Desktop">
    {desktopIcons.map((item) => (
      <button
        key={item.id}
        type="button"
        className={`aqua-desktop-icon${selectedId === item.id ? ' is-on' : ''}`}
        disabled={!interactive}
        onClick={() => {
          onSelect(item.id);
          onOpen(item.id);
        }}
      >
        <img className="aqua-desktop-icon__face" src={item.src} alt="" draggable={false} />
        <span className="aqua-desktop-icon__label">{item.label}</span>
      </button>
    ))}
  </div>
);

const DesktopStickers = ({ interactive }) => (
  <div className="aqua-desktop-stickers" aria-hidden>
    {desktopStickers.map((sticker) => (
      <div
        key={sticker.id}
        data-desktop-sticker={sticker.id}
        className={`aqua-desktop-sticker${interactive ? ' is-live' : ''}`}
        style={{
          left: sticker.left,
          top: sticker.top ?? 'auto',
          bottom: sticker.bottom ?? 'auto',
          width: sticker.width,
          aspectRatio: sticker.aspect,
          zIndex: sticker.z,
        }}
      >
        <ForgeSticker
          src={sticker.src}
          alt=""
          tilt={sticker.rotate}
          aspect={sticker.aspect}
          enabled={interactive}
          forgeOptions={aquaStickerForgeOptions}
        />
      </div>
    ))}
  </div>
);

const ToastDownloadIcon = () => (
  <svg className="aqua-toast__glyph" width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="currentColor"
      d="M12 3.4c.5 0 .9.4.9.9v8.3l2.4-2.4a.9.9 0 1 1 1.3 1.3l-4 4a.9.9 0 0 1-1.3 0l-4-4a.9.9 0 1 1 1.3-1.3l2.4 2.4V4.3c0-.5.4-.9.9-.9Z"
    />
    <path
      fill="currentColor"
      d="M5.2 15.2c.5 0 .9.4.9.9v1.3c0 .4.3.7.7.7h10.4c.4 0 .7-.3.7-.7V16.1c0-.5.4-.9.9-.9s.9.4.9.9v1.3c0 1.4-1.1 2.5-2.5 2.5H6.8c-1.4 0-2.5-1.1-2.5-2.5V16.1c0-.5.4-.9.9-.9Z"
    />
  </svg>
);

const DesktopToasts = ({ wave, onDismiss }) => {
  const toastRef = useRef(null);
  const dragX = useMotionValue(0);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const widthRef = useRef(320);
  const draggedRef = useRef(false);
  const [exiting, setExiting] = useState(false);

  const finishDismiss = () => {
    onDismiss?.();
  };

  const onPointerDown = (event) => {
    if (event.button !== 0 || exiting) return;
    event.stopPropagation();
    draggingRef.current = true;
    draggedRef.current = false;
    startXRef.current = event.clientX;
    widthRef.current = toastRef.current?.getBoundingClientRect().width ?? 320;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!draggingRef.current || exiting) return;
    const dx = Math.max(0, event.clientX - startXRef.current);
    if (dx > 8) draggedRef.current = true;
    dragX.set(dx);
  };

  const onPointerUp = (event) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const dx = Math.max(0, event.clientX - startXRef.current);
    const threshold = Math.max(80, widthRef.current * 0.45);
    if (dx >= threshold) {
      setExiting(true);
      animate(dragX, widthRef.current + 120, { duration: 0.28, ease: [0.4, 0, 1, 1] });
      return;
    }
    animate(dragX, 0, { type: 'spring', stiffness: 420, damping: 28, mass: 0.7 });
  };

  return (
    <div className="aqua-toasts" data-aqua-toasts aria-live="polite">
      <motion.div
        ref={toastRef}
        key={wave}
        className={`aqua-toast${exiting ? ' is-leaving' : ''}`}
        role="status"
        style={{ x: dragX }}
        initial={{ opacity: 0, scale: 0.72, y: -14 }}
        animate={exiting ? { opacity: 0, scale: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
        transition={exiting
          ? { duration: 0.28, ease: [0.4, 0, 1, 1] }
          : { type: 'spring', stiffness: 420, damping: 28, mass: 0.7 }}
        onAnimationComplete={() => {
          if (exiting) finishDismiss();
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <ToastDownloadIcon />
        <p className="aqua-toast__copy">现已推出最新版本简历</p>
        <a
          className="aqua-toast__gel"
          href={RESUME_PDF}
          download={RESUME_DOWNLOAD_NAME}
          onClick={(event) => {
            if (draggedRef.current || exiting) event.preventDefault();
          }}
        >
          <img className="aqua-toast__gel-art" src="/images/aqua/button-gel.png?v=676270" alt="" draggable={false} />
          <span className="aqua-toast__gel-label">立即下载</span>
        </a>
      </motion.div>
    </div>
  );
};

const DesktopDock = ({ interactive, runningIds, onOpen }) => {
  const mouseX = useMotionValue(Infinity);
  const sepAt = dockItems.findIndex((item) => item.id === 'separator');
  const leftItems = dockItems.slice(0, sepAt);
  const rightItems = dockItems.slice(sepAt + 1);

  return (
    <nav
      aria-label="Dock"
      className={`aqua-dock ${interactive ? 'pointer-events-auto' : 'pointer-events-none'}`}
      onMouseMove={interactive ? (event) => mouseX.set(event.clientX) : undefined}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      <DockGroup items={leftItems} interactive={interactive} runningIds={runningIds} onOpen={onOpen} mouseX={mouseX} />
      <span aria-hidden className="aqua-dock__sep" />
      <DockGroup items={rightItems} interactive={interactive} runningIds={runningIds} onOpen={onOpen} mouseX={mouseX} />
    </nav>
  );
};

const initialOpen = ['apps', 'xiaohongshu', 'about', 'ipod'];

const ABOUT_SKILL_ICONS = [
  { src: '/images/aqua/skills/cursor.png', label: 'Cursor' },
  { src: '/images/aqua/skills/codex.png', label: 'Codex' },
  { src: '/images/aqua/skills/hermes.png', label: 'Hermes' },
  { src: '/images/aqua/skills/figma.png', label: 'Figma' },
  { src: '/images/aqua/skills/manus.png', label: 'Manus' },
  { src: '/images/aqua/skills/claude.png', label: 'Claude' },
];

const ABOUT_COPY = {
  email: { value: 'jason2k@126.com', toast: '邮箱jason2k@126.com复制成功' },
  phone: { value: '17666003839', toast: '手机号17666003839复制成功' },
};

const DESIGN_GALLERIES = [
  {
    title: 'Pockit 商店宣传图',
    files: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg'],
  },
  {
    title: 'Doit! 商店宣传图',
    files: ['简体1.jpg', '简体2.jpg', '简体3.jpg', '简体4.jpg'],
  },
  {
    title: 'Tracck! 商店宣传图',
    files: ['图1.jpg', '图2.jpg', '图3.jpg', '图4.jpg', '图5.jpg', '图6.jpg'],
  },
  {
    title: 'Curio 商店宣传图',
    files: ['英文1.jpg', '英文2.jpg', '英文3.jpg', '英文4.jpg', '英文5.jpg'],
  },
];

const DESIGN_FLAT = DESIGN_GALLERIES.flatMap((group) => (
  group.files.map((file) => ({
    src: `/design/${encodeURI(file)}`,
    label: group.title,
  }))
));

const DesignGallery = ({ onPreview }) => (
  <div className="aqua-design">
    {DESIGN_GALLERIES.map((group) => (
      <section key={group.title} className="aqua-design__group">
        <h3 className="aqua-design__heading">{group.title}</h3>
        <div className="aqua-design__grid">
          {group.files.map((file) => {
            const src = `/design/${encodeURI(file)}`;
            const index = DESIGN_FLAT.findIndex((item) => item.src === src);
            return (
              <figure
                key={file}
                className="aqua-design__frame"
                onDoubleClick={() => onPreview?.(index)}
              >
                <img
                  className="aqua-design__img"
                  src={src}
                  alt={group.title}
                  draggable={false}
                />
              </figure>
            );
          })}
        </div>
      </section>
    ))}
  </div>
);

const DesignLightbox = ({ index, onClose, onStep }) => {
  const item = DESIGN_FLAT[index];

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onStep(-1);
      if (event.key === 'ArrowRight') onStep(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onStep]);

  if (!item) return null;

  return (
    <div
      className="aqua-design-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.label}
      onClick={onClose}
    >
      <button
        type="button"
        className="aqua-design-lightbox__nav aqua-design-lightbox__nav--prev"
        aria-label="Previous"
        onClick={(event) => {
          event.stopPropagation();
          onStep(-1);
        }}
      >
        ‹
      </button>
      <img
        className="aqua-design-lightbox__img"
        src={item.src}
        alt={item.label}
        draggable={false}
        onClick={(event) => event.stopPropagation()}
      />
      <button
        type="button"
        className="aqua-design-lightbox__nav aqua-design-lightbox__nav--next"
        aria-label="Next"
        onClick={(event) => {
          event.stopPropagation();
          onStep(1);
        }}
      >
        ›
      </button>
    </div>
  );
};

const XHS_STAT_ICONS = {
  follow: '/images/aqua/xhs/follow.png',
  like: '/images/aqua/xhs/like.png',
  read: '/images/aqua/xhs/read.png',
};

const XHS_ACCOUNTS = [
  {
    id: '2k',
    name: '2k',
    src: encodeURI('/小红书1.PNG'),
    stats: [
      { type: 'follow', value: '16k' },
      { type: 'like', value: '13.6w' },
      { type: 'read', value: '500w' },
    ],
    url: 'https://www.xiaohongshu.com/user/profile/5b091ac7f7e8b97d08005f36?xsec_token=&xsec_source=pc_note',
  },
  {
    id: '2kk',
    name: '2kk',
    src: encodeURI('/小红书2.png'),
    stats: [
      { type: 'follow', value: '2560' },
      { type: 'like', value: '8300' },
      { type: 'read', value: '30w' },
    ],
    url: 'https://www.xiaohongshu.com/user/profile/65438390000000000301e354?xsec_token=&xsec_source=pc_note',
  },
];

const XiaohongshuBody = ({ onOpenProfile }) => (
  <div className="aqua-xhs">
    {XHS_ACCOUNTS.map((account) => (
      <article key={account.id} className="aqua-xhs__card">
        {account.id === '2kk' ? (
          <span className="aqua-xhs__avatar-wrap">
            <img
              className="aqua-xhs__avatar aqua-xhs__avatar--2kk"
              src={account.src}
              alt=""
              draggable={false}
            />
          </span>
        ) : (
          <img className="aqua-xhs__avatar" src={account.src} alt="" draggable={false} />
        )}
        <h3 className="aqua-xhs__name">{account.name}</h3>
        <ul className="aqua-xhs__stats">
          {account.stats.map((stat) => (
            <li key={stat.type}>
              <img
                className="aqua-xhs__stat-icon"
                src={XHS_STAT_ICONS[stat.type]}
                alt=""
                draggable={false}
              />
              <span className="aqua-xhs__stat-num">{stat.value}</span>
            </li>
          ))}
        </ul>
        <a
          className="aqua-xhs__cta"
          href={account.url}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
              return;
            }
            event.preventDefault();
            onOpenProfile?.(account.url, account.name);
          }}
        >
          <img className="aqua-xhs__cta-art" src="/images/aqua/button-gel.png?v=676270" alt="" draggable={false} />
          <span className="aqua-xhs__cta-label">去看看</span>
        </a>
      </article>
    ))}
  </div>
);

const AboutMeBody = () => {
  const [copyToast, setCopyToast] = useState('');
  const [toastKey, setToastKey] = useState(0);

  useEffect(() => {
    if (!copyToast) return undefined;
    const timer = window.setTimeout(() => setCopyToast(''), 2000);
    return () => window.clearTimeout(timer);
  }, [copyToast, toastKey]);

  const copyField = async (field) => {
    const item = ABOUT_COPY[field];
    if (!item) return;
    try {
      await navigator.clipboard.writeText(item.value);
    } catch {
      const input = document.createElement('textarea');
      input.value = item.value;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopyToast(item.toast);
    setToastKey((key) => key + 1);
  };

  return (
    <div className="aqua-about">
      <img className="aqua-about__avatar" src="/images/desk/reference/avatar-pixel.png" alt="" draggable={false} />
      <h2 className="aqua-about__name">Jason He</h2>
      <p className="aqua-about__role">AI产品经理 · 独立开发者 · 小红书博主</p>
      <div className="aqua-about__bio">
        <p>
          5年C端产品经理，具备百万级MAU海外产品迭代经验；AI 独立开发者，个人落地多款App与Agent产品，实现<strong>2w</strong>以上用户量、<strong>上万美元</strong>收入；最高App store 效率榜<strong>#46</strong>，即刻产品发布会多次<strong>Top1</strong>
        </p>
      </div>
      <div className="aqua-about__tags">
        <span className="aqua-about__tag aqua-about__tag--skill">
          <span className="aqua-about__skill-icons" aria-hidden>
            {ABOUT_SKILL_ICONS.map((icon, index) => (
              <img
                key={icon.label}
                className="aqua-about__skill-icon"
                src={icon.src}
                alt=""
                title={icon.label}
                draggable={false}
                style={{ zIndex: index + 1 }}
              />
            ))}
          </span>
          <span>Skill</span>
        </span>
        <button type="button" className="aqua-about__tag" onClick={() => copyField('email')}>
          <img className="aqua-about__tag-icon" src="/images/aqua/mail-send-line.png" alt="" draggable={false} />
          <span>Email</span>
        </button>
        <button type="button" className="aqua-about__tag" onClick={() => copyField('phone')}>
          <img className="aqua-about__tag-icon" src="/images/aqua/phone-call-line.png" alt="" draggable={false} />
          <span>phone</span>
        </button>
      </div>
      {copyToast ? (
        <p key={toastKey} className="aqua-about__copy-toast" role="status">{copyToast}</p>
      ) : null}
    </div>
  );
};

const WindowBody = ({
  id,
  onOpenBrowser,
  onOpenWeb,
  onPreviewDesign,
  browserAppId,
  onBrowserAppIdChange,
  browserUrl,
  browserWebTitle,
  browserOpenTick,
}) => {
  if (id === 'about') {
    return <AboutMeBody />;
  }

  if (id === 'xiaohongshu') {
    return <XiaohongshuBody onOpenProfile={onOpenWeb} />;
  }

  if (id === 'computer') {
    return (
      <div className="aqua-computer">
        <div className="aqua-computer__brand">
          <img className="aqua-computer__logo" src="/images/aqua/apple.png" alt="" draggable={false} />
          <p className="aqua-computer__name">Jason's Space</p>
          <p className="aqua-computer__version">10.4</p>
        </div>
        <div className="aqua-computer__info">
          <dl className="aqua-computer__specs">
            <div>
              <dt>Built-in Memory</dt>
              <dd>16GB</dd>
            </div>
            <div>
              <dt>Virtual Memory</dt>
              <dd>Off</dd>
            </div>
            <div>
              <dt>Largest Unused Block</dt>
              <dd>Weekend</dd>
            </div>
          </dl>
          <p className="aqua-computer__copy">Jason He 1999 - 2026</p>
        </div>
      </div>
    );
  }

  if (id === 'notes') {
    return (
      <div className="px-5 py-4 text-[13px] leading-relaxed text-[#333]" style={{ background: '#fff7a0' }}>
        <p className="mb-3 font-bold">Profile</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Building Jason's Space as a two-page OS</li>
          <li>AI Product · Indie · Product Design</li>
          <li>Next: drop real project cards here</li>
        </ul>
      </div>
    );
  }

  if (id === 'projects') {
    return <DesignGallery onPreview={onPreviewDesign} />;
  }

  if (id === 'textedit') {
    return (
      <div className="px-5 py-4 text-[13px] leading-relaxed text-[#333]">
        <p className="mb-3 font-bold">Untitled</p>
        <p className="text-[#666]">A TextEdit placeholder.</p>
      </div>
    );
  }

  if (id === 'contacts') {
    return (
      <div className="px-5 py-4 text-[13px] leading-relaxed text-[#333]">
        <p className="mb-3 font-bold">Address Book</p>
        <p>Jason He</p>
        <p className="text-[#666]">jason2k@126.com</p>
      </div>
    );
  }

  if (id === 'calendar') {
    return (
      <div className="px-5 py-8 text-center text-[13px] text-[#666]">
        iCal
      </div>
    );
  }

  if (id === 'trash') {
    return (
      <div className="px-5 py-8 text-center text-[13px] text-[#666]">
        Trash is empty.
      </div>
    );
  }

  if (id === 'browser') {
    return (
      <BrowserWindowBody
        appId={browserAppId}
        onAppIdChange={onBrowserAppIdChange}
        webUrl={browserUrl}
        webTitle={browserWebTitle}
        openTick={browserOpenTick}
      />
    );
  }

  if (id === 'apps') {
    // My Products — App Store dock item still opens this window (id stays `apps`).
    return (
      <div className="aqua-apps">
        {WORK_APPS.map((app) => (
          <button
            key={app.id}
            type="button"
            className="aqua-apps__item"
            onClick={() => onOpenBrowser?.(app.id)}
          >
            <img className="aqua-apps__icon" src={app.src} alt="" draggable={false} />
            <span className="aqua-apps__name">{app.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="px-5 py-4 text-[13px] leading-relaxed text-[#333]">
      <p className="mb-3 font-bold">Jason's Space</p>
      <ul className="space-y-2">
        <li>About — AI Product · Indie</li>
        <li>Profile — working desk</li>
        <li>My Design — independent work</li>
        <li>Mail — jason2k@126.com</li>
      </ul>
    </div>
  );
};

const AquaMenuBar = ({
  interactive = false,
  aboutComputerOpen = false,
  onToggleAboutComputer,
}) => {
  const [now, setNow] = useState(() => new Date());
  const [volumeOpen, setVolumeOpen] = useState(false);

  useEffect(() => {
    const clock = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    if (!interactive) {
      setVolumeOpen(false);
    }
  }, [interactive]);

  return (
    <header className="aqua-menubar">
      <div className="aqua-menubar__left">
        <button
          type="button"
          data-apple-menu
          className="aqua-menubar__apple-btn"
          aria-label="About This Computer"
          aria-expanded={aboutComputerOpen}
          disabled={!interactive}
          onClick={() => {
            setVolumeOpen(false);
            onToggleAboutComputer?.();
          }}
        >
          <img src="/images/aqua/apple.png" alt="" className="aqua-menubar__apple" />
        </button>
        <span className="aqua-menubar__app">Jason's Space</span>
      </div>
      <div className="aqua-menubar__right">
        <AquaVolumeExtra
          interactive={interactive}
          open={volumeOpen}
          onToggle={() => {
            setVolumeOpen((open) => !open);
          }}
          onClose={() => setVolumeOpen(false)}
        />
        <time className="tabular-nums" dateTime={now.toISOString()}>
          {formatMenuTime(now)}
        </time>
      </div>
    </header>
  );
};

const useScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) return undefined;

    const pin = () => {
      if (window.scrollY > 0) window.scrollTo(0, 0);
    };

    const prevent = (event) => {
      event.preventDefault();
      pin();
    };

    const onKey = (event) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
        event.preventDefault();
      }
    };

    pin();
    document.documentElement.classList.add('mac-hero-locked');
    const previous = document.body.style.overflow;
    const previousHtml = document.documentElement.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
    window.addEventListener('wheel', prevent, { passive: false });
    window.addEventListener('touchmove', prevent, { passive: false });
    window.addEventListener('scroll', pin);
    window.addEventListener('keydown', onKey);

    return () => {
      document.documentElement.classList.remove('mac-hero-locked');
      document.body.style.overflow = previous;
      document.documentElement.style.overflow = previousHtml;
      document.body.style.overscrollBehavior = previousOverscroll;
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll;
      window.removeEventListener('wheel', prevent);
      window.removeEventListener('touchmove', prevent);
      window.removeEventListener('scroll', pin);
      window.removeEventListener('keydown', onKey);
    };
  }, [locked]);
};

export const OsDesktop = React.memo(({
  interactive = false,
  style,
  desktopRef,
  className = '',
  onBack,
  scanlineOpacity = 0,
  lockScroll = false,
}) => {
  const frameRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const exitIntentRef = useRef({});
  const minimizeDeltaRef = useRef({});
  const [openIds, setOpenIds] = useState(initialOpen);
  const [minimizedIds, setMinimizedIds] = useState([]);
  const [zOrder, setZOrder] = useState(initialOpen);
  const [positions, setPositions] = useState({});
  const [sizes, setSizes] = useState({});
  const [enterDeltas, setEnterDeltas] = useState({});
  const [selectedDesktopId, setSelectedDesktopId] = useState(null);
  const [toastWave, setToastWave] = useState(0);
  const [toastDismissed, setToastDismissed] = useState(false);
  const [browserAppId, setBrowserAppId] = useState('app1');
  const [browserUrl, setBrowserUrl] = useState('');
  const [browserWebTitle, setBrowserWebTitle] = useState('');
  const [browserOpenTick, setBrowserOpenTick] = useState(0);
  const [designPreview, setDesignPreview] = useState(null);

  useScrollLock(lockScroll && interactive);

  const setFrameRef = useCallback((node) => {
    frameRef.current = node;
    if (typeof desktopRef === 'function') desktopRef(node);
    else if (desktopRef) desktopRef.current = node;
  }, [desktopRef]);

  const runningIds = Array.from(new Set([...openIds, ...minimizedIds, ...ALWAYS_OPEN]));

  const focusWindow = (id) => {
    setZOrder((current) => [...current.filter((item) => item !== id), id]);
  };

  const measureToDock = (id) => {
    const frame = frameRef.current;
    const win = frame?.querySelector(`[data-os-window="${id}"]`);
    const icon = id === 'computer'
      ? frame?.querySelector('[data-apple-menu]')
      : (() => {
          const dockId = WINDOW_TO_DOCK[id];
          return dockId ? frame?.querySelector(`[data-dock-item="${dockId}"]`) : null;
        })();
    if (!win || !icon) {
      return id === 'computer' ? { x: 0, y: -36, scale: 0.12 } : { x: 0, y: 140, scale: 0.14 };
    }
    const wr = win.getBoundingClientRect();
    const ir = icon.getBoundingClientRect();
    return {
      x: ir.left + ir.width / 2 - (wr.left + wr.width / 2),
      y: ir.top + ir.height / 2 - (wr.top + wr.height / 2),
      scale: 0.14,
    };
  };

  const openWindow = (id) => {
    if (ALWAYS_OPEN.includes(id)) {
      focusWindow(id);
      return;
    }
    setEnterDeltas((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setMinimizedIds((current) => current.filter((item) => item !== id));
    setOpenIds((current) => (current.includes(id) ? current : [...current, id]));
    focusWindow(id);
  };

  const openBrowserForApp = (appId) => {
    setBrowserUrl('');
    setBrowserWebTitle('');
    setBrowserAppId(appId);
    setBrowserOpenTick((tick) => tick + 1);
    openWindow('browser');
  };

  const openBrowserForWeb = (url, title) => {
    setBrowserUrl(url);
    setBrowserWebTitle(title || 'Xiaohongshu');
    openWindow('browser');
  };

  const handleBrowserAppIdChange = (appId) => {
    setBrowserUrl('');
    setBrowserWebTitle('');
    setBrowserAppId(appId);
  };

  const closeDesignPreview = useCallback(() => {
    setDesignPreview(null);
  }, []);

  const stepDesignPreview = useCallback((delta) => {
    setDesignPreview((current) => {
      if (current == null) return current;
      return (current + delta + DESIGN_FLAT.length) % DESIGN_FLAT.length;
    });
  }, []);

  const restoreWindow = (id) => {
    const delta = minimizeDeltaRef.current[id] || measureToDock(id);
    setEnterDeltas((current) => ({ ...current, [id]: delta }));
    setMinimizedIds((current) => current.filter((item) => item !== id));
    setOpenIds((current) => (current.includes(id) ? current : [...current, id]));
    focusWindow(id);
  };

  const closeWindow = (id) => {
    if (ALWAYS_OPEN.includes(id)) return;
    exitIntentRef.current[id] = 'close';
    setOpenIds((current) => current.filter((item) => item !== id));
    setMinimizedIds((current) => current.filter((item) => item !== id));
  };

  const minimizeWindow = (id) => {
    if (ALWAYS_OPEN.includes(id)) return;
    const delta = measureToDock(id);
    minimizeDeltaRef.current[id] = delta;
    exitIntentRef.current[id] = 'minimize';
    setOpenIds((current) => current.filter((item) => item !== id));
    setMinimizedIds((current) => (current.includes(id) ? current : [...current, id]));
  };

  const onDesktopPointerDown = (event) => {
    if (!interactive || event.button !== 0 || !openIds.includes('browser')) return;
    if (event.target !== event.currentTarget) return;
    minimizeWindow('browser');
  };

  const handleDockOpen = (dockId) => {
    const id = DOCK_TO_WINDOW[dockId] || dockId;
    if (ALWAYS_OPEN.includes(id)) {
      if (!openIds.includes(id)) {
        setOpenIds((current) => (current.includes(id) ? current : [...current, id]));
      }
      focusWindow(id);
      return;
    }
    if (openIds.includes(id)) {
      focusWindow(id);
      return;
    }
    if (minimizedIds.includes(id)) {
      restoreWindow(id);
      return;
    }
    openWindow(id);
  };

  const onResizePointerDown = (event, id, meta, corner = 'se') => {
    if (!interactive || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    focusWindow(id);
    const frame = frameRef.current;
    const node = event.currentTarget.closest('[data-os-window]');
    if (!frame || !node) return;
    const frameBox = frame.getBoundingClientRect();
    const box = node.getBoundingClientRect();
    const startLeft = box.left - frameBox.left;
    const startTop = box.top - frameBox.top;
    const startW = box.width;
    const startH = box.height;
    const startRight = startLeft + startW;
    const startBottom = startTop + startH;

    setPositions((current) => ({ ...current, [id]: { left: startLeft, top: startTop } }));

    resizeRef.current = {
      id,
      corner,
      startX: event.clientX,
      startY: event.clientY,
      startW,
      startH,
      startLeft,
      startTop,
      startRight,
      startBottom,
      fw: frameBox.width,
      fh: frameBox.height,
    };
    const move = (ev) => {
      const resize = resizeRef.current;
      if (!resize) return;
      const dx = ev.clientX - resize.startX;
      const dy = ev.clientY - resize.startY;

      let nextW = resize.startW;
      let nextH = resize.startH;
      let nextLeft = resize.startLeft;
      let nextTop = resize.startTop;

      switch (resize.corner) {
        case 'se':
          nextW = resize.startW + dx;
          nextH = resize.startH + dy;
          break;
        case 'sw':
          nextW = resize.startW - dx;
          nextH = resize.startH + dy;
          nextLeft = resize.startRight - nextW;
          break;
        case 'ne':
          nextW = resize.startW + dx;
          nextH = resize.startH - dy;
          nextTop = resize.startBottom - nextH;
          break;
        case 'nw':
          nextW = resize.startW - dx;
          nextH = resize.startH - dy;
          nextLeft = resize.startRight - nextW;
          nextTop = resize.startBottom - nextH;
          break;
        default:
          break;
      }

      nextW = Math.max(BROWSER_MIN_W, nextW);
      nextH = Math.max(BROWSER_MIN_H, nextH);

      if (resize.corner === 'sw' || resize.corner === 'nw') {
        nextLeft = resize.startRight - nextW;
      }
      if (resize.corner === 'ne' || resize.corner === 'nw') {
        nextTop = resize.startBottom - nextH;
      }

      if (resize.corner === 'se' || resize.corner === 'ne') {
        nextW = Math.min(nextW, resize.fw - resize.startLeft);
      }
      if (resize.corner === 'sw' || resize.corner === 'nw') {
        nextW = Math.min(nextW, resize.startRight);
        if (nextLeft < 0) {
          nextLeft = 0;
          nextW = resize.startRight;
        }
      }
      if (resize.corner === 'se' || resize.corner === 'sw') {
        nextH = Math.min(nextH, resize.fh - resize.startTop);
      }
      if (resize.corner === 'ne' || resize.corner === 'nw') {
        nextH = Math.min(nextH, resize.startBottom);
        if (nextTop < 0) {
          nextTop = 0;
          nextH = resize.startBottom;
        }
      }

      setSizes((current) => ({
        ...current,
        [resize.id]: { w: nextW, h: nextH },
      }));

      if (resize.corner !== 'se') {
        setPositions((current) => ({
          ...current,
          [resize.id]: { left: nextLeft, top: nextTop },
        }));
      }
    };
    const up = () => {
      resizeRef.current = null;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onTitlePointerDown = (event, id) => {
    if (!interactive || event.button !== 0) return;
    if (event.target.closest('[data-window-chrome], [data-ipod-sticker], .aqua-window__resize')) return;
    const frame = frameRef.current;
    const node = event.currentTarget.closest('[data-os-window]');
    if (!frame || !node) return;
    event.preventDefault();
    focusWindow(id);
    const frameBox = frame.getBoundingClientRect();
    const box = node.getBoundingClientRect();
    const pinnedLeft = box.left - frameBox.left;
    const pinnedTop = box.top - frameBox.top;
    setPositions((current) => ({ ...current, [id]: { left: pinnedLeft, top: pinnedTop } }));
    dragRef.current = {
      id,
      dx: event.clientX - box.left,
      dy: event.clientY - box.top,
      fw: frameBox.width,
      fh: frameBox.height,
      ww: box.width,
      wh: box.height,
    };
    const move = (ev) => {
      const drag = dragRef.current;
      if (!drag) return;
      const nextFrame = frameRef.current?.getBoundingClientRect();
      if (!nextFrame) return;
      const left = Math.min(Math.max(0, ev.clientX - nextFrame.left - drag.dx), drag.fw - drag.ww);
      const top = Math.min(Math.max(0, ev.clientY - nextFrame.top - drag.dy), drag.fh - drag.wh);
      setPositions((current) => ({ ...current, [drag.id]: { left, top } }));
    };
    const up = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  useEffect(() => {
    if (!interactive) {
      dragRef.current = null;
      resizeRef.current = null;
    }
  }, [interactive]);

  useEffect(() => {
    if (!interactive) {
      setToastDismissed(false);
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setToastWave((wave) => wave + 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [interactive]);

  useEffect(() => {
    if (interactive) return;
    exitIntentRef.current.computer = 'close';
    setOpenIds((current) => current.filter((id) => id !== 'computer'));
    setMinimizedIds((current) => current.filter((id) => id !== 'computer'));
  }, [interactive]);

  useEffect(() => {
    if (!interactive || !openIds.includes('computer')) return undefined;
    const onPointerDown = (event) => {
      if (event.target.closest([
        '[data-os-window]',
        '.aqua-window',
        '.aqua-back',
        '.aqua-dock',
        '.aqua-desktop-icons',
        '[data-desktop-sticker]',
        '[data-apple-menu]',
        '[data-volume-extra]',
        '[data-aqua-toasts]',
      ].join(','))) {
        return;
      }
      closeWindow('computer');
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [interactive, openIds]);

  return (
    <div
      ref={setFrameRef}
      data-os-desktop
      className={`aqua-desktop overflow-hidden ${interactive ? 'pointer-events-auto' : 'pointer-events-none'} ${className}`}
      onPointerDown={onDesktopPointerDown}
      style={{
        transformOrigin: '50% 50%',
        willChange: interactive ? 'auto' : 'transform',
        ...style,
      }}
    >
      <AquaMenuBar
        interactive={interactive}
        aboutComputerOpen={openIds.includes('computer')}
        onToggleAboutComputer={() => {
          if (openIds.includes('computer')) closeWindow('computer');
          else if (minimizedIds.includes('computer')) restoreWindow('computer');
          else openWindow('computer');
        }}
      />

      <DesktopStickers interactive={interactive} />

      <DesktopIcons
        interactive={interactive}
        selectedId={selectedDesktopId}
        onSelect={setSelectedDesktopId}
        onOpen={handleDockOpen}
      />

      {interactive && toastWave > 0 && !toastDismissed ? (
        <DesktopToasts wave={toastWave} onDismiss={() => setToastDismissed(true)} />
      ) : null}

      <AnimatePresence>
        {openIds.includes('browser') && (
          <motion.div
            key="browser-dim"
            className="aqua-desktop__dim"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {onBack && (
        <div className="aqua-back">
          <span className="aqua-back__art" aria-hidden>
            <img className="aqua-back__gel" src="/images/aqua/button-gel.png?v=676270" alt="" draggable={false} />
          </span>
          <span className="aqua-back__label">Back</span>
          <button
            type="button"
            className="aqua-back__hit"
            onClick={onBack}
            disabled={!interactive}
            aria-label="Back"
          />
        </div>
      )}

      <AnimatePresence>
        {openIds.map((id) => {
          const z = 30 + zOrder.indexOf(id);
          const pos = positions[id];

          if (id === 'ipod') {
            const rest = restMotion(false);
            return (
              <motion.div
                key="ipod"
                data-os-window="ipod"
                className={`aqua-ipod${interactive ? ' aqua-ipod--live' : ''}`}
                style={{
                  ...(pos ? { left: pos.left, top: pos.top, right: 'auto' } : {}),
                  zIndex: z,
                }}
                initial={interactive ? riseMotion(false) : rest}
                animate={rest}
                transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.85 }}
                onPointerDown={(event) => onTitlePointerDown(event, 'ipod')}
              >
                <AquaIpod interactive={interactive} />
              </motion.div>
            );
          }

          const meta = windowCatalog[id];
          if (!meta) return null;
          const centered = !pos && meta.center;
          const rest = restMotion(centered);
          const enter = enterDeltas[id]
            ? dockMotion(centered, enterDeltas[id])
            : riseMotion(centered);
          const windowW = sizes[id]?.w ?? meta.w;
          const windowH = sizes[id]?.h ?? meta.h;

          return (
            <AquaWindow
              key={id}
              as={motion.article}
              windowId={id}
              title={id === 'browser'
                ? (browserUrl
                  ? (browserWebTitle || 'Xiaohongshu')
                  : browserSectionLabel(browserAppId))
                : meta.title}
              className={`absolute${meta.strip ? ' aqua-window--strip' : ''}${meta.card ? ' aqua-window--card' : ''}${meta.browser ? ' aqua-window--browser' : ''}${id === 'computer' ? ' aqua-window--computer' : ''}${id === 'projects' ? ' aqua-window--design' : ''}`}
              interactive={interactive}
              draggable
              resizable={meta.browser}
              canMinimize={id !== 'computer' && meta.canMinimize !== false}
              onClose={() => closeWindow(id)}
              onMinimize={() => minimizeWindow(id)}
              onTitlePointerDown={(event) => onTitlePointerDown(event, id)}
              onResizePointerDown={(event, corner) => onResizePointerDown(event, id, meta, corner)}
              titleId={id === 'computer' ? 'about-computer-title' : undefined}
              role={id === 'computer' ? 'dialog' : undefined}
              aria-labelledby={id === 'computer' ? 'about-computer-title' : undefined}
              style={{
                left: pos ? pos.left : (meta.left != null ? meta.left : `${meta.x}%`),
                top: pos ? pos.top : (meta.bottom != null ? 'auto' : (meta.top != null ? meta.top : `${meta.y}%`)),
                ...(pos || meta.bottom == null ? {} : { bottom: meta.bottom }),
                width: meta.strip ? 'max-content' : meta.card ? `${windowW}px` : `${meta.w}%`,
                height: meta.strip
                  ? 'auto'
                  : meta.card
                    ? (windowH != null ? `${windowH}px` : 'auto')
                    : `${meta.h}%`,
                ...(meta.browser
                  ? {
                    minWidth: `${BROWSER_MIN_W}px`,
                    minHeight: `${BROWSER_MIN_H}px`,
                    maxWidth: 'calc(100% - 48px)',
                    maxHeight: 'calc(100% - 132px)',
                  }
                  : {}),
                ...(id === 'about' && meta.h != null
                  ? { minHeight: `${meta.h}px`, maxHeight: `${meta.h}px` }
                  : {}),
                zIndex: id === 'browser' ? Math.max(z, BROWSER_DIM_Z + 1) : z,
              }}
              variants={{
                shown: rest,
                exit: () => {
                  if (exitIntentRef.current[id] === 'minimize') {
                    return {
                      ...dockMotion(centered, minimizeDeltaRef.current[id]),
                      transition: { duration: 0.38, ease: [0.42, 0, 0.9, 0.2] },
                    };
                  }
                  return {
                    ...rest,
                    opacity: 0,
                    transition: { duration: 0.22, ease: 'easeOut' },
                  };
                },
              }}
              initial={interactive ? enter : rest}
              animate="shown"
              exit="exit"
              transition={pos
                ? {
                    x: { duration: 0 },
                    y: { duration: 0 },
                    scale: { type: 'spring', stiffness: 320, damping: 30, mass: 0.85 },
                    opacity: { type: 'spring', stiffness: 320, damping: 30, mass: 0.85 },
                  }
                : { type: 'spring', stiffness: 320, damping: 30, mass: 0.85 }}
              onAnimationComplete={() => {
                setEnterDeltas((current) => {
                  if (!current[id]) return current;
                  const next = { ...current };
                  delete next[id];
                  return next;
                });
              }}
              onPointerDown={() => interactive && focusWindow(id)}
            >
              <WindowBody
                id={id}
                onOpenBrowser={openBrowserForApp}
                onOpenWeb={openBrowserForWeb}
                onPreviewDesign={setDesignPreview}
                browserAppId={browserAppId}
                onBrowserAppIdChange={handleBrowserAppIdChange}
                browserUrl={browserUrl}
                browserWebTitle={browserWebTitle}
                browserOpenTick={browserOpenTick}
              />
            </AquaWindow>
          );
        })}
      </AnimatePresence>

      <DesktopDock interactive={interactive} runningIds={runningIds} onOpen={handleDockOpen} />
      {designPreview != null ? (
        <DesignLightbox
          index={designPreview}
          onClose={closeDesignPreview}
          onStep={stepDesignPreview}
        />
      ) : null}
      <CrtScreen opacity={scanlineOpacity} />
    </div>
  );
});

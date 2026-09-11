import React, { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ForgeSticker, aquaStickerForgeOptions } from './forge-sticker';

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
    <path fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M9.5 3.5 5 8l4.5 4.5" />
  </svg>
);

const ForwardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
    <path fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M6.5 3.5 11 8l-4.5 4.5" />
  </svg>
);

const RELOAD_ICON = '/images/aqua/refresh-2-line.png';
const FOLDER_ICON = '/images/aqua/folder.png';

export const WORK_APPS = [
  { id: 'app1', src: '/app1.png', label: 'Doit！' },
  { id: 'app2', src: '/app2.png', label: 'Tracck！' },
  { id: 'app3', src: '/app3.png', label: 'Pockit' },
  { id: 'app4', src: '/app4.png', label: 'Curio' },
  { id: 'app5', src: '/app5.png', label: 'Olli' },
  { id: 'app6', src: '/app6.png', label: 'Lumon' },
];

export const OVERVIEW_ID = 'overview';

/** Sidebar order: Overview, Doit, then Pockit and the rest. */
const TOC_APP_ORDER = ['app1', 'app3', 'app2', 'app4', 'app6', 'app5'];

const APP_DETAIL = {
  app1: 'Do it！-四象限待办 任务管理',
  app3: 'Pockit -独立开发者收入看板',
  app2: 'Tracck！自媒体商单排期收入管理',
  app4: 'Curio 器物册：收藏管理与生命档案',
  app6: 'Lumon｜用户需求挖掘与产品研究Agent平台',
  app5: 'Olli｜桌面语音 Agent 助手',
};

export const BROWSER_TOC = [
  { id: OVERVIEW_ID, label: 'Overview', detail: 'Overview' },
  ...TOC_APP_ORDER.map((id) => {
    const app = WORK_APPS.find((item) => item.id === id);
    return app ? { ...app, detail: APP_DETAIL[id] || app.label } : null;
  }).filter(Boolean),
];

export const browserSectionLabel = (id) => (
  BROWSER_TOC.find((item) => item.id === id)?.label ?? 'App'
);

const appUrlFromLabel = (label) => `jason.space/my products/${label}`;

const appUrlFromId = (id) => appUrlFromLabel(browserSectionLabel(id));

const displayWebUrl = (url) => {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
};

const frameLooksBlocked = (frame) => {
  const href = frame.contentWindow?.location?.href ?? '';
  return !href || href === 'about:blank' || href.startsWith('chrome-error') || href.startsWith('about:neterror');
};

const bustUrl = (url, tick) => {
  if (!tick) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}_=${tick}`;
};

const StoreArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden>
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.2 11.8 11.8 4.2M6.8 4.2h5v5"
    />
  </svg>
);

const WebFrame = ({ url, title, reloadTick = 0 }) => {
  const frameRef = useRef(null);
  const [blocked, setBlocked] = useState(false);
  const frameSrc = bustUrl(url, reloadTick);

  useEffect(() => {
    setBlocked(false);
    const timer = window.setTimeout(() => {
      const frame = frameRef.current;
      if (!frame) return;
      try {
        if (frameLooksBlocked(frame)) setBlocked(true);
      } catch {
        setBlocked(false);
      }
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [frameSrc]);

  const handleLoad = () => {
    const frame = frameRef.current;
    if (!frame) return;
    try {
      setBlocked(frameLooksBlocked(frame));
    } catch {
      setBlocked(false);
    }
  };

  return (
    <div className="aqua-browser__web">
      <iframe
        key={frameSrc}
        ref={frameRef}
        className="aqua-browser__frame"
        src={frameSrc}
        title={title || 'Xiaohongshu'}
        onLoad={handleLoad}
      />
      {blocked ? (
        <div className="aqua-browser__web-fallback">
          <p className="aqua-browser__placeholder-title">{title || 'Xiaohongshu'}</p>
          <p className="aqua-browser__placeholder-hint">该页面不允许在窗口内嵌打开</p>
          <a
            className="aqua-browser__web-open"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            在新标签打开
          </a>
        </div>
      ) : null}
    </div>
  );
};

const overviewStickers = [
  { id: 'figure', src: '/images/aqua/stickers/figure.png', left: '2%', top: '18%', width: 132, rotate: -20, z: 2, aspect: 501 / 537 },
  { id: 'camera', src: '/images/aqua/stickers/camera.png', left: '16%', top: '52%', width: 140, rotate: 19, z: 3, aspect: 657 / 915 },
  { id: 'star', src: '/images/aqua/stickers/star.png', left: '48%', top: '14%', width: 108, rotate: -32, z: 4, aspect: 624 / 747, hint: '试试沿边缘撕开' },
  { id: 'bulb', src: '/images/aqua/stickers/bulb.png', left: '34%', top: '40%', width: 70, rotate: 27, z: 5, aspect: 196 / 334 },
];

const DOIT_HONORS = [
  { title: 'App Store效率榜', value: '#46' },
  { title: '即刻产品发布会', value: 'TOP1' },
];

const Honors = ({ items }) => (
  <div className="aqua-browser__honors" aria-label="荣誉">
    {items.map((honor) => (
      <div
        key={`${honor.kicker || honor.title}-${honor.value}`}
        className={`aqua-browser__honor${honor.kicker ? ' aqua-browser__honor--stacked' : ''}`}
      >
        <img
          className="aqua-browser__honor-wheat"
          src="/images/left-d.png"
          alt=""
          draggable={false}
        />
        <div className="aqua-browser__honor-copy">
          {honor.kicker ? (
            <>
              <span className="aqua-browser__honor-title">{honor.kicker}</span>
              <span className="aqua-browser__honor-value">{honor.value}</span>
              <span className="aqua-browser__honor-title">{honor.title}</span>
            </>
          ) : (
            <>
              <span className="aqua-browser__honor-title">{honor.title}</span>
              <span className="aqua-browser__honor-value">{honor.value}</span>
            </>
          )}
        </div>
        <img
          className="aqua-browser__honor-wheat"
          src="/images/right-d.png"
          alt=""
          draggable={false}
        />
      </div>
    ))}
  </div>
);

const DoitHonors = () => <Honors items={DOIT_HONORS} />;

/** Paywall / membership screenshot caption — use on every product page, not "Pro". */
export const SHOT_LABEL_SUBSCRIBE = '订阅页';

const DOIT_SHOTS = [
  { image: '/images/doit/quadrant.png', label: '四象限' },
  { image: '/images/doit/list.png', label: '列表' },
  { image: '/images/doit/calendar.png', label: '日历' },
  { image: '/images/doit/settings.png', label: '设置' },
  { image: '/images/doit/pro.png', label: SHOT_LABEL_SUBSCRIBE },
];

const DOIT_DESK_SHOTS = [
  { image: '/images/doit/mac-list.jpg', label: 'Mac列表' },
  { image: '/images/doit/mac-quadrant.jpg', label: 'Mac四象限' },
  { image: '/images/doit/widget.jpg', label: '桌面小组件' },
  { image: '/images/doit/create-task.jpg', label: '创建任务' },
];

const DOIT_STATS = [
  { value: '16,000+', label: '用户量' },
  { value: '12,000+', label: '美金' },
];

const DOIT_STORE_URL = 'https://apps.apple.com/cn/app/do-it-%E5%9B%9B%E8%B1%A1%E9%99%90%E5%BE%85%E5%8A%9E-%E4%BB%BB%E5%8A%A1%E7%AE%A1%E7%90%86/id6743646015';

const StoreLink = ({ href, children }) => {
  const isPlaceholder = !href || href === '#';
  return (
    <a
      className="aqua-browser__store"
      href={href || '#'}
      {...(isPlaceholder ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={isPlaceholder ? (event) => event.preventDefault() : undefined}
    >
      <span>{children}</span>
      <StoreArrowIcon />
    </a>
  );
};

const DOIT_ALL_SHOTS = [...DOIT_SHOTS, ...DOIT_DESK_SHOTS];

const ShotGroupTitle = ({ children }) => (
  <p className="aqua-browser__shot-group-title">{children}</p>
);

const PlayGlyph = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <path fill="currentColor" d="M5 3.15v9.7L13.4 8 5 3.15z" />
  </svg>
);

const ShotLightbox = ({ items, index, onClose, onStep }) => {
  const item = items[index];
  const showNav = items.length > 1 && typeof onStep === 'function';

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (!showNav) return;
      if (event.key === 'ArrowLeft') onStep(-1);
      if (event.key === 'ArrowRight') onStep(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onStep, showNav]);

  if (!item) return null;

  return (
    <div
      className="aqua-design-lightbox aqua-browser__lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.label}
      onClick={onClose}
    >
      {showNav ? (
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
      ) : null}
      <ShotImage
        className="aqua-design-lightbox__img"
        src={item.image}
        alt={item.label}
        loading="eager"
        decoding="async"
        draggable={false}
        onClick={(event) => event.stopPropagation()}
      />
      {showNav ? (
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
      ) : null}
    </div>
  );
};

const DemoClip = ({ src, poster, label = 'Demo', variant = 'phone' }) => {
  const videoRef = useRef(null);
  const homeSlotRef = useRef(null);
  const lightSlotRef = useRef(null);
  const playBtnRef = useRef(null);
  const expandedRef = useRef(false);
  const [expanded, setExpanded] = useState(false);

  const syncPlayButton = (playing) => {
    playBtnRef.current?.classList.toggle('is-hidden', Boolean(playing) || expandedRef.current);
  };

  useEffect(() => {
    const video = document.createElement('video');
    video.className = variant === 'web'
      ? 'aqua-browser__demo-video aqua-browser__demo-video--web'
      : 'aqua-browser__demo-video';
    video.src = src;
    video.poster = poster || '';
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.playbackRate = 1.5;
    video.defaultPlaybackRate = 1.5;
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    videoRef.current = video;
    homeSlotRef.current?.appendChild(video);

    const onPlay = () => {
      if (!expandedRef.current) syncPlayButton(true);
    };
    const onPause = () => {
      if (!expandedRef.current) syncPlayButton(false);
    };
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.remove();
      if (videoRef.current === video) videoRef.current = null;
    };
  }, [src, poster, variant]);

  useLayoutEffect(() => {
    if (!expanded) return;
    const video = videoRef.current;
    const slot = lightSlotRef.current;
    if (!video || !slot || video.parentNode === slot) return;
    const playing = !video.paused;
    slot.appendChild(video);
    video.className = variant === 'web'
      ? 'aqua-design-lightbox__video aqua-design-lightbox__video--web'
      : 'aqua-design-lightbox__video';
    video.controls = true;
    video.muted = false;
    video.playbackRate = 1.5;
    if (playing) {
      const play = video.play();
      if (play?.catch) play.catch(() => {});
    }
    syncPlayButton(playing);
  }, [expanded, variant]);

  useEffect(() => {
    if (!expanded) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // closeLightbox is defined below and only needs to run while expanded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const startHover = () => {
    if (expandedRef.current) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const play = video.play();
    if (play?.catch) play.catch(() => {});
    syncPlayButton(true);
  };

  const stopHover = () => {
    if (expandedRef.current) return;
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    syncPlayButton(false);
  };

  const openLightbox = () => {
    if (expandedRef.current) return;
    expandedRef.current = true;
    syncPlayButton(true);
    setExpanded(true);
  };

  const closeLightbox = () => {
    const video = videoRef.current;
    const home = homeSlotRef.current;
    const playing = Boolean(video && !video.paused);
    expandedRef.current = false;
    if (video && home && video.parentNode !== home) {
      home.appendChild(video);
      video.className = variant === 'web'
        ? 'aqua-browser__demo-video aqua-browser__demo-video--web'
        : 'aqua-browser__demo-video';
      video.controls = false;
      video.muted = true;
      video.playbackRate = 1.5;
      if (playing) {
        const play = video.play();
        if (play?.catch) play.catch(() => {});
      } else {
        video.pause();
      }
    }
    syncPlayButton(playing);
    setExpanded(false);
  };

  return (
    <figure className="aqua-browser__demo">
      <button
        type="button"
        className="aqua-browser__demo-hit"
        aria-label={label}
        onMouseEnter={startHover}
        onMouseLeave={stopHover}
        onClick={openLightbox}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <span ref={homeSlotRef} className="aqua-browser__demo-slot" />
        <span ref={playBtnRef} className="aqua-browser__demo-play" aria-hidden>
          <span className="aqua-browser__demo-play-icon">
            <PlayGlyph />
          </span>
        </span>
      </button>
      {expanded
        ? createPortal(
          <div
            className="aqua-design-lightbox aqua-browser__lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={label}
            onClick={closeLightbox}
          >
            <div
              ref={lightSlotRef}
              className="aqua-browser__demo-light-slot"
              onClick={(event) => event.stopPropagation()}
            />
          </div>,
          document.querySelector('.aqua-browser') || document.body,
        )
        : null}
    </figure>
  );
};

const InlineLoopVideo = ({ src, poster, style, holdMs = 0 }) => {
  const ref = useRef(null);
  const [armed, setArmed] = useState(holdMs <= 0);

  useEffect(() => {
    const video = ref.current;
    if (!video) return undefined;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = false;
    video.autoplay = false;
    setArmed(holdMs <= 0);

    let timer = 0;
    let cancelled = false;
    let started = false;

    const clearTimer = () => {
      window.clearTimeout(timer);
      timer = 0;
    };

    const playFromStart = () => {
      if (cancelled) return;
      setArmed(true);
      video.currentTime = 0;
      const play = video.play();
      if (play?.catch) play.catch(() => {});
    };

    const freezeLastThenPlay = () => {
      clearTimer();
      const duration = video.duration;
      const target = Number.isFinite(duration) && duration > 0
        ? Math.max(0, duration - 0.04)
        : 0;
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        video.pause();
        setArmed(true);
        timer = window.setTimeout(playFromStart, holdMs);
      };
      video.pause();
      video.addEventListener('seeked', onSeeked);
      if (Math.abs(video.currentTime - target) < 0.02) {
        onSeeked();
        return;
      }
      video.currentTime = target;
    };

    const onLoaded = () => {
      if (cancelled || started) return;
      started = true;
      if (holdMs > 0) freezeLastThenPlay();
      else playFromStart();
    };

    const onEnded = () => {
      if (cancelled) return;
      if (holdMs > 0) freezeLastThenPlay();
      else playFromStart();
    };

    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('ended', onEnded);
    if (video.readyState >= 1) onLoaded();

    return () => {
      cancelled = true;
      clearTimer();
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('ended', onEnded);
    };
  }, [src, holdMs]);

  return (
    <>
      {poster ? (
        <img
          className="aqua-browser__shot-overlay aqua-browser__shot-overlay-poster"
          src={poster}
          alt=""
          draggable={false}
          style={style}
        />
      ) : null}
      <video
        ref={ref}
        className={`aqua-browser__shot-overlay${armed ? '' : ' is-waiting'}`}
        src={src}
        muted
        playsInline
        disablePictureInPicture
        controls={false}
        preload="metadata"
        tabIndex={-1}
        aria-hidden
        style={style}
      />
    </>
  );
};

const ShotImage = ({ className, src, alt = '', loading = 'lazy', decoding = 'async', onLoad, onShown, ...rest }) => {
  const ref = useRef(null);
  const onShownRef = useRef(onShown);
  const [shown, setShown] = useState(false);
  onShownRef.current = onShown;

  const reveal = useCallback((event) => {
    setShown(true);
    onShownRef.current?.();
    onLoad?.(event);
  }, [onLoad]);

  useLayoutEffect(() => {
    setShown(false);
    const img = ref.current;
    if (img?.complete && img.naturalWidth > 0) {
      setShown(true);
      onShownRef.current?.();
    }
  }, [src]);

  return (
    <img
      ref={ref}
      className={`${className}${shown ? ' is-in' : ''}`}
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onLoad={reveal}
      {...rest}
    />
  );
};

const ShotMedia = ({ shot }) => {
  const [shown, setShown] = useState(false);

  return (
    <span className={`aqua-browser__shot-frame${shown ? ' is-in' : ''}`}>
      <ShotImage
        className="aqua-browser__shot-img"
        src={shot.image}
        alt={shot.label || ''}
        draggable={false}
        onShown={() => setShown(true)}
      />
      {shot.overlay ? (
        <InlineLoopVideo
          src={shot.overlay.src}
          poster={shot.overlay.poster}
          holdMs={shot.overlay.holdMs}
          style={{
            left: shot.overlay.left,
            top: shot.overlay.top,
            width: shot.overlay.width,
            height: shot.overlay.height,
          }}
        />
      ) : null}
    </span>
  );
};

const ShotGrid = ({ items, ariaLabel, variant = 'phone', onOpen, lead = null }) => (
  <div className={`aqua-browser__shots aqua-browser__shots--${variant}`} aria-label={ariaLabel}>
    {lead ? (
      <figure className="aqua-browser__shot aqua-browser__shot--demo">
        {lead}
      </figure>
    ) : null}
    {items.map((shot) => (
      <figure key={shot.image} className="aqua-browser__shot">
        <button
          type="button"
          className="aqua-browser__shot-hit"
          onClick={() => onOpen?.(shot)}
        >
          <ShotMedia shot={shot} />
        </button>
        {shot.label ? <figcaption className="aqua-browser__shot-label">{shot.label}</figcaption> : null}
      </figure>
    ))}
  </div>
);

const ShotStrip = ({ items, ariaLabel, onOpen, lead = null }) => (
  <div
    className="aqua-browser__shots aqua-browser__shots--strip"
    aria-label={ariaLabel}
    onPointerDown={(event) => event.stopPropagation()}
  >
    {lead ? (
      <figure className="aqua-browser__shot aqua-browser__shot--demo">
        {lead}
      </figure>
    ) : null}
    {items.map((shot) => (
      <figure key={shot.image} className="aqua-browser__shot">
        <button
          type="button"
          className="aqua-browser__shot-hit"
          onClick={() => onOpen?.(shot)}
        >
          <ShotImage
            className="aqua-browser__shot-img"
            src={shot.image}
            alt={shot.label || ''}
            draggable={false}
          />
        </button>
      </figure>
    ))}
  </div>
);

const DoitPage = memo(() => {
  const [preview, setPreview] = useState(null);

  const openShot = (shot) => {
    const index = DOIT_ALL_SHOTS.findIndex((item) => item.image === shot.image);
    if (index >= 0) setPreview(index);
  };

  const stepPreview = (delta) => {
    setPreview((current) => {
      if (current == null) return current;
      return (current + delta + DOIT_ALL_SHOTS.length) % DOIT_ALL_SHOTS.length;
    });
  };

  return (
    <article className="aqua-browser__overview aqua-browser__app-page">
      <header className="aqua-browser__app-head">
        <h1 className="aqua-browser__overview-title">Do it！-四象限待办 任务管理</h1>
        <DoitHonors />
      </header>
      <hr className="aqua-browser__overview-rule aqua-browser__app-rule" />
      <div className="aqua-browser__stats" aria-label="数据">
        {DOIT_STATS.map((stat) => (
          <div key={stat.label} className="aqua-browser__stat">
            <span className="aqua-browser__stat-value">{stat.value}</span>
            <span className="aqua-browser__stat-label">{stat.label}</span>
          </div>
        ))}
        <StoreLink href={DOIT_STORE_URL}>去 App store</StoreLink>
      </div>
      <div className="aqua-browser__overview-copy aqua-browser__app-copy">
        <p>一款简洁漂亮的任务管理App，采用时间四象限设计，用负担最小的方式，解放杂乱的思绪，帮助你专注真正重要事项</p>
      </div>
      <div className="aqua-browser__shot-group">
        <ShotGroupTitle>App</ShotGroupTitle>
        <ShotGrid items={DOIT_SHOTS} ariaLabel="手机截图" variant="phone" onOpen={openShot} />
      </div>
      <div className="aqua-browser__shot-group">
        <ShotGroupTitle>Mac</ShotGroupTitle>
        <ShotGrid items={DOIT_DESK_SHOTS} ariaLabel="桌面截图" variant="desk" onOpen={openShot} />
      </div>
      {preview != null
        ? createPortal(
          <ShotLightbox
            items={DOIT_ALL_SHOTS}
            index={preview}
            onClose={() => setPreview(null)}
            onStep={stepPreview}
          />,
          document.querySelector('.aqua-browser') || document.body,
        )
        : null}
    </article>
  );
});

const TRACCK_STORE_URL = 'https://apps.apple.com/cn/app/tracck-%E8%87%AA%E5%AA%92%E4%BD%93%E5%95%86%E5%8D%95%E6%8E%92%E6%9C%9F%E6%94%B6%E5%85%A5%E7%AE%A1%E7%90%86/id6743366923';
const POCKIT_STORE_URL = 'https://apps.apple.com/cn/app/pockit-%E7%8B%AC%E7%AB%8B%E5%BC%80%E5%8F%91%E8%80%85%E6%94%B6%E5%85%A5%E7%9C%8B%E6%9D%BF/id6775213732';
const CURIO_STORE_URL = 'https://apps.apple.com/cn/app/curio-%E5%99%A8%E7%89%A9%E5%86%8C-%E6%94%B6%E8%97%8F%E7%AE%A1%E7%90%86%E4%B8%8E%E7%94%9F%E5%91%BD%E6%A1%A3%E6%A1%88/id6781373090';
const LUMON_GITHUB_URL = 'https://github.com/jason2kkk/lumon';
const POCKIT_SHOTS = [
  { image: '/images/pockit/onboarding-01.jpg', label: '封面' },
  { image: '/images/pockit/onboarding-02.jpg', label: '欢迎' },
  { image: '/images/pockit/onboarding-03.jpg', label: '图表' },
  { image: '/images/pockit/onboarding-04.jpg', label: '提醒' },
  { image: '/images/pockit/onboarding-05.jpg', label: '小组件' },
  { image: '/images/pockit/onboarding-06.jpg', label: '评分' },
  { image: '/images/pockit/onboarding-07.jpg', label: '优惠码' },
  { image: '/images/pockit/onboarding-08.jpg', label: '评价' },
  { image: '/images/pockit/onboarding-09.jpg', label: '本地存储' },
  { image: '/images/pockit/onboarding-10.jpg', label: 'Connect' },
];

const POCKIT_UI_SHOTS = [
  { image: '/images/pockit/ui/01-home.jpg', label: '首页' },
  { image: '/images/pockit/ui/02-structure.png', label: '销售结构' },
  { image: '/images/pockit/ui/03-rating.png', label: '评分' },
  { image: '/images/pockit/ui/04-orders.png', label: '实时订单' },
  { image: '/images/pockit/ui/05-plus.jpg', label: SHOT_LABEL_SUBSCRIBE },
  { image: '/images/pockit/ui/06-regions.jpg', label: '下载地区' },
  { image: '/images/pockit/ui/07-reviews.png', label: '评价' },
  { image: '/images/pockit/ui/08-codes.png', label: '兑换码' },
  { image: '/images/pockit/ui/09-settings.png', label: '设置' },
  { image: '/images/pockit/ui/10-app.png', label: '应用详情' },
];

const TRACCK_LIGHT_SHOTS = [
  { image: '/images/tracck/light/01-home.jpg', label: '首页' },
  { image: '/images/tracck/light/02-calendar.png', label: '排期' },
  { image: '/images/tracck/light/03-heatmap.png', label: '热力图' },
  { image: '/images/tracck/light/04-pie.png', label: '合作类型' },
  { image: '/images/tracck/light/05-trend.png', label: '收入趋势' },
];

const TRACCK_DARK_SHOTS = [
  { image: '/images/tracck/dark/01-week.png', label: '周统计' },
  { image: '/images/tracck/dark/02-heatmap.png', label: '热力图' },
  { image: '/images/tracck/dark/03-calendar.png', label: '排期' },
  { image: '/images/tracck/dark/04-trend.png', label: '收入趋势' },
  { image: '/images/tracck/dark/05-pie.png', label: '合作类型' },
  { image: '/images/tracck/dark/06-home.jpg', label: '首页' },
  { image: '/images/tracck/dark/07-settings.png', label: '设置' },
  { image: '/images/tracck/dark/08-plus.png', label: SHOT_LABEL_SUBSCRIBE },
];

const CURIO_SHOTS_A = [
  { image: '/images/curio/01-cabinet.png', label: '展柜' },
  { image: '/images/curio/02-posters.png', label: '海报收藏' },
  { image: '/images/curio/03-objects.png', label: '物品' },
  { image: '/images/curio/04-series.png', label: '系列' },
];

const CURIO_SHOTS_B = [
  { image: '/images/curio/06-scan.png', label: '拍摄' },
  { image: '/images/curio/05-confirm.png', label: '新建' },
  { image: '/images/curio/07-detail.png', label: '档案' },
  { image: '/images/curio/08-plus.png', label: SHOT_LABEL_SUBSCRIBE },
  { image: '/images/curio/09-me.png', label: '我的' },
];

const OLLI_SHOTS = [
  {
    image: '/images/olli/01-desktop.png',
    label: '桌面',
    overlay: {
      src: '/videos/olli-run.mp4?v=face',
      poster: '/images/olli/run-last.jpg',
      holdMs: 2000,
      left: '50.4903%',
      top: '26.4643%',
      width: '9.5664%',
      height: '9.7088%',
    },
  },
];

const LUMON_VIDEO = {
  src: '/videos/lumon-demo.mp4',
  poster: '/images/lumon/video-poster.jpg',
  title: '录屏',
  variant: 'web',
};

const LUMON_SHOTS_A = [
  { image: '/images/lumon/01-mine.jpg', label: '需求挖掘' },
];

const LUMON_SHOTS_B = [
  { image: '/images/lumon/02-radar.jpg', label: '雷达搜索' },
  { image: '/images/lumon/03-discuss.jpg', label: '讨论需求' },
  { image: '/images/lumon/04-report.jpg', label: '产品报告' },
];

const LUMON_FEATURES = [
  { title: '需求挖掘', body: '规划 Agent 自动拆分搜索任务，采集社区帖子与评论，生成带原文链接的需求卡片。' },
  { title: '雷达搜索', body: '根据问题自动选择社区、竞品、App 评论或市场趋势数据源，并统一展示结果与来源。' },
  { title: '多角度讨论', body: '导演、产品经理、质疑者和投资人四个 Agent 分工讨论，沉淀产品方案、反对意见和最终结论。' },
  { title: '用户画像与报告', body: '基于已采集的证据生成 Persona、使用场景与研究报告，关键结论保留引用。' },
  { title: 'POC 验证', body: '围绕目标用户、需求证据和最小方案检查证据缺口，并给出下一步验证实验。' },
];

const LUMON_FLOW = [
  '输入研究方向',
  '搜索并采集公开讨论',
  '筛选、评分与聚类',
  '生成可回溯的需求主题',
  '讨论、报告与 POC 验证',
];

const LumonReadme = memo(() => (
  <section className="aqua-browser__readme" aria-label="工作说明">
    <div className="aqua-browser__readme-block">
      <h2 className="aqua-browser__readme-title">功能</h2>
      <ul className="aqua-browser__readme-list">
        {LUMON_FEATURES.map((item) => (
          <li key={item.title}>
            <strong>{item.title}</strong>
            ：
            {item.body}
          </li>
        ))}
      </ul>
    </div>
    <div className="aqua-browser__readme-block">
      <h2 className="aqua-browser__readme-title">工作流程</h2>
      <ol className="aqua-browser__flow" aria-label="工作流程">
        {LUMON_FLOW.map((step, index) => (
          <li key={step} className="aqua-browser__flow-item">
            <span className="aqua-browser__flow-node">{step}</span>
            {index < LUMON_FLOW.length - 1 ? (
              <span className="aqua-browser__flow-arrow" aria-hidden />
            ) : null}
          </li>
        ))}
      </ol>
    </div>
    <div className="aqua-browser__readme-block">
      <h2 className="aqua-browser__readme-title">工作原理</h2>
      <h3 className="aqua-browser__readme-sub">1. 搜索规划</h3>
      <p>Lumon 会把输入拆成痛点、解决方案、竞品和平台四类查询，同时生成适合 Web Search 的自然语言查询。搜索用于发现候选 URL，社区 CLI 用于读取原帖和评论上下文。</p>
      <p>快速模式和深度模式使用设置页当前选择的同一个通用模型。深度模式通过更大的搜索与评论预算、证据驱动二轮补搜和额外结果复核提高研究深度，不会切换到另一套模型或凭据。</p>
      <h3 className="aqua-browser__readme-sub">2. 筛选与评分</h3>
      <p>候选帖子先经过去重、时间范围、热度和需求信号过滤，再计算 1–5 分的单帖机会分：</p>
      <pre className="aqua-browser__readme-code">O_post = 0.25H + 0.20P + 0.20Q + 0.15A + 0.10W + 0.10S</pre>
      <p>其中 H 为热度共鸣，P 为痛点具体度，Q 为评论信号质量，A 为手工替代或切换行为，W 为付费或投入意愿，S 为软件可解性。</p>
      <p>评分用于排序研究材料，不代表需求已经得到市场验证。</p>
      <h3 className="aqua-browser__readme-sub">3. 证据与聚类</h3>
      <p>系统会优先深读高价值帖子的评论，并把可核对的正文或评论片段整理为证据包（Evidence Bundle）。证据包包含来源 URL、帖子或评论 ID、热度、平台和信号类型；只有能在原文中逐字匹配的内容才会标记为 verbatim。</p>
      <p>随后，Lumon 先过滤明显跑题内容并按底层任务粗分组，再为每组生成更具体的场景化标题和描述。需求组会综合高质量帖子、多帖支撑和来源多样性进行排序。</p>
      <h3 className="aqua-browser__readme-sub">4. 从需求继续研究</h3>
      <p>同一组证据可以继续用于：</p>
      <ul className="aqua-browser__readme-list">
        <li>多角色讨论：拆分争议点，形成产品方案并保留不同意见；</li>
        <li>用户画像：从真实行为和约束中识别差异明显的用户群；</li>
        <li>深度报告：补充竞品与市场信息，并约束关键结论引用已有证据；</li>
        <li>POC 验证：指出当前证据缺口和适合开展的下一步实验。</li>
      </ul>
      <p>
        搜索策略、回退路径、需求组评分和 FEMWC 评估方法见
        {' '}
        <a
          className="aqua-browser__readme-link"
          href="https://github.com/jason2kkk/lumon/blob/main/docs/HOW_IT_WORKS.md"
          target="_blank"
          rel="noopener noreferrer"
          onPointerDown={(event) => event.stopPropagation()}
        >
          Lumon 工作原理
        </a>
        。
      </p>
    </div>
  </section>
));

const ProductPage = memo(({
  title,
  copy,
  stats = [],
  honors = [],
  storeHref,
  storeLabel = '去 App store',
  storeInHead = false,
  shots = [],
  shotLayout,
  shotGroups,
  video,
  statsNote,
  titleNote,
  docs,
}) => {
  const [preview, setPreview] = useState(null);
  const gallery = shotGroups?.flatMap((group) => group.items || []) ?? shots;
  const store = storeHref
    ? <StoreLink href={storeHref}>{storeLabel}</StoreLink>
    : null;
  const showStatsRow = stats.length > 0 || Boolean(storeHref && !storeInHead);
  const openShot = (shot) => {
    const index = gallery.findIndex((item) => item.image === shot.image);
    if (index >= 0) setPreview(index);
  };
  const stepPreview = (delta) => {
    setPreview((current) => {
      if (current == null) return current;
      return (current + delta + gallery.length) % gallery.length;
    });
  };

  const renderGroup = (group, groupIndex) => {
    const items = group.items || [];
    return (
      <div key={group.title || `group-${groupIndex}`} className="aqua-browser__shot-group">
        {group.title ? <ShotGroupTitle>{group.title}</ShotGroupTitle> : null}
        {group.layout === 'strip' && (items.length || group.video) ? (
          <ShotStrip
            items={items}
            ariaLabel={group.title || '引导页'}
            onOpen={openShot}
            lead={group.video ? (
              <DemoClip
                src={group.video.src}
                poster={group.video.poster}
                label={group.video.title || 'Demo'}
              />
            ) : null}
          />
        ) : group.layout === 'empty' || !(items.length || group.video) ? (
          <div className="aqua-browser__shot-group-empty" aria-hidden />
        ) : (
          <ShotGrid
            items={items}
            ariaLabel={group.title || '截图'}
            variant={group.variant || 'phone'}
            onOpen={openShot}
            lead={group.video ? (
              <DemoClip
                src={group.video.src}
                poster={group.video.poster}
                label={group.video.title || 'Demo'}
                variant={group.video.variant || 'phone'}
              />
            ) : null}
          />
        )}
      </div>
    );
  };

  return (
    <article className="aqua-browser__overview aqua-browser__app-page">
      <header className="aqua-browser__app-head">
        <h1 className="aqua-browser__overview-title">
          {title}
          {titleNote ? <span className="aqua-browser__title-note">{titleNote}</span> : null}
        </h1>
        {honors.length ? (
          <Honors items={honors} />
        ) : storeInHead && store ? (
          store
        ) : null}
      </header>
      <hr className="aqua-browser__overview-rule aqua-browser__app-rule" />
      {showStatsRow ? (
        <div
          className={`aqua-browser__stats${stats.length ? '' : ' aqua-browser__stats--store-only'}`}
          aria-label="数据"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="aqua-browser__stat">
              <span className="aqua-browser__stat-value">{stat.value}</span>
              <span className="aqua-browser__stat-label">{stat.label}</span>
            </div>
          ))}
          {!storeInHead && store}
          {statsNote ? <p className="aqua-browser__stats-note">{statsNote}</p> : null}
        </div>
      ) : null}
      <div className="aqua-browser__overview-copy aqua-browser__app-copy">
        <p>{copy}</p>
      </div>
      {video && !shotGroups?.some((group) => group.video) ? (
        <div className="aqua-browser__shot-group">
          <ShotGroupTitle>{video.title || 'Demo'}</ShotGroupTitle>
          <DemoClip src={video.src} poster={video.poster} label={video.title || 'Demo'} />
        </div>
      ) : null}
      {shotGroups?.length ? (
        shotGroups.map((group, index) => renderGroup(group, index))
      ) : shotLayout === 'strip' && shots.length ? (
        <ShotStrip items={shots} ariaLabel="引导页" onOpen={openShot} />
      ) : shots.length ? (
        <ShotGrid items={shots} ariaLabel="截图" variant="phone" onOpen={openShot} />
      ) : null}
      {docs}
      {preview != null
        ? createPortal(
          <ShotLightbox
            items={gallery}
            index={preview}
            onClose={() => setPreview(null)}
            onStep={stepPreview}
          />,
          document.querySelector('.aqua-browser') || document.body,
        )
        : null}
    </article>
  );
});

const PRODUCT_PAGES = {
  app2: {
    title: 'Tracck！自媒体商单排期收入管理',
    copy: '一款专为内容创作者、自媒体博主打造的商单管理、排期工具；相比于常见的记账、任务、笔记App，Tracck！拥有收入计算、订单记录、排期等更多针对性的功能，能够帮助你减少繁琐的记录，专注创作本身',
    honors: [
      { title: '即刻产品发布会', value: 'TOP3' },
    ],
    stats: [
      { value: '4,000+', label: '用户量' },
      { value: '5,000+', label: '美金' },
    ],
    storeHref: TRACCK_STORE_URL,
    shotGroups: [
      { title: '亮色', layout: 'strip', items: TRACCK_LIGHT_SHOTS },
      { title: '暗夜', layout: 'strip', items: TRACCK_DARK_SHOTS },
    ],
  },
  app3: {
    title: 'Pockit -独立开发者收入看板',
    copy: '一款帮助开发者便捷追踪App收入表现的应用，随时在手机上查看App销量、收入、转化、来源、评分等数据，并获取实时订单与排名变化通知',
    honors: [
      { kicker: 'App Store', title: '软件开发榜', value: '#90' },
    ],
    storeHref: POCKIT_STORE_URL,
    shotGroups: [
      {
        title: 'Onboarding',
        layout: 'strip',
        video: {
          src: '/videos/pockit-demo.mp4?v=crf22',
          poster: '/images/pockit/video-poster.jpg',
          title: 'Demo',
        },
        items: POCKIT_SHOTS,
      },
      { title: 'UI图片', layout: 'strip', items: POCKIT_UI_SHOTS },
    ],
  },
  app4: {
    title: 'Curio 器物册：收藏管理与生命档案',
    copy: '一款面向器物收藏者的私人展柜与生命档案。盲盒、卡牌、专辑、海报、模型，或一只喜欢的杯子，用照片做成贴纸感封面，收进自己的展柜。',
    storeHref: CURIO_STORE_URL,
    storeInHead: true,
    shotGroups: [
      { layout: 'strip', items: CURIO_SHOTS_A },
      { layout: 'strip', items: CURIO_SHOTS_B },
    ],
  },
  app5: {
    title: 'Olli｜桌面语音 Agent 助手',
    titleNote: '（Demo阶段）',
    copy: '一款桌面级语音 Agent 助手，用户可通过自然语言实时唤醒助手，实现桌面语音对话交互，发起语音转写或屏幕理解、电脑控制、浏览器控制、文档/表格处理等多步骤任务',
    shotGroups: [
      { variant: 'web1', items: OLLI_SHOTS },
    ],
  },
  app6: {
    title: 'Lumon｜用户需求挖掘与产品研究Agent平台',
    copy: '基于公司内部的产品挖掘需求，个人独立开发的一款需求挖掘工具，帮助团队从 Reddit、Hacker News、Product Hunt等社区中发现、筛选和验证真实且值得投入的需求赛道，为POC产品提案提供有力研究依据',
    stats: [
      { value: '1,500+', label: '需求卡片' },
      { value: '200+', label: '产品报告' },
    ],
    statsNote: '（因公司内部仍在使用，不便公开链接，以下所有功能均已落地实现，非Demo）',
    storeHref: LUMON_GITHUB_URL,
    storeLabel: '去 GitHub',
    storeInHead: true,
    shotGroups: [
      { variant: 'web2', video: LUMON_VIDEO, items: LUMON_SHOTS_A },
      { variant: 'web3', items: LUMON_SHOTS_B },
    ],
    docs: <LumonReadme />,
  },
};

const OverviewPage = memo(() => (
  <article className="aqua-browser__overview">
    <h1 className="aqua-browser__overview-title">Overview</h1>
    <hr className="aqua-browser__overview-rule" />
    <div className="aqua-browser__overview-copy">
      <p>独立开发作品共有6款，涵盖iOS/MacOs App、 Web端开源Agent项目</p>
      <p>所有产品均为个人独立完成「产品定义、功能设计、UI/UX设计、开发、上架及后续推广」等所有工作内容</p>
      <p>多款产品已上架App store，并获得大批真实用户的好评认可，部分产品仍处于打磨开发阶段～</p>
    </div>
    <div className="aqua-browser__overview-stickers" aria-hidden>
      {overviewStickers.map((sticker) => (
        <div
          key={sticker.id}
          className="aqua-browser__overview-sticker"
          style={{
            left: sticker.left,
            top: sticker.top ?? 'auto',
            bottom: sticker.bottom ?? 'auto',
            width: sticker.width,
            aspectRatio: sticker.aspect,
            zIndex: sticker.z,
          }}
        >
          {sticker.hint ? (
            <div className="aqua-browser__sticker-hint" aria-hidden>
              <span className="aqua-browser__sticker-hint-copy">{sticker.hint}</span>
              <svg className="aqua-browser__sticker-hint-arrow" width="48" height="32" viewBox="0 0 48 32" fill="none">
                <path
                  d="M3.2 4.2C16.9 2.8 30.7 10.3 39.2 26.2"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <path
                  d="M34.6 25 39.4 26.6 37.2 21.9"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ) : null}
          <ForgeSticker
            src={sticker.src}
            alt=""
            tilt={sticker.rotate}
            aspect={sticker.aspect}
            enabled
            forgeOptions={aquaStickerForgeOptions}
          />
        </div>
      ))}
    </div>
    <img
      className="aqua-browser__overview-art"
      src="/images/素材1.png"
      alt=""
      draggable={false}
    />
  </article>
));

const AppsToc = memo(({ activeId, onSelect }) => (
  <nav className="aqua-browser__toc" aria-label="Apps">
    <ul className="aqua-browser__toc-list">
      {BROWSER_TOC.map((item, index) => {
        const selected = item.id === activeId;
        return (
          <li key={item.id}>
            <button
              type="button"
              className={`aqua-browser__toc-item${selected ? ' is-on' : ''}`}
              aria-current={selected ? 'location' : undefined}
              onClick={() => onSelect(item.id)}
              title={item.detail || item.label}
            >
              <span className="aqua-browser__toc-label">{index + 1}. {item.detail || item.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
));

const PagePane = ({ active, children }) => (
  <div
    className={`aqua-browser__page-pane${active ? '' : ' is-parked'}`}
    hidden={!active}
    aria-hidden={!active}
  >
    {children}
  </div>
);

export const BrowserWindowBody = ({
  appId = 'app1',
  onAppIdChange,
  webUrl = '',
  webTitle = 'Xiaohongshu',
  openTick = 0,
}) => {
  const [activeId, setActiveId] = useState(appId);
  const [reloadTick, setReloadTick] = useState(0);
  const inWeb = Boolean(webUrl);

  const activeSection = BROWSER_TOC.find((item) => item.id === activeId) ?? BROWSER_TOC[0];
  const url = inWeb ? displayWebUrl(webUrl) : appUrlFromId(activeSection.id);
  const pageTitle = webTitle || 'Xiaohongshu';

  useEffect(() => {
    setReloadTick(0);
  }, [webUrl, appId]);

  useEffect(() => {
    if (inWeb) return;
    setActiveId(appId);
  }, [appId, openTick, inWeb]);

  const selectApp = useCallback((id) => {
    setActiveId(id);
    onAppIdChange?.(id);
  }, [onAppIdChange]);

  const leaveWeb = () => {
    if (!inWeb) return;
    onAppIdChange?.(activeId);
  };

  const reloadPage = () => {
    setReloadTick((tick) => tick + 1);
  };

  return (
    <div className="aqua-browser">
      <div className="aqua-browser__chrome">
        <div className="aqua-browser__toolbar">
          <div className="aqua-browser__nav">
            <button
              type="button"
              className={`aqua-browser__btn${inWeb ? ' is-live' : ''}`}
              aria-label="Back"
              tabIndex={inWeb ? 0 : -1}
              onClick={leaveWeb}
            >
              <BackIcon />
            </button>
            <button type="button" className="aqua-browser__btn" aria-label="Forward" tabIndex={-1}>
              <ForwardIcon />
            </button>
          </div>
          <div className="aqua-browser__address">
            <input className="aqua-browser__url" readOnly value={url} aria-label="Address" tabIndex={-1} />
            <button
              type="button"
              className="aqua-browser__reload"
              aria-label="Reload"
              onClick={reloadPage}
            >
              <img className="aqua-browser__reload-icon" src={RELOAD_ICON} alt="" draggable={false} />
            </button>
          </div>
        </div>
        <div className="aqua-browser__bookmarks" aria-label="Folders">
          {TOC_APP_ORDER.map((id) => {
            const app = WORK_APPS.find((item) => item.id === id);
            if (!app) return null;
            const selected = !inWeb && activeId === app.id;
            return (
              <button
                key={app.id}
                type="button"
                className={`aqua-browser__bookmark${selected ? ' is-on' : ''}`}
                aria-current={selected ? 'location' : undefined}
                onClick={() => selectApp(app.id)}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <img className="aqua-browser__bookmark-icon" src={FOLDER_ICON} alt="" draggable={false} />
                <span className="aqua-browser__bookmark-label">{app.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={`aqua-browser__viewport${inWeb ? ' is-web' : ''}`}
        aria-label={inWeb ? pageTitle : 'My Products'}
      >
        <div className={`aqua-browser__workspace${inWeb ? ' is-parked' : ''}`}>
          <AppsToc activeId={activeId} onSelect={selectApp} />
          <div className="aqua-browser__page">
            <PagePane active={activeId === OVERVIEW_ID}>
              <OverviewPage />
            </PagePane>
            {activeId === 'app1' ? (
              <PagePane active>
                <DoitPage />
              </PagePane>
            ) : null}
            {activeId !== OVERVIEW_ID && activeId !== 'app1' && PRODUCT_PAGES[activeId] ? (
              <PagePane active>
                <ProductPage {...PRODUCT_PAGES[activeId]} />
              </PagePane>
            ) : null}
            {activeId !== OVERVIEW_ID && activeId !== 'app1' && !PRODUCT_PAGES[activeId] ? (
              <PagePane active>
                <div className="aqua-browser__blank" aria-label={activeSection.label} />
              </PagePane>
            ) : null}
          </div>
        </div>
        {inWeb ? (
          <WebFrame url={webUrl} title={pageTitle} reloadTick={reloadTick} />
        ) : null}
      </div>

      <div className="aqua-browser__status">
        <span>{inWeb ? `Opening ${pageTitle}…` : `Loading ${activeSection.label}…`}</span>
      </div>
    </div>
  );
};

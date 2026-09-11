import React, { useEffect, useRef, useState } from 'react';
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

export const WORK_APPS = [
  { id: 'app1', src: '/app1.png', label: 'Doit！' },
  { id: 'app2', src: '/app2.png', label: 'Tracck！' },
  { id: 'app3', src: '/app3.png', label: 'Pockit' },
  { id: 'app4', src: '/app4.png', label: 'Curio' },
  { id: 'app5', src: '/app5.png', label: 'Olli' },
  { id: 'app6', src: '/app6.png', label: 'Lumon' },
];

export const OVERVIEW_ID = 'overview';

export const BROWSER_TOC = [
  { id: OVERVIEW_ID, label: 'Overview' },
  ...WORK_APPS,
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
  { id: 'figure', src: '/images/aqua/stickers/figure.png', left: '2%', top: '6%', width: 132, rotate: -20, z: 2, aspect: 501 / 537 },
  { id: 'camera', src: '/images/aqua/stickers/camera.png', left: '16%', top: '48%', width: 140, rotate: 19, z: 3, aspect: 657 / 915 },
  { id: 'star', src: '/images/aqua/stickers/star.png', left: '48%', top: '10%', width: 108, rotate: -32, z: 4, aspect: 624 / 747 },
  { id: 'bulb', src: '/images/aqua/stickers/bulb.png', left: '34%', top: '36%', width: 70, rotate: 27, z: 5, aspect: 196 / 334 },
];

const OverviewPage = () => (
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
);

const AppsToc = ({ activeId, onSelect }) => (
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
            >
              <span className="aqua-browser__toc-label">{index + 1}. {item.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
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

  const selectApp = (id) => {
    setActiveId(id);
    onAppIdChange?.(id);
  };

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
      </div>

      <div
        className={`aqua-browser__viewport${inWeb ? ' is-web' : ''}`}
        aria-label={inWeb ? pageTitle : 'My Products'}
      >
        {inWeb ? (
          <WebFrame url={webUrl} title={pageTitle} reloadTick={reloadTick} />
        ) : (
          <>
            <AppsToc activeId={activeId} onSelect={selectApp} />
            <div
              key={`${activeSection.id}-${reloadTick}`}
              className="aqua-browser__page"
            >
              {activeSection.id === OVERVIEW_ID ? (
                <OverviewPage />
              ) : (
                <div className="aqua-browser__blank" aria-label={activeSection.label} />
              )}
            </div>
          </>
        )}
      </div>

      <div className="aqua-browser__status">
        <span>{inWeb ? `Opening ${pageTitle}…` : `Loading ${activeSection.label}…`}</span>
      </div>
    </div>
  );
};

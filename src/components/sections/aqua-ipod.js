import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getVolume, subscribe, unlockAudio } from '../../lib/aqua-volume';
import { ForgeSticker, ipodStickerForgeOptions } from '../ui/forge-sticker';

const PLAYLIST = [
  {
    id: 'sunflower',
    title: 'Sunflower (Spider-Man: Into the Spider-Verse)',
    artist: 'Post Malone & Swae Lee',
    album: 'Spider-Man: Into the Spider-Verse',
    src: '/ipod/Sunflower%20(Spider-Man_%20Into%20the%20Spider-Verse)-Post%20Malone%26Swae%20Lee.mp3',
    art: '/ipod/Sunflower.png',
  },
  {
    id: '50-feet',
    title: '50 Feet',
    artist: 'SoMo',
    album: '',
    src: '/ipod/50%20Feet.mp3',
    art: '/ipod/iShot_2026-09-10_11.49.22.png',
  },
  {
    id: 'double-take',
    title: 'double take',
    artist: 'dhruv',
    album: '',
    src: '/ipod/double%20take.mp3',
    art: '/ipod/double%20take.png',
  },
];

const nowPlayingText = (track) => `${track.title} — ${track.artist}`;

const TITLE_GAP = 14;

const NowPlayingTitle = ({ text }) => {
  const clipRef = useRef(null);
  const measureRef = useRef(null);
  const [shift, setShift] = useState(0);

  useLayoutEffect(() => {
    const clip = clipRef.current;
    const measure = measureRef.current;
    if (!clip || !measure) return undefined;

    const update = () => {
      const overflow = measure.scrollWidth - clip.clientWidth;
      setShift(overflow > 1 ? measure.scrollWidth + TITLE_GAP : 0);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(clip);
    return () => observer.disconnect();
  }, [text]);

  const scrolling = shift > 0;
  const duration = Math.max(7.5, shift / 16);

  return (
    <span className={`aqua-ipod-now__title${scrolling ? ' is-overflow' : ''}`} ref={clipRef}>
      <span
        className={`aqua-ipod-now__title-run${scrolling ? ' is-marquee' : ''}`}
        style={scrolling ? {
          '--marquee-shift': `${shift}px`,
          '--marquee-duration': `${duration}s`,
        } : undefined}
      >
        <span ref={measureRef} className="aqua-ipod-now__title-text">{text}</span>
        {scrolling ? (
          <span className="aqua-ipod-now__title-text" aria-hidden>{text}</span>
        ) : null}
      </span>
    </span>
  );
};

const HOLD_MS = 380;
const SEEK_RATE = 10;
const COVER_TRANSITION = { duration: 0.42, ease: [0.22, 1, 0.36, 1] };

const COVER_SLOTS = {
  farLeft: { x: '-138%', rotateY: 46, scale: 0.68, opacity: 0, z: -36, zIndex: 0 },
  left: { x: '-106%', rotateY: 34, scale: 0.76, opacity: 0.66, z: -20, zIndex: 1 },
  center: { x: '-50%', rotateY: 0, scale: 1, opacity: 1, z: 12, zIndex: 3 },
  right: { x: '6%', rotateY: -34, scale: 0.76, opacity: 0.64, z: -20, zIndex: 1 },
  farRight: { x: '38%', rotateY: -46, scale: 0.68, opacity: 0, z: -36, zIndex: 0 },
};

const coverVariants = {
  enter: (dir) => (dir > 0 ? COVER_SLOTS.farRight : COVER_SLOTS.farLeft),
  left: COVER_SLOTS.left,
  center: COVER_SLOTS.center,
  right: COVER_SLOTS.right,
  exit: (dir) => (dir > 0 ? COVER_SLOTS.farLeft : COVER_SLOTS.farRight),
};

const CoverStack = ({ cursor, direction }) => {
  const total = PLAYLIST.length;
  const items = [-1, 0, 1].map((offset) => {
    const tape = cursor + offset;
    const track = PLAYLIST[((tape % total) + total) % total];
    const slot = offset < 0 ? 'left' : offset > 0 ? 'right' : 'center';
    return { key: `tape-${tape}`, track, slot };
  });

  return (
    <div className="aqua-ipod-now__stack" aria-hidden>
      <AnimatePresence initial={false} custom={direction}>
        {items.map(({ key, track, slot }) => (
          <motion.div
            key={key}
            className={`aqua-ipod-now__card aqua-ipod-now__card--${slot}`}
            custom={direction}
            variants={coverVariants}
            initial="enter"
            animate={slot}
            exit="exit"
            transition={COVER_TRANSITION}
          >
            <img src={track.art} alt="" draggable={false} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const formatIpodTime = (seconds, remaining = false) => {
  if (!Number.isFinite(seconds) || seconds < 0) return remaining ? '-0:00' : '0:00';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  const body = `${m}:${String(s).padStart(2, '0')}`;
  return remaining ? `-${body}` : body;
};

const BatteryIcon = () => (
  <svg className="aqua-ipod-lcd__battery" viewBox="0 0 17 8" aria-hidden>
    <rect x="0.6" y="1.2" width="14.2" height="5.6" rx="0.8" fill="none" stroke="currentColor" strokeWidth="0.9" />
    <rect x="2" y="2.4" width="8.6" height="3.2" fill="currentColor" />
    <path d="M15.4 2.8h1v2.4h-1z" fill="currentColor" />
  </svg>
);

const PlayStatusIcon = ({ playing }) => (
  playing ? (
    <svg className="aqua-ipod-lcd__status-icon" viewBox="0 0 8 8" aria-hidden>
      <rect x="1.1" y="1.1" width="1.8" height="5.8" fill="currentColor" />
      <rect x="5.1" y="1.1" width="1.8" height="5.8" fill="currentColor" />
    </svg>
  ) : (
    <svg className="aqua-ipod-lcd__status-icon" viewBox="0 0 8 8" aria-hidden>
      <path d="M1.6 0.8v6.4L7.2 4z" fill="currentColor" />
    </svg>
  )
);

export const AquaIpod = ({ interactive = false }) => {
  const audioRef = useRef(null);
  const holdTimerRef = useRef(null);
  const seekingRef = useRef(null);
  const seekRafRef = useRef(0);
  const lastSeekRef = useRef(0);
  const indexRef = useRef(0);
  const cursorRef = useRef(0);
  const userPausedRef = useRef(true);
  const wantPlayRef = useRef(false);

  const [view, setView] = useState('now-playing');
  const [cursor, setCursor] = useState(0);
  const [direction, setDirection] = useState(1);
  const [highlight, setHighlight] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);

  const total = PLAYLIST.length;
  const index = ((cursor % total) + total) % total;
  indexRef.current = index;
  const track = PLAYLIST[index];

  const applyVolume = useCallback(() => {
    const node = audioRef.current;
    if (node) node.volume = getVolume() / 100;
  }, []);

  useEffect(() => subscribe(applyVolume), [applyVolume]);

  useEffect(() => {
    applyVolume();
  }, [index, applyVolume]);

  const playNode = useCallback((node) => {
    if (!node) return;
    unlockAudio();
    applyVolume();
    node.play().then(() => setPlaying(true)).catch(() => {
      if (!wantPlayRef.current) setPlaying(false);
    });
  }, [applyVolume]);

  const loadTrack = useCallback((nextIndex, { autoplay = false } = {}) => {
    const node = audioRef.current;
    const next = (nextIndex + PLAYLIST.length) % PLAYLIST.length;
    const current = ((cursorRef.current % PLAYLIST.length) + PLAYLIST.length) % PLAYLIST.length;
    wantPlayRef.current = autoplay;
    if (autoplay) userPausedRef.current = false;
    if (next !== current) {
      let delta = (next - current + PLAYLIST.length) % PLAYLIST.length;
      if (delta > PLAYLIST.length / 2) delta -= PLAYLIST.length;
      cursorRef.current += delta;
      setDirection(delta > 0 ? 1 : -1);
      setCursor(cursorRef.current);
    }
    setHighlight(next);
    setElapsed(0);
    if (!node) return;
    applyVolume();
    if (next === current) {
      node.currentTime = 0;
      if (autoplay) playNode(node);
      else {
        node.pause();
        setPlaying(false);
      }
    }
  }, [applyVolume, playNode]);

  useLayoutEffect(() => {
    const node = audioRef.current;
    if (!node) return;
    applyVolume();
    if (wantPlayRef.current) playNode(node);
  }, [index, track.src, applyVolume, playNode]);

  const togglePlay = useCallback(() => {
    const node = audioRef.current;
    if (!node) return;
    unlockAudio();
    applyVolume();
    if (node.paused) {
      userPausedRef.current = false;
      wantPlayRef.current = true;
      playNode(node);
    } else {
      userPausedRef.current = true;
      wantPlayRef.current = false;
      node.pause();
      setPlaying(false);
    }
  }, [applyVolume, playNode]);

  const skip = useCallback((delta) => {
    loadTrack(indexRef.current + delta, { autoplay: !userPausedRef.current });
  }, [loadTrack]);

  const onTrackEnded = useCallback(() => {
    if (userPausedRef.current) {
      wantPlayRef.current = false;
      setPlaying(false);
      return;
    }
    loadTrack(indexRef.current + 1, { autoplay: true });
  }, [loadTrack]);

  const stopHold = useCallback(() => {
    window.clearTimeout(holdTimerRef.current);
    holdTimerRef.current = null;
    if (seekRafRef.current) {
      window.cancelAnimationFrame(seekRafRef.current);
      seekRafRef.current = 0;
    }
    const wasSeeking = Boolean(seekingRef.current);
    seekingRef.current = null;
    return wasSeeking;
  }, []);

  const tickSeek = useCallback((now) => {
    const dir = seekingRef.current;
    const node = audioRef.current;
    if (!dir || !node) return;
    const dt = (now - lastSeekRef.current) / 1000;
    lastSeekRef.current = now;
    const next = Math.min(
      node.duration || 0,
      Math.max(0, node.currentTime + (dir === 'ff' ? 1 : -1) * SEEK_RATE * dt),
    );
    node.currentTime = next;
    setElapsed(next);
    seekRafRef.current = window.requestAnimationFrame(tickSeek);
  }, []);

  const beginHold = useCallback((dir) => {
    window.clearTimeout(holdTimerRef.current);
    holdTimerRef.current = window.setTimeout(() => {
      const node = audioRef.current;
      if (!node || !Number.isFinite(node.duration)) return;
      seekingRef.current = dir;
      lastSeekRef.current = performance.now();
      seekRafRef.current = window.requestAnimationFrame(tickSeek);
    }, HOLD_MS);
  }, [tickSeek]);

  useEffect(() => () => stopHold(), [stopHold]);

  const onMenu = (event) => {
    event.stopPropagation();
    if (!interactive) return;
    setView((current) => {
      if (current === 'now-playing') return 'songs';
      if (current === 'songs') return 'music';
      return 'music';
    });
  };

  const onSelect = (event) => {
    event.stopPropagation();
    if (!interactive) return;
    if (view === 'music') {
      setView('songs');
      return;
    }
    if (view === 'songs') {
      userPausedRef.current = false;
      loadTrack(highlight, { autoplay: true });
      setView('now-playing');
    }
  };

  const onPlayPause = (event) => {
    event.stopPropagation();
    if (!interactive) return;
    stopHold();
    togglePlay();
  };

  const onSkipPointerDown = (dir) => (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (!interactive) return;
    unlockAudio();
    beginHold(dir);
  };

  const onSkipPointerUp = (dir) => (event) => {
    event.stopPropagation();
    if (!interactive) return;
    const wasSeeking = stopHold();
    if (!wasSeeking) skip(dir === 'ff' ? 1 : -1);
  };

  const remaining = duration > 0 ? Math.max(0, duration - elapsed) : 0;
  const progress = duration > 0 ? Math.min(1, elapsed / duration) : 0;

  return (
    <>
      <img className="aqua-ipod__face" src="/images/aqua/ipod.png" alt="" draggable={false} />
      <div
        className="aqua-ipod-deco aqua-ipod-deco--gray"
        data-ipod-sticker="gray"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <ForgeSticker
          src="/images/aqua/stickers/cat-gray.png"
          alt=""
          tilt={-14}
          aspect={267 / 178}
          enabled={interactive}
          forgeOptions={ipodStickerForgeOptions}
        />
      </div>
      <div
        className="aqua-ipod-deco aqua-ipod-deco--orange"
        data-ipod-sticker="orange"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <ForgeSticker
          src="/images/aqua/stickers/cat-orange.png"
          alt=""
          tilt={27}
          aspect={193 / 136}
          enabled={interactive}
          forgeOptions={ipodStickerForgeOptions}
        />
      </div>

      <div className="aqua-ipod-lcd" aria-live="polite">
        {view === 'now-playing' && (
          <div className="aqua-ipod-now">
            <div className="aqua-ipod-now__bar">
              <span className="aqua-ipod-now__label">正在播放</span>
              <NowPlayingTitle text={nowPlayingText(track)} />
              <span className="aqua-ipod-now__status">
                <PlayStatusIcon playing={playing} />
                <BatteryIcon />
              </span>
            </div>
            <div className="aqua-ipod-now__body">
              <CoverStack cursor={cursor} direction={direction} />
            </div>
            <div className="aqua-ipod-now__progress">
              <span>{formatIpodTime(elapsed)}</span>
              <span className="aqua-ipod-now__rail" aria-hidden>
                <span className="aqua-ipod-now__fill" style={{ width: `${progress * 100}%` }} />
              </span>
              <span>{formatIpodTime(remaining, true)}</span>
            </div>
          </div>
        )}

        {view === 'songs' && (
          <div className="aqua-ipod-list">
            <div className="aqua-ipod-list__bar">
              <span>歌曲</span>
              <span>{highlight + 1}/{total}</span>
            </div>
            <ul className="aqua-ipod-list__rows">
              {PLAYLIST.map((item, i) => (
                <li
                  key={item.id}
                  className={i === highlight ? 'is-on' : undefined}
                >
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {view === 'music' && (
          <div className="aqua-ipod-list">
            <div className="aqua-ipod-list__bar">
              <span>音乐</span>
            </div>
            <ul className="aqua-ipod-list__rows">
              <li className="is-on">歌曲</li>
            </ul>
          </div>
        )}
      </div>

      <button type="button" className="aqua-ipod-hit aqua-ipod-hit--menu" aria-label="Menu" disabled={!interactive} onPointerDown={onMenu} />
      <button type="button" className="aqua-ipod-hit aqua-ipod-hit--prev" aria-label="Previous" disabled={!interactive} onPointerDown={onSkipPointerDown('rew')} onPointerUp={onSkipPointerUp('rew')} onPointerCancel={onSkipPointerUp('rew')} />
      <button type="button" className="aqua-ipod-hit aqua-ipod-hit--next" aria-label="Next" disabled={!interactive} onPointerDown={onSkipPointerDown('ff')} onPointerUp={onSkipPointerUp('ff')} onPointerCancel={onSkipPointerUp('ff')} />
      <button type="button" className="aqua-ipod-hit aqua-ipod-hit--play" aria-label="Play pause" disabled={!interactive} onPointerDown={onPlayPause} />
      <button type="button" className="aqua-ipod-hit aqua-ipod-hit--select" aria-label="Select" disabled={!interactive} onPointerDown={onSelect} />

      <audio
        ref={audioRef}
        src={track.src}
        preload="metadata"
        onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime || 0)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || 0);
          applyVolume();
          if (wantPlayRef.current) playNode(event.currentTarget);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => {
          if (wantPlayRef.current) return;
          setPlaying(false);
        }}
        onEnded={onTrackEnded}
      />
    </>
  );
};

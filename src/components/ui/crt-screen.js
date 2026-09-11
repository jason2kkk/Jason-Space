import React, { useId } from 'react';

export const CrtScreen = ({ className = '', opacity = 1 }) => {
  const reactId = useId().replace(/:/g, '');
  const bulgeId = `crt-bulge-${reactId}`;
  const noiseId = `crt-noise-${reactId}`;

  return (
    <div
      className={`crt-screen ${className}`}
      aria-hidden="true"
      style={{
        opacity,
        transition: 'opacity 0.55s ease',
        visibility: opacity <= 0.01 ? 'hidden' : 'visible',
      }}
    >
      <svg className="crt-screen__defs" aria-hidden="true">
        <defs>
          <filter id={bulgeId} x="-6%" y="-6%" width="112%" height="112%" colorInterpolationFilters="sRGB">
            <feImage
              href={`data:image/svg+xml;utf8,${encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><radialGradient id="g" cx="50%" cy="48%" r="62%"><stop offset="0%" stop-color="rgb(168,168,168)"/><stop offset="70%" stop-color="rgb(128,128,128)"/><stop offset="100%" stop-color="rgb(92,92,92)"/></radialGradient><rect width="64" height="64" fill="url(#g)"/></svg>',
              )}`}
              result="map"
              preserveAspectRatio="none"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale="8"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id={noiseId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
          </filter>
        </defs>
      </svg>
      <div className="crt-screen__warp" style={{ filter: `url(#${bulgeId})` }}>
        <div className="crt-screen__scanlines" />
        <div className="crt-screen__phosphor" />
      </div>
      <div className="crt-screen__bloom" />
      <div className="crt-screen__vignette" />
      <div className="crt-screen__grain" style={{ filter: `url(#${noiseId})` }} />
      <div className="crt-screen__glass" />
    </div>
  );
};

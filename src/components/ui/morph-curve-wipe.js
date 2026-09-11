import React, { useId, useMemo } from 'react';

// MorphSVG Curve · from oriform.art · keep this line if redistributing
// Original keyframes (viewBox 0 0 100 100):
//   start M 0 100 V 100 Q 50 100 100 100 V 100 z
//   mid   M 0 100 V 50 Q 50 0 100 50 V 100 z
//   end   M 0 100 V 0 Q 50 0 100 0 V 100 z

const START = { side: 100, control: 100 };
const MID = { side: 50, control: 0 };
const END = { side: 0, control: 0 };

const lerp = (from, to, t) => from + (to - from) * t;

const sampleCurve = (progress) => {
  const t = Math.min(1, Math.max(0, progress));
  if (t <= 0.5) {
    const p = t / 0.5;
    return {
      side: lerp(START.side, MID.side, p),
      control: lerp(START.control, MID.control, p),
    };
  }
  const p = (t - 0.5) / 0.5;
  return {
    side: lerp(MID.side, END.side, p),
    control: lerp(MID.control, END.control, p),
  };
};

export const morphCurvePath = (progress, scale = 1) => {
  const { side, control } = sampleCurve(progress);
  return `M 0 ${100 * scale} V ${side * scale} Q ${50 * scale} ${control * scale} ${100 * scale} ${side * scale} V ${100 * scale} z`;
};

export const MorphCurveWipe = ({
  progress = 0,
  entered = false,
  children,
  className = '',
}) => {
  const reactId = useId().replace(/:/g, '');
  const clipId = `morph-curve-wipe-${reactId}`;
  const morphProgress = Math.min(1, Math.max(0, progress));
  const pathUnit = useMemo(() => morphCurvePath(morphProgress, 0.01), [morphProgress]);
  const overlayOpacity = morphProgress <= 0.004 ? 0 : 1;

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{
        opacity: overlayOpacity,
        pointerEvents: entered ? 'auto' : 'none',
      }}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* MorphSVG Curve · from oriform.art · keep this line if redistributing */}
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={pathUnit} />
          </clipPath>
        </defs>
      </svg>
      <div
        className="absolute inset-0"
        style={{
          clipPath: entered ? 'none' : `url(#${clipId})`,
          WebkitClipPath: entered ? 'none' : `url(#${clipId})`,
          filter: entered ? 'none' : 'drop-shadow(0 -18px 28px rgba(0,0,0,0.28))',
        }}
      >
        {children}
      </div>
    </div>
  );
};

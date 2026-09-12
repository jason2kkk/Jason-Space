import { useEffect, useState } from 'react';

/** Narrow / phone layout only. Desktop (min-width: 900px) never matches. */
export const MOBILE_MQ = '(max-width: 899.98px)';

export const matchesMobileLayout = () => (
  typeof window !== 'undefined' && window.matchMedia(MOBILE_MQ).matches
);

export const useMobileLayout = () => {
  const [narrow, setNarrow] = useState(matchesMobileLayout);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_MQ);
    const sync = () => setNarrow(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return narrow;
};

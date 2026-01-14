import React from 'react';
import { cn } from '../../lib/utils';
import { translations } from '../../locales/translations';
import { ShimmerButton } from './shimmer-button';

export const LanguageSwitch = ({ currentLang, onToggle }) => {
  const isDark = document.documentElement.classList.contains('dark');
  
  return (
    <ShimmerButton
      onClick={onToggle}
      shimmerColor={isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"}
      background={isDark ? "rgba(31, 41, 55, 0.8)" : "rgba(250, 250, 250, 0.8)"}
      shimmerSize="0.1em"
      shimmerDuration="3s"
      className={cn(
        "flex items-center gap-2 px-4 py-2",
        "text-sm font-medium",
        "text-gray-700 dark:text-gray-200",
        "border-gray-200/20 dark:border-gray-700/30",
        "backdrop-blur-[2px]"
      )}
    >
      {translations[currentLang].switchLang}
    </ShimmerButton>
  );
}; 
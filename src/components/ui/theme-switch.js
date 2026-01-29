import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ShimmerButton } from './shimmer-button';

export const ThemeSwitch = ({ isDark, onToggle, lang }) => {
  return (
    <ShimmerButton
      onClick={onToggle}
      shimmerColor={isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"}
      background={isDark ? "rgba(31, 41, 55, 0.8)" : "rgba(250, 250, 250, 0.8)"}
      shimmerSize="0.1em"
      shimmerDuration="3s"
      className={cn(
        "flex items-center gap-2",
        "px-3 py-2 sm:px-4 sm:py-2",
        "text-sm font-medium",
        "text-gray-700 dark:text-gray-200",
        "border-gray-200/20 dark:border-gray-700/30",
        "backdrop-blur-[2px]"
      )}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      {/* 移动端只显示图标，桌面端显示文字 */}
      <span className="hidden sm:inline">
        {isDark ? (lang === 'zh' ? '亮色模式' : 'Light Mode') : (lang === 'zh' ? '暗夜模式' : 'Dark Mode')}
      </span>
    </ShimmerButton>
  );
}; 
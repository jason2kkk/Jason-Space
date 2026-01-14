import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { fireSideConfetti } from './confetti';
import ReactDOM from 'react-dom/client';
import { Toast } from './toast';
import { ShimmerButton } from './shimmer-button';

export const CoolModeButton = ({ lang }) => {
  const [count, setCount] = useState(0);
  const isDark = document.documentElement.classList.contains('dark');

  const showCountToast = (message) => {
    const toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
    
    const root = ReactDOM.createRoot(toast);
    root.render(
      <Toast 
        message={message}
        onClose={() => {
          setTimeout(() => {
            if (document.body.contains(toast)) {
              document.body.removeChild(toast);
            }
            root.unmount();
          }, 800);
        }} 
      />
    );
  };

  const handleClick = async (e) => {
    e.preventDefault();
    const newCount = count + 1;
    setCount(newCount);
    await fireSideConfetti(e);
    
    const message = lang === 'zh' 
      ? `为作者放礼花 x${newCount}`
      : `Celebrating with confetti x${newCount}`;
    showCountToast(message);
  };

  return (
    <ShimmerButton
      onClick={handleClick}
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
      <Sparkles className="w-4 h-4" />
      {lang === 'zh' ? '点我试试' : 'Click Me'}
    </ShimmerButton>
  );
}; 
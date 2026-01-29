import React from 'react';
import { cn } from '../../lib/utils';
import { CoolModeButton } from './cool-mode-button';
import { TypeWriter } from './type-writer';
import ReactDOM from 'react-dom/client';
import { Toast } from './toast';
import { ThemeSwitch } from './theme-switch';

export const Navbar = ({ currentLang, isDark, onThemeToggle }) => {
  const showAvatarToast = () => {
    const toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
    
    const root = ReactDOM.createRoot(toast);
    root.render(
      <Toast 
        message="这是我的像素风头像"
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

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50",
      "bg-white/80 dark:bg-transparent",
      "backdrop-blur-sm dark:backdrop-blur-none"
    )}>
      <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4">
        {/* 左侧：头像和标题 */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer hover:scale-110 transition-transform"
            onClick={showAvatarToast}
          >
            <img
              src="/assets/avatar.jpg"
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm sm:text-base md:text-lg font-medium text-gray-800 dark:text-gray-200">
            <TypeWriter text="Jason's Space" delay={150} />
          </span>
        </div>
        
        {/* 右侧：操作按钮 */}
        <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-8">
          {/* 桌面端显示 Cool Mode 按钮 */}
          <div className="hidden md:block">
            <CoolModeButton lang={currentLang} />
          </div>
          {/* 主题切换按钮 - 移动端使用更小的尺寸 */}
          <ThemeSwitch isDark={isDark} onToggle={onThemeToggle} lang={currentLang} />
        </div>
      </div>
    </div>
  );
}; 
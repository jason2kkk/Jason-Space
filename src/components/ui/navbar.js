import React from 'react';
import { LanguageSwitch } from './language-switch';
import { cn } from '../../lib/utils';
import { CoolModeButton } from './cool-mode-button';
import { TypeWriter } from './type-writer';
import ReactDOM from 'react-dom/client';
import { Toast } from './toast';
import { ThemeSwitch } from './theme-switch';

export const Navbar = ({ currentLang, onToggle, isDark, onThemeToggle }) => {
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
          }, 800); // 从300ms增加到800ms，确保动画完全结束
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
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer hover:scale-110 transition-transform"
            onClick={showAvatarToast}
          >
            <img
              src="/assets/avatar.jpg"
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-lg font-medium text-gray-800 dark:text-gray-200">
            <TypeWriter text="Jason's Space" delay={150} />
          </span>
        </div>
        
        <div className="flex items-center space-x-8">
          <CoolModeButton lang={currentLang} />
          <ThemeSwitch isDark={isDark} onToggle={onThemeToggle} lang={currentLang} />
          <LanguageSwitch currentLang={currentLang} onToggle={onToggle} />
        </div>
      </div>
    </div>
  );
}; 
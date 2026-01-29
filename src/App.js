/**
 * @file App.js
 * @description 应用程序的主入口组件，负责整体布局和状态管理
 * 
 * 主要功能：
 * 1. 管理全局状态（语言切换、启动屏幕显示等）
 * 2. 组织页面主要区块（英雄区、项目展示、工具展示等）
 * 3. 处理全局事件（简历下载、语言切换等）
 * 4. 控制页面布局和响应式设计
 * 5. 集成数据分析和用户行为跟踪
 * 
 * 包含的主要组件：
 * - SplashScreen：启动屏幕
 * - Navbar：导航栏
 * - HeroSection：首屏展示
 * - Globe：3D地球
 * - ProjectsSection：项目展示
 * - ToolsSection：技能工具展示
 * - FooterSection：页脚
 * - FloatingDock：浮动导航栏
 */

import React, { useState, useEffect } from 'react';
import FloatingDock from './components/ui/floating-dock';
import { translations } from './locales/translations';
import { HeroSection } from './components/sections/hero-section';
import { Navbar } from './components/ui/navbar';
import { cn } from './lib/utils';
import { analytics } from './lib/analytics';
import { FooterSection } from './components/sections/footer-section';
import { getDockItems } from './config/dock-items';
import { SplashScreen } from './components/ui/splash-screen';
import ClickSpark from './components/ui/click-spark';


/**
 * 应用程序主组件
 * 整合所有页面元素，管理全局状态
 */
function App() {
  // 状态管理
  const [showSplash, setShowSplash] = useState(true);
  const currentLang = 'zh'; // 固定使用中文
  const [isDark, setIsDark] = useState(false);
  const [themeChanging, setThemeChanging] = useState(false); // 新增：主题切换状态
  const t = translations[currentLang]; // 获取当前语言的翻译文本
  const [isNearFooter, setIsNearFooter] = useState(false); // 是否接近页脚，用于控制Dock显示

  useEffect(() => {
    // 检查本地存储的主题设置
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleThemeToggle = () => {
    // 先设置主题切换状态为true，显示欢迎页
    setThemeChanging(true);
    
    // 切换主题
    setIsDark(prev => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      if (newTheme) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newTheme;
    });
    
    // 移除setTimeout，让SplashScreen组件自己控制关闭时机
    // setTimeout(() => {
    //   setThemeChanging(false);
    // }, 1500);
  };


  useEffect(() => {
    // 初始化埋点工具
    analytics.init();
  }, []);

  return (
    <div className={cn(
      "min-h-screen w-full",
      "bg-white dark:bg-black",
      "text-gray-900 dark:text-gray-100",
      "transition-colors duration-200"
    )}>
      <ClickSpark sparkColor="#333" className="dark:sparkColor-white">
        {showSplash || themeChanging ? (
          <SplashScreen onComplete={() => {
            if (showSplash) {
              setShowSplash(false);
            } else if (themeChanging) {
              setThemeChanging(false);
            }
          }} />
        ) : (
          <>
            <Navbar 
              currentLang={currentLang} 
              isDark={isDark}
              onThemeToggle={handleThemeToggle}
            />
            <div className="pt-16 sm:pt-24 relative z-20">
              <HeroSection lang={currentLang} t={t} />
            </div>

            <FooterSection 
              lang={currentLang} 
              isNearFooter={isNearFooter}
              items={getDockItems(currentLang, t)}
            />
            <FloatingDock 
              items={getDockItems(currentLang, t)}
              isNearFooter={isNearFooter}
              setIsNearFooter={setIsNearFooter}
              lang={currentLang}
              t={t}
            />
          </>
        )}
      </ClickSpark>
    </div>
  );
}

export default App; 

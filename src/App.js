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
import { cn } from './lib/utils';
import { analytics } from './lib/analytics';
import { getDockItems } from './config/dock-items';


/**
 * 应用程序主组件
 * 整合所有页面元素，管理全局状态
 */
function App() {
  // 状态管理
  const currentLang = 'zh'; // 固定使用中文
  const t = translations[currentLang]; // 获取当前语言的翻译文本
  const [isNearFooter, setIsNearFooter] = useState(false); // 是否接近页脚，用于控制Dock显示

  useEffect(() => {
    // 检查本地存储的主题设置
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

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
      <div className="relative z-20">
        <HeroSection lang={currentLang} />
      </div>

      <FloatingDock 
        items={getDockItems(currentLang, t)}
        isNearFooter={isNearFooter}
        setIsNearFooter={setIsNearFooter}
        lang={currentLang}
        t={t}
      />
    </div>
  );
}

export default App; 

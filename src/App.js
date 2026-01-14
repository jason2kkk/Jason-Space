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
import { fireSmallConfetti } from './components/ui/confetti';
import { Toast } from './components/ui/toast';
import ReactDOM from 'react-dom/client';
import { HeroSection } from './components/sections/hero-section';
import { Navbar } from './components/ui/navbar';
import { cn } from './lib/utils';
import { ToolsSection } from './components/sections/tools-section';
import { ProjectsSection } from './components/sections/projects-section';
import { FooterSection } from './components/sections/footer-section';
import { getDockItems } from './config/dock-items';
import { Test3DCard } from './components/ui/test-3d-card';
import { SplashScreen } from './components/ui/splash-screen';
import { analytics } from './lib/analytics';
import { Globe } from './components/ui/globe';
import ClickSpark from './components/ui/click-spark';
import { Folder } from './components/ui/folder';
import Aurora from './components/ui/Aurora';

/**
 * 下载文件的辅助函数
 * 创建一个临时链接元素，触发下载，然后移除该元素
 * 
 * @param {string} url - 文件URL
 * @param {string} filename - 下载后的文件名
 */
const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 应用程序主组件
 * 整合所有页面元素，管理全局状态
 */
function App() {
  // 状态管理
  const [showSplash, setShowSplash] = useState(true);
  const [currentLang, setCurrentLang] = useState('zh');
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

  /**
   * 切换语言
   * 在中文和英文之间切换
   */
  const toggleLanguage = () => {
    analytics.trackNavClick('language_toggle'); // 记录语言切换事件
    setCurrentLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  /**
   * 处理简历下载
   * 显示提示、触发彩带效果，然后下载文件
   * 
   * @param {Event} e - 点击事件对象，用于定位彩带效果
   */
  const handleDownload = async (e) => {
    try {
      analytics.trackResumeDownload(); // 记录简历下载事件
      
      // 显示下载中提示
      const toast = document.createElement('div');
      toast.id = 'toast';
      document.body.appendChild(toast);
      
      const root = ReactDOM.createRoot(toast);
      root.render(
        <Toast 
          message={t.downloadStart} // 显示下载开始提示
          onClose={() => {
            setTimeout(() => {
              if (document.body.contains(toast)) {
                document.body.removeChild(toast);
              }
              root.unmount();
            }, 800); // 从500ms增加到800ms，与Toast退出动画持续时间一致
          }} 
        />
      );

      // 先触发小型彩带效果
      await fireSmallConfetti(e);
      
      // 然后开始下载
      downloadFile("/assets/resume.pdf", `${t.name}的简历.pdf`);

    } catch (err) {
      console.error('下载失败:', err);
    }
  };

  // 项目卡片数据
  const projectCards = [
    {
      id: 'game-elimination', // 项目唯一标识
      title: "消消乐游戏", // 项目标题
      src: "/images/消消乐游戏页面备份 6.png", // 项目图片路径
      category: "游戏开发", // 项目类别
      platform: "H5", // 项目平台
      interactionType: "游戏" // 交互类型
    },
    {
      id: 'alumni-homepage',
      title: "校友会首页",
      src: "/images/校友会首页.png",
      category: "门户网站",
      platform: "PC",
      interactionType: "网页"
    },
    {
      id: 'voting-system',
      title: "投票系统",
      src: "/images/投票01.png",
      category: "功能系统",
      platform: "H5",
      interactionType: "功能"
    },
    {
      id: 'spring-festival',
      title: "春节活动",
      src: "/images/project3.jpg",
      category: "节日活动",
      platform: "H5",
      interactionType: "活动"
    },
    {
      id: 'new-year',
      title: "新年活动",
      src: "/images/IMG_8612.PNG",
      category: "节日活动",
      platform: "H5",
      interactionType: "活动"
    },
    {
      id: 'lantern-festival',
      title: "元宵节活动",
      src: "/images/IMG_8613.PNG",
      category: "节日活动",
      platform: "H5",
      interactionType: "活动"
    },
    {
      id: 'campus-navigation',
      title: "校园导航",
      src: "/images/IMG_0603.PNG",
      category: "校园服务",
      platform: "H5",
      interactionType: "功能"
    },
    {
      id: 'campus-community',
      title: "校园社区",
      src: "/images/IMG_2099.PNG",
      category: "社交平台",
      platform: "H5",
      interactionType: "社交"
    },
    {
      id: 'campus-activity',
      title: "校园活动",
      src: "/images/IMG_3223.PNG",
      category: "校园服务",
      platform: "H5",
      interactionType: "活动"
    }
  ];

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
            <Aurora 
              colorStops={["#00FFFF", "#E5B3FF", "#00FFFF"]}
              amplitude={0.6}
              blend={0.5}
            />
            <Navbar 
              currentLang={currentLang} 
              onToggle={toggleLanguage}
              isDark={isDark}
              onThemeToggle={handleThemeToggle}
            />
            <div className="pt-32 min-h-[90vh] relative z-20">
              <div className="relative z-20 flex min-h-[70vh] items-center">
                <HeroSection 
                  lang={currentLang} 
                  t={t} 
                  onDownload={handleDownload} 
                />
                <div className="relative w-1/2 flex items-center justify-center">
                  <div className="relative w-full h-[550px] mt-[-30px]">
                    <Globe lang={currentLang} />
                  </div>
                </div>
              </div>
            </div>

            <div className="-mt-10 pt-20 min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-50 dark:from-black dark:via-black dark:to-black relative z-10" id="projects">
              <div className="container mx-auto px-8">
                <ProjectsSection projects={projectCards} lang={currentLang} />
                <div className="-mt-20">
                  <ToolsSection lang={currentLang} />
                </div>
              </div>
            </div>

            {/* 增加间距，为文件夹组件弹出的图片预留空间 */}
            <div className="h-60"></div>

            {/* 3D Card and Folder Animation */}
            <div className="bg-white dark:bg-black py-24">
              <div className="container mx-auto px-8">
                <div className="flex flex-col lg:flex-row gap-12 items-end justify-center min-h-[450px]">
                  <div className="w-full lg:w-1/2">
                    <Test3DCard lang={currentLang} />
                  </div>
                  <div className="w-full lg:w-1/2 flex justify-center">
                    <Folder />
                  </div>
                </div>
              </div>
            </div>

            {/* 增加与页脚之间的间距 */}
            <div className="h-60"></div>

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
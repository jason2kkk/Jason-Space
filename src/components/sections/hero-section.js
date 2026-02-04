/**
 * @file hero-section.js
 * @description 首屏英雄区块组件，展示个人主要信息和独立开发作品
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeCheck, X } from 'lucide-react';
import { cn } from '../../lib/utils';

// 数据标签组件（类似编辑精选样式）
const StatsBadge = ({ stats, lang, isDemo }) => {
  if (!stats || stats.length === 0) return null;
  
  if (isDemo) {
    // Demo 项目使用胶囊标签布局 - 更现代的渐变风格
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
              "bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30",
              "text-violet-700 dark:text-violet-300",
              "border border-violet-200/60 dark:border-violet-700/50",
              "shadow-sm hover:shadow-md transition-shadow"
            )}
          >
            <span className="text-sm">{stat.icon}</span>
            <span className="text-xs font-medium">
              {stat.label[lang]}
            </span>
          </motion.div>
        ))}
      </div>
    );
  }
  
  // 已上线项目使用简洁的标签样式
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {stats.map((stat, index) => (
        <span
          key={index}
          className={cn(
            "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium",
            "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30",
            "text-blue-700 dark:text-blue-300",
            "border border-blue-100 dark:border-blue-800/50"
          )}
        >
          {stat.icon && <span className="mr-1">{stat.icon}</span>}
          {stat.label[lang]}
        </span>
      ))}
    </div>
  );
};

// 小红书卡片组件
const XiaohongshuCard = ({ name, followers, href, lang }) => {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex-1 min-w-0 flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl",
        "bg-zinc-50 dark:bg-zinc-800/50",
        "border border-zinc-200 dark:border-zinc-700/50",
        "hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-200"
      )}
    >
      {/* 信息 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
          {name}
        </p>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          {lang === 'zh' ? '粉丝量：' : 'Followers: '}{followers}
        </p>
      </div>
      
      {/* 跳转按钮 */}
      <div className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium shrink-0",
        "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900",
        "hover:opacity-80 transition-opacity"
      )}>
        {lang === 'zh' ? '主页' : 'Profile'}
      </div>
    </motion.a>
  );
};

// 图片灯箱组件
const ImageLightbox = ({ image, title, isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          onClick={onClose}
        >
          {/* 模糊遮罩背景 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-8 sm:right-8 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          {/* 大图 */}
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            src={image}
            alt={title}
            className="relative max-w-full max-h-[90vh] w-auto h-auto rounded-2xl sm:rounded-3xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 截图轮播组件 - 类似 App Store 商店截图
const ScreenshotCarousel = ({ screenshots, isLandscape, lang, onImageClick }) => {
  const scrollRef = React.useRef(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  React.useEffect(() => {
    checkScrollability();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollability);
      return () => el.removeEventListener('scroll', checkScrollability);
    }
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = isLandscape ? 320 : 180;
      scrollRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  if (screenshots.length === 1) {
    // 单张图片不需要轮播
    return (
      <div 
        className="cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
        onClick={() => onImageClick(screenshots[0])}
      >
        <img
          src={screenshots[0]}
          alt="Screenshot"
          className={cn(
            "rounded-xl sm:rounded-2xl",
            isLandscape ? "w-full h-auto" : "w-full max-w-[280px] h-auto mx-auto"
          )}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* 左滑按钮 */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 z-10",
            "w-8 h-8 sm:w-10 sm:h-10 rounded-full",
            "bg-white/90 dark:bg-zinc-800/90 shadow-lg backdrop-blur-sm",
            "flex items-center justify-center",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:bg-white dark:hover:bg-zinc-700"
          )}
        >
          <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* 右滑按钮 */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 z-10",
            "w-8 h-8 sm:w-10 sm:h-10 rounded-full",
            "bg-white/90 dark:bg-zinc-800/90 shadow-lg backdrop-blur-sm",
            "flex items-center justify-center",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:bg-white dark:hover:bg-zinc-700"
          )}
        >
          <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* 截图滚动容器 */}
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          "snap-x snap-mandatory",
          "pb-2"
        )}
        onScroll={checkScrollability}
      >
        {screenshots.map((src, idx) => (
          <div
            key={idx}
            className={cn(
              "flex-shrink-0 snap-start cursor-pointer",
              "transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]",
              isLandscape 
                ? "w-[280px] sm:w-[320px]" // 横向 Mac 截图
                : "w-[140px] sm:w-[160px]" // 竖向 iOS 截图
            )}
            onClick={() => onImageClick(src)}
          >
            <img
              src={src}
              alt={`Screenshot ${idx + 1}`}
              className="w-full h-auto rounded-xl sm:rounded-2xl"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* 滚动指示器 - 移动端显示 */}
      <div className="flex justify-center gap-1.5 mt-3 sm:hidden">
        {screenshots.map((_, idx) => (
          <div
            key={idx}
            className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600"
          />
        ))}
      </div>
    </div>
  );
};

// 项目卡片组件 - 参考 App Store 风格布局
const ProjectCard = ({ project, lang, index }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(project.image);
  
  // 获取截图列表：如果有 screenshots 则使用，否则使用单张 image
  const screenshots = project.screenshots || [project.image];
  const hasMultipleScreenshots = screenshots.length > 1;
  
  const handleImageClick = (imageSrc) => {
    setCurrentImage(imageSrc);
    setIsLightboxOpen(true);
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={cn(
          "rounded-2xl sm:rounded-3xl overflow-hidden",
          "bg-zinc-900/5 dark:bg-zinc-800/50",
          "border border-zinc-200/50 dark:border-zinc-700/50"
        )}
      >
        {/* 上半部分：应用信息 + 收入数据（已上架项目）或 应用信息 + 能力标签（Demo项目） */}
        <div className="p-4 sm:p-6">
          {project.appStoreUrl ? (
            // 已上架项目：左右两栏布局
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* 左侧：应用基本信息 */}
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-3">
                  {lang === 'zh' ? '应用基本信息' : 'App Info'}
                </p>
                
                {/* App 图标和名称 */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center overflow-hidden">
                    {project.icon ? (
                      <img src={project.icon} alt={project.title[lang]} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-zinc-400 dark:text-zinc-500">
                        {project.title[lang].charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {project.title[lang]}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                      {project.subtitle[lang]}
                    </p>
                  </div>
                </div>
                
                {/* 评分平台和按钮容器 */}
                <div>
                  {/* 评分和平台信息 - 移动端同行，桌面端纵向 */}
                  <div className="flex gap-4 sm:flex-col sm:gap-0 sm:space-y-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-2 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <span>⭐️</span>
                      <span>{project.rating || '0'}{lang === 'zh' ? ' 评分' : ' Ratings'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{project.isLandscape ? '💻' : '📱'}</span>
                      <span>{project.isLandscape ? 'macOS / iOS' : 'iOS'}</span>
                    </div>
                  </div>
                  
                  {/* App Store 按钮 - 移动端缩小居左 */}
                  {/* 调整移动端按钮向下移动：修改 mt-2 的数值 */}
                  <div className="mt-4 sm:mt-0">
                    <a
                      href={project.appStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl",
                        "bg-black text-white dark:bg-white dark:text-black",
                        "hover:opacity-90 active:scale-95 transition-all",
                        "text-xs sm:text-sm font-medium"
                      )}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-[8px] sm:text-[10px] opacity-80">{lang === 'zh' ? '前往' : 'Get it on'}</span>
                        <span className="text-[10px] sm:text-sm font-semibold">App Store</span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
              
              {/* 右侧/下方：累计数据 */}
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-3">
                  {lang === 'zh' ? '累计数据' : 'Statistics'}
                </p>
                
                {/* 移动端横向排列，桌面端纵向排列 */}
                <div className="flex sm:flex-col gap-4 sm:gap-4">
                  {/* 收入金额 */}
                  {project.revenue && (
                    <div className="sm:flex-none">
                      <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                        {project.revenue}
                      </p>
                      <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        {lang === 'zh' ? '收入' : 'Revenue'}
                      </p>
                    </div>
                  )}
                  
                  {/* 下载量 */}
                  {/* 调整移动端位置：修改 ml-[20px] 的数值，如 ml-[30px] 向右，ml-[10px] 向左 */}
                  {project.downloads && (
                    <div className="ml-[40px] sm:ml-0 sm:flex-none">
                      <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                        {project.downloads}
                      </p>
                      <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        {lang === 'zh' ? '下载' : 'Downloads'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* 排名展示 - 仅 Doit 显示 */}
                {project.rankings && project.rankings.length > 0 && (
                  <div className="mt-5 sm:mt-6 flex justify-start gap-0 -ml-2 sm:-ml-5">
                    {project.rankings.map((rank, idx) => (
                      <div key={idx} className="flex items-center">
                        {/* 左侧月桂 - 亮色用 left-d，暗色用 Left Laurel */}
                        <img 
                          src="/images/left-d.png" 
                          alt="" 
                          className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0 dark:hidden"
                        />
                        <img 
                          src="/images/left.png" 
                          alt="" 
                          className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0 hidden dark:block"
                        />
                        
                        {/* 排名内容 - 标题和数字分行 */}
                        <div className="flex flex-col items-center text-center px-1">
                          <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap leading-tight">
                            {rank.title[lang]}
                          </span>
                          <span className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                            {rank.value}
                          </span>
                        </div>
                        
                        {/* 右侧月桂 - 亮色用 right-d，暗色用 Right Laurel */}
                        <img 
                          src="/images/right-d.png" 
                          alt="" 
                          className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0 dark:hidden"
                        />
                        <img 
                          src="/images/right.png" 
                          alt="" 
                          className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0 hidden dark:block"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Demo 项目：简单布局
            <div>
              {/* App 图标和名称 */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center overflow-hidden">
                  {project.icon ? (
                    <img src={project.icon} alt={project.title[lang]} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-zinc-400 dark:text-zinc-500">
                      {project.title[lang].charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {project.title[lang]}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {project.subtitle[lang]}
                  </p>
                </div>
              </div>
              
              {/* 能力标签 */}
              <StatsBadge stats={project.stats} lang={lang} isDemo={project.isDemo} />
            </div>
          )}
        </div>
        
        {/* 分割线 */}
        {hasMultipleScreenshots && (
          <div className="border-t border-zinc-200/50 dark:border-zinc-700/50" />
        )}
        
        {/* 下半部分：商店截图 */}
        <div className="p-4 sm:p-6">
          {hasMultipleScreenshots ? (
            // 多截图轮播 - 类似 App Store 商店截图布局
            <>
              <div className="mb-3">
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {lang === 'zh' ? '商店截图' : 'App Store Screenshots'}
                </p>
                <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-0.5">
                  {lang === 'zh' ? '应用商店展示图片' : 'App store display images'}
                </p>
              </div>
              <ScreenshotCarousel
                screenshots={screenshots}
                isLandscape={project.isLandscape || false}
                lang={lang}
                onImageClick={handleImageClick}
              />
            </>
          ) : (
            // 单图展示
            <div 
              className="cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => handleImageClick(project.image)}
            >
              <img
                src={project.image}
                alt={project.title[lang]}
                className="w-full h-auto rounded-xl sm:rounded-2xl"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </motion.div>
      
      {/* 图片灯箱 */}
      <ImageLightbox
        image={currentImage}
        title={project.title[lang]}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
    </>
  );
};

export const HeroSection = ({ lang, t }) => {
  // 项目数据 - 顺序：DoitMac、Tracck、Aha、评审工具
  // isLandscape: true 表示 Mac 横向截图，false 表示 iOS 竖向截图
  // screenshots: 数组表示有多张宣传图，支持滑动；不设置则使用单张 image
  const projects = [
    {
      id: 'doit-mac',
      title: { zh: 'Do it!', en: 'Do it!' },
      subtitle: { zh: '一款简单漂亮的任务规划App', en: 'A simple and beautiful task planning app' },
      image: '/images/doitmac/简体1.png',
      icon: '/images/Doit图标.png',
      // Mac 版本 - 横向截图
      isLandscape: true,
      screenshots: [
        '/images/doitmac/简体1.png',
        '/images/doitmac/英文2 1.png',
        '/images/doitmac/英文3 1.png',
      ],
      appStoreUrl: 'https://apps.apple.com/cn/app/do-it/id6743646015',
      rating: '200+',
      // 累计数据
      revenue: '$4,000+',
      downloads: '13,000+',
      // 排名
      rankings: [
        { title: { zh: 'App Store效率榜', en: 'App Store Productivity' }, value: '#48' },
        { title: { zh: '即刻产品发布会', en: 'Jike Product Launch' }, value: 'TOP1' },
      ],
    },
    {
      id: 'tracck',
      title: { zh: 'Tracck!', en: 'Tracck!' },
      subtitle: { zh: '一款博主商单管理、排期、收入统计App', en: 'A creator business management app' },
      image: '/images/tracck/图1.jpg',
      icon: '/images/tracck图标.png',
      // iOS 版本 - 竖向截图
      isLandscape: false,
      screenshots: [
        '/images/tracck/图1.jpg',
        '/images/tracck/图2.jpg',
        '/images/tracck/图3.jpg',
        '/images/tracck/图4.jpg',
        '/images/tracck/图5.jpg',
      ],
      appStoreUrl: 'https://apps.apple.com/cn/app/tracck/id6743366923',
      rating: '30+',
      // 累计数据
      revenue: '$2,000+',
      downloads: '2,000+',
    },
    {
      id: 'aha',
      title: { zh: 'Aha', en: 'Aha' },
      subtitle: { zh: 'AI专业领域查词工具，解决专业领域的"术语查询与复盘"需求', en: 'AI professional dictionary tool for terminology lookup and review' },
      image: '/images/Aha.png',
      icon: '/images/aha图标.png',
      // 单张图片，不需要轮播
      appStoreUrl: null,
      stats: [
        { icon: '🤖', label: { zh: 'LLM', en: 'LLM' } },
        { icon: '✨', label: { zh: 'Prompt工程', en: 'Prompt Engineering' } },
        { icon: '📚', label: { zh: 'RAG', en: 'RAG' } },
        { icon: '💡', label: { zh: '成本控制', en: 'Cost Control' } },
        { icon: '🔗', label: { zh: '大模型API集成', en: 'LLM API Integration' } },
      ],
      isDemo: true
    },
    {
      id: 'review-tool',
      title: { zh: 'AI原型用户体验评审工具', en: 'AI Prototype UX Review Tool' },
      subtitle: { zh: '可上传原型图片，调用多个专家agent进行分析并模拟不同性格用户的体验路径，输出优化结论', en: 'Upload prototype images, invoke multiple expert agents for analysis and simulate user journeys with different personalities, output optimization conclusions' },
      image: '/images/评审工具/评审工具1.png',
      isLandscape: true,
      screenshots: [
        '/images/评审工具/评审工具1.png',
        '/images/评审工具/评审工具2.png',
        '/images/评审工具/评审工具3.png',
      ],
      appStoreUrl: null,
      stats: [
        { icon: '🤖', label: { zh: '多专家Agent协同', en: 'Multi-Agent Collaboration' } },
        { icon: '✨', label: { zh: 'Prompt工程', en: 'Prompt Engineering' } },
        { icon: '🎯', label: { zh: '真实业务场景', en: 'Real Business Scenario' } },
      ],
      isDemo: true
    }
  ];

  return (
    <section className="relative w-full">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 pt-4 sm:pt-8">
        {/* 个人信息头部 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start gap-4 mb-8 sm:mb-12"
        >
          {/* 头像带在线状态 */}
          <div className="relative">
            <div className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-lg">
              <img
                src="/assets/avatar.jpg"
                alt={t.name}
                className="h-full w-full object-cover"
              />
            </div>
            {/* 在线状态指示器 */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-black" />
          </div>

          {/* 姓名和职位 */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {t.name}
              </h1>
              <BadgeCheck className="h-5 w-5 sm:h-6 sm:w-6 text-sky-500" />
            </div>
            <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
              {t.role}
            </p>
          </div>

          {/* 个人简介 */}
          <div className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-3">
            <p>
              {lang === 'zh' 
                ? '5年产品经验，AI独立开发者，小红书万粉科技博主，熟悉主流模型与AI产品；'
                : '5 years of product experience, AI indie developer, tech blogger with 10k+ followers, familiar with mainstream AI models and products;'
              }
            </p>
            <p>
              {lang === 'zh' ? (
                <>
                  非编程背景通过Cursor独立完成4款效率/AI产品落地于上架，其中<strong className="text-zinc-900 dark:text-zinc-100">2款</strong>已上线App Store，累计用户<strong className="text-zinc-900 dark:text-zinc-100">15,000+</strong>，最高App Store排行效率类<strong className="text-zinc-900 dark:text-zinc-100">#48</strong>，即刻产品发布会多次<strong className="text-zinc-900 dark:text-zinc-100">TOP1</strong>。
                </>
              ) : (
                <>
                  Non-programming background, independently completed 4 products with Cursor, <strong className="text-zinc-900 dark:text-zinc-100">2</strong> launched on App Store, <strong className="text-zinc-900 dark:text-zinc-100">15,000+</strong> total users, peaked at <strong className="text-zinc-900 dark:text-zinc-100">#48</strong> in App Store Productivity, multiple <strong className="text-zinc-900 dark:text-zinc-100">TOP1</strong> on Jike product launches.
                </>
              )}
            </p>
          </div>
        </motion.div>

        {/* 小红书入口卡片 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-8 sm:mb-12"
        >
          <div className="mb-4">
            <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
              SOCIAL
            </p>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {lang === 'zh' ? '小红书' : 'Xiaohongshu'}
            </h2>
          </div>
          
          <div className="flex gap-3 sm:gap-4">
            <XiaohongshuCard
              name="2k"
              followers="15,000+"
              href="https://xhslink.com/m/dP5NFoP6Wn"
              lang={lang}
            />
            <XiaohongshuCard
              name="2kk"
              followers="2,000+"
              href="https://xhslink.com/m/6cQte1ftsiI"
              lang={lang}
            />
          </div>
        </motion.div>

        {/* 项目展示区域 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="mb-6">
            <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
              PROJECT
            </p>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {lang === 'zh' ? '独立开发作品' : 'Indie Projects'}
            </h2>
          </div>

          {/* 项目列表 */}
          <div className="space-y-8 sm:space-y-12">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                lang={lang}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

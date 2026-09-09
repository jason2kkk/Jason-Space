/**
 * @file hero-section.js
 * @description 首屏英雄区块组件，展示个人主要信息和独立开发作品
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { AtSign, Battery, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, Bluetooth, Folder, Headphones, Mail, MapPin, Phone, UserRound, Wifi, X } from 'lucide-react';
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
// Kept as a fallback for the previous card-based presentation.
// eslint-disable-next-line no-unused-vars
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

const CodewayStoreButton = ({ store }) => (
  <a
    href={store.url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex h-12 min-w-[150px] flex-1 items-center justify-center gap-3 rounded-full border border-white/30 px-3 text-white transition-colors hover:bg-white/10"
  >
    <img src={store.icon} alt="" className={store.name === 'App Store' ? 'h-[22px] w-[18px]' : 'h-6 w-6'} />
    <span className="flex flex-col items-start leading-none">
      <span className="mb-1 text-[10px] font-normal">{store.eyebrow}</span>
      <span className="text-[17px] font-semibold">{store.name}</span>
    </span>
  </a>
);

const personalRankings = [
  { title: 'App Store效率榜', value: '#48' },
  { title: '即刻产品发布会', value: 'TOP1' },
];

const PersonalRankings = () => (
  <div className="flex min-h-[124px] items-center justify-center gap-1 pb-7">
    {personalRankings.map((ranking) => (
      <div key={ranking.title} className="flex min-w-0 flex-1 items-center justify-center">
        <img src="/images/left.png" alt="" className="h-[clamp(48px,4vw,68px)] w-[clamp(24px,2vw,34px)] shrink-0 object-contain" />
        <div className="min-w-0 px-1 text-center">
          <p className="whitespace-nowrap text-[clamp(10px,0.85vw,14px)] leading-tight text-white/85">{ranking.title}</p>
          <p className="mt-1 text-[clamp(26px,2vw,36px)] font-bold leading-none text-white">{ranking.value}</p>
        </div>
        <img src="/images/right.png" alt="" className="h-[clamp(48px,4vw,68px)] w-[clamp(24px,2vw,34px)] shrink-0 object-contain" />
      </div>
    ))}
  </div>
);

const CodewayPhone = ({ projects, screenY, compact = false }) => (
  <div
    className={cn(
      "aspect-[1120/2280] shrink-0 overflow-hidden",
      compact
        ? "relative mx-auto h-[min(54svh,500px)] min-h-[320px]"
        : "absolute bottom-0 left-1/2 h-[min(88svh,900px)] min-h-[480px] -translate-x-1/2"
    )}
  >
    {/* Keep a real app screen visible while the next lazy image is decoding. */}
    <img
      src={projects[0].screenOverlay}
      alt=""
      className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain"
      loading="eager"
    />
    <motion.div
      className="pointer-events-none absolute inset-0 z-20 flex h-full w-full flex-col will-change-transform"
      style={screenY ? { y: screenY } : undefined}
    >
      {projects.map((product) => (
        <img
          key={product.id}
          src={product.screenOverlay}
          alt={`${product.title} app screen`}
          className="h-full min-h-full w-full shrink-0 object-contain"
          loading="eager"
        />
      ))}
    </motion.div>
    <img
      src="/images/codeway-reference/phone-frame.png"
      alt=""
      className="pointer-events-none absolute inset-0 z-30 h-full w-full object-contain"
      loading="eager"
    />
  </div>
);

const CodewayProductInfo = ({ product, compact = false }) => (
  <div className={cn("text-white", compact ? "w-full" : "max-w-[390px]")}>
    <div className={cn("flex items-center", compact ? "gap-3" : "gap-5")}>
      <img
        src={product.icon}
        alt=""
        className={cn("shrink-0 object-cover", compact ? "h-14 w-14 rounded-[15px]" : "h-[84px] w-[84px] rounded-[22px]")}
      />
      <div className="min-w-0">
        <h3 className={cn("font-semibold", compact ? "text-[28px] leading-8" : "text-[clamp(32px,2.8vw,46px)] leading-none")}>
          {product.title}
        </h3>
        <p className={cn("font-normal text-white/95", compact ? "mt-1 text-[15px]" : "mt-3 text-[21px]")}>
          {product.category}
        </p>
      </div>
    </div>

    <p className={cn("text-white/85", compact ? "mt-4 line-clamp-3 text-[13px] leading-[1.65]" : "mt-10 text-[16px] leading-[1.8]")}>
      {compact ? product.mobileDescription : product.description}
    </p>

    <div className={cn("flex flex-wrap", compact ? "mt-4 gap-2" : "mt-8 gap-3")}>
      {product.stores.map((store) => <CodewayStoreButton key={store.name} store={store} />)}
    </div>
  </div>
);

const CodewayMetrics = ({ product, compact = false }) => {
  if (compact) {
    return (
      <div
        className="mt-4 grid border-y border-white/20 text-center text-white"
        style={{ gridTemplateColumns: `repeat(${product.metrics.length}, minmax(0, 1fr))` }}
      >
        {product.metrics.map((metric) => (
          <div key={metric.value} className="py-3">
            <p className="text-xl font-semibold">{metric.value}</p>
            {metric.rating ? (
              <img src={product.rating} alt="Rating" className="mx-auto mt-1 h-3 w-auto" />
            ) : (
              <p className="mt-1 text-[9px] uppercase text-white/70">{metric.label}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="ml-auto w-full max-w-[360px] text-center text-white">
      <PersonalRankings />
      {product.metrics.map((metric) => (
        <div key={metric.value} className="flex min-h-[124px] flex-col items-center justify-center border-t border-white/25 py-6">
          <p className="text-[clamp(34px,3.2vw,48px)] font-semibold leading-none">{metric.value}</p>
          {metric.rating ? (
            <img src={product.rating} alt="Rating" className="mt-3 h-[18px] w-auto" />
          ) : (
            <p className="mt-3 text-[12px] font-medium uppercase text-white/85">{metric.label}</p>
          )}
        </div>
      ))}
    </div>
  );
};

const ScrollProjectsShowcase = ({ projects }) => {
  const sectionRef = useRef(null);
  const snapTimerRef = useRef(null);
  const snapUnlockTimerRef = useRef(null);
  const isSnappingRef = useRef(false);
  const snapTargetRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 28,
    mass: 0.22,
    restDelta: 0.0001,
  });
  const renderedProgress = shouldReduceMotion ? scrollYProgress : smoothProgress;
  const trackY = useTransform(renderedProgress, [0, 1], ['0%', `${-(projects.length - 1) * 100}%`]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || projects.length < 2) return undefined;

    const clearSnapTimer = () => {
      if (snapTimerRef.current) {
        window.clearTimeout(snapTimerRef.current);
        snapTimerRef.current = null;
      }
    };

    const clearSnapUnlockTimer = () => {
      if (snapUnlockTimerRef.current) {
        window.clearTimeout(snapUnlockTimerRef.current);
        snapUnlockTimerRef.current = null;
      }
    };

    const unlockSnap = () => {
      isSnappingRef.current = false;
      snapTargetRef.current = null;
      clearSnapUnlockTimer();
    };

    const getSectionMetrics = () => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const maxOffset = Math.max(section.offsetHeight - window.innerHeight, 0);
      const offset = window.scrollY - sectionTop;

      return { sectionTop, maxOffset, offset };
    };

    const snapToNearestProject = () => {
      snapTimerRef.current = null;
      if (isSnappingRef.current) return;

      const { sectionTop, maxOffset, offset } = getSectionMetrics();
      const boundaryTolerance = Math.max(16, window.innerHeight * 0.045);

      // Leave scrolling outside the sticky showcase untouched.
      if (maxOffset <= 0 || offset < -boundaryTolerance || offset > maxOffset + boundaryTolerance) return;

      const progress = Math.min(1, Math.max(0, offset / maxOffset));
      const nearestIndex = Math.round(progress * (projects.length - 1));
      const projectStep = maxOffset / (projects.length - 1);
      const targetY = sectionTop + nearestIndex * projectStep;

      if (Math.abs(window.scrollY - targetY) < 3) return;

      isSnappingRef.current = true;
      snapTargetRef.current = targetY;
      window.scrollTo({
        top: targetY,
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
      });

      // scrollend is not available in every browser, so keep a bounded fallback.
      snapUnlockTimerRef.current = window.setTimeout(unlockSnap, shouldReduceMotion ? 100 : 900);
    };

    const handleScrollEnd = () => {
      if (!isSnappingRef.current) return;
      const targetY = snapTargetRef.current;
      if (targetY === null || Math.abs(window.scrollY - targetY) < 4) unlockSnap();
    };

    const handleScroll = () => {
      if (isSnappingRef.current) return;
      clearSnapTimer();
      snapTimerRef.current = window.setTimeout(snapToNearestProject, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scrollend', handleScrollEnd);

    return () => {
      clearSnapTimer();
      clearSnapUnlockTimer();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scrollend', handleScrollEnd);
      unlockSnap();
    };
  }, [projects.length, shouldReduceMotion]);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative w-full"
      style={{ height: `${projects.length * 100}svh` }}
    >
      <div className="sticky top-0 h-[100svh] min-h-[640px] overflow-hidden bg-[#0f5136]">
        <motion.div
          className="absolute inset-0 z-0 flex h-full flex-col will-change-transform"
          style={{ y: trackY }}
        >
          {projects.map((product) => (
            <section
              key={product.id}
              aria-label={product.title}
              className="h-full min-h-full w-full shrink-0"
              style={{ backgroundColor: product.background }}
            >
              <div className="relative z-10 mx-auto hidden h-full w-full max-w-[1440px] grid-cols-[minmax(280px,1fr)_minmax(240px,0.78fr)_minmax(220px,1fr)] items-center gap-[clamp(34px,4vw,70px)] px-[clamp(64px,8vw,132px)] lg:grid">
                <CodewayProductInfo product={product} />
                <div aria-hidden="true" />
                <CodewayMetrics product={product} />
              </div>

              <div className="flex h-full flex-col overflow-hidden px-5 pb-5 pt-6 sm:px-10 lg:hidden">
                <div className="flex min-h-0 flex-1 items-center justify-center">
                  <CodewayPhone projects={[product]} compact />
                </div>
                <div className="mx-auto w-full max-w-[560px] shrink-0">
                  <CodewayProductInfo product={product} compact />
                  <CodewayMetrics product={product} compact />
                </div>
              </div>
            </section>
          ))}
        </motion.div>

        <div className="pointer-events-none absolute inset-0 z-[5] hidden lg:block">
          <CodewayPhone projects={projects} screenY={trackY} />
        </div>
      </div>
    </section>
  );
};

const deskEntrance = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
};

let stickerForgeLoader;

const emptyForgeOptions = {};

const sharedStickerForgeOptions = {
  outline: { width: 16, color: '#f2eee8' },
  edge: { width: 2.3, strength: 0.65 },
  shadow: { color: '#191823', opacity: 0.2, blur: 20, distance: 14, angle: 42 },
  lighting: {
    direction: { x: -0.38, y: 0.52, z: 0.76 },
    intensity: 0.76,
    ambient: 0.34,
    softness: 0.62,
  },
  peel: {
    radius: 0.12,
    stiffness: 0.72,
    grabWidth: 22,
    maxAngle: 3.55,
    release: 'snap',
  },
  sound: { enabled: true, volume: 0.68 },
  back: { color: '#eeeae4', gloss: 0.62, roughness: 0.38 },
  material: {
    type: 'original',
    intensity: 0.8,
    scale: 1,
    holographicGrain: 0.72,
    seed: 0.37,
    holographicColors: ['#f2a7c5', '#8edfd5', '#9db4ea'],
  },
  wind: 0.25,
  quality: 'high',
};

const macBookStickerForgeOptions = {
  ...sharedStickerForgeOptions,
  edge: { ...sharedStickerForgeOptions.edge, width: 1.4, strength: 0.38 },
  shadow: { ...sharedStickerForgeOptions.shadow, opacity: 0.1, blur: 5, distance: 2 },
};

const headphoneStickerForgeOptions = {
  ...sharedStickerForgeOptions,
  outline: { ...sharedStickerForgeOptions.outline, width: 15, color: '#eae5dd' },
  edge: { ...sharedStickerForgeOptions.edge, width: 2.2, strength: 0.6 },
  shadow: { ...sharedStickerForgeOptions.shadow, opacity: 0.18, blur: 18, distance: 12 },
  lighting: { ...sharedStickerForgeOptions.lighting, intensity: 0.72, ambient: 0.32, softness: 0.66 },
  back: { ...sharedStickerForgeOptions.back, color: '#e7e2da', gloss: 0.56, roughness: 0.44 },
  material: { ...sharedStickerForgeOptions.material, intensity: 0.74 },
};

const deskStickerSurfaceFilter = 'brightness(0.98) saturate(0.96) contrast(0.99) sepia(0.01)';
const headphoneStickerSurfaceFilter = 'brightness(0.93) saturate(0.88) contrast(0.98) sepia(0.03)';

const loadStickerForge = () => {
  if (window.StickerForge) return Promise.resolve(window.StickerForge);
  if (stickerForgeLoader) return stickerForgeLoader;

  stickerForgeLoader = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-sticker-forge]');
    const script = existingScript || document.createElement('script');

    const handleLoad = () => {
      if (window.StickerForge) resolve(window.StickerForge);
      else reject(new Error('Sticker Forge loaded without exposing its API.'));
    };

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', () => reject(new Error('Sticker Forge failed to load.')), { once: true });

    if (!existingScript) {
      script.src = '/vendor/sticker-forge/sticker-forge.iife.js';
      script.async = true;
      script.dataset.stickerForge = 'true';
      document.head.appendChild(script);
    }
  });

  return stickerForgeLoader;
};

const ForgeSticker = ({
  src,
  alt,
  className,
  delay = 0.45,
  tilt = 0,
  forgeOptions = emptyForgeOptions,
  displayScale,
  displayAspect,
  renderScale = 2,
  zIndex = 30,
  surfaceFilter = 'none',
}) => {
  const frameRef = useRef(null);
  const mountRef = useRef(null);
  const peelResetTimerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [fallbackSrc, setFallbackSrc] = useState(null);
  const [isPeeling, setIsPeeling] = useState(false);

  useEffect(() => {
    let disposed = false;
    const image = new Image();
    setFallbackSrc(null);

    image.onload = () => {
      if (!disposed) setFallbackSrc(src);
    };
    image.onerror = () => {
      if (!disposed) setFallbackSrc(null);
    };
    image.src = src;

    return () => {
      disposed = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [src]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const handlePeelStart = () => {
      window.clearTimeout(peelResetTimerRef.current);
      setIsPeeling(true);
    };
    const handlePeelEnd = () => {
      window.clearTimeout(peelResetTimerRef.current);
      peelResetTimerRef.current = window.setTimeout(() => setIsPeeling(false), 950);
    };

    mount.addEventListener('peelstart', handlePeelStart);
    mount.addEventListener('peelend', handlePeelEnd);

    return () => {
      window.clearTimeout(peelResetTimerRef.current);
      mount.removeEventListener('peelstart', handlePeelStart);
      mount.removeEventListener('peelend', handlePeelEnd);
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    let instance;
    let resizeObserver;
    const frame = frameRef.current;
    const mount = mountRef.current;
    const getDisplayOptions = () => {
      if (!frame || !displayScale || !displayAspect) return {};
      // The larger transparent mount gives the peeled mesh room to travel without clipping.
      const width = Math.max(1, frame.clientWidth * displayScale);
      return { display: { width, height: width / displayAspect } };
    };

    loadStickerForge()
      .then((api) => api.createSticker(mount, {
        source: { type: 'image', src, name: alt },
        outline: { width: 2, color: '#f8f8f6', ...forgeOptions.outline },
        edge: { width: 1.4, strength: 0.5, ...forgeOptions.edge },
        shadow: {
          color: '#050505',
          opacity: 0.25,
          blur: 9,
          distance: 4,
          ...forgeOptions.shadow,
        },
        lighting: {
          direction: { x: -0.42, y: 0.56, z: 0.72 },
          intensity: 0.72,
          ambient: 0.42,
          softness: 0.72,
          ...forgeOptions.lighting,
        },
        peel: {
          radius: 0.1,
          stiffness: 0.68,
          grabWidth: 16,
          maxAngle: 3.35,
          surfaceShadow: true,
          release: 'reset',
          ...forgeOptions.peel,
          residue: false,
        },
        back: { color: '#f1f0eb', gloss: 0.42, roughness: 0.58, ...forgeOptions.back },
        material: { type: 'original', intensity: 0, ...forgeOptions.material },
        sound: { enabled: false, volume: 0, ...forgeOptions.sound },
        tilt: forgeOptions.tilt ?? tilt,
        wind: forgeOptions.wind ?? 0.08,
        quality: forgeOptions.quality ?? 'medium',
        ...getDisplayOptions(),
      }))
      .then((createdSticker) => {
        instance = createdSticker;
        if (disposed) {
          createdSticker.destroy();
          return;
        }
        createdSticker.setRenderScale(renderScale);
        mount.querySelector('canvas')?.style.setProperty('outline', 'none');
        if (frame && displayScale && displayAspect && typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => {
            createdSticker.setOptions(getDisplayOptions());
            createdSticker.resize();
          });
          resizeObserver.observe(frame);
        }
        setIsReady(true);
      })
      .catch((error) => {
        if (!disposed) console.error(error);
      });

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      instance?.destroy();
    };
  }, [alt, displayAspect, displayScale, forgeOptions, renderScale, src, tilt]);

  const mountScale = 2.2;
  const restingPadding = 0.16;
  const restingWidth = (displayScale || 0.58) + restingPadding;
  const restingHeight = (displayAspect ? (displayScale || 0.58) / displayAspect : (displayScale || 0.58)) + restingPadding;
  const restingInsetX = Math.max(0, (1 - Math.min(mountScale, restingWidth) / mountScale) * 50);
  const restingInsetY = Math.max(0, (1 - Math.min(mountScale, restingHeight) / mountScale) * 50);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      ref={frameRef}
      className={`pointer-events-auto absolute z-30 aspect-square overflow-visible ${className}`}
      style={{ zIndex }}
      aria-label={alt}
    >
      {fallbackSrc && (
        <img
          src={fallbackSrc}
          alt=""
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 m-auto h-auto select-none object-contain transition-opacity duration-150 ${isReady ? 'opacity-0' : 'opacity-100'}`}
          style={{
            width: displayScale ? `${displayScale * 100}%` : '58%',
            filter: surfaceFilter,
          }}
          draggable={false}
        />
      )}
      <div
        ref={mountRef}
        className={`absolute inset-[-60%] overflow-visible transition-opacity duration-150 [&_canvas]:outline-none ${isReady ? 'opacity-100' : 'opacity-0'}`}
        style={{
          clipPath: isPeeling ? 'inset(0)' : `inset(${restingInsetY}% ${restingInsetX}%)`,
          filter: surfaceFilter,
        }}
      />
    </motion.div>
  );
};

const MacBookLayer = ({ isFocused, onFocus, onBlur }) => (
  <div
    className="pointer-events-none absolute left-1/2 top-[23.5%] z-10 h-[27%] w-[64vw] -translate-x-1/2 -translate-y-1/2 sm:top-[27%] sm:h-[45%] sm:w-[58vw] lg:left-[49.3%] lg:top-[32%] lg:h-[56%] lg:w-[535px]"
    style={{ zIndex: isFocused ? 24 : 10 }}
  >
    <motion.div
      className="pointer-events-auto relative mx-auto h-full aspect-[833/801] max-w-full"
      onHoverStart={onFocus}
      onHoverEnd={onBlur}
      whileHover={{
        y: -4,
        scale: 1.04,
        filter: 'brightness(1.055) saturate(1.02) drop-shadow(0 14px 20px rgba(0,0,0,0.3))',
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
      }}
      style={{ transformOrigin: '50% 52%' }}
    >
      <motion.img
        src="/images/desk/processed/macbook-clean.png"
        alt="MacBook viewed from above"
        {...deskEntrance}
        transition={{ ...deskEntrance.transition, delay: 0.08 }}
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
        draggable={false}
      />
      <ForgeSticker
        src="/images/desk/stickers/hello-workbench-original.png"
        alt="Peelable hello sticker"
        delay={0.52}
        tilt={-3}
        displayScale={0.82}
        displayAspect={1}
        forgeOptions={macBookStickerForgeOptions}
        surfaceFilter={deskStickerSurfaceFilter}
        className="left-[-3%] top-[62%] w-[45%]"
      />
      <ForgeSticker
        src="/images/desk/stickers/mac-sticker.png"
        alt="Peelable classic Mac sticker"
        delay={0.6}
        tilt={6}
        displayScale={0.58}
        displayAspect={1}
        forgeOptions={sharedStickerForgeOptions}
        surfaceFilter={deskStickerSurfaceFilter}
        className="right-[9%] top-[74%] w-[21%]"
      />
    </motion.div>
  </div>
);

const LocationDial = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.45 }}
      className="absolute left-[6%] top-[63%] z-30 hidden w-[112px] sm:block lg:left-[4.3%] lg:top-[66%] lg:w-[128px]"
    >
      <img
        src="/images/desk/reference/avatar-pixel.png"
        alt="Jason's pixel avatar"
        className="aspect-square w-full select-none object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.3)]"
        draggable={false}
      />
      <div className="mt-[-2px] flex h-7 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/10 text-xs text-white/55 backdrop-blur-md">
        <MapPin className="h-3.5 w-3.5" />
        <span>China</span>
      </div>
    </motion.div>
  );
};

const formatDeskTime = (date) => new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
}).format(date);

const DeskStatusBar = () => {
  const [now, setNow] = useState(() => new Date());
  const [isOnline, setIsOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine);
  const [battery, setBattery] = useState({ level: null, charging: null });

  useEffect(() => {
    const clock = window.setInterval(() => setNow(new Date()), 1000);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.clearInterval(clock);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    let batteryManager;
    let syncBattery;

    if (typeof navigator === 'undefined' || typeof navigator.getBattery !== 'function') return undefined;

    navigator.getBattery().then((manager) => {
      if (disposed) return;
      batteryManager = manager;
      syncBattery = () => setBattery({ level: manager.level, charging: manager.charging });
      syncBattery();
      manager.addEventListener('levelchange', syncBattery);
      manager.addEventListener('chargingchange', syncBattery);
    }).catch(() => {});

    return () => {
      disposed = true;
      if (!batteryManager || !syncBattery) return;
      batteryManager.removeEventListener('levelchange', syncBattery);
      batteryManager.removeEventListener('chargingchange', syncBattery);
    };
  }, []);

  const batteryPercent = battery.level === null ? null : Math.round(battery.level * 100);
  const BatteryIcon = battery.charging
    ? BatteryCharging
    : batteryPercent === null
      ? Battery
      : batteryPercent >= 67
        ? BatteryFull
        : batteryPercent >= 30
          ? BatteryMedium
          : BatteryLow;
  const batteryLabel = batteryPercent === null
    ? 'Battery status unavailable in this browser'
    : `${batteryPercent}%${battery.charging ? ' · Charging' : ''}`;

  return (
    <div className="pointer-events-none absolute right-5 top-4 z-[60] flex items-center gap-3 text-white/60 sm:right-7 sm:top-5 sm:gap-4">
      <Wifi className={`h-[15px] w-[15px] sm:h-4 sm:w-4 ${isOnline ? 'text-white/65' : 'text-white/25'}`} aria-label={isOnline ? 'Online' : 'Offline'} />
      <Headphones className="h-[15px] w-[15px] sm:h-4 sm:w-4" aria-hidden="true" />
      <Bluetooth className="h-[15px] w-[15px] sm:h-4 sm:w-4" aria-hidden="true" />
      <div className="flex items-center gap-1" title={batteryLabel} aria-label={batteryLabel}>
        <BatteryIcon className="h-[18px] w-[18px] sm:h-[19px] sm:w-[19px]" />
        {batteryPercent !== null && <span className="text-[11px] font-medium tabular-nums text-white/65 sm:text-xs">{batteryPercent}%</span>}
      </div>
      <time dateTime={now.toISOString()} className="whitespace-nowrap text-[13px] font-medium tabular-nums text-white/65 sm:text-sm">
        {formatDeskTime(now)}
      </time>
    </div>
  );
};

const DeskNavigation = () => (
  <div className="absolute bottom-[3.5%] left-1/2 z-40 -translate-x-1/2 lg:bottom-[-10%]">
    <motion.nav
      aria-label="Primary navigation"
      className="flex gap-2 rounded-[28px] border border-white/15 bg-white/[0.07] p-2 backdrop-blur-xl"
    >
      {[
        { label: 'Projects', href: '#projects', icon: Folder },
        { label: 'About', href: '#about', icon: UserRound },
        { label: 'Contact', href: 'mailto:jason2k@126.com', icon: AtSign },
      ].map((item) => (
        <motion.a
          key={item.label}
          href={item.href}
          whileHover={{ y: -3, backgroundColor: 'rgba(255,255,255,0.11)' }}
          whileTap={{ scale: 0.96 }}
          className="flex h-12 w-12 items-center justify-center rounded-[17px] border border-white/10 bg-white/[0.08] text-white sm:h-[66px] sm:w-[66px] sm:rounded-[20px]"
        >
          <item.icon className="h-5 w-5 sm:h-7 sm:w-7" />
          <span className="sr-only">{item.label}</span>
        </motion.a>
      ))}
    </motion.nav>
  </div>
);

const deskSpotlightPositions = {
  ipad: { x: 14, y: 36 },
  pencil: { x: 28, y: 26 },
  macbook: { x: 50, y: 30 },
  mouse: { x: 72, y: 38 },
  headphones: { x: 86, y: 29 },
};

const DeskHero = () => {
  const [focusedObject, setFocusedObject] = useState(null);
  const [spotlightObject, setSpotlightObject] = useState('macbook');
  const focusClearTimerRef = useRef(null);
  const spotlightPosition = deskSpotlightPositions[spotlightObject];

  useEffect(() => () => window.clearTimeout(focusClearTimerRef.current), []);

  const focusObject = (objectName) => {
    window.clearTimeout(focusClearTimerRef.current);
    setSpotlightObject(objectName);
    setFocusedObject(objectName);
  };
  const clearFocus = (objectName) => {
    window.clearTimeout(focusClearTimerRef.current);
    focusClearTimerRef.current = window.setTimeout(() => {
      setFocusedObject((currentObject) => (currentObject === objectName ? null : currentObject));
    }, 80);
  };

  return (
  <section id="about" className="relative isolate h-[100svh] min-h-[760px] overflow-hidden bg-[#070707] text-white">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,#151515_0%,#0b0b0b_46%,#050505_100%)]" />
    <div className="pointer-events-none absolute left-1/2 top-[12%] z-[2] h-[48%] w-[95%] max-w-[1320px] -translate-x-1/2 overflow-hidden rounded-[16px] border-2 border-[#1f1c1b] bg-[#191716] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),inset_0_0_0_3px_rgba(0,0,0,0.24),0_14px_24px_rgba(0,0,0,0.18)] sm:top-[13%] sm:h-[52%] sm:w-[95%]">
      <div
        className="absolute inset-[5px] rounded-[11px] border border-dashed border-white/[0.055] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.32),inset_0_0_14px_rgba(0,0,0,0.18)]"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 54%, rgba(91,52,42,0.20) 0%, rgba(30,25,24,0.30) 28%, rgba(9,9,9,0.94) 76%), repeating-linear-gradient(0deg, rgba(255,255,255,0.009) 0px, rgba(255,255,255,0.009) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 4px)',
        }}
      />
    </div>
    <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_50%_40%,transparent_38%,rgba(0,0,0,0.08)_66%,rgba(0,0,0,0.42)_100%)]" />
    <DeskStatusBar />

    <div className="relative z-10 mx-auto h-full w-full max-w-[1440px] translate-y-[2vh] overflow-visible">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20"
        initial={{
          opacity: 0,
          background: `radial-gradient(ellipse 31% 42% at ${deskSpotlightPositions.macbook.x}% ${deskSpotlightPositions.macbook.y}%, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.012) 28%, rgba(0,0,0,0.055) 58%, rgba(0,0,0,0.25) 100%)`,
        }}
        animate={{
          opacity: focusedObject ? 1 : 0,
          background: `radial-gradient(ellipse 31% 42% at ${spotlightPosition.x}% ${spotlightPosition.y}%, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.012) 28%, rgba(0,0,0,0.055) 58%, rgba(0,0,0,0.25) 100%)`,
        }}
        transition={{
          opacity: focusedObject
            ? { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0.72, delay: 0.04, ease: [0.4, 0, 0.2, 1] },
          background: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
        }}
      />

      <motion.img
        src="/images/desk/reference/ipad-pro-dark-clock.webp"
        alt="iPad Pro showing a dark editorial clock screen"
        initial={{ opacity: 0, rotate: -44, scale: 0.94 }}
        animate={{ opacity: 1, rotate: -38, scale: 1 }}
        onHoverStart={() => focusObject('ipad')}
        onHoverEnd={() => clearFocus('ipad')}
        whileHover={{
          y: -4,
          scale: 1.05,
          rotate: -36.5,
          filter: 'brightness(1.065) saturate(1.025) drop-shadow(0 14px 18px rgba(0,0,0,0.32))',
          transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
        }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto absolute left-[-4%] top-[32%] z-[8] w-[38%] select-none object-contain drop-shadow-[0_18px_18px_rgba(0,0,0,0.32)] sm:left-[0%] sm:top-[26%] sm:w-[27.5%] lg:left-[3%] lg:top-[25%] lg:w-[22.8%]"
        style={{ zIndex: focusedObject === 'ipad' ? 24 : 8 }}
        draggable={false}
      />

      <motion.img
        src="/images/desk/reference/apple-pencil-pro.png"
        alt="Apple Pencil Pro"
        initial={{ opacity: 0, rotate: -22, scale: 0.9 }}
        animate={{ opacity: 1, rotate: -17, scale: 1 }}
        onHoverStart={() => focusObject('pencil')}
        onHoverEnd={() => clearFocus('pencil')}
        whileHover={{
          y: -4,
          scale: 1.06,
          rotate: -15.5,
          filter: 'brightness(1.07) drop-shadow(0 11px 14px rgba(0,0,0,0.32))',
          transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
        }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto absolute left-[25%] top-[21%] z-[9] hidden h-[17%] w-auto select-none object-contain drop-shadow-[0_8px_8px_rgba(0,0,0,0.3)] sm:block lg:left-[26.5%] lg:top-[20%] lg:h-[18%]"
        style={{ zIndex: focusedObject === 'pencil' ? 24 : 9 }}
        draggable={false}
      />

      <motion.div
        initial={{ opacity: 0, rotate: 18, scale: 0.9 }}
        animate={{ opacity: 1, rotate: 25, scale: 1 }}
        onHoverStart={() => focusObject('headphones')}
        onHoverEnd={() => clearFocus('headphones')}
        transition={{ duration: 0.95, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{
          y: -4,
          rotate: 22,
          scale: 1.04,
          filter: 'brightness(1.065) saturate(1.02) drop-shadow(0 14px 18px rgba(0,0,0,0.32))',
          transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
        }}
        className="absolute right-[-2.8%] top-[18%] z-[9] w-[33.4%] select-none lg:right-[3.4%] lg:top-[12%] lg:w-[19.86%]"
        style={{ zIndex: focusedObject === 'headphones' ? 24 : 9 }}
      >
        <img
          src="/images/desk/reference/headphones.png"
          alt="AirPods Max"
          className="pointer-events-none h-auto w-full object-contain"
          draggable={false}
        />
        {headphoneStickerPlacements.map((sticker, index) => (
          <ForgeSticker
            key={sticker.src}
            src={sticker.src}
            alt={`${sticker.alt} on AirPods Max`}
            delay={0.68 + index * 0.045}
            tilt={sticker.tilt}
            displayScale={sticker.displayScale}
            displayAspect={sticker.aspect}
            forgeOptions={headphoneStickerForgeOptions}
            surfaceFilter={headphoneStickerSurfaceFilter}
            zIndex={sticker.zIndex}
            className={sticker.className}
          />
        ))}
      </motion.div>

      <MacBookLayer
        isFocused={focusedObject === 'macbook'}
        onFocus={() => focusObject('macbook')}
        onBlur={() => clearFocus('macbook')}
      />

      <motion.img
        src="/images/desk/reference/pencil.png"
        alt="Magic Mouse"
        initial={{ opacity: 0, rotate: -8, y: -20 }}
        animate={{ opacity: 1, rotate: -16, y: 0 }}
        onHoverStart={() => focusObject('mouse')}
        onHoverEnd={() => clearFocus('mouse')}
        whileHover={{
          y: -4,
          scale: 1.06,
          rotate: -14.5,
          filter: 'brightness(1.075) drop-shadow(0 11px 15px rgba(0,0,0,0.33))',
          transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
        }}
        transition={{ duration: 0.75, delay: 0.42 }}
        className="pointer-events-auto absolute right-[28%] top-[33%] z-[18] w-[6%] select-none object-contain lg:right-[27.2%] lg:top-[34.2%] lg:w-[4%]"
        style={{ zIndex: focusedObject === 'mouse' ? 24 : 18 }}
        draggable={false}
      />

      <div className="absolute left-1/2 top-[60%] z-30 w-full -translate-x-1/2 text-center sm:top-[58%] lg:left-[45%] lg:top-[63%]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="whitespace-nowrap text-[clamp(54px,9.8vw,144px)] font-bold leading-none text-[#e4e4e4]">
            Jason He.
          </h1>
          <div className="mx-auto mt-3 flex w-full max-w-[340px] flex-wrap items-center justify-center gap-x-2 gap-y-1 px-2 text-[10px] text-white/50 sm:max-w-[720px] sm:gap-x-5 sm:px-5 sm:text-base lg:relative lg:-left-3 lg:text-xl">
            <span>AI Product Manager</span>
            <span className="hidden text-white/25 lg:inline">•</span>
            <span>Indie Developer</span>
            <span className="hidden text-white/25 lg:inline">•</span>
            <span>Product Designer</span>
          </div>
          <div className="mx-auto mt-2 hidden max-w-[720px] items-center justify-center gap-6 text-base text-white/45 sm:flex lg:relative lg:-left-3 lg:text-lg">
            <a href="mailto:jason2k@126.com" className="flex items-center gap-2 hover:text-white/75">
              <Mail className="h-5 w-5" />
              <span>jason2k@126.com</span>
            </a>
            <span className="text-white/20">•</span>
            <a href="tel:+8617666003839" className="flex items-center gap-2 hover:text-white/75">
              <Phone className="h-5 w-5" />
              <span>+86 176 6600 3839</span>
            </a>
          </div>
        </motion.div>
      </div>

      <LocationDial />

      <DeskNavigation />
    </div>
  </section>
  );
};

const stickerPreviews = [
  { src: '/images/desk/stickers/preview/origin-tattoo.png', alt: 'Origin Tattoo Killer sticker', aspect: 624 / 507, scale: 0.74, tilt: -5 },
  { src: '/images/desk/stickers/preview/chill.png', alt: 'Chill sticker', aspect: 718 / 517, scale: 0.78, tilt: 4 },
  { src: '/images/desk/stickers/preview/gojira.png', alt: 'Gojira sticker', aspect: 587 / 626, scale: 0.67, tilt: -3 },
  { src: '/images/desk/stickers/preview/nasa-meatball.png', alt: 'NASA meatball sticker', aspect: 415 / 343, scale: 0.7, tilt: 5 },
  { src: '/images/desk/stickers/preview/nasa-retro.png', alt: 'Retro NASA sticker', aspect: 1, scale: 0.68, tilt: -4 },
  { src: '/images/desk/stickers/preview/nasa-wordmark.png', alt: 'NASA wordmark sticker', aspect: 416 / 319, scale: 0.76, tilt: 3 },
  { src: '/images/desk/stickers/preview/ares.png', alt: 'Ares mission sticker', aspect: 384 / 340, scale: 0.7, tilt: -5 },
  { src: '/images/desk/stickers/preview/nasa-rocket.png', alt: 'NASA rocket sticker', aspect: 342 / 397, scale: 0.64, tilt: 4 },
];

const headphoneStickerPlacements = [
  { ...stickerPreviews[0], displayScale: 0.68, tilt: -7, zIndex: 31, className: 'left-[15%] top-[52%] w-[31%]' },
  { src: '/images/desk/stickers/preview/phone-dogs.png', alt: 'Double phone dogs sticker', aspect: 452 / 302, displayScale: 0.67, tilt: 5, zIndex: 32, className: 'left-[23%] top-[58%] w-[30%]' },
  { ...stickerPreviews[1], displayScale: 0.62, tilt: -4, zIndex: 33, className: 'left-[20%] top-[66%] w-[29.1%]' },
  { ...stickerPreviews[2], displayScale: 0.64, tilt: 7, zIndex: 34, className: 'left-[16%] top-[63%] w-[24.25%]' },
  { ...stickerPreviews[4], displayScale: 0.72, tilt: 6, zIndex: 31, className: 'left-[55%] top-[60%] w-[23.28%]' },
  { src: '/images/desk/stickers/preview/red-spike-head.png', alt: 'Red spike head sticker', aspect: 453 / 351, displayScale: 0.68, tilt: -5, zIndex: 35, className: 'left-[52%] top-[63%] w-[27.16%]' },
  { ...stickerPreviews[6], displayScale: 0.65, tilt: 3, zIndex: 33, className: 'left-[60%] top-[69%] w-[26.19%]' },
  { ...stickerPreviews[7], displayScale: 0.68, tilt: -7, zIndex: 34, className: 'left-[69%] top-[62%] w-[24.25%]' },
];

export const HeroSection = ({ lang }) => {
  const appStore = {
    name: 'App Store',
    eyebrow: 'Download on the',
    icon: '/images/codeway-reference/apple.svg',
  };
  const projects = [
    {
      id: 'chat-ask-ai',
      title: 'Chat & Ask AI',
      category: 'Chatbot & Smart Assistant',
      description: 'Our flagship chatbot hit the market first, long before the AI boom. We built it to make AI accessible to everyone. It’s a bold, always-learning interface for exploring human-AI interaction at scale.',
      mobileDescription: 'A bold chatbot built before ChatGPT’s app—designed to make AI chat accessible, intuitive, and constantly learning.',
      background: '#0f5136',
      icon: '/images/codeway-reference/chat-icon.png',
      screen: '/images/codeway-reference/chat-screen.jpg',
      screenOverlay: '/images/codeway-reference/phone-screen-chat.png',
      rating: '/images/codeway-reference/chat-rating.svg',
      stores: [
        { ...appStore, url: 'https://apps.apple.com/us/app/chat-ask-ai-by-codeway/id1668787639' },
      ],
      metrics: [
        { value: '50M+', label: 'Downloads' },
        { value: '4.6', rating: true },
        { value: '300M+', label: 'Chats' },
      ],
    },
    {
      id: 'retake',
      title: 'Retake',
      category: 'Face & Photo Editor',
      description: 'We developed Retake using our in-house AI to reimagine photography. It generates hyper-realistic retakes from any photo, turning missed moments into stunning portraits. No filters, no fakery.',
      mobileDescription: 'Our in-house AI turns missed moments into hyper-realistic portraits. No filters, no fakery.',
      background: '#5b0034',
      icon: '/images/codeway-reference/retake-icon.png',
      screen: '/images/codeway-reference/retake-screen.jpg',
      screenOverlay: '/images/codeway-reference/phone-screen-retake.png',
      rating: '/images/codeway-reference/rating.svg',
      stores: [
        { ...appStore, url: 'https://apps.apple.com/us/app/retake-ai-face-selfie-editor/id6466298983' },
      ],
      metrics: [
        { value: '17M+', label: 'Downloads' },
        { value: '4.3', rating: true },
      ],
    },
    {
      id: 'learna',
      title: 'Learna',
      category: 'AI English Tutor',
      description: 'Learna is our AI-powered English tutor that speaks, listens, and adapts like a human teacher. We combined talking head tech, Gaussian image generation, and natural language understanding to make language learning feel personal, fun, and effective.',
      mobileDescription: 'An AI English tutor that speaks, listens, and adapts like a human teacher.',
      background: '#075daa',
      icon: '/images/codeway-reference/learna-icon.png',
      screen: '/images/codeway-reference/learna-screen.jpg',
      screenOverlay: '/images/codeway-reference/phone-screen-learna.png',
      rating: '/images/codeway-reference/rating.svg',
      stores: [
        { ...appStore, url: 'https://apps.apple.com/us/app/speak-learn-english-learna/id6478287397' },
      ],
      metrics: [
        { value: '50M+', label: 'Downloads' },
        { value: '4.5', rating: true },
      ],
    },
  ];

  return (
    <>
      <DeskHero />
      <ScrollProjectsShowcase projects={projects} />
    </>
  );
};

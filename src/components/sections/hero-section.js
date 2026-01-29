/**
 * @file hero-section.js
 * @description 首屏英雄区块组件，展示个人主要信息和独立开发作品
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeCheck, X } from 'lucide-react';
import { cn } from '../../lib/utils';

// App Store 按钮组件
const AppStoreButton = ({ href, lang }) => {
  if (!href) return null;
  
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl",
        "bg-black text-white dark:bg-white dark:text-black",
        "hover:opacity-90 active:scale-95 transition-all",
        "text-sm font-medium shrink-0"
      )}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
      <div className="flex flex-col items-start leading-tight">
        <span className="text-[10px] opacity-80">{lang === 'zh' ? '下载于' : 'Download on the'}</span>
        <span className="text-sm font-semibold">App Store</span>
      </div>
    </a>
  );
};

// 数据标签组件（类似编辑精选样式）
const StatsBadge = ({ stats, lang }) => {
  if (!stats || stats.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {stats.map((stat, index) => (
        <span
          key={index}
          className={cn(
            "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium",
            "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30",
            "text-blue-700 dark:text-blue-300",
            "border border-blue-100 dark:border-blue-800/50",
            "shadow-sm"
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

// 项目卡片组件
const ProjectCard = ({ project, lang, index }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="flex flex-col gap-4"
      >
        {/* 项目图片 - 可点击 */}
        <div 
          className={cn(
            "relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer",
            "bg-gradient-to-br",
            project.bgGradient,
            "p-4 sm:p-6",
            "transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          )}
          onClick={() => setIsLightboxOpen(true)}
        >
          <img
            src={project.image}
            alt={project.title[lang]}
            className="w-full h-auto rounded-xl sm:rounded-2xl shadow-2xl"
            loading="lazy"
          />
          {/* 悬停提示 */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors rounded-2xl sm:rounded-3xl">
            <span className="opacity-0 hover:opacity-100 text-white text-sm font-medium px-4 py-2 bg-black/50 rounded-full backdrop-blur-sm transition-opacity">
              {lang === 'zh' ? '点击查看大图' : 'Click to enlarge'}
            </span>
          </div>
        </div>
        
        {/* 项目信息和按钮 */}
        <div className="px-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {project.title[lang]}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                {project.subtitle[lang]}
              </p>
            </div>
            <AppStoreButton href={project.appStoreUrl} lang={lang} />
          </div>
          
          {/* 数据标签 */}
          <StatsBadge stats={project.stats} lang={lang} />
        </div>
      </motion.div>
      
      {/* 图片灯箱 */}
      <ImageLightbox
        image={project.image}
        title={project.title[lang]}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
    </>
  );
};

export const HeroSection = ({ lang, t }) => {
  // 项目数据 - 顺序：DoitMac、Tracck、Aha、评审工具、Doit
  const projects = [
    {
      id: 'doit-mac',
      title: { zh: 'Do it!', en: 'Do it!' },
      subtitle: { zh: '一款简单漂亮的任务规划App', en: 'A simple and beautiful task planning app' },
      image: '/images/DoitMac.png',
      bgGradient: 'from-blue-100 via-blue-50 to-cyan-50 dark:from-blue-900/50 dark:via-blue-800/30 dark:to-cyan-900/30',
      appStoreUrl: 'https://apps.apple.com/cn/app/do-it/id6743646015',
      stats: [
        { icon: '👥', label: { zh: '下载 13,000+', en: '13,000+ Downloads' } },
        { icon: '💰', label: { zh: '收入 $4,000', en: '$4,000 Revenue' } },
        { icon: '📈', label: { zh: '付费率 40%+', en: '40%+ Paid Rate' } },
        { icon: '🏆', label: { zh: '效率榜 #48', en: 'Productivity #48' } },
        { icon: '🔥', label: { zh: '即刻发布会多次TOP1', en: 'Multiple TOP1 on Jike' } },
      ]
    },
    {
      id: 'tracck',
      title: { zh: 'Tracck!', en: 'Tracck!' },
      subtitle: { zh: '一款博主商单管理、排期、收入统计App', en: 'A creator business management app' },
      image: '/images/Tracck.png',
      bgGradient: 'from-gray-50 to-white dark:from-gray-800 dark:to-gray-900',
      appStoreUrl: 'https://apps.apple.com/cn/app/tracck/id6743366923',
      stats: [
        { icon: '👥', label: { zh: '下载 2,000+', en: '2,000+ Downloads' } },
        { icon: '💰', label: { zh: '收入 $2,000', en: '$2,000 Revenue' } },
      ]
    },
    {
      id: 'aha',
      title: { zh: 'Aha', en: 'Aha' },
      subtitle: { zh: 'AI智能对话助手', en: 'AI Smart Chat Assistant' },
      image: '/images/Aha.png',
      bgGradient: 'from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700',
      appStoreUrl: null,
      stats: null
    },
    {
      id: 'review-tool',
      title: { zh: '评审工具', en: 'Review Tool' },
      subtitle: { zh: '产品评审效率工具', en: 'Product Review Efficiency Tool' },
      image: '/images/评审工具.png',
      bgGradient: 'from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800',
      appStoreUrl: null,
      stats: null
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
                  非编程背景通过Cursor独立完成4款产品落地，其中<strong className="text-zinc-900 dark:text-zinc-100">2款</strong>已上线App Store，累计用户<strong className="text-zinc-900 dark:text-zinc-100">15,000+</strong>，最高App Store排行效率类<strong className="text-zinc-900 dark:text-zinc-100">#48</strong>，即刻产品发布会多次<strong className="text-zinc-900 dark:text-zinc-100">TOP1</strong>。
                </>
              ) : (
                <>
                  Non-programming background, independently completed 4 products with Cursor, <strong className="text-zinc-900 dark:text-zinc-100">2</strong> launched on App Store, <strong className="text-zinc-900 dark:text-zinc-100">15,000+</strong> total users, peaked at <strong className="text-zinc-900 dark:text-zinc-100">#48</strong> in App Store Productivity, multiple <strong className="text-zinc-900 dark:text-zinc-100">TOP1</strong> on Jike product launches.
                </>
              )}
            </p>
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

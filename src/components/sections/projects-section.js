/**
 * @file projects-section.js
 * @description 项目展示区块组件，展示个人项目作品集
 * 
 * 主要功能：
 * 1. 展示项目卡片网格或轮播
 * 2. 支持项目详情弹窗展示
 * 3. 提供项目筛选和分类
 * 4. 实现响应式布局
 * 
 * 交互特性：
 * - 项目卡片悬停效果
 * - 点击展开详情弹窗
 * - 支持键盘导航
 * - 滚动动画效果
 * 
 * 多语言支持：
 * - 项目标题和描述的中英文切换
 * - 标签和分类的翻译
 * - 动态适应语言切换
 * 
 * 数据结构：
 * - 项目信息的统一管理
 * - 标签系统
 * - 图片资源链接
 */

import React, { useEffect, useRef, useState, createContext, useContext } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { cn } from "../../lib/utils";
import { useOutsideClick } from "../../hooks/use-outside-click";
import { XIcon, ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { AnimatedText } from '../magicui/animated-text';

const translations = {
  zh: {
    viewDetails: '查看详情',
    tags: {
      design: '设计',
      development: '开发',
      mobile: '移动端',
      web: 'Web端'
    },
    titles: {
      'xiaohongshu': '小红书',
      'portfolio': '个人作品集',
      'game': '消消乐游戏'
    },
    descriptions: {
      '消消乐游戏': '一款基于Vue3开发的移动端消除类游戏。采用了模块化设计，实现了关卡进度保存、积分系统、音效反馈等功能，并针对触摸操作进行了优化。',
      '校友会首页': '校友会官方网站的首页设计与开发。采用响应式设计，确保在不同设备上都能获得良好的浏览体验。整合了新闻动态、活动信息等模块。',
      '投票系统': '为校园活动开发的在线投票系统。支持实时票数统计、防重复投票、数据可视化等功能，后端采用Node.js构建。',
      '春节活动': '春节期间推出的互动营销活动。融合了红包雨、集福字等多个小游戏，并接入了微信分享功能，提升用户参与度。',
      '新年活动': '新年主题的营销活动页面。包含了抽奖、签到打卡等互动环节，通过动画效果增强用户体验。',
      '元宵节活动': '元宵节专题活动页面。设计了猜灯谜、集卡等玩法，并加入了节日特色的视觉元素。',
      '校园导航': '面向新生开发的校园导航小程序。集成了地图导航、校园信息查询等功能，帮助新生快速熟悉校园环境。',
      '校园社区': '校园社交平台的移动端应用。支持发帖、评论、私信等社交功能，采用Flutter跨平台开发。',
      '校园活动': '校园活动管理与报名系统。提供活动发布、报名管理、签到统计等功能，支持在线支付。'
    }
  },
  en: {
    viewDetails: 'View Details',
    tags: {
      design: 'Design',
      development: 'Development',
      mobile: 'Mobile',
      web: 'Web'
    },
    titles: {
      'xiaohongshu': 'RED',
      'portfolio': 'Portfolio',
      'game': 'Match-3 Game'
    },
    descriptions: {
      '消消乐游戏': 'A mobile match-3 game developed with Vue3. Features modular design, level progression saving, scoring system, sound effects, and touch-optimized controls.',
      '校友会首页': 'Homepage design and development for the Alumni Association website. Implements responsive design for optimal viewing across devices. Integrates news updates and event information.',
      '投票系统': 'Online voting system for campus events. Features real-time vote counting, duplicate vote prevention, and data visualization. Backend built with Node.js.',
      '春节活动': 'Interactive marketing campaign for Spring Festival. Includes mini-games like red packet rain and fu character collection, with WeChat sharing integration.',
      '新年活动': 'New Year themed marketing campaign page. Features lucky draws and check-in activities, enhanced with animations for better user experience.',
      '元宵节活动': 'Lantern Festival themed activity page. Includes riddle games and card collection mechanics with festival-specific visual elements.',
      '校园导航': 'Campus navigation mini-program for new students. Integrates map navigation and campus information lookup to help newcomers familiarize with the environment.',
      '校园社区': 'Mobile application for campus social platform. Supports posting, commenting, and private messaging. Developed with Flutter for cross-platform compatibility.',
      '校园活动': 'Campus event management and registration system. Provides event publishing, registration management, attendance tracking, and online payment support.'
    }
  }
};

const CarouselContext = createContext({
  onCardClose: () => {},
  currentIndex: 0,
});

// 堆叠图片组件
const StackedImages = ({ images, currentIndex }) => {
  // 生成随机旋转角度
  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10;
  };

  return (
    <div className="relative w-full aspect-[280/607] scale-90">
      {/* 主图片 */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={currentIndex}
          initial={{
            opacity: 0,
            scale: 0.85,
            z: -150,
            rotate: randomRotateY(),
          }}
          animate={{
            opacity: 1,
            scale: 1,
            z: 0,
            rotate: 0,
            y: [0, -30, 0],
          }}
          exit={{
            opacity: 0,
            scale: 0.85,
            z: -150,
            rotate: randomRotateY(),
          }}
          transition={{
            duration: 0.4,
            ease: [0.32, 0.72, 0, 1],
          }}
          className="absolute inset-0 origin-center"
        >
          <img
            src={images[currentIndex]}
            alt={`Project image ${currentIndex + 1}`}
            className="w-full h-full object-cover rounded-[32px] shadow-lg dark:shadow-gray-800/50 border-[6px] border-gray-200/60 dark:border-white/30"
          />
        </motion.div>
      </AnimatePresence>

      {/* 堆叠的背景图片 */}
      {[...Array(3)].map((_, index) => {
        const nextIndex = (currentIndex + index + 1) % images.length;
        return (
          <motion.div
            key={`stack-${index}-${currentIndex}`}
            className="absolute inset-0 origin-center"
            initial={{
              opacity: 0,
              scale: 0.85,
              z: -150,
              rotate: randomRotateY(),
            }}
            animate={{
              opacity: 0.8 - (index * 0.25),
              scale: 0.92 - (index * 0.06),
              z: -40 * (index + 1),
              rotate: randomRotateY(),
              y: 20 * (index + 1),
            }}
            transition={{
              duration: 0.4,
              ease: [0.32, 0.72, 0, 1],
            }}
            style={{
              zIndex: -(index + 1)
            }}
          >
            <img
              src={images[nextIndex]}
              alt={`Stack image ${nextIndex + 1}`}
              className="w-full h-full object-cover rounded-[32px] shadow-lg dark:shadow-gray-800/50 border-[6px] border-gray-200/60 dark:border-white/30"
            />
          </motion.div>
        );
      })}
    </div>
  );
};

const ProjectCard = ({ project, index, layout = false, lang, projects }) => {
  const [open, setOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(index);
  const containerRef = useRef(null);
  const { onCardClose } = useContext(CarouselContext);

  // 所有可用的项目图片
  const allProjectImages = [
    '/images/project1.jpg',
    '/images/project2.jpg',
    '/images/project3.jpg',
    '/images/project4.jpg',
    '/images/project5.jpg',
    '/images/project6.jpg',
    '/images/投票01.png',
    '/images/消消乐游戏页面备份 6.png',
    '/images/校友会首页.png',
    '/images/IMG_0603.PNG',
    '/images/IMG_2099.PNG',
    '/images/IMG_3223.PNG',
    '/images/IMG_8612.PNG',
    '/images/IMG_8613.PNG',
    '/images/IMG_708125EB1BA7-1.jpeg'
  ];

  // 为当前项目随机选择4张图片
  const getRandomImages = () => {
    const shuffled = [...allProjectImages].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  };

  // 在组件挂载时生成随机图片
  const [projectImages] = useState(getRandomImages());

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => {
      const newIndex = prev > 0 ? prev - 1 : projectImages.length - 1;
      return newIndex;
    });
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => {
      const newIndex = prev < projectImages.length - 1 ? prev + 1 : 0;
      return newIndex;
    });
  };

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  const handlePrevProject = () => {
    setCurrentProjectIndex((prev) => {
      const newIndex = prev > 0 ? prev - 1 : projects.length - 1;
      return newIndex;
    });
  };

  const handleNextProject = () => {
    setCurrentProjectIndex((prev) => {
      const newIndex = prev < projects.length - 1 ? prev + 1 : 0;
      return newIndex;
    });
  };

  // 获取当前项目
  const currentProject = projects[currentProjectIndex];

  useOutsideClick(containerRef, () => handleClose());

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open]);

  return (
    <>
      <AnimatePresence mode="wait">
        {open && (
          <div 
            className="fixed inset-0 h-screen z-50 overflow-auto flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleClose();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="bg-black/80 backdrop-blur-lg h-full w-full fixed inset-0"
            />
            <motion.div
              initial={{ 
                opacity: 0,
                scale: 0.95,
                y: 20
              }}
              animate={{ 
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{ 
                opacity: 0,
                scale: 0.95,
                y: 20
              }}
              transition={{
                duration: 0.3,
                ease: [0.32, 0.72, 0, 1],
              }}
              ref={containerRef}
              layoutId={layout ? `card-${project.title}` : undefined}
              className="max-w-[90%] w-[650px] mx-auto bg-white h-fit z-[60] p-8 rounded-[32px] font-sans relative"
            >
              <button
                className="absolute top-6 right-6 h-10 w-10 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors"
                onClick={handleClose}
              >
                <XIcon className="h-5 w-5 text-gray-700" />
              </button>

              <div className="grid grid-cols-2 gap-8">
                {/* 左侧堆叠图片 */}
                <div className="col-span-1 relative">
                  {/* 左切换按钮 */}
                  <button
                    className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-50 h-10 w-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                    onClick={handlePrevImage}
                  >
                    <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
                  </button>

                  <StackedImages 
                    images={projectImages} 
                    currentIndex={currentImageIndex}
                  />

                  {/* 右切换按钮 */}
                  <button
                    className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-50 h-10 w-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                    onClick={handleNextImage}
                  >
                    <ArrowRightIcon className="h-5 w-5 text-gray-700" />
                  </button>
                </div>

                {/* 右侧项目信息 */}
                <div className="col-span-1 pt-4">
                  <motion.h2
                    layoutId={layout ? `title-${currentProject.title}` : undefined}
                    className="text-3xl font-bold text-gray-900"
                  >
                    {currentProject.title}
                  </motion.h2>
                  
                  {/* 标签 */}
                  <div className="flex gap-2 mt-4">
                    <span className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600">
                      {translations[lang].tags.development}
                    </span>
                    <span className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600">
                      {translations[lang].tags.mobile}
                    </span>
                  </div>

                  {/* 项目描述 */}
                  <p className="mt-6 text-gray-600 leading-relaxed">
                    {translations[lang].descriptions[currentProject.title]}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <motion.button
        layoutId={layout ? `card-${project.title}` : undefined}
        onClick={() => setOpen(true)}
        className="w-[280px] h-[607px] rounded-[32px] overflow-hidden relative z-10 group"
        whileHover={{ 
          transition: { duration: 0.2 }
        }}
      >
        <img
          src={project.src}
          alt={project.title}
          className="object-cover absolute z-10 inset-0 w-full h-full border-[6px] border-gray-200/60 dark:border-white/30 rounded-[32px]"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 ease-out z-20" />
        
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl font-medium text-gray-900 whitespace-nowrap opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out hover:scale-105">
            {translations[lang].viewDetails}
          </div>
        </div>
      </motion.button>
    </>
  );
};

export const ProjectsSection = ({ projects, lang }) => {
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isInView = useInView(carouselRef, { 
    margin: "-100px",
    amount: 0.2
  });

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleCardClose = (index) => {
    setCurrentIndex(index);
  };

  return (
    <CarouselContext.Provider value={{ onCardClose: handleCardClose, currentIndex }}>
      <div className="py-16 pb-32" id="projects">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.32, 0.72, 0, 1]
          }}
          className="pt-20 pb-4"
        >
          <AnimatedText
            text={lang === 'zh' ? '项目展示' : 'Project Showcase'}
            lang={lang}
          />
        </motion.div>
        
        <div className="relative w-full">
          <div className="w-full pt-6">
            <div className="relative">
              {/* 左侧遮罩 */}
              <div className={cn(
                "absolute left-0 top-0 h-[607px] w-[15%] z-20 pointer-events-none",
                "bg-gradient-to-r from-white via-white/80 to-transparent dark:from-black dark:via-black/80 dark:to-transparent",
                !canScrollLeft && "opacity-0"
              )} />

              {/* 右侧遮罩 */}
              <div className={cn(
                "absolute right-0 top-0 h-[607px] w-[15%] z-20 pointer-events-none",
                "bg-gradient-to-l from-white via-white/80 to-transparent dark:from-black dark:via-black/80 dark:to-transparent",
                !canScrollRight && "opacity-0"
              )} />

              {/* 滚动容器 */}
              <div
                className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth [scrollbar-width:none]"
                ref={carouselRef}
                onScroll={checkScrollability}
              >
                <div className="flex flex-row justify-start gap-8 pl-[10%] pr-[10%] mx-auto">
                  {projects.map((project, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={isInView ? {
                        opacity: 1,
                        y: 0,
                        transition: {
                          type: "spring",
                          duration: 0.6,
                          delay: 0.05 * index,
                          damping: 20,
                          stiffness: 100
                        },
                      } : {
                        opacity: 0,
                        y: 15
                      }}
                      key={project.title}
                    >
                      <ProjectCard project={project} index={index} layout lang={lang} projects={projects} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 控制按钮 - 调整位置 */}
          <div className="absolute bottom-[-3.5rem] right-[10%] flex justify-end gap-3">
            <button
              className={cn(
                "relative z-40 h-11 w-11 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm",
                "hover:bg-white hover:shadow-md transition-all",
                !canScrollLeft && "opacity-50 cursor-not-allowed"
              )}
              onClick={scrollLeft}
              disabled={!canScrollLeft}
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button
              className={cn(
                "relative z-40 h-11 w-11 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm",
                "hover:bg-white hover:shadow-md transition-all",
                !canScrollRight && "opacity-50 cursor-not-allowed"
              )}
              onClick={scrollRight}
              disabled={!canScrollRight}
            >
              <ArrowRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </CarouselContext.Provider>
  );
}; 
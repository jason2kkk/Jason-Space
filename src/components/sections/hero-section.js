/**
 * @file hero-section.js
 * @description 首屏英雄区块组件，展示个人主要信息和工作经历
 * 
 * 主要功能：
 * 1. 展示个人姓名、职业和简介
 * 2. 显示技能标签轮播动画
 * 3. 展示工作经历时间轴
 * 4. 提供简历下载功能
 * 5. 支持中英文切换
 * 
 * 动画效果：
 * - 组件入场渐显动画
 * - 技能标签无缝滚动
 * - 工作经历时间轴动画
 * - 下载按钮悬停效果
 * - 滚动指示箭头动画
 * 
 * 交互功能：
 * - 点击标签显示提示
 * - 点击下载按钮触发下载
 * - 点击箭头滚动到项目区域
 * - 响应语言切换实时更新
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NumberTicker } from '../ui/number-ticker';
import RainbowButton from '../magicui/rainbow-button';
import AnimatedShinyText from '../magicui/animated-shiny-text';
import { cn } from '../../lib/utils';
import { ChevronDownIcon } from 'lucide-react';
import ReactDOM from 'react-dom/client';
import { Toast } from '../ui/toast';

/**
 * 首屏英雄区块组件
 * 展示个人信息、工作经历和技能标签
 * 
 * @param {string} lang - 当前语言（'zh'或'en'）
 * @param {Object} t - 翻译文本对象
 * @param {Function} onDownload - 下载简历的回调函数
 */
export const HeroSection = ({ lang, t, onDownload }) => {
  // 当前活跃的标签索引
  const [activeTagIndex, setActiveTagIndex] = useState(0);

  // 工作经历数据
  const experiences = [
    {
      period: {
        zh: "2023.08—至今",
        en: "2023.08—Present"
      },
      company: {
        zh: "珠海达酷互动",
        en: "Zhuhai Dakuu"
      },
      role: {
        zh: "助理运营经理",
        en: "Assistant Manager"
      },
      isCurrent: true // 标记为当前工作
    },
    {
      period: {
        zh: "2022.06—2023.08",
        en: "2022.06—2023.08"
      },
      company: {
        zh: "深圳淘乐网络",
        en: "Shenzhen Taole"
      },
      role: {
        zh: "产品运营",
        en: "Product Operations"
      },
      isCurrent: false
    },
    {
      period: {
        zh: "2021.11—2022.05",
        en: "2021.11—2022.05"
      },
      company: {
        zh: "腾讯音乐娱乐",
        en: "Tencent Music Entertainment"
      },
      role: {
        zh: "产品运营",
        en: "Product Operations"
      },
      isCurrent: false
    }
  ];

  /**
   * 生成循环标签数组
   * 将标签数组复制三份，用于实现无缝滚动效果
   * 
   * @param {string} currentLang - 当前语言
   * @returns {Array} 循环标签数组
   */
  const getCircularTags = (currentLang) => {
    const currentTags = t.tags;
    return [...currentTags, ...currentTags, ...currentTags];
  };

  // 标签滚动偏移量
  const [offset, setOffset] = useState(0);

  // 设置标签自动滚动效果
  useEffect(() => {
    // 获取标签容器和第一个标签元素
    const tagContainer = document.querySelector('.tags-container');
    const firstTag = tagContainer?.firstElementChild;
    if (!firstTag) return;

    // 计算标签宽度和间距
    const tagWidth = firstTag.offsetWidth;
    const gap = 12; // gap-3 = 12px
    // 计算一组标签的总宽度
    const singleSetWidth = t.tags.length * (tagWidth + gap);
    
    let animationFrameId;
    let startTime = performance.now();
    const speed = 50; // 控制滚动速度的参数
    
    /**
     * 动画函数，实现标签的平滑滚动
     * @param {number} currentTime - 当前时间戳
     */
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      // 从右向左滚动，所以是正值
      let newOffset = (elapsed * speed / 1000) % singleSetWidth;
      
      // 当第一组标签滚动完毕后，从第二组开始显示，实现无缝衔接
      if (newOffset >= singleSetWidth) {
        startTime = currentTime - (newOffset % singleSetWidth) * (1000 / speed);
        newOffset = newOffset % singleSetWidth;
      }
      
      setOffset(newOffset);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // 启动动画
    animationFrameId = requestAnimationFrame(animate);
    
    // 组件卸载时清理动画
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [lang, t.tags]); // 当语言或标签变化时重新设置动画

  /**
   * 平滑滚动到项目展示区块
   */
  const scrollToProjects = () => {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ 
        behavior: 'smooth', // 平滑滚动
        block: 'start' // 滚动到顶部对齐
      });
    }
  };

  /**
   * 显示提示消息
   * @param {string} message - 提示消息内容
   */
  const showToast = (message) => {
    // 创建Toast容器
    const toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
    
    // 创建React根节点并渲染Toast组件
    const root = ReactDOM.createRoot(toast);
    root.render(
      <Toast 
        message={message}
        onClose={() => {
          // Toast关闭后的清理函数
          setTimeout(() => {
            if (document.body.contains(toast)) {
              document.body.removeChild(toast); // 移除DOM节点
            }
            root.unmount(); // 卸载React组件
          }, 800); // 从500ms增加到800ms，确保动画完全结束
        }} 
      />
    );
  };

  // 渲染英雄区块
  return (
    <div className="hero-section flex flex-col justify-center w-1/2 ml-[12%] px-8 relative z-10">
      {/* 主要内容区域，带入场动画 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} // 初始状态：透明且向下偏移
        animate={{ opacity: 1, y: 0 }} // 动画目标：完全显示且回到原位
        transition={{ duration: 0.8 }} // 动画持续时间
        className="space-y-8"
      >
        {/* 姓名标题区域，根据语言调整高度 */}
        <div className={cn(
          "space-y-2",
          lang === 'zh' ? "h-[120px]" : "h-[90px]" // 中文和英文使用不同的高度
        )}>
          <motion.h1
            key={`name-${lang}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
              "text-6xl font-bold tracking-tight",
              "text-gray-900 dark:text-gray-100",
              lang === 'zh' ? "font-['AlibabaPuHuiTi-Bold'] tracking-wider" : ""
            )}
          >
            {t.name}
          </motion.h1>
          <AnimatePresence mode="wait">
            {lang === 'zh' && (
              <motion.h2
                key="role"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "text-3xl font-medium",
                  "text-gray-600 dark:text-gray-300",
                  lang === 'zh' ? "font-['AlibabaPuHuiTi-Medium']" : ""
                )}
              >
                {t.role}
              </motion.h2>
            )}
          </AnimatePresence>
        </div>
        
        <motion.div
          key={`tags-${lang}`}
          className={cn(
            "relative w-[480px] overflow-hidden -ml-4 cursor-pointer",
            lang === 'zh' ? "-mt-4" : "-mt-8"
          )}
          onClick={() => showToast(t.tagsHint)}
        >
          <div
            className="tags-container flex gap-3 transform will-change-transform backface-visibility-hidden"
            style={{ 
              transform: `translateX(-${offset}px)`,
              willChange: 'transform'
            }}
          >
            {getCircularTags(lang).map((tag, index) => (
              <motion.span
                key={`${tag}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0",
                  "bg-gray-100 text-gray-800",
                  "dark:bg-gray-800 dark:text-gray-200",
                  "transform-gpu shadow-sm",
                  "dark:shadow-[0_2px_8px_-2px_rgba(255,255,255,0.1)]",
                  lang === 'zh' ? "font-['AlibabaPuHuiTi-Regular']" : ""
                )}
              >
                {tag}
              </motion.span>
            ))}
          </div>
          <div className="absolute inset-y-0 -left-8 w-32 pointer-events-none bg-gradient-to-r from-white via-white to-transparent dark:from-black dark:via-black" />
          <div className="absolute inset-y-0 right-0 w-24 pointer-events-none bg-gradient-to-l from-white via-white to-transparent dark:from-black dark:via-black" />
        </motion.div>
        
        <motion.p
          key={`description-${lang}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl space-y-1"
        >
          <div className="flex items-baseline whitespace-nowrap">
            <AnimatedShinyText className="text-gray-600 dark:text-gray-300">
              {lang === 'zh' ? '具备' : 'Experienced in '}
            </AnimatedShinyText>
            <span className="inline-flex items-baseline mx-1">
              <NumberTicker 
                value={30} 
                className="text-gray-900 dark:text-gray-100 text-4xl font-bold"
                delay={0.2}
              />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">+</span>
            </span>
            <AnimatedShinyText className="text-gray-600 dark:text-gray-300">
              {lang === 'zh' ? '项目落地经验' : 'successful project implementations'}
            </AnimatedShinyText>
          </div>

          <div className="leading-relaxed">
            <AnimatedShinyText className="text-gray-600 dark:text-gray-300">
              {t.description}
            </AnimatedShinyText>
          </div>
        </motion.p>

        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`button-${lang}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <RainbowButton onClick={onDownload}>
                {t.downloadButton}
              </RainbowButton>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-5">
          <div className="space-y-6 relative text-sm">
            <div className="relative">
              <div 
                className="absolute left-[9.5rem] top-[13px] h-[calc(100%-85px)] w-[1px] bg-gray-100 dark:bg-gray-700 -translate-x-1/2 cursor-pointer"
                onClick={() => showToast(t.experienceHint)}
              />

              <div className="space-y-6">
                {experiences.map((exp, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "flex items-center gap-12 relative",
                      exp.isCurrent 
                        ? "text-gray-900 dark:text-gray-100" 
                        : "text-gray-400 dark:text-gray-500"
                    )}
                  >
                    <motion.span 
                      key={`period-${lang}-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="w-36 flex-shrink-0 font-medium"
                    >
                      {exp.period[lang]}
                    </motion.span>
                    <div className={cn(
                      "absolute left-[9.5rem] w-2.5 h-2.5 rounded-full -translate-x-1/2",
                      "z-10",
                      exp.isCurrent 
                        ? "bg-gray-900 dark:bg-gray-100" 
                        : "bg-gray-200 dark:bg-gray-700"
                    )} />
                    <div className="flex gap-4 ml-4">
                      <motion.span 
                        key={`company-${lang}-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
                        className={cn(
                          "font-medium",
                          exp.isCurrent 
                            ? "text-gray-900 dark:text-gray-100" 
                            : "text-gray-400 dark:text-gray-500"
                        )}
                      >
                        {exp.company[lang]}
                      </motion.span>
                      <motion.span 
                        key={`role-${lang}-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                        className={exp.isCurrent 
                          ? "text-gray-900 dark:text-gray-100" 
                          : "text-gray-400 dark:text-gray-500"}
                      >
                        {exp.role[lang]}
                      </motion.span>
                    </div>
                  </div>
                ))}

                <div className="flex items-center gap-12 relative pt-4">
                  <span className="w-36 flex-shrink-0" />
                  <div className="-ml-6">
                    <motion.button
                      onClick={scrollToProjects}
                      className={cn(
                        "p-2 rounded-full transition-colors cursor-pointer relative z-[11]",
                        "bg-gray-100 hover:bg-gray-200",
                        "dark:bg-gray-800 dark:hover:bg-gray-700"
                      )}
                      whileHover={{ y: 5 }}
                      animate={{
                        y: [0, 5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <ChevronDownIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 
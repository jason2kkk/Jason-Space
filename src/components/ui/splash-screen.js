/**
 * @file splash-screen.js
 * @description 启动屏幕组件，提供网站首次加载时的过渡动画
 * 
 * 主要功能：
 * 1. 显示网站加载时的欢迎界面
 * 2. 提供平滑的淡入淡出过渡效果
 * 3. 支持自定义加载动画
 * 4. 自动计时并移除启动屏幕
 * 
 * 动画效果：
 * - 使用framer-motion实现平滑过渡
 * - 渐变式的背景动画
 * - 文字的打字机效果
 * - 元素的依次淡入
 * 
 * 交互行为：
 * - 自动检测加载完成
 * - 平滑退出动画
 * - 支持提前跳过
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export const SplashScreen = ({ onComplete }) => {
  const [text, setText] = useState('');
  const fullText = "Jason's Space";
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  // 检测当前主题
  const isDarkMode = document.documentElement.classList.contains('dark');

  // 打字效果 - 每次组件挂载时重置状态
  useEffect(() => {
    setText('');
    setIsTypingComplete(false);
    setIsExiting(false);
    
    const startDelay = setTimeout(() => {
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setText(fullText.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTypingComplete(true);
        }
      }, 40);

      return () => clearInterval(typingInterval);
    }, 500);

    return () => clearTimeout(startDelay);
  }, [isDarkMode]); // 当主题变化时重新触发动画

  // 退出动画
  useEffect(() => {
    if (isTypingComplete) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          onComplete?.();
        }, 200);
      }, 1000); // 统一使用1000ms的等待时间

      return () => clearTimeout(timer);
    }
  }, [isTypingComplete, onComplete]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`splash-screen-${isDarkMode ? 'dark' : 'light'}`} // 使用不同的key确保动画重新触发
        className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-black overflow-hidden"
        initial={{ opacity: 0 }} // 初始状态为透明
        animate={{ opacity: 1 }} // 淡入动画
        exit={{ 
          opacity: 0,
          scale: 1.1,
          filter: "blur(10px)",
          transition: {
            duration: 0.8,
            ease: [0.32, 0.72, 0, 1]
          }
        }}
      >
        <motion.div 
          className="relative flex flex-col items-center"
          animate={isExiting ? {
            y: -40,
            scale: 0.9,
            opacity: 0,
            filter: "blur(5px)"
          } : {}}
          transition={{
            duration: 0.8,
            ease: [0.32, 0.72, 0, 1]
          }}
        >
          {/* 内容容器 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1,
              y: 0,
              transition: {
                duration: 1,
                ease: [0.32, 0.72, 0, 1]
              }
            }}
            className="relative flex flex-col items-center"
          >
            {/* Welcome 标题 */}
            <div className="mb-8 sm:mb-16 relative z-20">
              <span className={cn(
                "text-[48px] sm:text-[80px] md:text-[120px] leading-none tracking-tight",
                "font-extrabold uppercase",
                "bg-clip-text text-transparent",
                "bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-transparent",
                "dark:from-gray-100/95 dark:via-gray-200/90 dark:to-transparent",
                "select-none",
                "drop-shadow-sm"
              )}>
                WELCOME
              </span>
              {/* 背景渐变效果 */}
              <div className="absolute inset-0 -z-10 opacity-40 dark:opacity-30">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-500 blur-2xl" />
              </div>
            </div>

            {/* Logo */}
            <div className="relative z-20 mb-4 sm:mb-6">
              <img 
                src="/assets/avatar.jpg" 
                alt="Logo"
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full ring-4 ring-black/5 dark:ring-white/10"
              />
              {/* 光环效果 */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0, 0.5, 0],
                  transition: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 z-10"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 blur-xl dark:opacity-60" />
              </motion.div>
            </div>

            {/* 标题打字效果 */}
            <div className="relative z-20">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-wide">
                {text}
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="inline-block ml-1"
                >
                  |
                </motion.span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 
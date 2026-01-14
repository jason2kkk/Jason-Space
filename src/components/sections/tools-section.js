import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { AnimatedText } from '../magicui/animated-text';
import { analytics } from '../../lib/analytics';

const tools = [
  { name: 'Mastergo', icon: '/icons/mastergo.png' },
  { name: 'Axure', icon: '/icons/axure.png' },
  { name: 'ChatGPT', icon: '/icons/chatgpt.png' },
  { name: 'Final Cut Pro', icon: '/icons/finalcutpro.png' },
  { name: 'Lanhu', icon: '/icons/lanhu.png' },
  { name: 'XMind', icon: '/icons/xmind.png' },
  { name: 'Cursor', icon: '/icons/cursor.png' },
  { name: 'Figma', icon: '/icons/figma.png' },
  { name: 'Photoshop', icon: '/icons/ps.png' },
  { name: 'Modao', icon: '/icons/modao.png' },
  { name: 'Sketch', icon: '/icons/sketch.png' },
  { name: 'PPT', icon: '/icons/ppt.png' },
  { name: 'Excel', icon: '/icons/excel.png' },
  { name: 'Word', icon: '/icons/word.png' }
];

const ToolCard = ({ name, icon }) => {
  const handleMouseEnter = () => {
    analytics.trackToolCardHover(name);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      className="flex items-center gap-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-3 rounded-xl border border-black/[0.1] dark:border-white/[0.1] min-w-[180px] group hover:bg-white/95 dark:hover:bg-gray-800/95 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 ease-out"
    >
      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-50/80 dark:bg-gray-700/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <img src={icon} alt={name} className="w-6 h-6 object-contain group-hover:scale-110 transition-transform duration-300" />
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">{name}</span>
    </div>
  );
};

// 创建多组工具列表
const createMultipleToolSets = (count) => {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(...tools);
  }
  return result;
};

export const ToolsSection = ({ lang }) => {
  const [offset1, setOffset1] = useState(0);
  const [offset2, setOffset2] = useState(0);
  const [tools1] = useState(createMultipleToolSets(5)); // 增加到5组
  const [tools2] = useState(createMultipleToolSets(5)); // 不需要倒序，通过滚动方向控制
  const singleSetWidth = tools.length * 200; // 单组宽度
  const containerWidth = singleSetWidth * 5; // 总宽度

  // 第一行向左滚动
  useEffect(() => {
    let animationFrameId;
    let startTime = performance.now();
    let lastTimestamp = startTime;
    const FRAME_RATE = 1000 / 60; // 60fps

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTimestamp;
      
      // 限制帧率
      if (deltaTime >= FRAME_RATE) {
        const elapsed = currentTime - startTime;
        let newOffset = -(elapsed * 0.03) % singleSetWidth;
        setOffset1(newOffset);

        if (Math.abs(newOffset) >= singleSetWidth) {
          startTime = currentTime;
        }
        
        lastTimestamp = currentTime;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [singleSetWidth]);

  // 第二行向右滚动
  useEffect(() => {
    let animationFrameId;
    let startTime = performance.now();
    let lastTimestamp = startTime;
    const FRAME_RATE = 1000 / 60; // 60fps

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTimestamp;
      
      // 限制帧率
      if (deltaTime >= FRAME_RATE) {
        const elapsed = currentTime - startTime;
        let newOffset = (elapsed * 0.02) % singleSetWidth;
        setOffset2(newOffset);

        if (newOffset >= singleSetWidth) {
          startTime = currentTime;
        }
        
        lastTimestamp = currentTime;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [singleSetWidth]);

  return (
    <div className="pt-48 pb-16" id="tools">
      <AnimatedText
        text={lang === 'zh' ? '擅长工具' : 'Proficient Tools'}
        lang={lang}
      />
      
      <div className="space-y-4 overflow-hidden">
        {/* 第一行 - 向左滚动 */}
        <div className="relative mx-[-100vw] px-[100vw]">
          <div
            className="flex gap-4 transform will-change-transform backface-visibility-hidden"
            style={{ transform: `translateX(${offset1}px)` }}
          >
            {tools1.map((tool, index) => (
              <ToolCard key={`${tool.name}-1-${index}`} {...tool} />
            ))}
          </div>
          {/* 左右渐变遮罩 */}
          <div className="absolute inset-y-0 left-[100vw] w-32 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-black/60 dark:via-black/40 dark:to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-[100vw] w-32 bg-gradient-to-l from-white via-white/95 to-transparent dark:from-black/60 dark:via-black/40 dark:to-transparent pointer-events-none" />
        </div>

        {/* 第二行 - 向右滚动 */}
        <div className="relative mx-[-100vw] px-[100vw] pb-4">
          <div
            className="flex gap-4 transform will-change-transform backface-visibility-hidden"
            style={{ transform: `translateX(${-singleSetWidth + offset2}px)` }}
          >
            {tools2.map((tool, index) => (
              <ToolCard key={`${tool.name}-2-${index}`} {...tool} />
            ))}
          </div>
          {/* 左右渐变遮罩 */}
          <div className="absolute inset-y-0 left-[100vw] w-32 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-black/60 dark:via-black/40 dark:to-transparent pointer-events-none" style={{ bottom: "1rem" }} />
          <div className="absolute inset-y-0 right-[100vw] w-32 bg-gradient-to-l from-white via-white/95 to-transparent dark:from-black/60 dark:via-black/40 dark:to-transparent pointer-events-none" style={{ bottom: "1rem" }} />
        </div>
      </div>
    </div>
  );
}; 
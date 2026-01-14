/**
 * @file floating-dock.js
 * @description 浮动Dock导航栏组件，类似macOS的Dock效果
 * 
 * 主要功能：
 * 1. 提供快捷导航访问
 * 2. 响应式设计，适配桌面和移动设备
 * 3. 根据页面滚动位置自动显示/隐藏
 * 4. 实现图标悬停放大效果
 * 
 * 交互特性：
 * - 桌面版：
 *   · 鼠标悬停图标放大效果
 *   · 图标工具提示
 *   · 平滑动画过渡
 * - 移动版：
 *   · 折叠式菜单
 *   · 点击展开/收起
 *   · 动画过渡效果
 * 
 * 自适应特性：
 * - 桌面和移动设备使用不同布局
 * - 接近页脚时自动隐藏
 * - 自动调整位置和大小
 */

import React, { useRef, useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { translations } from '../../locales/translations';

/**
 * 浮动Dock组件
 * 类似macOS的Dock栏，在页面底部显示快捷导航
 * 
 * @param {string} lang - 当前语言
 * @param {boolean} isNearFooter - 是否接近页脚
 * @param {Function} setIsNearFooter - 设置是否接近页脚的函数
 * @param {Object} props - 其他属性
 */
export const FloatingDock = ({ lang, isNearFooter, setIsNearFooter, items, ...props }) => {
  // eslint-disable-next-line no-unused-vars
  const _t = translations[lang];

  useEffect(() => {
    /**
     * 检查是否接近页脚
     * 当页面滚动到接近页脚时，隐藏Dock栏
     */
    const checkFooterButtonsVisibility = () => {
      const footer = document.querySelector('footer');
      
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const threshold = 100; // 设置阈值，当距离页脚还有100px时就显示dock

        // 如果页脚接近视口底部，就显示页脚按钮
        const shouldShowFooter = footerRect.top - windowHeight < threshold;
        setIsNearFooter(shouldShowFooter);
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkFooterButtonsVisibility();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    checkFooterButtonsVisibility(); // 初始检查

    return () => window.removeEventListener('scroll', onScroll);
  }, [setIsNearFooter]);

  const variants = {
    initial: {
      y: 100,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 1
      }
    },
    exit: {
      y: 50,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <AnimatePresence>
        {!isNearFooter && (
          <motion.div
            className="pointer-events-auto"
            initial="initial"
            animate="visible"
            exit="exit"
            variants={variants}
          >
            <FloatingDockDesktop 
              items={items} 
              className={props.desktopClassName} 
            />
            <FloatingDockMobile 
              items={items} 
              className={props.mobileClassName} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * 移动版浮动Dock组件
 * 在移动设备上显示的简化版Dock
 * 
 * @param {Array} items - Dock项目数组
 * @param {string} className - 自定义类名
 */
const FloatingDockMobile = ({
  items,
  className,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn(
      "fixed bottom-12 right-8 z-50 block md:hidden",
      className
    )}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute bottom-full right-0 mb-2 flex flex-col gap-2 items-end"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: { delay: idx * 0.05 },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <a
                  href={item.href}
                  onClick={item.onClick}
                  className="h-10 w-10 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-lg border border-gray-200/20 dark:border-white/10 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <div className="h-4 w-4 text-gray-600 dark:text-gray-300">{item.icon}</div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="h-12 w-12 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-lg border border-gray-200/20 dark:border-white/10 flex items-center justify-center hover:scale-105 transition-transform"
      >
        <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}) => {
  let mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "absolute bottom-8",
        "left-1/2 -translate-x-1/2",
        "hidden md:flex items-center gap-5",
        "px-6 py-3 rounded-2xl",
        "bg-white/60 dark:bg-gray-800/60 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.1)] backdrop-blur-xl",
        "border border-white/10",
        "hover:bg-white/70 dark:hover:bg-gray-800/70 hover:shadow-[0_12px_36px_-4px_rgba(0,0,0,0.15)] transition-all duration-300",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  onClick,
  type,
  className
}) {
  let ref = useRef(null);
  let tooltipRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-200, 0, 200], [45, 65, 45]);
  let heightTransform = useTransform(distance, [-200, 0, 200], [45, 65, 45]);
  let widthTransformIcon = useTransform(distance, [-200, 0, 200], [24, 32, 24]);
  let heightTransformIcon = useTransform(distance, [-200, 0, 200], [24, 32, 24]);

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 200,
    damping: 20
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 200,
    damping: 20
  });
  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 200,
    damping: 20
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 200,
    damping: 20
  });

  if (type === 'separator') {
    return <div className={className} />;
  }

  return (
    <div className="relative flex items-center justify-center">
      <a 
        href={href} 
        onClick={onClick}
        className="relative flex items-center justify-center"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <motion.div
          ref={ref}
          style={{ width, height }}
          className="relative flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            style={{ width: widthIcon, height: heightIcon }}
            className="flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {React.cloneElement(icon, { 
              className: 'w-6 h-6 transition-transform',
              strokeWidth: 1.5
            })}
          </motion.div>
        </motion.div>
      </a>
      <div className="absolute inset-x-0 -top-20 flex items-center justify-center pointer-events-none">
        <AnimatePresence>
          {hovered && (
            <motion.div
              ref={tooltipRef}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className={cn(
                "px-4 py-2 rounded-lg",
                "bg-white/95 dark:bg-gray-800/95 text-gray-800 dark:text-white text-sm font-medium",
                "whitespace-nowrap shadow-xl",
                "select-none",
                "border border-gray-200/20 dark:border-white/10",
                "backdrop-blur-sm"
              )}
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default FloatingDock; 
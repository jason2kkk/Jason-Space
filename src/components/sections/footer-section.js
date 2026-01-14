import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

const FooterButton = ({ item, variants, index }) => {
  const [hovered, setHovered] = useState(false);
  const tooltipRef = useRef(null);

  return (
    <div className="relative">
      <motion.a
        key={item.title}
        href={item.href}
        onClick={item.onClick}
        custom={index}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "w-10 h-10 rounded-full",
          "bg-white/80 backdrop-blur-sm shadow-md dark:bg-gray-800/80",
          "flex items-center justify-center",
          "border border-gray-200/50 dark:border-white/10",
          "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
          "transition-colors"
        )}
      >
        {React.cloneElement(item.icon, { 
          className: 'w-5 h-5',
          strokeWidth: 1.5
        })}
      </motion.a>

      <div className="absolute inset-x-0 -top-14 flex items-center justify-center pointer-events-none">
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
                "bg-gray-900/95 text-white text-sm font-medium",
                "whitespace-nowrap shadow-xl",
                "select-none",
                "border border-white/10",
                "backdrop-blur-sm"
              )}
            >
              {item.title}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const FooterSection = ({ lang, isNearFooter, items }) => {
  const [showTechInfo, setShowTechInfo] = useState(false);
  
  const techDescription = "基于 React + Framer Motion 打造";
  
  const toggleInfo = () => {
    setShowTechInfo(prev => !prev);
  };

  const footerButtonVariants = {
    initial: (index) => ({
      opacity: 0,
      y: 20,
      scale: 0.8,
      rotate: -15
    }),
    animate: (index) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.8,
        delay: index * 0.08
      }
    }),
    exit: (index) => ({
      opacity: 0,
      y: 10,
      scale: 0.9,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.8,
        delay: index * 0.05
      }
    })
  };

  return (
    <footer className="pt-8 pb-16 bg-white dark:bg-black relative">
      <div className="container mx-auto px-8">
        <div className="flex flex-col items-center justify-center gap-8">
          <AnimatePresence mode="wait">
            {isNearFooter && (
              <motion.div
                key="footer-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    mass: 0.8,
                    delayChildren: 0.1,
                    staggerChildren: 0.08
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  y: 10,
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    mass: 0.8,
                    staggerChildren: 0.05
                  }
                }}
                className="flex items-center gap-4 mb-8"
              >
                {items.filter(item => item.type !== 'separator').map((item, index) => (
                  <FooterButton
                    key={item.title}
                    item={item}
                    variants={footerButtonVariants}
                    index={index}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 版权信息 */}
          <div 
            className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 cursor-pointer"
            onClick={toggleInfo}
          >
            <AnimatePresence mode="wait">
              {showTechInfo ? (
                <motion.div
                  key="tech-info"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="text-sm text-center px-4 mb-2"
                >
                  {techDescription}
                </motion.div>
              ) : (
                <motion.div
                  key="copyright"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <p className={cn(
                    "text-sm mb-2",
                    lang === 'zh' ? "font-['AlibabaPuHuiTi-Regular']" : ""
                  )}>
                    {lang === 'zh' ? '© 2025 何鹏伟. 保留所有权利.' : '© 2025 Jason He. All rights reserved.'}
                  </p>
                  <p className={cn(
                    "text-sm text-gray-400",
                    lang === 'zh' ? "font-['AlibabaPuHuiTi-Regular']" : ""
                  )}>
                    {lang === 'zh' ? '暂未适配移动端，感谢理解🙏' : 'Mobile version coming soon, thank you for your understanding🙏'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </footer>
  );
}; 
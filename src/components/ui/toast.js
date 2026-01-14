import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "../../lib/utils";

export const Toast = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // 延迟调用 onClose，给退出动画足够的时间完成
      setTimeout(onClose, 600);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-x-0 top-0 flex items-start justify-center z-50 pointer-events-none pt-6">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 30,
                mass: 0.8
              }
            }}
            exit={{ 
              opacity: 0, 
              y: -15,
              scale: 0.95,
              transition: {
                type: "tween",
                ease: "easeInOut",
                duration: 0.5
              }
            }}
            className={cn(
              "bg-gray-900/95 text-white px-6 py-3 rounded-full text-sm font-medium",
              "shadow-xl backdrop-blur-sm border border-white/10",
              "pointer-events-auto"
            )}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 
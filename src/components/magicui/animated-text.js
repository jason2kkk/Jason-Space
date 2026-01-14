import React, { useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export const AnimatedText = ({ text, className, lang, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    margin: "-100px",
    amount: 0.5  // 当元素有50%进入视图时触发
  });

  const characters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delay }
    })
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200
      }
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200
      }
    }
  };

  return (
    <motion.h2
      ref={ref}
      className={cn(
        "text-4xl font-bold mb-12 text-center",
        lang === 'zh' ? "font-['AlibabaPuHuiTi-Bold']" : "",
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`title-${lang}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
        >
          {text}
        </motion.div>
      </AnimatePresence>
    </motion.h2>
  );
}; 
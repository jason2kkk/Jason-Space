import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export const AnimatedText = ({ text, className, lang }) => {
  const ref = useRef(null);

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
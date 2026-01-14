import React, { useRef } from "react";
import { CardContainer, CardBody, CardItem } from "./3d-card";
import { NumberTicker } from "./number-ticker";
import { ArrowRight } from "lucide-react";
import { useInView, motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

export const Test3DCard = ({ lang = 'zh' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });
  
  const t = {
    title: lang === 'zh' ? '我的小红书' : 'My RedNote',
    nickname: '2k',
    description: lang === 'zh' ? '分享一些有趣实用的产品' : 'Share some interesting and useful products',
    followers: lang === 'zh' ? '粉丝' : 'Fans',
    likes: lang === 'zh' ? '获赞' : 'Likes',
    views: lang === 'zh' ? '浏览' : 'Views',
    viewButton: lang === 'zh' ? '去看看' : 'Go See'
  };

  return (
    <div className="relative">
      <CardContainer>
        <CardBody className="relative group/card w-auto sm:w-[30rem] h-auto rounded-xl p-6 bg-white dark:bg-gray-900 border border-black/[0.1] dark:border-white/[0.1]">
          {/* 标题 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={lang}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <CardItem translateZ="50" className="text-xl font-bold text-neutral-600 dark:text-neutral-200 mb-4">
                {t.title}
              </CardItem>
            </motion.div>
          </AnimatePresence>

          {/* 卡片主体区域 */}
          <CardItem translateZ="100" className="w-full">
            <div ref={ref} className="h-64 w-full bg-gradient-to-br from-cyan-400 to-purple-400 rounded-xl p-8">
              {/* 头像和昵称 */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-20 h-20 rounded-full overflow-hidden border-4 border-white/30">
                  <img src="/assets/avatar.jpg" alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-center gap-1 flex-grow min-w-0">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`nickname-${lang}`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className="text-2xl font-bold text-white"
                    >
                      {t.nickname}
                    </motion.span>
                  </AnimatePresence>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`desc-${lang}`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "text-sm text-white/90",
                        lang === 'zh' ? "whitespace-nowrap overflow-hidden text-ellipsis" : "whitespace-normal text-left"
                      )}
                    >
                      {t.description}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              {/* 数据统计 */}
              <div className="grid grid-cols-3 gap-8 text-white mt-6">
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold mb-2 text-white flex items-baseline h-[3.5rem]">
                    <span className="text-4xl font-bold text-white">1.6</span>
                    <span className="text-lg ml-0.5">w</span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`followers-${lang}`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span className="text-sm">{t.followers}</span>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold mb-2 text-white flex items-baseline h-[3.5rem]">
                    <NumberTicker 
                      value={11.5} 
                      className="text-white" 
                      startValue={5} 
                      decimalPlaces={1}
                      formatValue={(value) => value.toFixed(1)}
                    />
                    <span className="text-lg ml-0.5">w</span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`likes-${lang}`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm">{t.likes}</span>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold mb-2 text-white flex items-baseline h-[3.5rem]">
                    <NumberTicker 
                      value={130.6} 
                      className="text-white" 
                      startValue={100}
                      decimalPlaces={1}
                      formatValue={(value) => value.toFixed(1)}
                    />
                    <span className="text-lg ml-0.5">w</span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`views-${lang}`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm">{t.views}</span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </CardItem>

          {/* 底部按钮 */}
          <div className="flex justify-end items-center mt-8">
            <CardItem translateZ={20}>
              <AnimatePresence mode="wait">
                <motion.a
                  key={`button-${lang}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  href="https://www.xiaohongshu.com/user/profile/5b7d47aaf7e8b97c7eec8b13"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:bg-black/80 dark:hover:bg-white/80 transition-colors flex items-center gap-2"
                >
                  {t.viewButton}
                  <ArrowRight className="w-4 h-4" />
                </motion.a>
              </AnimatePresence>
            </CardItem>
          </div>
        </CardBody>
      </CardContainer>
    </div>
  );
}; 
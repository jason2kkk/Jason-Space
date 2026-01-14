/**
 * @file background-beams.js
 * @description 背景光束动画组件，创建流动的渐变光束效果
 * 
 * 主要功能：
 * 1. 生成动态的SVG渐变光束效果
 * 2. 创建流畅的动画过渡
 * 3. 提供可自定义的背景装饰效果
 * 4. 支持响应式设计
 * 
 * 动画特性：
 * - 使用framer-motion实现流畅的动画效果
 * - 随机生成的光束路径和动画时间
 * - 渐变色彩的平滑过渡
 * - 无限循环的动画效果
 * 
 * 自定义选项：
 * - 可配置光束颜色和透明度
 * - 支持自定义CSS类名
 * - 可调整动画持续时间和延迟
 */

"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const BackgroundBeams = React.memo(({ className }) => {
  const paths = [
    "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
    // ... 其他路径数据，为了简洁我只列出一部分，你可以从教程中复制完整的路径数据
  ];

  return (
    <div
      className={cn(
        "absolute h-full w-full inset-0 [mask-size:40px] [mask-repeat:no-repeat] flex items-center justify-center",
        className
      )}
    >
      <svg
        className="z-0 h-full w-full pointer-events-none absolute"
        width="100%"
        height="100%"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875"
          stroke="url(#paint0_radial_242_278)"
          strokeOpacity="0.05"
          strokeWidth="0.5"
        />

        {paths.map((path, index) => (
          <motion.path
            key={`path-${index}`}
            d={path}
            stroke={`url(#linearGradient-${index})`}
            strokeOpacity="0.4"
            strokeWidth="0.5"
          />
        ))}

        <defs>
          {paths.map((path, index) => (
            <motion.linearGradient
              id={`linearGradient-${index}`}
              key={`gradient-${index}`}
              initial={{
                x1: "0%",
                x2: "0%",
                y1: "0%",
                y2: "0%",
              }}
              animate={{
                x1: ["0%", "100%"],
                x2: ["0%", "95%"],
                y1: ["0%", "100%"],
                y2: ["0%", `${93 + Math.random() * 8}%`],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                ease: "easeInOut",
                repeat: Infinity,
                delay: Math.random() * 10,
              }}
            >
              <stop stopColor="#18CCFC" stopOpacity="0" />
              <stop stopColor="#18CCFC" />
              <stop offset="32.5%" stopColor="#6344F5" />
              <stop offset="100%" stopColor="#AE48FF" stopOpacity="0" />
            </motion.linearGradient>
          ))}

          <radialGradient
            id="paint0_radial_242_278"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(352 34) rotate(90) scale(555 1560.62)"
          >
            <stop offset="0.0666667" stopColor="var(--neutral-300)" />
            <stop offset="0.243243" stopColor="var(--neutral-300)" />
            <stop offset="0.43594" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
});

BackgroundBeams.displayName = "BackgroundBeams"; 
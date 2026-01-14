import React from "react";
import { cn } from "../../lib/utils";

const RainbowButton = React.forwardRef(({ children, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        // 基础样式
        "group relative inline-flex h-11 animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 font-medium text-white dark:text-gray-900 transition-all duration-300",
        // 背景和边框样式
        "[background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent]",
        // 焦点样式
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:scale-105",
        // 禁用状态
        "disabled:pointer-events-none disabled:opacity-50",
        // 悬停效果
        "hover:scale-105 hover:shadow-[0_0_2rem_-0.5rem_hsl(var(--color-3))] hover:brightness-110",
        // 点击效果
        "active:scale-100 active:brightness-90 active:shadow-[0_0_1rem_-0.5rem_hsl(var(--color-3))]",
        // 发光效果 - 调整 z-index 为 -1
        "before:absolute before:bottom-[-20%] before:left-1/2 before:-z-[1] before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:[filter:blur(calc(0.8*1rem))]",
        // 渐变背景 - 确保在发光效果之上
        "after:absolute after:inset-0 after:z-0 after:rounded-xl after:bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
        // 暗色模式
        "after:dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
        className
      )}
      {...props}
    >
      <span className="relative z-[2] flex items-center gap-2 transition-transform duration-300 group-hover:scale-110 group-active:scale-90">
        {children}
      </span>
    </button>
  );
});

RainbowButton.displayName = "RainbowButton";

export default RainbowButton; 
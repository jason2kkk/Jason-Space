/**
 * @file click-spark.js
 * @description 点击特效组件，在点击时产生火花动画效果
 * 
 * 主要功能：
 * 1. 响应点击事件生成火花动画
 * 2. 支持自定义火花颜色、大小和数量
 * 3. 提供多种动画缓动效果
 * 4. 自适应容器大小
 * 
 * 动画特性：
 * - 使用Canvas绘制火花效果
 * - 支持多种缓动函数
 * - 平滑的动画过渡
 * - 自动清理完成的动画
 */

import { useRef, useEffect, useCallback } from "react";

const ClickSpark = ({
  sparkColor = "#000",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = "ease-out",
  extraScale = 1.0,
  className = "",
  children
}) => {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);     
  const startTimeRef = useRef(null); 
  
  // 检查是否处于暗色模式
  const isDarkMode = useCallback(() => {
    return document.documentElement.classList.contains('dark');
  }, []);

  // 获取当前应该使用的火花颜色
  const getCurrentSparkColor = useCallback(() => {
    // 如果className包含dark:sparkColor-white且处于暗色模式，则使用白色
    if (className.includes('dark:sparkColor-white') && isDarkMode()) {
      return 'white';
    }
    return sparkColor;
  }, [sparkColor, className, isDarkMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  const easeFunc = useCallback(
    (t) => {
      switch (easing) {
        case "linear":
          return t;
        case "ease-in":
          return t * t;
        case "ease-in-out":
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    },
    [easing]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationId;

    const draw = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp; 
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) {
          return false;
        }

        const progress = elapsed / duration;
        const eased = easeFunc(progress);

        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        // 使用当前应该的火花颜色
        ctx.strokeStyle = getCurrentSparkColor();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [
    sparkSize,
    sparkRadius,
    sparkCount,
    duration,
    easeFunc,
    extraScale,
    getCurrentSparkColor,
  ]);

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const now = performance.now();
    const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
      x,
      y,
      angle: (2 * Math.PI * i) / sparkCount,
      startTime: now,
    }));

    sparksRef.current.push(...newSparks);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9999
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            pointerEvents: 'none'
          }}
        />
      </div>
      <div onClick={handleClick}>
        {children}
      </div>
    </div>
  );
};

export default ClickSpark; 
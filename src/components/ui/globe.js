/**
 * @file globe.js
 * @description 3D交互式地球组件，基于cobe库实现
 * 
 * 主要功能：
 * 1. 渲染可交互的3D地球模型
 * 2. 支持鼠标拖拽旋转和自动旋转
 * 3. 在地球上标记重要城市位置
 * 4. 响应点击事件显示提示信息
 * 5. 自适应容器大小，保持高清渲染
 * 
 * 交互特性：
 * - 自动缓慢旋转
 * - 鼠标拖拽控制视角
 * - 点击显示提示信息
 * - 悬停时显示抓取光标
 * 
 * 配置项：
 * - 地球大小和分辨率
 * - 标记点位置和大小
 * - 光照和材质参数
 * - 动画和交互参数
 */

"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import { cn } from "../../lib/utils";
import ReactDOM from 'react-dom/client';
import { Toast } from './toast';
import { translations } from '../../locales/translations';

const GLOBE_CONFIG = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  markers: [
    { location: [39.9042, 116.4074], size: 0.08 }, // 北京
    { location: [31.2304, 121.4737], size: 0.06 }, // 上海
    { location: [22.5431, 114.0579], size: 0.06 }, // 深圳
    { location: [37.7749, -122.4194], size: 0.05 }, // 旧金山
    { location: [40.7128, -74.006], size: 0.05 }, // 纽约
  ],
};

/**
 * Globe组件 - 渲染交互式3D地球
 * @param {string} className - 自定义CSS类名
 * @param {Object} config - 地球配置对象，默认使用GLOBE_CONFIG
 * @param {string} lang - 当前语言，用于显示提示信息
 */
export function Globe({ className, config = GLOBE_CONFIG, lang }) {
  const phiRef = useRef(0);
  const widthRef = useRef(0);
  const canvasRef = useRef(null);
  const pointerInteracting = useRef(null);
  const pointerInteractionMovement = useRef(0);
  const [r, setR] = useState(0);

  const t = translations[lang];

  /**
   * 更新指针交互状态
   * @param {number|null} value - 指针位置或null（表示结束交互）
   */
  const updatePointerInteraction = (value) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value ? "grabbing" : "grab";
    }
  };

  /**
   * 更新地球移动状态
   * @param {number} clientX - 鼠标或触摸的X坐标
   */
  const updateMovement = (clientX) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      setR(delta / 200);
    }
  };

  /**
   * 地球渲染回调函数
   * 在每一帧渲染时更新地球状态
   */
  const onRender = useCallback(
    (state) => {
      if (!pointerInteracting.current) phiRef.current += 0.005;
      state.phi = phiRef.current + r;
      state.width = widthRef.current * 2;
      state.height = widthRef.current * 2;
    },
    [r]
  );

  const onResize = useCallback(() => {
    if (canvasRef.current) {
      widthRef.current = canvasRef.current.offsetWidth;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvasRef.current, {
      ...config,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      onRender,
    });

    setTimeout(() => (canvasRef.current.style.opacity = "1"));
    return () => {
      window.removeEventListener("resize", onResize);
      globe.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    const toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
    
    const root = ReactDOM.createRoot(toast);
    root.render(
      <Toast 
        message={t.globeHint}
        onClose={() => {
          setTimeout(() => {
            if (document.body.contains(toast)) {
              document.body.removeChild(toast);
            }
            root.unmount();
          }, 800);
        }} 
      />
    );
  };

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[550px]",
        className
      )}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <canvas
        className={cn(
          "h-full w-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]"
        )}
        ref={canvasRef}
        onPointerDown={(e) =>
          updatePointerInteraction(e.clientX - pointerInteractionMovement.current)
        }
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) => e.touches[0] && updateMovement(e.touches[0].clientX)}
      />
    </div>
  );
} 
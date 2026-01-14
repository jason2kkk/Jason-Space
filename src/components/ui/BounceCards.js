/**
 * BounceCards组件 - 弹出式卡片动画组件
 * 
 * 该组件实现了一组图片卡片的弹出和收起动画效果。
 * 当isOpen状态为true时，卡片从指定位置弹出并展开；
 * 当isOpen状态为false时，卡片收起并回到原始位置。
 * 
 * 特性:
 * - 弹性动画效果
 * - 卡片悬停交互
 * - 可自定义容器尺寸
 * - 可自定义动画延迟
 * - 动画完成回调函数
 */

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./BounceCards.css";

/**
 * BounceCards组件
 * @param {Object} props - 组件属性
 * @param {Array} props.images - 图片URL数组
 * @param {number} props.containerWidth - 容器宽度，默认800px
 * @param {number} props.containerHeight - 容器高度，默认400px
 * @param {number} props.animationDelay - 卡片动画间的延迟时间，默认0.2秒
 * @param {boolean} props.isOpen - 控制卡片是否展开
 * @param {Object} props.folderPosition - 文件夹位置坐标 {x, y}
 * @param {Function} props.onAnimationComplete - 动画完成时的回调函数
 */
const BounceCards = ({
  images,
  containerWidth = 800,
  containerHeight = 400,
  animationDelay = 0.2,
  isOpen = false,
  folderPosition = { x: 0, y: 0 },
  onAnimationComplete = () => {}
}) => {
  const containerRef = useRef(null); // 容器DOM引用
  const animationsRef = useRef([]); // 存储动画实例的引用
  const [hasAnimated, setHasAnimated] = useState(false); // 跟踪动画是否已执行
  const previousIsOpenRef = useRef(isOpen); // 存储上一次的isOpen状态

  /**
   * 主要动画效果实现
   * 监听isOpen状态变化，触发相应的展开或收起动画
   */
  useEffect(() => {
    // 如果isOpen状态没有变化，则不重新触发动画
    if (previousIsOpenRef.current === isOpen) {
      console.log('isOpen state unchanged, skipping animation');
      return;
    }
    
    console.log('isOpen changed to:', isOpen);
    previousIsOpenRef.current = isOpen;
    
    const container = containerRef.current;
    const cards = container.querySelectorAll(".card");

    // 清除之前的动画
    animationsRef.current.forEach(animation => animation.kill());
    animationsRef.current = [];

    // 更新容器状态
    container.classList.toggle("active", isOpen);
    
    // 不再切换卡片的 active 类，以避免图片透明度变化
    // cards.forEach(card => card.classList.toggle("active", isOpen));
    
    if (isOpen) {
      console.log('Starting expand animation');
      // 手动设置所有图片为可见
      cards.forEach(card => {
        const image = card.querySelector('.image');
        if (image) {
          image.style.opacity = '1';
        }
      });
    }

    // 卡片位置变换样式配置
    const transformStyles = [
      { x: -100, y: -50, rotate: -10 },
      { x: 0, y: 0, rotate: 0 },
      { x: 100, y: -50, rotate: 10 },
      { x: 200, y: -100, rotate: 20 },
      { x: -200, y: -100, rotate: -20 },
    ];

    if (isOpen) {
      // 展开动画
      cards.forEach((card, index) => {
        // 获取卡片内的图片元素
        const image = card.querySelector('.image');
        if (image) {
          image.style.opacity = '0'; // 初始设置为不可见
        }
        
        // 初始位置（从文件夹位置开始）
        gsap.set(card, {
          x: 0,
          y: folderPosition.y - containerHeight + 50, // 与收起动画的最终位置保持一致
          opacity: 0,
          scale: 0.3,
          rotate: -45,
          visibility: 'visible',
        });

        // 弹出并移动到目标位置
        const timeline = gsap.timeline();
        
        timeline.to(card, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          delay: index * animationDelay,
          ease: "power2.out",
          onStart: () => {
            // 动画开始时显示图片
            if (image) {
              image.style.opacity = '1';
            }
          }
        })
        .to(card, {
          ...transformStyles[index % transformStyles.length],
          rotate: transformStyles[index % transformStyles.length].rotate,
          duration: 0.8,
          ease: "elastic.out(1, 0.5)",
        }, "-=0.3");

        animationsRef.current.push(timeline);
      });
      
      setHasAnimated(true);
    } else {
      // 收起动画
      console.log('Starting collapse animation');
      let lastCardIndex = cards.length - 1;
      
      cards.forEach((card, index) => {
        const timeline = gsap.timeline({
          delay: index * 0.05 // 添加轻微的延迟，让卡片按顺序收回
        });
        
        // 获取卡片内的图片元素
        const image = card.querySelector('.image');
        
        // 先让卡片有一个轻微的上升动作，然后再收回
        timeline.to(card, {
          y: "-=30", // 增加上升高度
          scale: 0.95,
          rotation: (index % 2 === 0) ? "-=8" : "+=8", // 增加旋转角度
          duration: 0.25, // 增加动画时间
          ease: "power1.out",
        })
        .to(card, {
          ...transformStyles[index % transformStyles.length],
          y: transformStyles[index % transformStyles.length].y + 50, // 增加下移距离
          scale: 0.8,
          rotation: (index % 2 === 0) ? "+=15" : "-=15", // 增加旋转角度
          duration: 0.35, // 增加动画时间
          ease: "power2.inOut",
        })
        .to(card, {
          x: 0,
          y: folderPosition.y - containerHeight + 50, // 再向下移动50像素，增强下落感
          opacity: 0, // 卡片整体淡出
          scale: 0.3,
          rotate: -45,
          duration: 0.5, // 增加动画时间
          ease: "power3.in", // 使用更强的加速效果
          onComplete: () => {
            gsap.set(card, { visibility: 'hidden' });
            // 动画完成后再隐藏图片
            if (image) {
              image.style.opacity = '0';
            }
            
            // 如果是最后一张卡片，通知父组件动画已完成
            if (index === lastCardIndex) {
              console.log('Last card animation complete, calling callback');
              onAnimationComplete();
            }
          }
        }, "+=0.05");

        animationsRef.current.push(timeline);
      });
    }

    /**
     * 添加悬停效果（仅在展开状态时）
     * 当鼠标悬停在卡片上时，该卡片放大并提升层级，其他卡片略微移开
     */
    if (isOpen) {
      cards.forEach((card, index) => {
        // 鼠标进入卡片时的处理函数
        const enterHandler = () => {
          gsap.to(card, {
            scale: 1.1,
            zIndex: 10,
            duration: 0.3,
            ease: "power2.out",
          });

          cards.forEach((otherCard, otherIndex) => {
            if (otherIndex !== index) {
              const direction = otherIndex < index ? -1 : 1;
              gsap.to(otherCard, {
                x: transformStyles[otherIndex % transformStyles.length].x + direction * 50,
                scale: 0.9,
                duration: 0.3,
                ease: "power2.out",
              });
            }
          });
        };

        // 鼠标离开卡片时的处理函数
        const leaveHandler = () => {
          cards.forEach((otherCard, otherIndex) => {
            gsap.to(otherCard, {
              ...transformStyles[otherIndex % transformStyles.length],
              scale: 1,
              zIndex: 1,
              duration: 0.3,
              ease: "power2.out",
            });
          });
        };

        card.addEventListener("mouseenter", enterHandler);
        card.addEventListener("mouseleave", leaveHandler);

        return () => {
          card.removeEventListener("mouseenter", enterHandler);
          card.removeEventListener("mouseleave", leaveHandler);
        };
      });
    }
  }, [containerHeight, animationDelay, isOpen, folderPosition, onAnimationComplete]);

  return (
    <div
      ref={containerRef}
      className="bounceCardsContainer"
      style={{ width: containerWidth, height: containerHeight }}
    >
      {images.map((image, index) => (
        <div
          key={index}
          className="card"
          style={{ zIndex: 1 }}
        >
          <img
            src={image}
            alt={`Project ${index + 1}`}
            className="image"
          />
        </div>
      ))}
    </div>
  );
};

export default BounceCards; 
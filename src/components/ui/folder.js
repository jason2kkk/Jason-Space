/**
 * Folder组件 - 交互式文件夹组件
 * 
 * 该组件实现了一个可点击的文件夹效果，点击后会展开并显示一系列图片卡片。
 * 当用户点击文件夹时，文件夹会打开并弹出多张图片卡片；再次点击或滚动页面时，
 * 图片卡片会先收起，然后文件夹才会关闭，实现平滑的动画过渡效果。
 * 
 * 特性:
 * - 点击文件夹打开/关闭
 * - 滚动页面时自动关闭
 * - 图片卡片弹出和收起动画
 * - 文件夹开合动画效果
 */

import { cn } from "../../lib/utils";
import { useState, useRef, useEffect } from "react";
import BounceCards from "./BounceCards";

/**
 * Folder组件
 * @param {Object} props - 组件属性
 * @param {string} props.className - 自定义CSS类名
 */
export function Folder({ className }) {
  // 状态管理
  const [isOpen, setIsOpen] = useState(false); // 控制文件夹是否打开
  const [isClosing, setIsClosing] = useState(false); // 控制文件夹是否正在关闭过程中
  const folderRef = useRef(null); // 文件夹DOM引用

  /**
   * 监听滚动事件，当页面滚动时自动关闭文件夹
   */
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen && !isClosing) {
        handleFolderClose();
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, isClosing]);

  /**
   * 处理文件夹点击事件
   * 如果文件夹已打开，则触发关闭动画
   * 如果文件夹已关闭，则直接打开
   * 如果正在关闭过程中，则忽略点击
   */
  const handleFolderClick = () => {
    console.log('Folder clicked, current state:', { isOpen, isClosing });
    
    if (isClosing) {
      console.log('Ignoring click while closing');
      return;
    }
    
    if (isOpen) {
      console.log('Starting close sequence');
      handleFolderClose();
    } else {
      console.log('Opening folder');
      setIsOpen(true);
    }
  };

  /**
   * 处理文件夹关闭逻辑
   * 设置isClosing状态为true，触发BounceCards组件的收起动画
   */
  const handleFolderClose = () => {
    console.log('Setting isClosing to true');
    setIsClosing(true);
  };

  /**
   * 处理动画完成回调
   * 当BounceCards组件的收起动画完成后，重置文件夹状态
   */
  const handleAnimationComplete = () => {
    console.log('Animation complete callback received');
    setIsOpen(false);
    setIsClosing(false);
    console.log('Folder closed, reset states');
  };

  // 项目图片数组
  const projectImages = [
    "/images/消消乐游戏页面备份 6.png",
    "/images/校友会首页.png",
    "/images/投票01.png",
    "/images/project3.jpg",
    "/images/IMG_8612.PNG",
    "/images/消消乐游戏页面备份 6.png",
    "/images/校友会首页.png",
    "/images/投票01.png",
    "/images/project3.jpg",
    "/images/IMG_8612.PNG"
  ];

  /**
   * 获取文件夹位置
   * 用于计算BounceCards组件的动画起始位置
   * @returns {{x: number, y: number}} 文件夹的中心坐标
   */
  const getFolderPosition = () => {
    if (folderRef.current) {
      const rect = folderRef.current.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top - 20
      };
    }
    return { x: 0, y: 0 };
  };

  return (
    <div className="relative flex flex-col justify-end h-full">
      <section
        className={cn(
          "relative flex flex-col items-center justify-center",
          className
        )}
      >
        {/* BounceCards组件 - 显示弹出的图片卡片 */}
        <div className="absolute top-[-400px] left-1/2 transform -translate-x-1/2 z-40">
          <BounceCards
            images={projectImages}
            containerWidth={1200}
            containerHeight={400}
            animationDelay={0.15}
            isOpen={isClosing ? false : isOpen}
            folderPosition={getFolderPosition()}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>
        {/* 文件夹组件 - 可点击的文件夹视觉效果 */}
        <div 
          ref={folderRef}
          className={`file relative w-60 h-40 cursor-pointer origin-bottom [perspective:1500px] z-50 ${isClosing ? 'pointer-events-none' : ''}`}
          onClick={handleFolderClick}
        >
          {/* 文件夹底部 */}
          <div className={`work-5 bg-stone-600 w-full h-full origin-top rounded-2xl rounded-tl-none ${isOpen ? 'shadow-[0_20px_40px_rgba(0,0,0,.2)]' : ''} transition-all ease duration-300 relative after:absolute after:content-[''] after:bottom-[99%] after:left-0 after:w-20 after:h-4 after:bg-stone-600 after:rounded-t-2xl before:absolute before:content-[''] before:-top-[15px] before:left-[75.5px] before:w-4 before:h-4 before:bg-stone-600 before:[clip-path:polygon(0_35%,0%_100%,50%_100%);]`}></div>
          {/* 文件夹内部层 - 创建深度效果 */}
          <div className={`work-4 absolute inset-1 bg-zinc-400 rounded-2xl transition-all ease duration-300 origin-bottom select-none ${isOpen ? '[transform:rotateX(-20deg)]' : ''}`}></div>
          <div className={`work-3 absolute inset-1 bg-zinc-300 rounded-2xl transition-all ease duration-300 origin-bottom ${isOpen ? '[transform:rotateX(-30deg)]' : ''}`}></div>
          <div className={`work-2 absolute inset-1 bg-zinc-200 rounded-2xl transition-all ease duration-300 origin-bottom ${isOpen ? '[transform:rotateX(-38deg)]' : ''}`}></div>
          {/* 文件夹顶部 - 可翻转的部分 */}
          <div className={`work-1 absolute bottom-0 bg-gradient-to-t from-stone-500 to-stone-400 w-full h-[156px] rounded-2xl rounded-tr-none after:absolute after:content-[''] after:bottom-[99%] after:right-0 after:w-[146px] after:h-[16px] after:bg-stone-400 after:rounded-t-2xl before:absolute before:content-[''] before:-top-[10px] before:right-[142px] before:size-3 before:bg-stone-400 before:[clip-path:polygon(100%_14%,50%_100%,100%_100%);] transition-all ease duration-300 origin-bottom flex items-end ${isOpen ? 'shadow-[inset_0_20px_40px_#57534e,_inset_0_-20px_40px_#44403c] [transform:rotateX(-46deg)_translateY(1px)]' : ''}`}></div>
        </div>
      </section>
    </div>
  );
} 
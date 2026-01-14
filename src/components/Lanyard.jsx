/* eslint-disable react/no-unknown-property */
'use client';
import React, { useState, useEffect } from 'react';
import './Lanyard.css';

export default function Lanyard() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [cardPos, setCardPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);

  // 模拟加载
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // 处理动画效果
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setCardPos(prev => ({
          x: prev.x + (Math.random() * 2 - 1) * 5,
          y: prev.y + (Math.random() * 2 - 1) * 5
        }));
      }, 100);
      return () => clearInterval(interval);
    } else if (!isDragging) {
      // 如果不在拖拽状态，逐渐回到中心位置
      const interval = setInterval(() => {
        setCardPos(prev => ({
          x: prev.x * 0.9,
          y: prev.y * 0.9
        }));
        if (Math.abs(cardPos.x) < 0.5 && Math.abs(cardPos.y) < 0.5) {
          setCardPos({ x: 0, y: 0 });
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAnimating, isDragging, cardPos]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPos({
      x: e.clientX - cardPos.x,
      y: e.clientY - cardPos.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - startPos.x;
      const newY = e.clientY - startPos.y;
      setCardPos({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!isDragging) {
      setIsAnimating(!isAnimating);
    }
  };

  // 计算挂绳的路径
  const calculateLanyardPath = () => {
    const startX = 150;
    const startY = 0;
    const endX = 150 + cardPos.x * 0.5;
    const endY = 100 + cardPos.y * 0.5;
    
    // 贝塞尔曲线控制点
    const cp1x = startX;
    const cp1y = startY + 30;
    const cp2x = endX;
    const cp2y = endY - 30;
    
    return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
  };

  return (
    <div className="lanyard-container">
      {loading ? (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          <svg className="lanyard-svg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
            <path
              d={calculateLanyardPath()}
              stroke="white"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <div 
            className={`card ${isHovered ? 'hovered' : ''} ${isAnimating ? 'animating' : ''}`}
            style={{
              transform: `translate(${cardPos.x}px, ${cardPos.y}px) rotate(${cardPos.x * 0.05}deg)`
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseEnter={() => setIsHovered(true)}
            onMouseOut={() => setIsHovered(false)}
            onClick={handleClick}
          >
            <div className="card-content">
              <h3>我的状态</h3>
              <p>当前状态: {isAnimating ? "晃动中" : isDragging ? "拖拽中" : "静止"}</p>
              <p>点击卡片切换晃动状态</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import React, { useEffect, useRef } from "react";

const getContainer = () => {
  const id = "_coolMode_effect";
  let container = document.getElementById(id);

  if (!container) {
    container = document.createElement("div");
    container.setAttribute("id", id);
    container.setAttribute(
      "style",
      "overflow:hidden; position:fixed; height:100%; top:0; left:0; right:0; bottom:0; pointer-events:none; z-index:2147483647"
    );
    document.body.appendChild(container);
  }

  return container;
};

const applyParticleEffect = (element) => {
  const container = getContainer();
  const particles = [];

  function createFirework() {
    // 增加爆炸范围
    const centerX = window.innerWidth / 2 + (Math.random() - 0.5) * 800; // 从400增加到800
    const centerY = window.innerHeight * 0.3 + (Math.random() - 0.5) * 300; // 从200增加到300
    
    const particleCount = 80;
    const color = `hsl(${Math.random() * 360}, 80%, 60%)`;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const randomAngle = angle + (Math.random() - 0.5) * 0.8;
      
      const velocity = 6 + Math.random() * 3; // 增加初始速度，让爆炸范围更大
      const size = Math.floor(Math.random() * 3) + 2;
      
      const particle = document.createElement("div");
      const svgNS = "http://www.w3.org/2000/svg";
      const circleSVG = document.createElementNS(svgNS, "svg");
      const circle = document.createElementNS(svgNS, "circle");
      
      circle.setAttributeNS(null, "cx", (size / 2).toString());
      circle.setAttributeNS(null, "cy", (size / 2).toString());
      circle.setAttributeNS(null, "r", (size / 2).toString());
      circle.setAttributeNS(null, "fill", color);

      circleSVG.appendChild(circle);
      circleSVG.setAttribute("width", size.toString());
      circleSVG.setAttribute("height", size.toString());

      particle.appendChild(circleSVG);
      particle.style.position = "absolute";
      particle.style.transform = `translate3d(${centerX}px, ${centerY}px, 0px)`;
      container.appendChild(particle);

      particles.push({
        element: particle,
        x: centerX,
        y: centerY,
        size,
        velocity,
        angle: randomAngle,
        gravity: 0.15, // 增加重力加速度，从 0.05 改为 0.15
        friction: 0.96, // 减小空气阻力，从 0.98 改为 0.96
        opacity: 1,
        velocityX: Math.cos(randomAngle) * velocity,
        velocityY: Math.sin(randomAngle) * velocity,
        decay: 0.01 + Math.random() * 0.01, // 增加衰减速度
        hue: parseInt(color.match(/\d+/)[0]) // 保存颜色色相值
      });
    }
  }

  function refreshParticles() {
    particles.forEach((p, i) => {
      // 更新速度和位置
      p.velocityX *= p.friction;
      p.velocityY *= p.friction;
      p.velocityY += p.gravity; // 由于增加了重力，粒子会下落得更快
      
      p.x += p.velocityX;
      p.y += p.velocityY;
      p.opacity -= p.decay; // 使用衰减速度

      if (p.opacity <= 0) {
        particles.splice(i, 1);
        p.element.remove();
      } else {
        // 添加轻微的颜色变化
        const hue = p.hue + Math.sin(p.opacity * 10) * 5;
        const saturation = 80 - (1 - p.opacity) * 30;
        const lightness = 60 - (1 - p.opacity) * 20;
        
        p.element.style.transform = `translate3d(${p.x}px, ${p.y}px, 0px)`;
        p.element.style.opacity = p.opacity;
        p.element.querySelector('circle').setAttribute(
          'fill',
          `hsl(${hue}, ${saturation}%, ${lightness}%)`
        );
      }
    });
  }

  let animationFrame;

  function loop() {
    refreshParticles();
    animationFrame = requestAnimationFrame(loop);
  }

  loop();

  const handleClick = () => {
    // 减少烟花数量到2个
    const fireworkCount = 2;
    for (let i = 0; i < fireworkCount; i++) {
      setTimeout(() => createFirework(), i * 200);
    }
  };

  element.addEventListener("click", handleClick);

  return () => {
    element.removeEventListener("click", handleClick);
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    particles.forEach(p => p.element.remove());
    if (container.children.length === 0) {
      container.remove();
    }
  };
};

export const CoolMode = ({ children }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      return applyParticleEffect(ref.current);
    }
  }, []);

  return React.cloneElement(children, { ref });
}; 
import React, { useRef, useState } from "react";
import { HomeIcon, MailIcon } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

function DockIcon({ children, mouseX, index }) {
  const ref = useRef(null);
  
  const distance = useMotionValue(0);
  const widthSync = useTransform(distance, [-100, 0, 100], [0.5, 1.2, 0.5]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  React.useEffect(() => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const distanceFromMouse = mouseX - (rect.left + rect.width / 2);
    distance.set(distanceFromMouse);
  }, [mouseX]);

  return (
    <motion.div
      ref={ref}
      style={{
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        scale: width
      }}
    >
      {children}
    </motion.div>
  );
}

function Dock() {
  const [mouseX, setMouseX] = useState(0);
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    setMouseX(e.clientX);
  };

  const handleMouseLeave = () => setMouseX(0);

  const copyEmail = () => {
    navigator.clipboard.writeText("jason2k@126.com");
    alert("邮箱已复制到剪贴板！");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="dock-container">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="dock"
      >
        <DockIcon mouseX={mouseX} index={0}>
          <button onClick={scrollToTop} className="dock-button">
            <HomeIcon className="h-5 w-5" />
            <span className="dock-tooltip">回到顶部</span>
          </button>
        </DockIcon>

        <div className="dock-separator" />

        <DockIcon mouseX={mouseX} index={1}>
          <button onClick={copyEmail} className="dock-button">
            <MailIcon className="h-5 w-5" />
            <span className="dock-tooltip">复制邮箱</span>
          </button>
        </DockIcon>

        <div className="dock-separator" />

        <DockIcon mouseX={mouseX} index={2}>
          <a
            href="https://www.xiaohongshu.com/user/profile/5b091ac7f7e8b97d08005f36"
            target="_blank"
            rel="noopener noreferrer"
            className="dock-button"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path
                fill="currentColor"
                d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z"
              />
              <path
                fill="white"
                d="M12 4.5a7.5 7.5 0 100 15 7.5 7.5 0 000-15z"
              />
              <text
                x="50%"
                y="50%"
                fontSize="8"
                fill="currentColor"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontWeight: 'bold' }}
              >
                红
              </text>
            </svg>
            <span className="dock-tooltip">小红书</span>
          </a>
        </DockIcon>
      </motion.div>
    </div>
  );
}

export default Dock; 
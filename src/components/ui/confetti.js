import confetti from "canvas-confetti";

export const fireConfetti = async (event) => {
  try {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const defaults = {
      origin: {
        x: x / window.innerWidth,
        y: y / window.innerHeight,
      },
      particleCount: 40 + Math.random() * 30, // 40-70个粒子
      spread: 80 + Math.random() * 50, // 80-130度扩散
      startVelocity: 45 + Math.random() * 20, // 45-65速度
      gravity: 0.65, // 降低重力使粒子飞得更高
      drift: Math.random() - 0.5, // 随机漂移
      ticks: 300 + Math.random() * 100, // 300-400帧
      shapes: ['circle', 'square'], // 添加方形粒子
      colors: [
        '#FF5252', // 红色
        '#4CAF50', // 绿色
        '#2196F3', // 蓝色
        '#FFC107', // 黄色
        '#9C27B0', // 紫色
        '#FF9800', // 橙色
      ],
      scalar: 1.2 + Math.random() * 0.4, // 1.2-1.6大小
      zIndex: 9999,
      decay: 0.93, // 增加衰减时间
      disableForReducedMotion: true
    };

    // 发射三次，每次角度和时间不同
    await Promise.all([
      confetti({
        ...defaults,
        angle: 60 + Math.random() * 30, // 60-90度
        spread: 70 + Math.random() * 30, // 70-100度扩散
      }),
      confetti({
        ...defaults,
        angle: 90 + Math.random() * 30, // 90-120度
        spread: 70 + Math.random() * 30, // 70-100度扩散
        delay: 50, // 延迟50ms
      }),
      confetti({
        ...defaults,
        angle: 120 + Math.random() * 30, // 120-150度
        spread: 70 + Math.random() * 30, // 70-100度扩散
        delay: 100, // 延迟100ms
      })
    ]);

  } catch (error) {
    console.error("Confetti effect error:", error);
  }
};

export const fireSmallConfetti = async (event) => {
  try {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const defaults = {
      origin: {
        x: x / window.innerWidth,
        y: y / window.innerHeight,
      },
      particleCount: 30 + Math.random() * 20, // 30-50个粒子
      spread: 80 + Math.random() * 40, // 80-120度扩散
      startVelocity: 45 + Math.random() * 15, // 45-60速度
      gravity: 0.7, // 降低重力使粒子飞得更高
      drift: Math.random() - 0.5, // 随机漂移
      ticks: 250 + Math.random() * 100, // 250-350帧
      shapes: ['circle'],
      colors: [
        '#FF5252', // 红色
        '#4CAF50', // 绿色
        '#2196F3', // 蓝色
        '#FFC107', // 黄色
        '#9C27B0', // 紫色
        '#FF9800', // 橙色
      ],
      scalar: 1 + Math.random() * 0.4, // 1.0-1.4大小
      zIndex: 9999,
      decay: 0.92, // 增加衰减时间
      disableForReducedMotion: true
    };

    // 发射三次，不同角度和时间
    await Promise.all([
      confetti({
        ...defaults,
        angle: 80 + (Math.random() - 0.5) * 30, // 65-95度
        spread: 60 + Math.random() * 30, // 60-90度扩散
      }),
      confetti({
        ...defaults,
        angle: 100 + (Math.random() - 0.5) * 30, // 85-115度
        spread: 60 + Math.random() * 30, // 60-90度扩散
        delay: 50, // 延迟50ms
      }),
      confetti({
      ...defaults,
      angle: 90 + (Math.random() - 0.5) * 40, // 70-110度
        spread: 70 + Math.random() * 30, // 70-100度扩散
        delay: 100, // 延迟100ms
      })
    ]);

  } catch (error) {
    console.error("Confetti effect error:", error);
  }
};

export const fireSideConfetti = async (e) => {
  const confetti = (await import('canvas-confetti')).default;
  
  // 左侧彩带
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { x: 0, y: 0.5 },
    angle: 45,
    startVelocity: 60,
    gravity: 0.7,
    ticks: 300,
    shapes: ['circle', 'square'],
    scalar: 1.2,
    decay: 0.92,
    colors: ['#FF5252', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#FF9800'],
  });

  // 右侧彩带
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { x: 1, y: 0.5 },
    angle: 135,
    startVelocity: 60,
    gravity: 0.7,
    ticks: 300,
    shapes: ['circle', 'square'],
    scalar: 1.2,
    decay: 0.92,
    colors: ['#FF5252', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#FF9800'],
  });
}; 
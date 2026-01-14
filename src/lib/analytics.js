class Analytics {
  constructor() {
    this.startTime = null;
    this.maxScrollDepth = 0;
    this.isFirstVisit = !localStorage.getItem('firstVisitTime');
    this.eventQueue = [];
    this.isProcessing = false;
    this.batchSize = 10;
    this.processInterval = 1000; // 1秒处理一次
  }

  init() {
    // 记录首次访问时间
    if (this.isFirstVisit) {
      const firstVisitTime = new Date().toISOString();
      localStorage.setItem('firstVisitTime', firstVisitTime);
      this.trackEvent('first_visit', {
        time: firstVisitTime,
        referrer: document.referrer || 'direct',
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        devicePixelRatio: window.devicePixelRatio
      });
    }

    // 记录本次访问开始时间
    this.startTime = new Date();

    // 监听页面滚动
    this.initScrollTracking();

    // 页面关闭前发送停留时长
    window.addEventListener('beforeunload', () => {
      this.trackStayDuration();
    });

    // 记录设备和浏览器信息
    this.trackDeviceInfo();

    // 添加全局错误处理
    window.addEventListener('error', (event) => {
      this.trackEvent('error', {
        type: 'runtime',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('error', {
        type: 'promise',
        message: event.reason?.message || 'Promise rejected',
        error: event.reason?.stack
      });
    });

    // 添加性能监控
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            this.trackEvent('performance', {
              type: 'LCP',
              value: entry.startTime
            });
          }
          if (entry.entryType === 'first-input') {
            this.trackEvent('performance', {
              type: 'FID',
              value: entry.processingStart - entry.startTime
            });
          }
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    }
  }

  // 初始化滚动深度追踪
  initScrollTracking() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrolled = window.scrollY;
          const scrollPercentage = (scrolled / scrollHeight) * 100;
          
          if (scrollPercentage > this.maxScrollDepth) {
            this.maxScrollDepth = scrollPercentage;
            // 每当达到新的滚动深度时记录
            if (scrollPercentage >= 25 && scrollPercentage % 25 < 1) {
              this.trackEvent('scroll_depth', {
                depth: Math.floor(scrollPercentage)
              });
            }
          }
          
          ticking = false;
        });
        
        ticking = true;
      }
    });
  }

  // 追踪页面停留时长
  trackStayDuration() {
    if (this.startTime) {
      const duration = new Date() - this.startTime;
      this.trackEvent('stay_duration', {
        duration: duration,
        durationInSeconds: Math.floor(duration / 1000)
      });
    }
  }

  // 追踪设备和浏览器信息
  trackDeviceInfo() {
    const ua = navigator.userAgent;
    const browserInfo = this.getBrowserInfo(ua);
    const deviceInfo = this.getDeviceInfo(ua);

    this.trackEvent('device_info', {
      browser: browserInfo,
      device: deviceInfo,
      os: this.getOS(ua),
      isMobile: /Mobile|Android|iPhone/i.test(ua)
    });
  }

  // 获取浏览器信息
  getBrowserInfo(ua) {
    const browsers = {
      Chrome: /Chrome\/(\d+)/,
      Firefox: /Firefox\/(\d+)/,
      Safari: /Safari\/(\d+)/,
      Edge: /Edg\/(\d+)/,
      IE: /MSIE|Trident.*rv:(\d+)/
    };

    for (const [name, regex] of Object.entries(browsers)) {
      const match = ua.match(regex);
      if (match) return `${name} ${match[1]}`;
    }
    return 'Unknown Browser';
  }

  // 获取设备信息
  getDeviceInfo(ua) {
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS Device';
    if (/Android/i.test(ua)) return 'Android Device';
    if (/Windows Phone/i.test(ua)) return 'Windows Phone';
    if (/Mac/i.test(ua)) return 'Mac';
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Linux/i.test(ua)) return 'Linux';
    return 'Unknown Device';
  }

  // 获取操作系统信息
  getOS(ua) {
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Mac OS X/i.test(ua)) return 'MacOS';
    if (/Linux/i.test(ua)) return 'Linux';
    if (/Android/i.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    return 'Unknown OS';
  }

  // 处理事件队列
  async processEventQueue() {
    if (this.isProcessing || this.eventQueue.length === 0) return;
    
    this.isProcessing = true;
    const events = this.eventQueue.splice(0, this.batchSize);
    
    try {
      // 这里可以批量发送到后端
      console.log('Batch Events:', events);
      
      // 示例：批量发送到后端API
      // await fetch('/api/analytics/batch', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ events })
      // });
    } catch (error) {
      // 发送失败时，将事件放回队列
      this.eventQueue.unshift(...events);
      console.error('Failed to process events:', error);
    } finally {
      this.isProcessing = false;
      
      // 如果队列中还有事件，继续处理
      if (this.eventQueue.length > 0) {
        setTimeout(() => this.processEventQueue(), this.processInterval);
      }
    }
  }

  // 通用事件追踪方法
  trackEvent(eventName, eventData = {}) {
    const event = {
      eventName,
      eventData: {
        ...eventData,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    };

    this.eventQueue.push(event);
    
    // 如果队列达到批处理大小，或者是重要事件，立即处理
    if (this.eventQueue.length >= this.batchSize || 
        eventName === 'first_visit' || 
        eventName === 'error') {
      this.processEventQueue();
    } else {
      // 否则等待一段时间后处理
      setTimeout(() => this.processEventQueue(), this.processInterval);
    }
  }

  // 追踪导航栏点击
  trackNavClick(itemName) {
    this.trackEvent('nav_click', {
      item: itemName,
      timestamp: new Date().toISOString()
    });
  }

  // 追踪简历下载
  trackResumeDownload() {
    this.trackEvent('resume_download', {
      timestamp: new Date().toISOString(),
      language: document.documentElement.lang || 'unknown'
    });
  }

  // 追踪项目查看
  trackProjectView(project) {
    const viewDuration = {
      startTime: new Date().toISOString()
    };
    
    // 存储查看开始时间
    this._projectViewTimes = this._projectViewTimes || {};
    this._projectViewTimes[project.id] = viewDuration;

    this.trackEvent('project_view', {
      projectId: project.id,
      projectName: project.title,
      category: project.category,
      platform: project.platform,
      interactionType: project.interactionType,
      viewStartTime: viewDuration.startTime,
      source: window.location.pathname,
      referrer: document.referrer
    });
  }

  // 追踪项目查看结束
  trackProjectViewEnd(project) {
    if (this._projectViewTimes && this._projectViewTimes[project.id]) {
      const startTime = new Date(this._projectViewTimes[project.id].startTime);
      const endTime = new Date();
      const duration = endTime - startTime;

      this.trackEvent('project_view_end', {
        projectId: project.id,
        projectName: project.title,
        category: project.category,
        platform: project.platform,
        interactionType: project.interactionType,
        viewStartTime: this._projectViewTimes[project.id].startTime,
        viewEndTime: endTime.toISOString(),
        viewDuration: duration,
        viewDurationSeconds: Math.floor(duration / 1000)
      });

      // 清除记录
      delete this._projectViewTimes[project.id];
    }
  }

  // 追踪项目交互
  trackProjectInteraction(project, interactionType, details = {}) {
    this.trackEvent('project_interaction', {
      projectId: project.id,
      projectName: project.title,
      category: project.category,
      platform: project.platform,
      interactionType: project.interactionType,
      action: interactionType,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  // 追踪工具卡片悬停
  trackToolCardHover(toolName) {
    this.trackEvent('tool_card_hover', {
      tool: toolName,
      timestamp: new Date().toISOString()
    });
  }

  // 追踪性能指标
  trackPerformance() {
    if (window.performance) {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const dnsTime = perfData.domainLookupEnd - perfData.domainLookupStart;
      const tcpTime = perfData.connectEnd - perfData.connectStart;
      const renderTime = perfData.domComplete - perfData.domLoading;

      this.trackEvent('performance', {
        pageLoadTime,
        dnsTime,
        tcpTime,
        renderTime
      });
    }
  }
}

export const analytics = new Analytics(); 
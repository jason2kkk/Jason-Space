/**
 * @file App.js
 * @description 应用程序的主入口组件，负责整体布局和状态管理
 * 
 * 主要功能：
 * 1. 管理全局状态（语言切换、启动屏幕显示等）
 * 2. 组织页面主要区块（英雄区、项目展示、工具展示等）
 * 3. 处理全局事件（简历下载、语言切换等）
 * 4. 控制页面布局和响应式设计
 * 5. 集成数据分析和用户行为跟踪
 * 
 * 包含的主要组件：
 * - HeroSection：首屏展示
 * - Globe：3D地球
 * - ProjectsSection：项目展示
 * - ToolsSection：技能工具展示
 * - FooterSection：页脚
 * - FloatingDock：浮动导航栏
 */

import React from 'react';
import './App.css';

function App() {
  return (
    <main className="blank-pages">
      <section className="blank-page" data-page="page-1" aria-label="page-1" />
      <section className="blank-page" data-page="page-2" aria-label="page-2" />
    </main>
  );
}

export default App;

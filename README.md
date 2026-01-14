# 个人简历网站

## 最近更新
### 2024-01-18
- 优化了导航栏功能
  - 保留四个核心功能入口
    1. 回到顶部
    2. 下载简历
    3. 复制邮箱
    4. 小红书主页
  - 移除了冗余的社交媒体入口
  - 优化了布局和间距
- 优化了复制邮箱功能
  - 使用轻量级 Toast 提示替代 alert
  - 添加了平滑的动画效果
  - 优化了视觉样式
  - 自动消失的交互

### 功能说明
#### 导航项
1. 回到顶部
   - 图标: HomeIcon
   - 功能: 平滑滚动到页面顶部

2. 下载简历
   - 图标: FileTextIcon
   - 功能: 下载 PDF 格式简历
   - 文件名: 何鹏伟的简历.pdf

3. 复制邮箱
   - 图标: MailIcon
   - 功能: 复制邮箱到剪贴板
   - 反馈: 弹窗提示

4. 小红书主页
   - 图标: HeartIcon
   - 功能: 跳转到小红书个人主页

## 开发规范
### React 相关
- 始终在文件顶部导入 React（即使在新版本中不是必需的）
- 使用解构导入需要的 React Hooks
- 组件文件使用 .jsx 扩展名（可选但推荐）

### 样式规范
#### 导航栏
- 基础尺寸: 45px
- 最大缩放尺寸: 65px
- 图标基础尺寸: 24px
- 图标最大尺寸: 32px
- 动画参数:
  - 质量(mass): 0.1
  - 刚度(stiffness): 200
  - 阻尼(damping): 20
- 视觉效果:
  - 背景透明度: 85%
  - 模糊效果: backdrop-blur-xl
  - 内边距: px-6 py-3
  - 图标间距: gap-5
  - 圆角: rounded-2xl
- 交互效果:
  - 悬停缩放: 1.02
  - 点击缩放: 0.98
  - 悬停背景: white/5

#### 工具提示
- 动画类型: spring
- 动画参数:
  - 刚度: 300
  - 阻尼: 20
- 视觉效果:
  - 背景色: 95% 黑色
  - 模糊效果: backdrop-blur-sm
  - 内边距: px-4 py-2
  - 圆角: rounded-lg
  - 字体: font-medium

## 常见问题解决
### ESLint 报错
1. 'React' is not defined
   - 解决方法: `import React from 'react'`
   
2. 'ReactDOM' is not defined
   - 解决方法: `import ReactDOM from 'react-dom/client'`
   - 注意: React 18 使用新的 client API
   
### React 18 相关
- 创建根节点: 使用 ReactDOM.createRoot()
- 动态渲染: 确保正确清理
- 示例:
  ```javascript
  const root = ReactDOM.createRoot(container);
  root.render(<Component />);
  // 清理
  root.unmount();
  ```

### 组件说明
#### Toast 提示
- 位置: 屏幕正中心
- 显示时长: 2秒
- 动画效果:
  - 显示: 向上淡入
  - 消失: 向下淡出
- 视觉风格:
  - 背景色: 95% 黑色
  - 圆角: rounded-xl
  - 内边距: px-6 py-3
  - 模糊效果: backdrop-blur-sm
  - 细边框: border-white/10
  - 字体: font-medium
- 动画参数:
  - 类型: spring
  - 刚度: 400
  - 阻尼: 30 

## 项目结构
### 静态资源
- public/assets/: 存放静态文件
  - resume.pdf: 简历 PDF 文件
  
### 文件命名规范
- PDF 文件: 小写字母，使用连字符
  - 示例: `resume.pdf`, `resume-2024.pdf`
- 下载文件名: 可以使用中文，更友好
  - 示例: "何鹏伟的简历.pdf"

### 功能说明
#### 下载简历
- 文件位置: public/assets/resume.pdf
- 访问路径: /assets/resume.pdf
- 下载文件名: 何鹏伟的简历.pdf
- 交互反馈: 
  - 开始下载提示
  - 下载成功提示
  - 下载失败提示
- 错误处理:
  - 网络错误处理
  - 文件不存在处理
  - 用户友好的错误提示
- 状态跟踪:
  - 控制台日志记录
  - 下载时间戳记录 

### 2024-01-19
- 优化了工具卡片展示效果
  - 实现了双行无限滚动效果
  - 第一行从右向左滚动
  - 第二行从左向右滚动
  - 优化了滚动速度和平滑度
- 新增了多个工具图标
  - PPT
  - Excel
  - Word
- 优化了下载简历功能
  - 简化了下载提示逻辑
  - 仅保留"下载中"提示
  - 优化了节点移除逻辑，防止报错
- 优化了移动端适配提示文案

### 组件说明
#### 工具卡片滚动
- 滚动容器
  - 宽度: 超出屏幕边缘
  - 负边距: mx-[-100vw]
  - 内边距: px-[100vw]
- 动画效果:
  - 类型: requestAnimationFrame
  - 速度: 可配置
  - 方向: 双向滚动
- 渐变遮罩:
  - 位置: left-[100vw] 和 right-[100vw]
  - 效果: 渐变消失
- 性能优化:
  - 使用 transform 实现滚动
  - 避免频繁 DOM 操作
  - 优化重绘性能

### 常见问题解决
#### Node 节点移除报错
1. "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
   - 问题: 尝试移除已经不存在的 DOM 节点
   - 解决方案: 添加节点存在检查
   ```javascript
   if (document.body.contains(node)) {
     document.body.removeChild(node);
   }
   ```

#### 滚动动画问题
1. 卡片无法从页面边缘开始滚动
   - 问题: 容器存在安全区域padding
   - 解决方案: 使用负边距延伸容器
   ```css
   mx-[-100vw]
   px-[100vw]
   ```

2. 滚动不流畅
   - 问题: 动画帧数不足
   - 解决方案: 使用 requestAnimationFrame
   ```javascript
   let start = null;
   const animate = (timestamp) => {
     if (!start) start = timestamp;
     const progress = timestamp - start;
     // 计算位移
     requestAnimationFrame(animate);
   };
   requestAnimationFrame(animate);
   ```

## 部署准备
1. 静态资源优化
   - 压缩图片资源
   - 优化 PDF 文件大小
   - CDN 加速配置

2. 性能优化
   - 代码分割和懒加载
   - 资源预加载
   - 缓存策略配置

3. SEO 优化
   - 添加 meta 标签
   - 生成 sitemap
   - robots.txt 配置

4. 环境配置
   - 域名购买和解析
   - SSL 证书配置
   - 选择合适的托管平台（如 Vercel、Netlify）

5. 监控和分析
   - 错误监控
   - 性能监控
   - 访问统计

6. 安全措施
   - XSS 防护
   - CSP 配置
   - 资源完整性校验

7. 备份策略
   - 代码备份
   - 资源备份
   - 定期备份计划 

### 2024-02-27
- 新增了交互式文件夹组件
  - 实现了可点击的3D文件夹效果
  - 添加了文件夹打开和关闭的动画
  - 实现了文件夹内图片卡片的弹出和收起动画
  - 优化了动画过渡效果和交互体验
- 优化了图片卡片动画效果
  - 实现了卡片弹性展开动画
  - 添加了卡片悬停交互效果
  - 优化了卡片收起动画，增强震动和旋转效果
  - 实现了卡片按顺序收回的动画序列
- 改进了组件状态管理
  - 添加了isClosing状态跟踪关闭过程
  - 实现了动画完成回调机制
  - 优化了滚动时自动关闭文件夹的功能
- 完善了代码注释和文档
  - 为新组件添加了详细的功能注释
  - 更新了项目文档，记录新功能的实现细节

### 组件说明
#### 文件夹组件 (Folder)
- 视觉效果:
  - 3D文件夹外观，带有翻盖效果
  - 多层次结构，创造深度感
  - 打开时的阴影和光照效果
- 交互功能:
  - 点击打开/关闭
  - 滚动页面自动关闭
  - 打开时弹出图片卡片
  - 关闭时等待卡片收起后再关闭
- 动画参数:
  - 文件夹翻转角度: 46度
  - 过渡时间: 300ms
  - 过渡类型: ease

#### 弹出卡片组件 (BounceCards)
- 视觉效果:
  - 多张图片卡片弹出展示
  - 卡片分散排列，错落有致
  - 悬停时突出显示当前卡片
- 动画效果:
  - 弹性展开动画，使用elastic.out缓动
  - 收起时的震动和旋转效果
  - 卡片间的交错动画，创造序列感
- 动画参数:
  - 展开动画时长: 0.8秒
  - 收起动画时长: 0.5秒
  - 卡片间延迟: 0.15秒
  - 悬停缩放: 1.1倍 
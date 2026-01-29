# 首页首屏页面设计说明（桌面端优先）

## 1) Layout（布局系统与逻辑）
- 首屏采用「上部信息区 + 下部作品拼贴区」两段式结构。
- 推荐实现：CSS Grid 负责大区块排布 + Flex 负责信息区内联排。
  - 外层容器：12 栅格（grid-template-columns: repeat(12, 1fr)）。
  - 上部信息区：左侧占 6–7 栅格（身份信息+简介+标题），右侧可留白或作为拼贴的视觉延伸空间。
  - 下部拼贴区：跨 12 栅格，使用相对定位 + transform 进行斜放叠层。
- 间距：使用 8px 基准（8/16/24/32/48）。
- 响应式：
  - >= 1024px（桌面）：按本设计执行。
  - 768–1023px（平板）：上部信息区占满宽度；拼贴区减少卡片数量或缩小旋转角度。
  - < 768px（移动）：信息区改为垂直堆叠；拼贴改为单列卡片（不强制斜放），确保可读性。

## 2) Meta Information（页面元信息）
- Title："你的姓名 | Portfolio"
- Description："你的职位/方向 + 一句话价值主张"
- Open Graph：
  - og:title 同 Title
  - og:description 同 Description
  - og:image：使用占位图（例如 1200x630）

## 3) Global Styles（全局样式/设计令牌建议）
- Background：#0B0F17（深色）或 #FFFFFF（浅色，二选一保持一致）
- Text：主文字 #EAECEF（深色底）/ #111827（浅色底）
- Accent（强调色）：#7C3AED 或 #22C55E（二选一）
- Typography（桌面建议）：
  - H1（WORK）：48–64px / 700
  - H2（副标题）：18–20px / 500
  - Body（简介）：16–18px / 400，行高 1.6
- Button/Link（若有文本链接）：
  - 默认：强调色
  - Hover：提高亮度/添加下划线；过渡 150–200ms
- Card：圆角 16px，阴影（或描边）用于区分层级；Hover 轻微抬升（translateY(-4px)）

## 4) Page Structure（页面结构）
首屏容器（Max width 1120–1200，居中）
- 顶部安全区（padding-top 48–72）
- 信息区（左上）
- WORK 标题区（紧接简介后）
- 拼贴区（首屏下半区域，允许部分卡片溢出首屏边界制造张力）

## 5) Sections & Components（区块与组件明细）

### 5.1 首屏容器（HeroShell）
- 结构：
  - HeroShell（grid 12列）
    - LeftInfo（col-span 7）
    - RightSpace（col-span 5，可为空，用于留白/平衡）
    - WorkCollage（col-span 12）

### 5.2 左上身份信息区（IdentityBlock）
- 位置：首屏左上。
- 元素：
  1. 头像（Avatar）
     - 尺寸：48–64px（桌面）
     - 形状：圆形
     - 图片：占位图
       - 示例：<img src="https://placehold.co/128x128" style="width:64px;height:64px;border-radius:9999px;" />
  2. 姓名（Name）
     - 字重 600–700
  3. 认证（Verified Badge）
     - 紧贴姓名右侧
     - 表达方式：图标 + 文本（可选，仅图标也可）
     - 颜色：强调色或中性描边
  4. 职位（Title/Role）
     - 位于姓名行下方或同一行尾部（推荐下方更清晰）
- 排列：Avatar 在左，右侧为姓名/认证/职位的文本堆叠（Flex Row + 内部 Column）。

### 5.3 简介段落（IntroParagraph）
- 位置：IdentityBlock 下方 16–24px。
- 内容：1–2 段，每段 1–3 行。
- 交互：无。

### 5.4 WORK 标题与副标题（WorkHeading）
- 位置：简介下方 24–32px。
- 元素：
  - 主标题：WORK（H1/视觉最强）
  - 副标题：一行解释（例如“精选项目与案例”）
- 细节：主标题可使用紧凑字距（letter-spacing: -0.02em）。

### 5.5 下方斜放项目卡片拼贴（WorkCollage）
- 位置：首屏下半区域，建议与 WORK 标题有 24–40px 间距。
- 组成：3–6 张 ProjectCard。
- 卡片内容（最低必需）：
  - 封面图（占位图）
  - 项目名称（1 行，溢出省略）
- 占位图示例：
  - <img src="https://placehold.co/640x400" style="width:100%;border-radius:12px;" />
- 拼贴规则（桌面推荐参数，可微调）：
  - 容器 position: relative; height: 380–520px。
  - 每张卡 position: absolute。
  - 旋转角度：-12° ~ +10°，避免都同向。
  - 层级：使用 z-index 形成前后叠放；最重要项目置顶。
  - 轻微错位：top/left 差值 24–64px。
- Hover（仅视觉）：
  - 提升层级（z-index+）
  - 放大 1.02–1.04
  - 阴影增强或描边高亮
- 可访问性：
  - 确保卡片文字与背景对比足够
  - 悬停效果需有 focus-visible 等价效果（键盘可达）

## 6) 组件清单（便于实现）
- HeroShell
- IdentityBlock（Avatar、Name、VerifiedBadge、RoleTitle）
- IntroParagraph
- WorkHeading（WorkTitle、WorkSubtitle）
- WorkCollage（ProjectCard x N）

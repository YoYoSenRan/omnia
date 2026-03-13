# Omnia Console UI 设计规范

本文档定义 Console 的视觉标准、交互准则与空间排版规则。所有新页面和组件修改以此为基准。

## 1. 核心设计哲学

- **高信噪比**：通过字阶大小和文字明度对比引导视觉，而非堆砌边框和色块。重点信息提亮，次要信息降噪。
- **空间与纵深**：悬浮元素投射有质感的阴影，暗色模式下表面具有微弱的玻璃折射效果。
- **克制的生命力**：所有可交互元素对悬停、聚焦、点击具有丝滑且克制的响应，但不过度。

## 2. 双模式设计

项目支持亮色（light）和暗色（dark）两套主题，通过 CSS 变量切换。所有组件必须在两种模式下正常工作。

### 2.1 亮色模式

- 页面底色为纯白（`--background: oklch(1 0 0)`）
- 卡片面板为纯白不透明
- 边框使用浅灰（`--border: oklch(0.922 0 0)`）
- 整体风格：干净、明亮、高对比度文字

### 2.2 暗色模式

- 页面底色为深蓝灰（`--background: oklch(0.18 0.01 250)`），非纯黑
- 卡片面板为半透明蓝灰（`--card: oklch(0.22 0.01 250 / 40%)`），配合 `backdrop-blur` 形成玻璃材质
- 边框使用极低透明度白（`--border: oklch(1 0 0 / 8%)`）
- 主色为蓝紫光（`--primary: oklch(0.60 0.20 250)`），用于按钮、焦点环、关键指标

### 2.3 原则

- **永远使用语义 token**，不硬编码颜色值。写 `bg-card` 而非 `bg-white` 或 `bg-gray-900`
- 暗色模式专属效果（如 `backdrop-blur`、发光阴影）通过 `dark:` 前缀添加
- 两种模式下同一元素的视觉权重应当一致

## 3. 语义色 Token 对照表

所有颜色通过 CSS 变量定义，Tailwind 中使用语义类名。**禁止直接使用 `gray-200`、`white`、`black` 等硬编码颜色。**

| Token | Tailwind 类名 | 使用场景 |
|-------|--------------|----------|
| `--background` | `bg-background` | 页面底色 |
| `--foreground` | `text-foreground` | 主文本、标题、关键数值 |
| `--card` | `bg-card` | 卡片、面板背景 |
| `--card-foreground` | `text-card-foreground` | 卡片内文本 |
| `--muted` | `bg-muted` | 次级区域背景、禁用态底色 |
| `--muted-foreground` | `text-muted-foreground` | 次要文本、描述、时间戳 |
| `--primary` | `bg-primary`, `text-primary` | 主操作按钮、焦点环、关键链接 |
| `--primary-foreground` | `text-primary-foreground` | 主按钮上的文字 |
| `--secondary` | `bg-secondary` | 次要按钮背景 |
| `--accent` | `bg-accent` | 悬停态、侧边栏激活项 |
| `--accent-foreground` | `text-accent-foreground` | accent 上的文字 |
| `--destructive` | `text-destructive` | 错误文字、危险操作 |
| `--border` | `border-border` | 所有边框的默认色 |
| `--input` | `bg-input` | 输入框背景 |
| `--ring` | `ring-ring` | 焦点环颜色 |

### 强调色使用规范

- `primary` 仅用于核心操作按钮和关键高亮，不滥用
- 状态色（成功/警告/错误）使用低透明度底色 + 同色系文字：`bg-destructive/10 text-destructive`
- 避免大面积涂抹高饱和色块

## 4. 空间布局与间距

严格遵循 **4px 基础网格**（Tailwind 1 单位 = 0.25rem = 4px）。

### 间距层级

| 层级 | Tailwind | 像素 | 使用场景 |
|------|----------|------|----------|
| 微间距 | `gap-1` ~ `gap-2` | 4-8px | 图标与文字、徽章之间 |
| 组内间距 | `gap-3` ~ `gap-4` | 12-16px | 卡片内标题与内容、表单字段之间 |
| 区块间距 | `gap-6` ~ `gap-8` | 24-32px | 页面区域之间、独立 section 之间 |

### 容器边距

- 页面内容区左右内边距：`px-6`（24px）起步
- 卡片内边距：`p-4`（16px）到 `p-6`（24px）
- 避免拥挤，留白即层级

### 布局禁忌

- 不要随意混用不同间距值
- 同级元素间距保持一致
- 嵌套容器的内边距逐层递减而非递增

## 5. 排版

使用 `Geist Variable` 可变字体。

### 字阶

| 层级 | 类名 | 使用场景 |
|------|------|----------|
| 页面标题 | `text-2xl font-semibold tracking-tight` | 每页顶部唯一标题 |
| 区块标题 | `text-lg font-medium` | 卡片标题、section 标题 |
| 正文 | `text-sm text-muted-foreground` | 描述、说明、次要信息 |
| 标签/强调 | `text-sm text-foreground font-medium` | 字段名、关键值 |
| 辅助文字 | `text-xs text-muted-foreground` | 时间戳、ID、来源 |

### 规则

- **明暗对比优先于大小对比**：正文默认 `text-muted-foreground`，仅关键信息使用 `text-foreground`
- **收紧字间距**：标题加 `tracking-tight` 提升专业感
- **数字等宽**：ID、日期、数值使用 `tabular-nums` 确保垂直对齐
- 避免巨型字体，页面最大不超过 `text-2xl`

## 6. 表面与边框

### 卡片/面板

```
亮色模式：bg-card border border-border rounded-lg
暗色模式：bg-card border border-border rounded-lg backdrop-blur-md
```

暗色模式下 `--card` 自身已是半透明值，无需额外写透明度。

### 边框

- 默认使用 `border-border`，项目 CSS 基础层已全局设置 `* { border-color: var(--border) }`
- 表格行分隔：仅用底线 `border-b border-border`，不加竖线
- 避免沉重的粗边框，暗色下边框本身就是 8% 透明度白色

### 阴影

- 普通卡片：不加阴影或极浅阴影 `shadow-sm`
- 悬浮元素（Dropdown、Dialog）：`shadow-lg`
- 暗色模式主按钮：发光阴影 `shadow-[0_0_15px_-3px_var(--color-primary)]`（已在 Button 组件实现）

## 7. 微交互

所有交互动画使用 `transition-all duration-200` 或 `duration-300`。

### 7.1 指针

| 状态 | 类名 | 说明 |
|------|------|------|
| 可点击 | `cursor-pointer` | 按钮、链接、可点击卡片、可点击表格行 |
| 禁用 | `opacity-50 cursor-not-allowed` | disabled 元素 |
| 加载中 | `cursor-wait` / `animate-spin` | 提交中的按钮 |

### 7.2 悬停 (Hover)

- 背景微调：`hover:bg-accent`（语义色，两种模式自动适配）
- 可选的显隐：日常隐藏的操作按钮通过 `group-hover:opacity-100` 浮现
- 不要突兀变色，保持过渡平滑

### 7.3 按压 (Active)

- 物理按压反馈：`active:scale-[0.98]`（已在 Button default variant 实现）
- 配合 `active:translate-y-px` 增加下沉感

### 7.4 焦点 (Focus)

- **绝对不能移除 focus ring**，禁止 `outline-none` 不加替代
- 统一焦点环：`focus-visible:ring-3 focus-visible:ring-ring/50`（已在 Button 基础类实现）
- 焦点环颜色跟随 `--ring` 变量，暗色下为蓝紫光

## 8. 组件体系对接

项目使用 **Base UI（无样式原语）+ CVA（样式变体）** 的组合方式构建组件。

### 已有组件

| 组件 | 文件 | 说明 |
|------|------|------|
| Button | `components/ui/button.tsx` | 6 个样式变体 + 8 个尺寸，完整的交互状态 |

Button 已实现本规范中的所有微交互要求（发光阴影、scale 按压、focus ring）。

### 待建组件

| 组件 | 说明 | 规范要点 |
|------|------|----------|
| Dialog | 弹窗容器 | 遮罩 `bg-background/80 backdrop-blur-sm`，面板 `bg-card border-border shadow-lg` |
| Drawer | 侧边抽屉 | 右侧滑入，遮罩同 Dialog，面板宽 480px |
| Input | 文本输入 | `bg-input border-border rounded-md`，focus 态 `ring-ring` |
| Textarea | 多行输入 | 同 Input，支持 `resize-none` |
| Select | 下拉选择 | 触发器同 Input 样式，下拉面板 `bg-popover shadow-lg` |
| Badge/StatusBadge | 状态徽章 | 低透明度底色 + 同色文字，如 `bg-primary/10 text-primary` |

### 新组件开发规则

1. 使用 Base UI 原语（Dialog、Select 等）作为行为层，自行用 Tailwind 控制样式
2. 使用 CVA 定义变体（如有多种样式），保持与 Button 一致的模式
3. 所有颜色使用语义 token，禁止硬编码
4. 必须在亮色和暗色模式下测试
5. 交互状态完整覆盖：default → hover → active → focus-visible → disabled

## 9. 常见错误与修正

| 错误做法 | 正确做法 |
|---------|---------|
| `border-gray-200` 或 `border-white/5` | `border-border`（已通过 CSS 变量适配双模式） |
| `bg-black` / `bg-white` | `bg-background` 或 `bg-card` |
| `text-gray-500` | `text-muted-foreground` |
| `bg-red-500 text-white` 作为错误提示 | `bg-destructive/10 text-destructive border-destructive/20` |
| 表格行之间粗分隔线 + 竖线 | 仅 `border-b border-border`，列靠间距区分 |
| `outline-none` 不加替代方案 | `focus-visible:ring-3 focus-visible:ring-ring/50` |
| 在亮色模式下使用 `backdrop-blur` | `backdrop-blur` 仅在暗色模式使用（`dark:backdrop-blur-md`） |
| `hover:bg-gray-100` / `hover:bg-gray-800` | `hover:bg-accent`（语义色自动适配） |

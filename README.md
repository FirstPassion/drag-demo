# 拖拽组件编辑器

一个基于 TypeScript + Vite 的可视化拖拽编辑器演示项目，支持从组件库拖拽组件到画布、编辑属性、撤销重做、预览和导出功能。

![首页](/img/first.png)

## 功能特性

- **组件库**：文本、按钮、输入框、图片、文本域、下拉框、复选框、单选框、滑块
- **拖拽操作**：从左侧面板拖拽组件到画布，支持网格对齐（20px）
- **属性编辑**：右侧面板实时编辑选中组件的尺寸、位置、文本等属性
- **撤销重做**：支持 Ctrl+Z / Ctrl+Shift+Z 快捷键操作
- **保存加载**：支持 localStorage 本地保存和 JSON 文件导出
- **预览导出**：全屏预览编辑效果，下载生成的 HTML 源码

## 快速开始

### 环境要求

- Node.js >= 16
- pnpm 包管理器

### 安装运行

```bash
# 安装依赖
pnpm i

# 启动开发服务器（支持热更新）
pnpm dev
```

开发服务器默认运行在 `127.0.0.1:8080`。

### 其他命令

```bash
pnpm build    # TypeScript 检查 + 生产构建
pnpm preview  # 预览生产构建
```

## 技术栈

- **TypeScript** - 严格模式
- **Vite** - 构建工具
- **原生 DOM** - 无框架依赖

## 项目结构

```
src/
├── main.ts                 # 应用入口
├── types/                  # 类型定义
│   ├── component.ts        # 组件类型枚举和接口
│   └── index.ts            # 应用状态接口
├── state/                  # 状态管理
│   ├── store.ts            # 中央状态管理（发布/订阅）
│   ├── history.ts          # 撤销重做
│   └── persistence.ts      # 本地存储
├── core/                   # 核心功能
│   ├── DragManager.ts      # 拖拽管理
│   ├── MoveManager.ts      # 移动管理
│   ├── SelectionManager.ts # 选择管理
│   └── GridSnapper.ts      # 网格对齐
├── components/             # UI 组件
│   ├── ComponentRegistry.ts # 组件注册表
│   ├── Editor.ts           # 画布编辑器
│   ├── PropertyPanel.ts    # 属性面板
│   └── ComponentLibrary.ts # 组件库
├── events/                 # 事件系统
└── utils/                  # 工具函数
```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+Z | 撤销 |
| Ctrl+Shift+Z / Ctrl+Y | 重做 |
| Ctrl+S | 保存 |
| Delete | 删除选中组件 |

## License

MIT

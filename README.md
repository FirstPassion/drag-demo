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
- **自定义弹窗**：美观的提示和确认弹窗，替代浏览器原生 alert/confirm

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
├── main.ts                 # 应用入口，初始化所有模块
├── types/                  # 类型定义
│   ├── component.ts        # 组件类型枚举和接口
│   └── index.ts            # 应用状态、事件类型接口
├── state/                  # 状态管理
│   ├── store.ts            # 中央状态管理（发布/订阅模式）
│   ├── history.ts          # 撤销/重做历史管理
│   └── persistence.ts      # 本地存储（localStorage）
├── core/                   # 核心功能
│   ├── DragManager.ts      # 拖拽管理（组件库 → 画布）
│   ├── MoveManager.ts      # 移动管理（画布内组件移动）
│   ├── SelectionManager.ts # 选中状态管理
│   └── GridSnapper.ts      # 网格对齐工具
├── components/             # UI 组件
│   ├── ComponentRegistry.ts # 组件注册表（类型定义 + DOM 创建）
│   ├── Editor.ts           # 画布编辑器（渲染 + 交互）
│   ├── PropertyPanel.ts    # 属性面板（编辑组件属性）
│   └── ComponentLibrary.ts # 组件库（左侧拖拽源）
├── utils/                  # 工具函数
│   └── dialog.ts           # 自定义弹窗（替代原生 alert/confirm）
└── style.css               # 全局样式
```

## 核心架构

### 状态管理（Store）

整个应用使用单一的 `Store` 实例管理所有状态。其他模块通过订阅事件来响应状态变化。

```
用户操作 → DragManager/MoveManager/SelectionManager → Store.setState()
  → 触发 state:changed 事件 → Editor.render() 重新渲染
  → 触发 component:selected 事件 → PropertyPanel 更新属性面板
```

### 事件系统

| 事件类型 | 触发时机 | 监听者 |
|---------|---------|--------|
| `state:changed` | 任何状态变化 | Editor, HistoryManager |
| `component:added` | 新组件添加 | - |
| `component:removed` | 组件移除 | - |
| `component:updated` | 组件属性修改 | PropertyPanel |
| `component:selected` | 组件被选中 | SelectionManager, PropertyPanel |
| `component:deselected` | 取消选中 | SelectionManager, PropertyPanel |

## 功能详解

### 1. 拖拽添加组件

**操作流程**：
1. 用户在左侧组件库按住鼠标左键
2. 拖动到中间画布区域
3. 松开鼠标，组件被添加到画布

**代码调用链**：
```
用户开始拖动
  → DragManager.setupComponentDrag() 的 dragstart 事件
  → 记录组件尺寸到 dataTransfer
  → 创建临时组件实例

用户拖动经过画布
  → DragManager.setupEditorEvents() 的 dragenter/dragover 事件
  → 添加 drag-over 样式（高亮边框）

用户松开鼠标
  → DragManager.setupEditorEvents() 的 drop 事件
  → DragManager.handleDrop()
  → 计算鼠标位置（考虑滚动偏移）
  → GridSnapper.snapPositionWithBounds() 网格对齐
  → registry.createInstance() 创建组件实例
  → store.addComponent() 添加到状态
  → 触发 state:changed → Editor.render() 重新渲染
```

### 2. 移动画布上的组件

**操作流程**：
1. 用户在画布上的组件上按住鼠标左键
2. 拖动到新位置
3. 松开鼠标，组件位置被保存

**代码调用链**：
```
用户按下鼠标左键
  → Editor.renderComponent() 的 onmousedown 事件
  → selectionManager.select() 选中组件
  → moveManager.startDrag() 记录起始位置

用户拖动鼠标
  → MoveManager.init() 的 mousemove 事件
  → calculateClampedPosition() 计算新位置
  → 实时更新组件 DOM 位置（视觉反馈）

用户松开鼠标
  → MoveManager.init() 的 mouseup 事件
  → calculateClampedPosition() 计算最终位置
  → store.updateComponent() 保存位置
  → 触发 state:changed → Editor.render() 重新渲染
```

### 3. 选中组件

**操作流程**：
1. 用户点击画布上的组件
2. 组件显示蓝色边框（选中状态）
3. 右侧面板显示该组件的属性

**代码调用链**：
```
用户点击组件
  → Editor.renderComponent() 的 onclick 事件
  → selectionManager.select(id)
  → store.selectComponent(id)
  → 触发 component:selected 事件
  → SelectionManager.updateSelectionVisual() 添加选中样式
  → PropertyPanel.updatePanel() 更新属性面板
```

### 4. 编辑组件属性

**操作流程**：
1. 选中一个组件
2. 在右侧面板修改属性值（如宽度、文本内容）
3. 按回车或点击其他地方，修改生效

**代码调用链**：
```
用户修改输入框并失去焦点
  → PropertyPanel.bindInputEvents() 的 onblur 事件
  → handleInputChange() 处理输入值
  → store.updateComponent() 更新组件属性
  → 触发 component:updated 事件 → PropertyPanel.updatePanel()
  → 触发 state:changed 事件 → Editor.render() 重新渲染
```

### 5. 删除组件

**操作流程**：
1. 选中一个组件
2. 按 Delete 键，或右键点击组件选择删除

**代码调用链**：
```
方式一：按 Delete 键
  → main.ts setupKeyboardShortcuts() 的 keydown 事件
  → store.removeComponent(selectedId)
  → 触发 state:changed → Editor.render() 重新渲染

方式二：右键点击选中的组件
  → Editor.renderComponent() 的 onmousedown 事件（button === 2）
  → Editor.showDeleteButton()
  → 用户点击删除按钮
  → store.removeComponent(id)
  → 触发 state:changed → Editor.render() 重新渲染
```

### 6. 撤销/重做

**操作流程**：
1. 执行一系列操作（如添加、移动、修改组件）
2. 按 Ctrl+Z 撤销上一步操作
3. 按 Ctrl+Shift+Z 或 Ctrl+Y 重做

**代码调用链**：
```
用户按 Ctrl+Z
  → main.ts setupKeyboardShortcuts() 的 keydown 事件
  → history.undo()
  → historyIndex-- （索引前移）
  → store.restoreSnapshot() 恢复到上一个状态
  → 触发 state:changed → Editor.render() 重新渲染

用户按 Ctrl+Shift+Z
  → history.redo()
  → historyIndex++ （索引后移）
  → store.restoreSnapshot() 恢复到下一个状态
  → 触发 state:changed → Editor.render() 重新渲染
```

### 7. 保存/加载

**操作流程**：
1. 点击"保存"按钮，状态保存到浏览器 localStorage
2. 刷新页面后，点击"加载"按钮，状态恢复

**代码调用链**：
```
保存：
  用户点击"保存" → persistence.save(store.getState())
  → JSON.stringify() 序列化 → localStorage.setItem() 保存

加载：
  应用启动 → loadSavedState() → persistence.load()
  → localStorage.getItem() 读取 → JSON.parse() 反序列化
  → store.setState() 恢复状态
```

### 8. 预览/导出

**操作流程**：
1. 点击"全屏预览"按钮，隐藏侧边栏，显示预览效果
2. 双击预览区域退出预览
3. 点击"下载源码"按钮，下载 HTML 文件

**代码调用链**：
```
预览：
  用户点击"全屏预览" → editor.togglePreviewMode()
  → 隐藏左侧面板、右侧面板
  → 显示预览代码（生成的 HTML）

导出：
  用户点击"下载源码" → editor.downloadSourceCode()
  → generatePreviewCode() 生成 HTML
  → 创建 Blob → 生成临时链接 → 模拟点击下载
```

### 9. 自定义弹窗

项目使用自定义弹窗替代浏览器原生的 `alert()` 和 `confirm()`，提供更美观的 UI 体验。

**弹窗类型**：
- 成功提示（绿色对勾图标）
- 警告提示（橙色感叹号图标）
- 错误提示（红色叉号图标）
- 信息提示（紫色信息图标）
- 确认弹窗（带确定/取消按钮）

**使用示例**：
```typescript
import { showAlert, showConfirm, showSuccess, showWarning } from './utils/dialog';

// 显示成功提示
await showSuccess('保存成功！');

// 显示确认弹窗
const confirmed = await showConfirm('确定要删除吗？', {
  confirmText: '确定删除',
  cancelText: '取消',
  icon: 'warning'
});
if (confirmed) {
  // 执行删除操作
}
```

**代码调用链**：
```
保存操作：
  用户点击"保存" → persistence.save()
  → await showSuccess('保存成功！')
  → 创建弹窗 DOM → 显示动画 → 用户点击确定 → 关闭弹窗

清除操作：
  用户点击"清除全部"
  → await showConfirm('确定要清除所有组件吗？')
  → 创建弹窗 DOM → 显示动画
  → 用户点击"确定清除" → editor.clear()
  → 用户点击"取消" → 关闭弹窗
```

**弹窗特性**：
- 支持键盘操作（Enter 确认，Escape 取消）
- 点击遮罩层可关闭
- 平滑的打开/关闭动画（淡入 + 缩放滑入）
- 与项目整体设计风格一致（使用相同的颜色变量）

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+Z | 撤销 |
| Ctrl+Shift+Z / Ctrl+Y | 重做 |
| Ctrl+S | 保存 |
| Delete | 删除选中组件 |

## License

MIT

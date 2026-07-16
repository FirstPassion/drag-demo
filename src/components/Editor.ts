import { Store } from '../state/store';
import { ComponentRegistry } from './ComponentRegistry';
import { SelectionManager } from '../core/SelectionManager';
import { MoveManager } from '../core/MoveManager';
import { ComponentInstance } from '../types/component';

/**
 * 编辑器区域管理
 * 负责画布区域的组件渲染、事件绑定和预览模式。
 *
 * 核心职责：
 * 1. 监听状态变化，重新渲染所有组件
 * 2. 为每个组件绑定交互事件（点击、右键、拖拽移动、Delete 键）
 * 3. 管理预览模式（隐藏侧边栏，显示预览代码）
 * 4. 生成可下载的 HTML 源码
 *
 * 事件流：
 * store.state:changed → render() → 遍历组件 → renderComponent() → 绑定事件
 *
 * 注意：每次状态变化都会清空画布并重新渲染所有组件。
 * 这是一种简单但低效的实现方式，适合小型应用。
 */
export class Editor {
  private container: HTMLElement;         // 画布区域的 DOM 元素
  private store: Store;
  private registry: ComponentRegistry;
  private selectionManager: SelectionManager;
  private moveManager: MoveManager;
  private isPreviewMode: boolean;        // 当前是否处于预览模式
  private leftPanel: HTMLElement | null; // 左侧组件库面板
  private rightPanel: HTMLElement | null;// 右侧属性面板
  private codeBox: HTMLElement | null;   // 预览代码显示区域

  constructor(
    container: HTMLElement,
    store: Store,
    registry: ComponentRegistry,
    selectionManager: SelectionManager,
    moveManager: MoveManager
  ) {
    this.container = container;
    this.store = store;
    this.registry = registry;
    this.selectionManager = selectionManager;
    this.moveManager = moveManager;
    this.isPreviewMode = false;

    // 缓存 DOM 元素引用，避免重复查询
    this.leftPanel = document.querySelector('#left');
    this.rightPanel = document.querySelector('#right');
    this.codeBox = document.querySelector('.code');

    // 监听状态变化，自动重新渲染
    this.store.on('state:changed', () => this.render());
  }

  /**
   * 渲染所有组件
   * 每次状态变化时调用，清空画布并重新创建所有组件的 DOM 元素
   *
   * 流程：
   * 1. 清空容器的 innerHTML
   * 2. 遍历 store 中的所有组件
   * 3. 为每个组件创建 DOM 元素并绑定事件
   * 4. 将 DOM 元素添加到画布
   * 5. 更新组件实例的 element 引用
   */
  render(): void {
    this.container.innerHTML = '';

    this.store.getComponents().forEach(component => {
      const element = this.renderComponent(component);
      component.element = element;  // 将 DOM 元素引用保存到组件实例
      this.container.appendChild(element);
    });
  }

  /**
   * 渲染单个组件
   * @param instance - 组件实例
   * @returns 创建的 DOM 元素
   *
   * 为每个组件绑定的事件：
   * - onclick: 点击选中组件
   * - onkeydown: 按 Delete 键删除组件
   * - oncontextmenu: 禁用右键菜单
   * - onmousedown: 左键开始拖拽移动，右键显示删除按钮
   */
  private renderComponent(instance: ComponentInstance): HTMLElement {
    // 根据组件类型和属性创建 DOM 元素
    const element = this.registry.createElement(instance.type, instance.props);
    element.tabIndex = -1;  // 使元素可以接收键盘事件

    // 点击事件：选中组件
    element.onclick = (e) => {
      e.stopPropagation();  // 阻止事件冒泡到画布
      this.selectionManager.select(instance.id);
    };

    // 键盘事件：按 Delete 键删除组件
    element.onkeydown = (e) => {
      if (e.key === 'Delete') {
        this.store.removeComponent(instance.id);
      }
    };

    // 禁用右键菜单
    element.oncontextmenu = (e) => {
      e.preventDefault();
    };

    // 鼠标按下事件
    element.onmousedown = (e) => {
      if (e.button === 0) {
        // 左键：选中并开始拖拽移动
        e.stopPropagation();
        this.selectionManager.select(instance.id);
        this.moveManager.startDrag(instance, e);
      } else if (e.button === 2) {
        // 右键：如果组件已选中，显示删除按钮
        if (this.store.getSelectedId() === instance.id) {
          this.showDeleteButton(instance);
        }
      }
    };

    return element;
  }

  /**
   * 显示删除按钮
   * @param instance - 要删除的组件
   *
   * 右键点击已选中的组件时调用
   * 删除按钮位于组件的右上角，点击后删除组件
   */
  private showDeleteButton(instance: ComponentInstance): void {
    const delbtn = this.selectionManager.createDeleteButton(instance);
    if (!delbtn) return;

    delbtn.onclick = () => {
      this.store.removeComponent(instance.id);
      this.selectionManager.clearDeleteButtons();
    };

    this.container.appendChild(delbtn);
  }

  /**
   * 清空画布
   * 移除所有组件
   *
   * 调用链：用户点击"清除全部"按钮 → main.ts bindClick('.clear') → editor.clear()
   */
  clear(): void {
    this.store.setState({ components: [], selectedId: null });
  }

  /**
   * 切换预览模式
   * 预览模式会隐藏左侧组件库和右侧属性面板，只显示画布区域
   *
   * 调用链：用户点击"全屏预览"按钮 → main.ts bindClick('.look') → editor.togglePreviewMode()
   *   或：用户双击预览区域 → main.ts dblclick → editor.togglePreviewMode()
   */
  togglePreviewMode(): void {
    this.isPreviewMode = !this.isPreviewMode;

    if (this.isPreviewMode) {
      // 进入预览模式：隐藏侧边栏，显示预览代码
      if (this.leftPanel) this.leftPanel.style.display = 'none';
      if (this.rightPanel) this.rightPanel.style.display = 'none';
      if (this.codeBox) {
        this.codeBox.style.display = 'block';
        this.codeBox.innerHTML = this.generatePreviewCode();
      }
    } else {
      // 退出预览模式：显示侧边栏，隐藏预览代码
      if (this.leftPanel) this.leftPanel.style.display = 'block';
      if (this.rightPanel) this.rightPanel.style.display = 'block';
      if (this.codeBox) this.codeBox.style.display = 'none';
    }
  }

  /**
   * 生成预览 HTML 代码
   * @returns 完整的 HTML 文档字符串
   *
   * 生成的 HTML 包含：
   * - 标准的 HTML5 文档结构
   * - 画布区域的 innerHTML（移除了 draggable 和 tabindex 属性）
   * - 使组件在预览中正确显示的基础样式
   */
  private generatePreviewCode(): string {
    // 获取画布内容，移除拖拽相关属性
    const content = this.container.innerHTML
      .replace(/draggable="true"/g, '')
      .replace(/tabindex="-1"/g, '');

    return `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>预览页面</title>
</head>
<body>
  <div style="position: relative; width: 100%; min-height: 100vh;">${content}</div>
</body>
</html>`;
  }

  /**
   * 下载源码文件
   * 将预览 HTML 代码下载为 index.html 文件
   *
   * 调用链：用户点击"下载源码"按钮 → main.ts bindClick('.down') → editor.downloadSourceCode()
   *
   * 实现原理：
   * 1. 生成预览代码
   * 2. 创建 Blob 对象
   * 3. 生成临时下载链接
   * 4. 模拟点击触发下载
   * 5. 清理临时资源
   */
  downloadSourceCode(): void {
    const code = this.generatePreviewCode();
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

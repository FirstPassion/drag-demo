import { Store } from '../state/store';
import { ComponentRegistry } from './ComponentRegistry';
import { SelectionManager } from '../core/SelectionManager';
import { MoveManager } from '../core/MoveManager';
import { ComponentInstance } from '../types/component';

// 编辑器区域管理
export class Editor {
  private container: HTMLElement;
  private store: Store;
  private registry: ComponentRegistry;
  private selectionManager: SelectionManager;
  private moveManager: MoveManager;

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

    // 监听状态变化，重新渲染
    this.store.on('state:changed', () => this.render());
  }

  // 渲染所有组件
  render(): void {
    // 清除容器
    this.container.innerHTML = '';

    // 渲染所有组件
    const components = this.store.getComponents();
    components.forEach(component => {
      const element = this.renderComponent(component);
      component.element = element;
      this.container.appendChild(element);
    });
  }

  // 渲染单个组件
  private renderComponent(instance: ComponentInstance): HTMLElement {
    const element = this.registry.createElement(instance.type, instance.props);

    // 设置 tabindex 以支持键盘事件
    element.tabIndex = -1;

    // 绑定点击事件
    element.onclick = (e) => {
      e.stopPropagation();
      this.selectionManager.select(instance.id);
    };

    // 绑定键盘事件（按 Delete 删除）
    element.onkeydown = (e) => {
      if (e.key === 'Delete') {
        this.store.removeComponent(instance.id);
      }
    };

    // 禁用右键菜单
    element.oncontextmenu = (e) => {
      e.preventDefault();
    };

    // 绑定鼠标按下事件
    element.onmousedown = (e) => {
      // 左键：选中并开始拖拽移动
      if (e.button === 0) {
        e.stopPropagation();
        this.selectionManager.select(instance.id);
        this.moveManager.startDrag(instance, e);
      }
      // 右键：显示删除按钮
      else if (e.button === 2) {
        const selected = this.store.getSelectedId();
        if (selected === instance.id) {
          this.showDeleteButton(instance);
        }
      }
    };

    return element;
  }

  // 显示删除按钮
  private showDeleteButton(instance: ComponentInstance): void {
    // 先清除已有的删除按钮
    this.selectionManager.clearDeleteButtons();

    const delbtn = this.selectionManager.createDeleteButton(instance);
    if (!delbtn) return;

    // 删除按钮点击事件
    delbtn.onclick = () => {
      this.store.removeComponent(instance.id);
      this.selectionManager.clearDeleteButtons();
    };

    this.container.appendChild(delbtn);
  }

  // 获取容器元素
  getContainer(): HTMLElement {
    return this.container;
  }

  // 获取编辑器内容的HTML
  getInnerHTML(): string {
    return this.container.innerHTML;
  }

  // 清空编辑器
  clear(): void {
    this.store.setState({ components: [], selectedId: null });
  }

  // 全屏预览模式
  enterPreviewMode(): void {
    const left = document.querySelector('#left') as HTMLElement;
    const right = document.querySelector('#right') as HTMLElement;
    const codeBox = document.querySelector('.code') as HTMLElement;

    if (left) left.style.display = 'none';
    if (right) right.style.display = 'none';
    if (codeBox) {
      codeBox.style.display = 'block';
      codeBox.innerHTML = this.generatePreviewCode();
    }
  }

  // 退出预览模式
  exitPreviewMode(): void {
    const left = document.querySelector('#left') as HTMLElement;
    const right = document.querySelector('#right') as HTMLElement;
    const codeBox = document.querySelector('.code') as HTMLElement;

    if (left) left.style.display = 'block';
    if (right) right.style.display = 'block';
    if (codeBox) codeBox.style.display = 'none';
  }

  // 生成预览代码
  private generatePreviewCode(): string {
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

  // 下载源码
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

import { Store } from '../state/store';
import { GridSnapper } from './GridSnapper';
import { SelectionManager } from './SelectionManager';
import { ComponentRegistry } from '../components/ComponentRegistry';
import { ComponentType, ComponentInstance } from '../types/component';

// 拖拽管理器
export class DragManager {
  private store: Store;
  private editorContainer: HTMLElement;
  private gridSnapper: GridSnapper;
  private selectionManager: SelectionManager;
  private registry: ComponentRegistry;
  private currentComponent: ComponentInstance | null;

  constructor(
    store: Store,
    editorContainer: HTMLElement,
    gridSnapper: GridSnapper,
    selectionManager: SelectionManager,
    registry: ComponentRegistry
  ) {
    this.store = store;
    this.editorContainer = editorContainer;
    this.gridSnapper = gridSnapper;
    this.selectionManager = selectionManager;
    this.registry = registry;
    this.currentComponent = null;
  }

  // 初始化拖拽事件
  init(): void {
    this.setupEditorEvents();
  }

  // 设置编辑器区域的拖拽事件
  private setupEditorEvents(): void {
    // 拖拽进入编辑区域
    this.editorContainer.addEventListener('dragenter', (e) => {
      e.preventDefault();
      this.editorContainer.classList.add('drag-over');
    });

    // 拖拽经过编辑区域
    this.editorContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'copy';
      this.editorContainer.classList.add('drag-over');
    });

    // 拖拽离开编辑区域（只在真正离开#midden时才移除样式）
    this.editorContainer.addEventListener('dragleave', (e) => {
      if (!this.editorContainer.contains(e.relatedTarget as Node)) {
        this.editorContainer.classList.remove('drag-over');
      }
    });

    // 拖拽放下
    this.editorContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleDrop(e);
    });

    // 拖拽结束时清理状态（处理在编辑区外松开的情况）
    document.addEventListener('dragend', () => {
      this.editorContainer.classList.remove('drag-over');
      this.currentComponent = null;
    });

    // 点击编辑区域空白处取消选中
    this.editorContainer.addEventListener('click', (e) => {
      if (e.target === this.editorContainer) {
        this.selectionManager.deselect();
      }
    });
  }

  // 处理拖拽放下事件
  private handleDrop(e: DragEvent): void {
    // 移除拖拽样式
    this.editorContainer.classList.remove('drag-over');

    if (!this.currentComponent) return;

    // 清除选中状态
    this.selectionManager.deselect();

    // 获取编辑区域的位置信息（考虑滚动偏移）
    const editorRect = this.editorContainer.getBoundingClientRect();
    const scrollTop = this.editorContainer.scrollTop;
    const scrollLeft = this.editorContainer.scrollLeft;

    // 计算鼠标相对于编辑区域的位置（包含滚动偏移）
    const mouseX = e.clientX - editorRect.left + scrollLeft;
    const mouseY = e.clientY - editorRect.top + scrollTop;

    // 获取存储的组件尺寸信息
    let componentWidth: number;
    let componentHeight: number;
    try {
      const sizeData = JSON.parse(e.dataTransfer!.getData('text/plain'));
      componentWidth = sizeData.width;
      componentHeight = sizeData.height;
    } catch {
      componentWidth = 100;
      componentHeight = 30;
    }

    // 计算位置（网格对齐并限制在边界内）
    const position = this.gridSnapper.snapPositionWithBounds(
      mouseY,
      mouseX,
      componentWidth,
      componentHeight,
      this.editorContainer.scrollWidth,
      this.editorContainer.scrollHeight
    );

    // 创建新的组件实例
    const newComponent = this.registry.createInstance(
      this.currentComponent.type,
      {
        top: position.top,
        left: position.left,
        width: componentWidth,
        height: componentHeight
      }
    );

    // 添加到状态管理器
    this.store.addComponent(newComponent);

    // 选中新添加的组件
    this.selectionManager.select(newComponent.id);

    // 重置当前组件
    this.currentComponent = null;
  }

  // 设置组件库的拖拽开始事件
  setupComponentDrag(element: HTMLElement, type: ComponentType): void {
    element.ondragstart = (e) => {
      const dragEvent = e as DragEvent;

      // 存储组件尺寸信息
      const rect = element.getBoundingClientRect();
      dragEvent.dataTransfer!.setData(
        'text/plain',
        JSON.stringify({
          width: rect.width,
          height: rect.height
        })
      );
      dragEvent.dataTransfer!.effectAllowed = 'copy';
      dragEvent.stopPropagation();

      // 创建临时组件实例用于拖拽
      this.currentComponent = this.registry.createInstance(type);

      // 设置透明拖拽图片,隐藏浏览器默认的幽灵图片
      const emptyImg = new Image();
      emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      dragEvent.dataTransfer!.setDragImage(emptyImg, 0, 0);
    };
  }

  // 设置组件库中特殊组件的事件
  setupSpecialComponentEvents(component: HTMLElement): void {
    // 处理 select 包装器
    if (component.classList.contains('select-wrapper')) {
      const select = component.querySelector('select');
      if (select) {
        this.preventSelectInteraction(select);
      }
    }

    // 处理包含 input 的 div 元素
    if (component.tagName === 'DIV' && component.querySelector('input')) {
      const inputs = component.querySelectorAll('input');
      inputs.forEach(input => {
        this.preventInputInteraction(input as HTMLElement);
      });
    }
  }

  // 阻止 select 元素的交互
  private preventSelectInteraction(select: HTMLSelectElement): void {
    select.onmousedown = (e) => e.stopPropagation();
    select.onclick = (e) => e.preventDefault();
    select.onfocus = (e) => {
      e.preventDefault();
      select.blur();
    };
    select.ontouchstart = (e) => e.preventDefault();
  }

  // 阻止 input 元素的交互
  private preventInputInteraction(input: HTMLElement): void {
    input.onmousedown = (e) => e.stopPropagation();
    input.onfocus = (e) => e.stopPropagation();
    input.ontouchstart = (e) => e.stopPropagation();
  }

  // 当前操作的组件
  getCurrentComponent(): ComponentInstance | null {
    return this.currentComponent;
  }
}

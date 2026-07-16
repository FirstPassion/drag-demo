import { Store } from '../state/store';
import { GridSnapper } from './GridSnapper';
import { SelectionManager } from './SelectionManager';
import { ComponentRegistry } from '../components/ComponentRegistry';
import { ComponentType, ComponentInstance } from '../types/component';

/**
 * 拖拽管理器
 * 负责处理从组件库拖拽组件到画布的完整流程。
 *
 * 拖拽流程：
 * 1. 用户在组件库按下鼠标并开始拖动 → setupComponentDrag() 设置 dragstart 事件
 * 2. 拖动过程中经过画布区域 → dragenter/dragover/dragleave 事件控制视觉反馈
 * 3. 在画布区域松开鼠标 → handleDrop() 创建新组件并添加到状态
 *
 * 关键设计：
 * - 使用原生 HTML5 拖拽 API（draggable, dragstart, drop 等事件）
 * - 拖拽时创建透明图片来隐藏浏览器默认的"幽灵图片"
 * - 组件库中的特殊元素（select、checkbox 等）需要阻止其默认交互行为
 */
export class DragManager {
  private store: Store;
  private editorContainer: HTMLElement;     // 画布区域的 DOM 元素
  private gridSnapper: GridSnapper;        // 网格对齐工具
  private selectionManager: SelectionManager;  // 选中状态管理
  private registry: ComponentRegistry;     // 组件注册表
  private currentComponent: ComponentInstance | null;  // 当前正在拖拽的组件（临时实例）

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

  /**
   * 初始化拖拽事件
   * 在 main.ts 中调用：dragManager.init()
   */
  init(): void {
    this.setupEditorEvents();
  }

  /**
   * 设置画布区域的拖拽事件
   *
   * 事件处理：
   * - dragenter: 拖拽进入画布，添加视觉反馈样式
   * - dragover: 拖拽经过画布，设置 dropEffect 为 "copy"
   * - dragleave: 拖拽离开画布，移除视觉反馈样式
   * - drop: 拖拽放下，创建新组件
   * - dragend: 拖拽结束（无论是否放下），清理状态
   * - click: 点击画布空白处，取消选中
   */
  private setupEditorEvents(): void {
    // 拖拽进入画布区域时，添加高亮边框样式
    this.editorContainer.addEventListener('dragenter', (e) => {
      e.preventDefault();  // 必须阻止默认行为，否则 drop 事件不会触发
      this.editorContainer.classList.add('drag-over');
    });

    // 拖拽经过画布区域时，持续显示高亮样式
    this.editorContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'copy';  // 设置拖拽效果为"复制"
      this.editorContainer.classList.add('drag-over');
    });

    // 拖拽离开画布区域时，移除高亮样式
    // 注意：只有真正离开 #midden 时才移除，离开子元素时不移除
    this.editorContainer.addEventListener('dragleave', (e) => {
      if (!this.editorContainer.contains(e.relatedTarget as Node)) {
        this.editorContainer.classList.remove('drag-over');
      }
    });

    // 在画布区域松开鼠标时，创建新组件
    this.editorContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleDrop(e);
    });

    // 拖拽结束时（无论是否放下），清理状态
    document.addEventListener('dragend', () => {
      this.editorContainer.classList.remove('drag-over');
      this.currentComponent = null;
    });

    // 点击画布空白处，取消选中所有组件
    this.editorContainer.addEventListener('click', (e) => {
      if (e.target === this.editorContainer) {
        this.selectionManager.deselect();
      }
    });
  }

  /**
   * 处理拖拽放下事件
   * 这是拖拽流程的核心，负责：
   * 1. 计算鼠标相对于画布的位置
   * 2. 获取组件尺寸信息
   * 3. 网格对齐并限制在边界内
   * 4. 创建新的组件实例
   * 5. 添加到状态管理器
   * 6. 选中新添加的组件
   */
  private handleDrop(e: DragEvent): void {
    this.editorContainer.classList.remove('drag-over');
    if (!this.currentComponent) return;

    // 清除之前的选中状态
    this.selectionManager.deselect();

    // 计算鼠标相对于画布的位置（考虑滚动偏移）
    const editorRect = this.editorContainer.getBoundingClientRect();
    const mouseX = e.clientX - editorRect.left + this.editorContainer.scrollLeft;
    const mouseY = e.clientY - editorRect.top + this.editorContainer.scrollTop;

    // 从 dataTransfer 中获取组件尺寸信息（在 dragstart 时存储的）
    let componentWidth: number;
    let componentHeight: number;
    try {
      const sizeData = JSON.parse(e.dataTransfer!.getData('text/plain'));
      componentWidth = sizeData.width;
      componentHeight = sizeData.height;
    } catch {
      // 解析失败时使用默认尺寸
      componentWidth = 100;
      componentHeight = 30;
    }

    // 计算最终位置：网格对齐 + 边界限制
    const position = this.gridSnapper.snapPositionWithBounds(
      mouseY, mouseX,
      componentWidth, componentHeight,
      this.editorContainer.scrollWidth, this.editorContainer.scrollHeight
    );

    // 创建新的组件实例（使用网格对齐后的位置和获取的尺寸）
    const newComponent = this.registry.createInstance(
      this.currentComponent.type,
      {
        top: position.top,
        left: position.left,
        width: componentWidth,
        height: componentHeight
      }
    );

    // 添加到状态管理器（会触发 state:changed 事件，Editor 会重新渲染）
    this.store.addComponent(newComponent);

    // 选中新添加的组件（会触发 component:selected 事件，属性面板会更新）
    this.selectionManager.select(newComponent.id);

    this.currentComponent = null;
  }

  /**
   * 设置组件库中组件卡片的拖拽开始事件
   * 由 ComponentLibrary.renderComponentItem() 调用
   *
   * @param element - 组件卡片的 DOM 元素
   * @param type - 组件类型
   *
   * 关键点：
   * - 将组件尺寸信息存储到 dataTransfer 中，供 drop 时读取
   * - 创建透明图片来隐藏浏览器默认的"幽灵图片"
   * - 创建临时组件实例（仅用于记录类型信息）
   */
  setupComponentDrag(element: HTMLElement, type: ComponentType): void {
    element.ondragstart = (e) => {
      const dragEvent = e as DragEvent;

      // 存储组件卡片的尺寸信息到 dataTransfer
      // 这样在 drop 时可以读取，用于设置新组件的初始尺寸
      const rect = element.getBoundingClientRect();
      dragEvent.dataTransfer!.setData(
        'text/plain',
        JSON.stringify({ width: rect.width, height: rect.height })
      );
      dragEvent.dataTransfer!.effectAllowed = 'copy';
      dragEvent.stopPropagation();

      // 创建临时组件实例，记录要创建的组件类型
      this.currentComponent = this.registry.createInstance(type);

      // 设置透明拖拽图片，隐藏浏览器默认的"幽灵图片"
      const emptyImg = new Image();
      emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      dragEvent.dataTransfer!.setDragImage(emptyImg, 0, 0);
    };
  }

  /**
   * 设置组件库中特殊组件的事件处理
   * 由 ComponentLibrary.renderComponentItem() 调用
   *
   * 问题：某些组件（如 select、checkbox、radio）有自带的交互行为，
   * 这些行为会干扰拖拽操作。需要阻止这些交互。
   */
  setupSpecialComponentEvents(component: HTMLElement): void {
    // 处理 select 包装器：阻止 select 的下拉行为
    if (component.classList.contains('select-wrapper')) {
      const select = component.querySelector('select');
      if (select) {
        this.preventSelectInteraction(select);
      }
    }

    // 处理包含 input 的 div 元素（如 checkbox、radio）：阻止 input 的交互
    if (component.tagName === 'DIV' && component.querySelector('input')) {
      const inputs = component.querySelectorAll('input');
      inputs.forEach(input => {
        this.preventInputInteraction(input as HTMLElement);
      });
    }
  }

  /**
   * 阻止 select 元素的交互行为
   * 使用多种事件处理来确保 select 在拖拽时不会弹出下拉框
   */
  private preventSelectInteraction(select: HTMLSelectElement): void {
    select.onmousedown = (e) => e.stopPropagation();  // 阻止事件冒泡
    select.onclick = (e) => e.preventDefault();        // 阻止默认点击行为
    select.onfocus = (e) => {
      e.preventDefault();  // 阻止获得焦点
      select.blur();       // 立即失去焦点
    };
    select.ontouchstart = (e) => e.preventDefault();  // 阻止触摸事件
  }

  /**
   * 阻止 input 元素的交互行为
   * 防止 checkbox、radio 等 input 元素干扰拖拽
   */
  private preventInputInteraction(input: HTMLElement): void {
    input.onmousedown = (e) => e.stopPropagation();
    input.onfocus = (e) => e.stopPropagation();
    input.ontouchstart = (e) => e.stopPropagation();
  }
}

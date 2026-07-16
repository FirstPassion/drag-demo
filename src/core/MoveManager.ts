import { Store } from '../state/store';
import { GridSnapper } from './GridSnapper';
import { ComponentInstance } from '../types/component';

/**
 * 组件移动管理器
 * 负责处理画布上已放置组件的拖拽移动操作。
 *
 * 与 DragManager 的区别：
 * - DragManager：处理从组件库拖拽组件到画布（创建新组件）
 * - MoveManager：处理画布上已有组件的位置移动
 *
 * 移动流程：
 * 1. 用户在组件上按下鼠标左键 → startDrag() 记录起始位置
 * 2. 用户拖动鼠标 → mousemove 事件实时更新组件位置
 * 3. 用户松开鼠标 → mouseup 事件将最终位置保存到状态
 *
 * 关键设计：
 * - 使用 document 级别的 mousemove/mouseup 事件（而不是组件级别）
 *   这样即使鼠标移出组件范围，移动操作也能继续
 * - 每次移动都进行网格对齐和边界限制
 */
export class MoveManager {
  private store: Store;
  private editorContainer: HTMLElement;     // 画布区域，用于获取边界范围
  private gridSnapper: GridSnapper;        // 网格对齐工具
  private isDragging: boolean;             // 是否正在拖拽
  private dragTarget: ComponentInstance | null;  // 当前拖拽的目标组件
  private startX: number;                  // 鼠标按下时的 X 坐标
  private startY: number;                  // 鼠标按下时的 Y 坐标
  private startTop: number;               // 组件拖拽开始时的 top 值
  private startLeft: number;              // 组件拖拽开始时的 left 值

  constructor(
    store: Store,
    editorContainer: HTMLElement,
    gridSnapper: GridSnapper
  ) {
    this.store = store;
    this.editorContainer = editorContainer;
    this.gridSnapper = gridSnapper;
    this.isDragging = false;
    this.dragTarget = null;
    this.startX = 0;
    this.startY = 0;
    this.startTop = 0;
    this.startLeft = 0;
  }

  /**
   * 初始化移动事件
   * 在 main.ts 中调用：moveManager.init()
   *
   * 注意：这里只注册全局的 mousemove 和 mouseup 事件
   * mousedown 事件在 Editor.renderComponent() 中针对每个组件单独注册
   */
  init(): void {
    // 全局鼠标移动事件：实时更新组件位置
    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !this.dragTarget?.element) return;
      e.preventDefault();  // 防止文本被选中

      const pos = this.calculateClampedPosition(e.clientX, e.clientY);
      this.dragTarget.element.style.top = `${pos.top}px`;
      this.dragTarget.element.style.left = `${pos.left}px`;
    });

    // 全局鼠标释放事件：保存最终位置，结束拖拽
    document.addEventListener('mouseup', (e) => {
      if (!this.isDragging || !this.dragTarget) return;
      e.preventDefault();

      const pos = this.calculateClampedPosition(e.clientX, e.clientY);
      // 将最终位置保存到状态（会触发 state:changed 事件）
      this.store.updateComponent(this.dragTarget.id, pos);

      // 重置拖拽状态
      this.isDragging = false;
      this.dragTarget = null;
      this.editorContainer.style.cursor = '';
    });
  }

  /**
   * 计算网格对齐并限制在编辑器范围内的位置
   * @param clientX - 鼠标当前的 X 坐标（屏幕坐标）
   * @param clientY - 鼠标当前的 Y 坐标（屏幕坐标）
   * @returns 计算后的 { top, left } 位置
   *
   * 计算逻辑：
   * 1. 计算鼠标相对于起始位置的偏移量
   * 2. 将起始位置 + 偏移量进行网格对齐
   * 3. 将结果限制在画布边界内（不超出画布范围）
   */
  private calculateClampedPosition(clientX: number, clientY: number): { top: number; left: number } {
    if (!this.dragTarget) return { top: 0, left: 0 };

    // 计算偏移量
    const deltaX = clientX - this.startX;
    const deltaY = clientY - this.startY;

    // 网格对齐
    const top = this.gridSnapper.snap(this.startTop + deltaY);
    const left = this.gridSnapper.snap(this.startLeft + deltaX);

    // 边界限制：确保组件不会移出画布
    const maxTop = this.editorContainer.scrollHeight - this.dragTarget.props.height;
    const maxLeft = this.editorContainer.scrollWidth - this.dragTarget.props.width;

    return {
      top: Math.max(0, Math.min(top, maxTop)),
      left: Math.max(0, Math.min(left, maxLeft))
    };
  }

  /**
   * 开始拖拽移动
   * 由 Editor.renderComponent() 中的 onmousedown 事件调用
   *
   * @param instance - 要移动的组件实例
   * @param e - 鼠标事件对象
   *
   * 记录拖拽的起始状态，包括：
   * - 鼠标按下时的坐标（用于计算偏移量）
   * - 组件拖拽开始时的位置（作为计算基准）
   */
  startDrag(instance: ComponentInstance, e: MouseEvent): void {
    if (!instance.element) return;

    this.isDragging = true;
    this.dragTarget = instance;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startTop = instance.props.top;
    this.startLeft = instance.props.left;

    // 设置拖拽时的视觉效果
    this.editorContainer.style.cursor = 'grabbing';
    instance.element.style.zIndex = '1000';   // 提升层级，确保在最上面
    instance.element.style.cursor = 'grabbing';
  }
}

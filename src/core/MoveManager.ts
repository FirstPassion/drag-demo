import { Store } from '../state/store';
import { GridSnapper } from './GridSnapper';
import { ComponentInstance } from '../types/component';

// 组件移动管理器
export class MoveManager {
  private store: Store;
  private editorContainer: HTMLElement;
  private gridSnapper: GridSnapper;
  private isDragging: boolean;
  private dragTarget: ComponentInstance | null;
  private startX: number;
  private startY: number;
  private startTop: number;
  private startLeft: number;

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

  // 初始化移动事件
  init(): void {
    this.setupMouseMove();
    this.setupMouseUp();
  }

  // 设置鼠标移动事件
  private setupMouseMove(): void {
    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !this.dragTarget?.element) return;

      e.preventDefault();

      // 计算移动距离
      const deltaX = e.clientX - this.startX;
      const deltaY = e.clientY - this.startY;

      // 计算新位置（网格对齐）
      const newTop = this.gridSnapper.snap(this.startTop + deltaY);
      const newLeft = this.gridSnapper.snap(this.startLeft + deltaX);

      // 限制在编辑器范围内
      const maxTop = this.editorContainer.scrollHeight - this.dragTarget.props.height;
      const maxLeft = this.editorContainer.scrollWidth - this.dragTarget.props.width;

      const clampedTop = Math.max(0, Math.min(newTop, maxTop));
      const clampedLeft = Math.max(0, Math.min(newLeft, maxLeft));

      // 更新DOM位置
      this.dragTarget.element.style.top = `${clampedTop}px`;
      this.dragTarget.element.style.left = `${clampedLeft}px`;
    });
  }

  // 设置鼠标释放事件
  private setupMouseUp(): void {
    document.addEventListener('mouseup', (e) => {
      if (!this.isDragging || !this.dragTarget) return;

      e.preventDefault();

      // 计算最终位置
      const deltaX = e.clientX - this.startX;
      const deltaY = e.clientY - this.startY;

      const newTop = this.gridSnapper.snap(this.startTop + deltaY);
      const newLeft = this.gridSnapper.snap(this.startLeft + deltaX);

      // 限制在编辑器范围内
      const maxTop = this.editorContainer.scrollHeight - this.dragTarget.props.height;
      const maxLeft = this.editorContainer.scrollWidth - this.dragTarget.props.width;

      const clampedTop = Math.max(0, Math.min(newTop, maxTop));
      const clampedLeft = Math.max(0, Math.min(newLeft, maxLeft));

      // 更新状态
      this.store.updateComponent(this.dragTarget.id, {
        top: clampedTop,
        left: clampedLeft
      });

      // 重置拖拽状态
      this.isDragging = false;
      this.dragTarget = null;
      this.editorContainer.style.cursor = '';
    });
  }

  // 开始拖拽移动
  startDrag(instance: ComponentInstance, e: MouseEvent): void {
    if (!instance.element) return;

    this.isDragging = true;
    this.dragTarget = instance;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startTop = instance.props.top;
    this.startLeft = instance.props.left;

    // 设置拖拽样式
    this.editorContainer.style.cursor = 'grabbing';
    instance.element.style.zIndex = '1000';
    instance.element.style.cursor = 'grabbing';
  }

  // 是否正在拖拽
  isDraggingNow(): boolean {
    return this.isDragging;
  }
}

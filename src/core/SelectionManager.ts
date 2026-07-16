import { Store } from '../state/store';
import { ComponentInstance } from '../types/component';

/**
 * 选中状态管理器
 * 负责管理组件的选中/取消选中状态，以及相关的视觉效果。
 *
 * 视觉效果：
 * - 选中的组件会添加 "selected" CSS 类（通常显示蓝色边框）
 * - 选中的组件会获得焦点（以便接收键盘事件，如 Delete 键）
 * - 右键点击选中的组件会显示删除按钮（红色的 X）
 *
 * 事件流：
 * 用户点击组件 → Editor → selectionManager.select(id)
 *   → store.selectComponent(id) → 触发 component:selected 事件
 *   → SelectionManager.updateSelectionVisual() 添加选中样式
 *   → PropertyPanel.updatePanel() 更新属性面板
 */
export class SelectionManager {
  private store: Store;

  constructor(store: Store) {
    this.store = store;

    // 监听选中状态变化，更新视觉效果
    this.store.on('component:selected', (id) => {
      this.updateSelectionVisual(id as string);
    });

    // 监听取消选中状态，清除视觉效果
    this.store.on('component:deselected', () => {
      this.clearAllSelectionVisuals();
    });
  }

  /**
   * 选中组件
   * @param componentId - 要选中的组件 ID
   *
   * 调用链：用户点击组件 → Editor → selectionManager.select(id)
   */
  select(componentId: string): void {
    this.store.selectComponent(componentId);
  }

  /**
   * 取消选中
   *
   * 调用链：用户点击画布空白处 → DragManager → selectionManager.deselect()
   */
  deselect(): void {
    this.store.selectComponent(null);
  }

  /**
   * 获取当前选中的组件
   * @returns 选中的组件，或 null
   */
  getSelected(): ComponentInstance | null {
    return this.store.getSelectedComponent();
  }

  /**
   * 更新选中组件的视觉效果
   * 1. 先清除所有组件的选中样式
   * 2. 给目标组件添加选中样式
   * 3. 让目标组件获得焦点（以便接收键盘事件）
   */
  private updateSelectionVisual(componentId: string): void {
    this.clearAllSelectionVisuals();

    const component = this.store.getComponentById(componentId);
    if (component?.element) {
      component.element.classList.add('selected');  // 添加选中样式
      component.element.focus();                    // 获得焦点
    }
  }

  /**
   * 清除所有选中样式和删除按钮
   * 在以下场景调用：
   * - 选中新的组件时（先清除旧的选中样式）
   * - 取消选中时
   */
  private clearAllSelectionVisuals(): void {
    // 遍历所有组件，移除 selected 类
    this.store.getComponents().forEach(component => {
      if (component.element) {
        component.element.classList.remove('selected');
      }
    });
    // 同时清除所有删除按钮
    this.clearDeleteButtons();
  }

  /**
   * 清除所有删除按钮
   * 删除按钮是右键点击组件时显示的红色 X 按钮
   */
  clearDeleteButtons(): void {
    document.querySelectorAll('.delbtn').forEach(btn => btn.remove());
  }

  /**
   * 创建删除按钮
   * @param component - 要删除的组件实例
   * @returns 删除按钮的 DOM 元素，创建失败返回 null
   *
   * 按钮位置：组件的右上角
   * 样式：20x20px 的红色方块，白色 X 文字
   */
  createDeleteButton(component: ComponentInstance): HTMLElement | null {
    if (!component.element) return null;

    const delbtn = document.createElement('div');
    delbtn.classList.add('delbtn');
    delbtn.style.position = 'absolute';
    delbtn.style.width = '20px';
    delbtn.style.height = '20px';
    delbtn.style.top = component.props.top + 'px';
    // 按钮位置：组件左边 + 组件宽度 - 按钮宽度
    delbtn.style.left = (component.props.left + component.props.width - 20) + 'px';
    delbtn.style.textAlign = 'center';
    delbtn.style.cursor = 'pointer';
    delbtn.style.color = '#fff';
    delbtn.textContent = 'X';

    return delbtn;
  }
}

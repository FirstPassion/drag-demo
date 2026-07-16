import { Store } from '../state/store';
import { ComponentInstance } from '../types/component';

/**
 * 选中状态管理器
 * 负责管理组件的选中/取消选中状态，以及相关的视觉效果。
 */
export class SelectionManager {
  private store: Store;

  constructor(store: Store) {
    this.store = store;

    this.store.on('component:selected', (id) => {
      this.updateSelectionVisual(id as string);
    });

    this.store.on('component:deselected', () => {
      this.clearAllSelectionVisuals();
    });
  }

  /** 选中组件 */
  select(componentId: string): void {
    this.store.selectComponent(componentId);
  }

  /** 取消选中 */
  deselect(): void {
    this.store.selectComponent(null);
  }

  /** 更新选中组件的视觉效果 */
  private updateSelectionVisual(componentId: string): void {
    this.clearAllSelectionVisuals();
    const component = this.store.getComponentById(componentId);
    if (component?.element) {
      component.element.classList.add('selected');
      component.element.focus();
    }
  }

  /** 清除所有选中样式和删除按钮 */
  private clearAllSelectionVisuals(): void {
    this.store.getComponents().forEach(component => {
      if (component.element) component.element.classList.remove('selected');
    });
    this.clearDeleteButtons();
  }

  /** 清除所有删除按钮 */
  clearDeleteButtons(): void {
    document.querySelectorAll('.delbtn').forEach(btn => btn.remove());
  }

  /** 创建删除按钮（位于组件右上角） */
  createDeleteButton(component: ComponentInstance): HTMLElement | null {
    if (!component.element) return null;

    const delbtn = document.createElement('div');
    delbtn.classList.add('delbtn');
    delbtn.style.position = 'absolute';
    delbtn.style.width = '20px';
    delbtn.style.height = '20px';
    delbtn.style.top = component.props.top + 'px';
    delbtn.style.left = (component.props.left + component.props.width - 20) + 'px';
    delbtn.style.textAlign = 'center';
    delbtn.style.cursor = 'pointer';
    delbtn.style.color = '#fff';
    delbtn.textContent = 'X';

    return delbtn;
  }
}

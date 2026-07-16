import { Store } from '../state/store';
import { ComponentInstance } from '../types/component';

// 选中状态管理
export class SelectionManager {
  private store: Store;

  constructor(store: Store) {
    this.store = store;

    // 监听选中状态变化，更新视觉效果
    this.store.on('component:selected', (id) => {
      this.updateSelectionVisual(id as string);
    });

    this.store.on('component:deselected', () => {
      this.clearAllSelectionVisuals();
    });
  }

  // 选中组件
  select(componentId: string): void {
    this.clearAllSelectionVisuals();
    this.store.selectComponent(componentId);
  }

  // 取消选中
  deselect(): void {
    this.clearAllSelectionVisuals();
    this.store.selectComponent(null);
  }

  // 获取当前选中的组件
  getSelected(): ComponentInstance | null {
    const selectedId = this.store.getSelectedId();
    if (!selectedId) return null;
    return this.store.getComponentById(selectedId) || null;
  }

  // 更新选中组件的视觉效果
  private updateSelectionVisual(componentId: string): void {
    // 清除所有选中样式
    this.clearAllSelectionVisuals();

    // 找到对应的DOM元素并添加选中样式
    const component = this.store.getComponentById(componentId);
    if (component?.element) {
      component.element.classList.add('selected');
      component.element.focus();
    }
  }

  // 清除所有选中样式
  private clearAllSelectionVisuals(): void {
    const components = this.store.getComponents();
    components.forEach(component => {
      if (component.element) {
        component.element.classList.remove('selected');
      }
    });

    // 同时清除删除按钮
    this.clearDeleteButtons();
  }

  // 清除所有删除按钮
  clearDeleteButtons(): void {
    const deleteButtons = document.querySelectorAll('.delbtn');
    deleteButtons.forEach(btn => btn.remove());
  }

  // 在选中元素的右上角创建删除按钮
  createDeleteButton(component: ComponentInstance): HTMLElement | null {
    if (!component.element) return null;

    // 先清除已有的删除按钮
    this.clearDeleteButtons();

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

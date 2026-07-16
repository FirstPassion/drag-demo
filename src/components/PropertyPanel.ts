import { Store } from '../state/store';
import { ComponentRegistry } from './ComponentRegistry';
import { ComponentInstance, PropertySchema } from '../types/component';

// 基础属性键名（宽度、高度、上边距、左边距）
const BASE_KEYS = ['width', 'height', 'top', 'left'] as const;

/**
 * 属性面板管理
 * 负责显示和编辑选中组件的属性。
 * 只显示组件实际拥有的属性，隐藏不存在的属性。
 */
export class PropertyPanel {
  private store: Store;
  private registry: ComponentRegistry;
  private inputs: HTMLInputElement[];
  private items: HTMLElement[];  // 所有属性项的 DOM 元素
  private container: HTMLElement | null;

  constructor(
    container: HTMLElement,
    store: Store,
    registry: ComponentRegistry
  ) {
    this.store = store;
    this.registry = registry;
    this.inputs = Array.from(container.querySelectorAll('.inp')) as HTMLInputElement[];
    // 获取所有属性项（.item 元素）
    this.items = Array.from(container.querySelectorAll('.item')) as HTMLElement[];
    this.container = container;

    this.store.on('component:selected', () => this.updatePanel());
    this.store.on('component:deselected', () => this.clearPanel());
    this.store.on('component:updated', () => this.updatePanel());

    this.updatePanel();
  }

  /** 更新属性面板 */
  updatePanel(): void {
    const selected = this.store.getSelectedComponent();
    if (!selected) {
      this.clearPanel();
      return;
    }

    const config = this.registry.getConfig(selected.type);
    if (!config) return;

    this.hidePlaceholder();

    // 先隐藏所有属性项
    this.items.forEach(item => item.classList.add('hidden'));

    // 显示基础属性项（前 4 个）
    BASE_KEYS.forEach((key, i) => {
      if (this.items[i]) {
        this.items[i].classList.remove('hidden');
        this.setInputValue(i, selected.props[key]);
      }
    });

    // 根据 schema 显示动态属性项
    config.propertySchema.forEach((prop, index) => {
      if (index >= 4 && index < this.items.length) {
        this.items[index].classList.remove('hidden');
        this.setLabel(index, prop.label);

        const value = selected.props[prop.key];
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
        this.setInputValue(index, displayValue as string | number | undefined);
      }
    });

    // 绑定输入框事件
    this.bindInputEvents(selected, config.propertySchema);
  }

  /** 设置输入框的值（数值类型自动取整） */
  private setInputValue(index: number, value: string | number | undefined): void {
    if (!this.inputs[index] || value === undefined) return;
    const displayValue = typeof value === 'number' ? Math.round(value) : value;
    this.inputs[index].value = String(displayValue);
    this.inputs[index].disabled = false;
    this.inputs[index].readOnly = false;
  }

  /** 更新输入框的标签 */
  private setLabel(index: number, text: string): void {
    const label = this.inputs[index]?.closest('.item')?.querySelector('.text');
    if (label) label.textContent = text;
  }

  /** 绑定输入框事件 */
  private bindInputEvents(instance: ComponentInstance, schema: PropertySchema[]): void {
    // 清除所有事件
    this.inputs.forEach(input => {
      input.oninput = null;
      input.onblur = null;
      input.onkeypress = null;
    });

    // 绑定基础属性事件
    BASE_KEYS.forEach((key, i) => {
      // 实时更新：输入时立即同步到组件
      this.inputs[i].oninput = () => this.handleInputChange(instance.id, key, this.inputs[i].value);
      this.inputs[i].onblur = () => this.handleInputChange(instance.id, key, this.inputs[i].value);
      this.inputs[i].onkeypress = (e) => this.handleKeyPress(e, instance.id, key, this.inputs[i].value);
    });

    // 绑定动态属性事件
    schema.forEach((prop, index) => {
      if (index >= 4 && index < this.inputs.length) {
        const input = this.inputs[index];
        input.oninput = () => this.handleInputChange(instance.id, prop.key, input.value, prop.type);
        input.onblur = () => this.handleInputChange(instance.id, prop.key, input.value, prop.type);
        input.onkeypress = (e) => this.handleKeyPress(e, instance.id, prop.key, input.value, prop.type);
      }
    });
  }

  /** 处理输入框变化 */
  private handleInputChange(instanceId: string, key: string, value: string, type?: string): void {
    const component = this.store.getComponentById(instanceId);
    if (!component) return;

    let processedValue: string | number = value;

    // 数值类型属性的处理
    if (type === 'number' || BASE_KEYS.includes(key as typeof BASE_KEYS[number])) {
      // 输入中允许为空或不完整的数字（用户可能正在输入）
      if (value === '' || value === '-') return;
      const num = parseInt(value, 10);
      if (isNaN(num)) return;
      processedValue = num;
    }

    this.store.updateComponent(instanceId, { [key]: processedValue });
  }

  /** 处理回车键 */
  private handleKeyPress(e: KeyboardEvent, instanceId: string, key: string, value: string, type?: string): void {
    if (e.key === 'Enter') this.handleInputChange(instanceId, key, value, type);
  }

  /** 清空属性面板 */
  clearPanel(): void {
    this.items.forEach(item => item.classList.add('hidden'));
    this.showPlaceholder();
  }

  /** 显示占位提示 */
  private showPlaceholder(): void {
    if (!this.container) return;
    let placeholder = this.container.querySelector('.panel-placeholder') as HTMLElement;
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.className = 'panel-placeholder';
      placeholder.textContent = '请选择一个组件';
      this.container.appendChild(placeholder);
    }
    placeholder.style.display = 'flex';
  }

  /** 隐藏占位提示 */
  private hidePlaceholder(): void {
    if (!this.container) return;
    const placeholder = this.container.querySelector('.panel-placeholder') as HTMLElement;
    if (placeholder) placeholder.style.display = 'none';
  }
}

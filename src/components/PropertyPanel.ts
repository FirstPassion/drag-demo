import { Store } from '../state/store';
import { ComponentRegistry } from './ComponentRegistry';
import { ComponentInstance, PropertySchema } from '../types/component';

/**
 * 属性面板管理
 * 负责显示和编辑选中组件的属性。
 *
 * 布局：
 * - 前 4 个输入框固定显示：宽度、高度、上边距、左边距
 * - 之后的输入框根据组件类型动态显示（如文本、颜色、字号等）
 *
 * 事件流：
 * 用户选中组件 → store.selectComponent() → 触发 component:selected 事件
 *   → PropertyPanel.updatePanel() → 读取选中组件的属性 → 填充到输入框
 *
 * 用户修改属性 → 输入框 onblur/onkeypress → handleInputChange()
 *   → store.updateComponent() → 触发 component:updated 事件
 *   → PropertyPanel.updatePanel() → 更新输入框显示
 */
export class PropertyPanel {
  private store: Store;
  private registry: ComponentRegistry;
  private inputs: HTMLInputElement[];  // 所有输入框的引用

  constructor(
    container: HTMLElement,
    store: Store,
    registry: ComponentRegistry
  ) {
    this.store = store;
    this.registry = registry;
    // 获取属性面板中所有的输入框
    this.inputs = Array.from(container.querySelectorAll('.inp')) as HTMLInputElement[];

    // 监听事件
    this.store.on('component:selected', () => this.updatePanel());
    this.store.on('component:deselected', () => this.clearPanel());
    this.store.on('component:updated', () => this.updatePanel());

    this.updatePanel();
  }

  /**
   * 更新属性面板
   * 根据当前选中的组件，更新所有输入框的值
   *
   * 流程：
   * 1. 获取当前选中的组件
   * 2. 如果没有选中组件，清空面板
   * 3. 设置基础属性（宽度、高度、上边距、左边距）
   * 4. 根据组件类型设置动态属性
   * 5. 绑定输入框事件
   */
  updatePanel(): void {
    const selected = this.store.getSelectedComponent();

    if (!selected) {
      this.clearPanel();
      return;
    }

    const config = this.registry.getConfig(selected.type);
    if (!config) return;

    // 设置基础属性值（前 4 个输入框）
    const baseKeys = ['width', 'height', 'top', 'left'] as const;
    baseKeys.forEach((key, i) => this.setInputValue(i, selected.props[key]));

    // 设置动态属性值（第 5 个及之后的输入框）
    this.setupDynamicInputs(selected, config.propertySchema);
    // 绑定输入框事件
    this.bindInputEvents(selected);
  }

  /**
   * 设置输入框的值
   * @param index - 输入框的索引
   * @param value - 要设置的值
   */
  private setInputValue(index: number, value: string | number | undefined): void {
    if (this.inputs[index] && value !== undefined) {
      this.inputs[index].value = String(value);
      this.inputs[index].disabled = false;
      this.inputs[index].readOnly = false;
    }
  }

  /**
   * 设置动态输入框
   * 根据组件的属性模式，设置第 5 个及之后的输入框
   *
   * @param instance - 组件实例
   * @param schema - 属性模式定义
   *
   * 例如：
   * - 文本组件：显示文本内容、颜色、字号
   * - 输入框组件：显示占位文本
   * - 图片组件：显示图片地址
   */
  private setupDynamicInputs(instance: ComponentInstance, schema: PropertySchema[]): void {
    // 先清空所有动态输入框
    for (let i = 4; i < this.inputs.length; i++) {
      this.inputs[i].value = '';
      this.inputs[i].disabled = true;
      this.inputs[i].readOnly = true;
    }

    // 根据 schema 设置对应输入框的值
    schema.forEach((prop, index) => {
      if (index >= 4 && index < this.inputs.length) {
        const value = instance.props[prop.key];
        if (value !== undefined && value !== '') {
          this.inputs[index].value = String(value);
          this.inputs[index].disabled = false;
          this.inputs[index].readOnly = false;
        }
      }
    });
  }

  /**
   * 绑定输入框事件
   * 为每个输入框绑定 onblur 和 onkeypress 事件
   *
   * - onblur: 输入框失去焦点时保存值
   * - onkeypress: 按回车键时保存值
   */
  private bindInputEvents(instance: ComponentInstance): void {
    // 先清除之前的事件绑定
    this.inputs.forEach(input => {
      input.onblur = null;
      input.onkeypress = null;
    });

    // 绑定基础属性事件（前 4 个输入框）
    const baseKeys = ['width', 'height', 'top', 'left'] as const;
    baseKeys.forEach((key, i) => {
      this.inputs[i].onblur = () => this.handleInputChange(instance.id, key, this.inputs[i].value);
      this.inputs[i].onkeypress = (e) => this.handleKeyPress(e, instance.id, key, this.inputs[i].value);
    });

    // 绑定动态属性事件（第 5 个及之后的输入框）
    const config = this.registry.getConfig(instance.type);
    config?.propertySchema.forEach((prop, index) => {
      if (index >= 4 && index < this.inputs.length) {
        const input = this.inputs[index];
        input.onblur = () => this.handleInputChange(instance.id, prop.key, input.value, prop.type);
        input.onkeypress = (e) => this.handleKeyPress(e, instance.id, prop.key, input.value, prop.type);
      }
    });
  }

  /**
   * 处理输入框变化
   * 当用户修改输入框内容并失去焦点时调用
   *
   * @param instanceId - 组件 ID
   * @param key - 属性名（如 'width'、'text' 等）
   * @param value - 输入的值
   * @param type - 属性类型（'number'、'text'、'color' 等）
   *
   * 数值类型的属性会被解析为整数，如果解析失败则忽略
   */
  private handleInputChange(
    instanceId: string,
    key: string,
    value: string,
    type?: string
  ): void {
    const component = this.store.getComponentById(instanceId);
    if (!component) return;

    let processedValue: string | number = value;

    // 数值类型的属性需要解析为整数
    if (type === 'number' || ['width', 'height', 'top', 'left'].includes(key)) {
      processedValue = parseInt(value, 10);
      if (isNaN(processedValue)) return;  // 解析失败则忽略
    }

    this.store.updateComponent(instanceId, { [key]: processedValue });
  }

  /**
   * 处理回车键
   * 按回车键时保存输入框的值
   */
  private handleKeyPress(e: KeyboardEvent, instanceId: string, key: string, value: string, type?: string): void {
    if (e.key === 'Enter') {
      this.handleInputChange(instanceId, key, value, type);
    }
  }

  /**
   * 清空属性面板
   * 取消选中组件时调用，清空所有输入框的值
   */
  clearPanel(): void {
    this.inputs.forEach(input => {
      input.value = '';
      input.disabled = false;
      input.readOnly = false;
      input.onblur = null;
      input.onkeypress = null;
    });
  }
}

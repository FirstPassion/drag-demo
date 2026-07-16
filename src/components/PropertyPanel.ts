import { Store } from '../state/store';
import { ComponentRegistry } from './ComponentRegistry';
import { ComponentInstance, PropertySchema } from '../types/component';

// 属性面板管理
export class PropertyPanel {
  private container: HTMLElement;
  private store: Store;
  private registry: ComponentRegistry;
  private inputs: HTMLInputElement[];

  constructor(
    container: HTMLElement,
    store: Store,
    registry: ComponentRegistry
  ) {
    this.container = container;
    this.store = store;
    this.registry = registry;
    this.inputs = [];

    // 初始化输入框
    this.initInputs();

    // 监听选中状态变化
    this.store.on('component:selected', () => this.updatePanel());
    this.store.on('component:deselected', () => this.clearPanel());
    this.store.on('component:updated', () => this.updatePanel());

    // 初始渲染
    this.updatePanel();
  }

  // 初始化输入框
  private initInputs(): void {
    this.inputs = Array.from(
      this.container.querySelectorAll('.inp')
    ) as HTMLInputElement[];
  }

  // 更新面板
  updatePanel(): void {
    const selected = this.getSelectedComponent();

    if (!selected) {
      this.clearPanel();
      return;
    }

    const config = this.registry.getConfig(selected.type);
    if (!config) return;

    // 设置属性值
    this.setInputValue(0, selected.props.width);
    this.setInputValue(1, selected.props.height);
    this.setInputValue(2, selected.props.top);
    this.setInputValue(3, selected.props.left);

    // 根据组件类型设置其他属性
    this.setupDynamicInputs(selected, config.propertySchema);

    // 绑定事件
    this.bindInputEvents(selected);
  }

  // 设置输入框值
  private setInputValue(index: number, value: string | number | undefined): void {
    if (this.inputs[index] && value !== undefined) {
      this.inputs[index].value = String(value);
      this.inputs[index].disabled = false;
      this.inputs[index].readOnly = false;
    }
  }

  // 设置动态输入框
  private setupDynamicInputs(
    instance: ComponentInstance,
    schema: PropertySchema[]
  ): void {
    // 清除所有动态输入框
    for (let i = 4; i < this.inputs.length; i++) {
      this.inputs[i].value = '';
      this.inputs[i].disabled = true;
      this.inputs[i].readOnly = true;
    }

    // 根据schema设置对应输入框
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

  // 绑定输入框事件
  private bindInputEvents(instance: ComponentInstance): void {
    // 清除之前的事件
    this.inputs.forEach(input => {
      input.onblur = null;
      input.onkeypress = null;
    });

    // width
    this.inputs[0].onblur = () => this.handleInputChange(instance.id, 'width', this.inputs[0].value);
    this.inputs[0].onkeypress = (e) => this.handleKeyPress(e, instance.id, 'width', this.inputs[0].value);

    // height
    this.inputs[1].onblur = () => this.handleInputChange(instance.id, 'height', this.inputs[1].value);
    this.inputs[1].onkeypress = (e) => this.handleKeyPress(e, instance.id, 'height', this.inputs[1].value);

    // top
    this.inputs[2].onblur = () => this.handleInputChange(instance.id, 'top', this.inputs[2].value);
    this.inputs[2].onkeypress = (e) => this.handleKeyPress(e, instance.id, 'top', this.inputs[2].value);

    // left
    this.inputs[3].onblur = () => this.handleInputChange(instance.id, 'left', this.inputs[3].value);
    this.inputs[3].onkeypress = (e) => this.handleKeyPress(e, instance.id, 'left', this.inputs[3].value);

    // 其他属性（根据组件类型）
    this.bindDynamicInputEvents(instance);
  }

  // 绑定动态输入框事件
  private bindDynamicInputEvents(instance: ComponentInstance): void {
    const config = this.registry.getConfig(instance.type);
    if (!config) return;

    config.propertySchema.forEach((prop, index) => {
      if (index >= 4 && index < this.inputs.length) {
        const input = this.inputs[index];
        input.onblur = () => {
          this.handleInputChange(instance.id, prop.key, input.value, prop.type);
        };
        input.onkeypress = (e) => {
          this.handleKeyPress(e, instance.id, prop.key, input.value, prop.type);
        };
      }
    });
  }

  // 处理输入框变化
  private handleInputChange(
    instanceId: string,
    key: string,
    value: string,
    type?: string
  ): void {
    const component = this.store.getComponentById(instanceId);
    if (!component) return;

    let processedValue: string | number | boolean = value;

    // 根据类型处理值
    if (type === 'number' || key === 'width' || key === 'height' || key === 'top' || key === 'left') {
      processedValue = parseInt(value, 10);
      if (isNaN(processedValue)) return;
    }

    this.store.updateComponent(instanceId, { [key]: processedValue });
  }

  // 处理回车键
  private handleKeyPress(
    e: KeyboardEvent,
    instanceId: string,
    key: string,
    value: string,
    type?: string
  ): void {
    if (e.key === 'Enter') {
      this.handleInputChange(instanceId, key, value, type);
    }
  }

  // 获取当前选中的组件
  private getSelectedComponent(): ComponentInstance | null {
    const selectedId = this.store.getSelectedId();
    if (!selectedId) return null;
    return this.store.getComponentById(selectedId) || null;
  }

  // 清空面板
  clearPanel(): void {
    this.inputs.forEach(input => {
      input.value = '';
      input.disabled = false;
      input.readOnly = false;
      input.onblur = null;
      input.onkeypress = null;
    });
  }

  // 获取容器元素
  getContainer(): HTMLElement {
    return this.container;
  }
}

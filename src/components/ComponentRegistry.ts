import { ComponentType, ComponentConfig, ComponentInstance, ComponentProps } from '../types/component';

// 组件注册表和配置
export class ComponentRegistry {
  private configs: Map<ComponentType, ComponentConfig>;

  constructor() {
    this.configs = new Map();
    this.registerDefaultComponents();
  }

  // 注册默认组件
  private registerDefaultComponents(): void {
    // 文本组件
    this.register({
      type: ComponentType.Text,
      name: '预览文本',
      defaultProps: {
        width: 150,
        height: 40,
        text: '预览文本',
        color: '#333333',
        fontSize: '14px'
      },
      propertySchema: [
        { key: 'width', label: '宽度', type: 'number', unit: 'px' },
        { key: 'height', label: '高度', type: 'number', unit: 'px' },
        { key: 'top', label: '上边距', type: 'number', unit: 'px' },
        { key: 'left', label: '左边距', type: 'number', unit: 'px' },
        { key: 'text', label: '文本内容', type: 'text' },
        { key: 'color', label: '文字颜色', type: 'color' },
        { key: 'fontSize', label: '字号', type: 'text', unit: 'px' }
      ]
    });

    // 按钮组件
    this.register({
      type: ComponentType.Button,
      name: '预览按钮',
      defaultProps: {
        width: 120,
        height: 36,
        text: '预览按钮'
      },
      propertySchema: [
        { key: 'width', label: '宽度', type: 'number', unit: 'px' },
        { key: 'height', label: '高度', type: 'number', unit: 'px' },
        { key: 'top', label: '上边距', type: 'number', unit: 'px' },
        { key: 'left', label: '左边距', type: 'number', unit: 'px' },
        { key: 'text', label: '按钮文本', type: 'text' },
        { key: 'color', label: '文字颜色', type: 'color' },
        { key: 'fontSize', label: '字号', type: 'text', unit: 'px' }
      ]
    });

    // 输入框组件
    this.register({
      type: ComponentType.Input,
      name: '预览输入框',
      defaultProps: {
        width: 200,
        height: 36,
        placeholder: '预览输入框'
      },
      propertySchema: [
        { key: 'width', label: '宽度', type: 'number', unit: 'px' },
        { key: 'height', label: '高度', type: 'number', unit: 'px' },
        { key: 'top', label: '上边距', type: 'number', unit: 'px' },
        { key: 'left', label: '左边距', type: 'number', unit: 'px' },
        { key: 'placeholder', label: '占位文本', type: 'text' }
      ]
    });

    // 图片组件
    this.register({
      type: ComponentType.Image,
      name: '示例图片',
      defaultProps: {
        width: 150,
        height: 100,
        src: './img/demo.jpg'
      },
      propertySchema: [
        { key: 'width', label: '宽度', type: 'number', unit: 'px' },
        { key: 'height', label: '高度', type: 'number', unit: 'px' },
        { key: 'top', label: '上边距', type: 'number', unit: 'px' },
        { key: 'left', label: '左边距', type: 'number', unit: 'px' },
        { key: 'src', label: '图片地址', type: 'text' }
      ]
    });

    // 文本域组件
    this.register({
      type: ComponentType.Textarea,
      name: '预览文本域',
      defaultProps: {
        width: 200,
        height: 80,
        placeholder: '预览文本域'
      },
      propertySchema: [
        { key: 'width', label: '宽度', type: 'number', unit: 'px' },
        { key: 'height', label: '高度', type: 'number', unit: 'px' },
        { key: 'top', label: '上边距', type: 'number', unit: 'px' },
        { key: 'left', label: '左边距', type: 'number', unit: 'px' },
        { key: 'placeholder', label: '占位文本', type: 'text' }
      ]
    });

    // 下拉选择组件
    this.register({
      type: ComponentType.Select,
      name: '下拉选择',
      defaultProps: {
        width: 150,
        height: 36,
        options: [
          { label: '选项1', value: '1' },
          { label: '选项2', value: '2' },
          { label: '选项3', value: '3' }
        ]
      },
      propertySchema: [
        { key: 'width', label: '宽度', type: 'number', unit: 'px' },
        { key: 'height', label: '高度', type: 'number', unit: 'px' },
        { key: 'top', label: '上边距', type: 'number', unit: 'px' },
        { key: 'left', label: '左边距', type: 'number', unit: 'px' }
      ]
    });

    // 复选框组件
    this.register({
      type: ComponentType.Checkbox,
      name: '复选框',
      defaultProps: {
        width: 120,
        height: 30,
        text: '复选框',
        checked: false
      },
      propertySchema: [
        { key: 'width', label: '宽度', type: 'number', unit: 'px' },
        { key: 'height', label: '高度', type: 'number', unit: 'px' },
        { key: 'top', label: '上边距', type: 'number', unit: 'px' },
        { key: 'left', label: '左边距', type: 'number', unit: 'px' },
        { key: 'text', label: '标签文本', type: 'text' }
      ]
    });

    // 单选框组件
    this.register({
      type: ComponentType.Radio,
      name: '单选框',
      defaultProps: {
        width: 120,
        height: 30,
        text: '单选框',
        checked: false
      },
      propertySchema: [
        { key: 'width', label: '宽度', type: 'number', unit: 'px' },
        { key: 'height', label: '高度', type: 'number', unit: 'px' },
        { key: 'top', label: '上边距', type: 'number', unit: 'px' },
        { key: 'left', label: '左边距', type: 'number', unit: 'px' },
        { key: 'text', label: '标签文本', type: 'text' }
      ]
    });

    // 滑块组件
    this.register({
      type: ComponentType.Range,
      name: '滑块',
      defaultProps: {
        width: 200,
        height: 30,
        value: 50
      },
      propertySchema: [
        { key: 'width', label: '宽度', type: 'number', unit: 'px' },
        { key: 'height', label: '高度', type: 'number', unit: 'px' },
        { key: 'top', label: '上边距', type: 'number', unit: 'px' },
        { key: 'left', label: '左边距', type: 'number', unit: 'px' },
        { key: 'value', label: '当前值', type: 'number' }
      ]
    });
  }

  // 注册组件配置
  register(config: ComponentConfig): void {
    this.configs.set(config.type, config);
  }

  // 获取组件配置
  getConfig(type: ComponentType): ComponentConfig | undefined {
    return this.configs.get(type);
  }

  // 创建组件实例
  createInstance(type: ComponentType, overrides?: Partial<ComponentProps>): ComponentInstance {
    const config = this.configs.get(type);
    if (!config) {
      throw new Error(`Unknown component type: ${type}`);
    }

    const id = `comp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const props = { ...config.defaultProps, ...overrides } as ComponentProps;

    return {
      id,
      type,
      props
    };
  }

  // 获取所有组件类型
  getAllTypes(): ComponentType[] {
    return Array.from(this.configs.keys());
  }

  // 获取所有组件配置
  getAllConfigs(): ComponentConfig[] {
    return Array.from(this.configs.values());
  }

  // 根据类型创建DOM元素
  createElement(type: ComponentType, props: ComponentProps): HTMLElement {
    const config = this.configs.get(type);
    if (!config) {
      throw new Error(`Unknown component type: ${type}`);
    }

    let element: HTMLElement;

    switch (type) {
      case ComponentType.Text:
        element = document.createElement('p');
        element.textContent = props.text || '';
        break;

      case ComponentType.Button:
        element = document.createElement('button');
        element.textContent = props.text || '';
        break;

      case ComponentType.Input:
        element = document.createElement('input');
        (element as HTMLInputElement).type = 'text';
        element.setAttribute('placeholder', props.placeholder || '');
        break;

      case ComponentType.Image:
        element = document.createElement('img');
        element.setAttribute('src', props.src || '');
        (element as HTMLImageElement).alt = '图片';
        break;

      case ComponentType.Textarea:
        element = document.createElement('textarea');
        element.setAttribute('placeholder', props.placeholder || '');
        break;

      case ComponentType.Select: {
        const wrapper = document.createElement('div');
        wrapper.classList.add('select-wrapper');
        const select = document.createElement('select');
        (props.options || []).forEach(opt => {
          const option = document.createElement('option');
          option.value = String(opt.value);
          option.textContent = opt.label;
          select.appendChild(option);
        });
        wrapper.appendChild(select);
        element = wrapper;
        break;
      }

      case ComponentType.Checkbox: {
        const container = document.createElement('div');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = props.checked || false;
        const label = document.createElement('label');
        label.textContent = props.text || '';
        container.appendChild(input);
        container.appendChild(label);
        element = container;
        break;
      }

      case ComponentType.Radio: {
        const radioContainer = document.createElement('div');
        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.name = `radio_${Date.now()}`;
        radioInput.checked = props.checked || false;
        const radioLabel = document.createElement('label');
        radioLabel.textContent = props.text || '';
        radioContainer.appendChild(radioInput);
        radioContainer.appendChild(radioLabel);
        element = radioContainer;
        break;
      }

      case ComponentType.Range: {
        const rangeContainer = document.createElement('div');
        const rangeInput = document.createElement('input');
        rangeInput.type = 'range';
        rangeInput.min = '0';
        rangeInput.max = '100';
        rangeInput.value = String(props.value || 50);
        const rangeLabel = document.createElement('span');
        rangeLabel.textContent = '滑块';
        rangeContainer.appendChild(rangeInput);
        rangeContainer.appendChild(rangeLabel);
        element = rangeContainer;
        break;
      }

      default:
        element = document.createElement('div');
    }

    // 应用基础样式
    element.style.width = `${props.width}px`;
    element.style.height = `${props.height}px`;
    element.style.position = 'absolute';
    element.style.top = `${props.top}px`;
    element.style.left = `${props.left}px`;

    // 应用可选样式
    if (props.color) {
      element.style.color = props.color;
    }
    if (props.fontSize) {
      element.style.fontSize = props.fontSize;
    }
    if (props.src && type === ComponentType.Image) {
      (element as HTMLImageElement).style.objectFit = 'contain';
    }

    return element;
  }
}

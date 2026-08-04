import { ComponentType, ComponentConfig, ComponentInstance, ComponentProps, PropertySchema } from '../types/component';

/**
 * 所有组件共用的基础属性模式
 * 每个组件都有这 4 个基础属性：宽度、高度、上边距、左边距
 */
const BASE_SCHEMA: PropertySchema[] = [
  { key: 'width', label: '宽度', type: 'number', unit: 'px' },
  { key: 'height', label: '高度', type: 'number', unit: 'px' },
  { key: 'top', label: '上边距', type: 'number', unit: 'px' },
  { key: 'left', label: '左边距', type: 'number', unit: 'px' },
];

/**
 * 组件注册表
 * 管理所有组件类型的配置和创建。
 *
 * 职责：
 * 1. 注册所有支持的组件类型（文本、按钮、输入框等）
 * 2. 存储每种组件的默认属性和属性模式
 * 3. 根据类型创建组件实例
 * 4. 根据类型和属性创建 DOM 元素
 *
 * 使用场景：
 * - DragManager 创建组件实例：registry.createInstance(type, overrides)
 * - Editor 渲染组件：registry.createElement(type, props)
 * - ComponentLibrary 显示组件列表：registry.getAllConfigs()
 * - PropertyPanel 显示属性模式：registry.getConfig(type).propertySchema
 */
export class ComponentRegistry {
  private configs: Map<ComponentType, ComponentConfig>;

  constructor() {
    this.configs = new Map();
    this.registerDefaultComponents();
  }

  /**
   * 注册默认组件
   * 在构造时自动调用，注册所有支持的组件类型
   */
  private registerDefaultComponents(): void {
    // 文本组件
    this.register({
      type: ComponentType.Text,
      name: '预览文本',
      defaultProps: { width: 150, height: 40, text: '预览文本', color: '#333333', fontSize: '14px' },
      propertySchema: [...BASE_SCHEMA, { key: 'text', label: '文本内容', type: 'text' }, { key: 'color', label: '文字颜色', type: 'color' }, { key: 'fontSize', label: '字号', type: 'text', unit: 'px' }]
    });

    // 按钮组件
    this.register({
      type: ComponentType.Button,
      name: '预览按钮',
      defaultProps: { width: 120, height: 36, text: '预览按钮' },
      propertySchema: [...BASE_SCHEMA, { key: 'text', label: '按钮文本', type: 'text' }, { key: 'color', label: '文字颜色', type: 'color' }, { key: 'fontSize', label: '字号', type: 'text', unit: 'px' }]
    });

    // 输入框组件
    this.register({
      type: ComponentType.Input,
      name: '预览输入框',
      defaultProps: { width: 200, height: 36, placeholder: '预览输入框' },
      propertySchema: [...BASE_SCHEMA, { key: 'placeholder', label: '占位文本', type: 'text' }]
    });

    // 图片组件
    this.register({
      type: ComponentType.Image,
      name: '示例图片',
      defaultProps: { width: 150, height: 100, src: './img/demo.jpg' },
      propertySchema: [...BASE_SCHEMA, { key: 'src', label: '图片地址', type: 'text' }]
    });

    // 文本域组件
    this.register({
      type: ComponentType.Textarea,
      name: '预览文本域',
      defaultProps: { width: 200, height: 80, placeholder: '预览文本域' },
      propertySchema: [...BASE_SCHEMA, { key: 'placeholder', label: '占位文本', type: 'text' }]
    });

    // 下拉选择组件
    this.register({
      type: ComponentType.Select,
      name: '下拉选择',
      defaultProps: { width: 150, height: 36, options: [{ label: '选项1', value: '1' }, { label: '选项2', value: '2' }, { label: '选项3', value: '3' }] },
      propertySchema: [...BASE_SCHEMA]
    });

    // 复选框组件
    this.register({
      type: ComponentType.Checkbox,
      name: '复选框',
      defaultProps: { width: 120, height: 30, text: '复选框', checked: false },
      propertySchema: [...BASE_SCHEMA, { key: 'text', label: '标签文本', type: 'text' }]
    });

    // 单选框组件
    this.register({
      type: ComponentType.Radio,
      name: '单选框',
      defaultProps: { width: 120, height: 30, text: '单选框', checked: false },
      propertySchema: [...BASE_SCHEMA, { key: 'text', label: '标签文本', type: 'text' }]
    });

    // 滑块组件
    this.register({
      type: ComponentType.Range,
      name: '滑块',
      defaultProps: { width: 200, height: 30, value: 50 },
      propertySchema: [...BASE_SCHEMA, { key: 'value', label: '当前值', type: 'number' }]
    });
  }

  /** 注册组件配置（内部使用） */
  private register(config: ComponentConfig): void {
    this.configs.set(config.type, config);
  }

  /**
   * 获取组件配置
   * @param type - 组件类型
   * @returns 组件配置，如果类型不存在返回 undefined
   */
  getConfig(type: ComponentType): ComponentConfig | undefined {
    return this.configs.get(type);
  }

  /**
   * 创建组件实例
   * @param type - 组件类型
   * @param overrides - 覆盖默认属性的值
   * @returns 新创建的组件实例
   *
   * 组件 ID 格式：comp_{时间戳}_{随机字符串}
   * 例如：comp_1623456789000_abc1234
   */
  createInstance(type: ComponentType, overrides?: Partial<ComponentProps>): ComponentInstance {
    const config = this.configs.get(type);
    if (!config) throw new Error(`Unknown component type: ${type}`);

    // 生成唯一 ID
    const id = `comp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    // 合并默认属性和覆盖属性
    const props = { ...config.defaultProps, ...overrides } as ComponentProps;

    return { id, type, props };
  }

  /**
   * 获取所有组件配置
   * 用于在组件库中显示所有可用组件
   */
  getAllConfigs(): ComponentConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * 创建复选框/单选框的公共方法
   * 这两种组件的 DOM 结构几乎相同，只是 input type 不同
   *
   * @param type - 组件类型（Checkbox 或 Radio）
   * @param props - 组件属性
   * @returns 创建的 DOM 元素
   */
  private createCheckRadio(type: ComponentType.Checkbox | ComponentType.Radio, props: ComponentProps): HTMLElement {
    const container = document.createElement('div');
    const input = document.createElement('input');
    input.type = type === ComponentType.Checkbox ? 'checkbox' : 'radio';
    if (type === ComponentType.Radio) input.name = `radio_${Date.now()}`;
    input.checked = props.checked || false;
    const label = document.createElement('label');
    label.textContent = props.text || '';
    container.appendChild(input);
    container.appendChild(label);
    return container;
  }

  /**
   * 根据类型创建 DOM 元素
   * @param type - 组件类型
   * @param props - 组件属性
   * @returns 创建的 DOM 元素
   *
   * 每种组件类型的 DOM 结构：
   * - Text: <p>文本内容</p>
   * - Button: <button>按钮文本</button>
   * - Input: <input placeholder="...">
   * - Image: <img src="...">
   * - Textarea: <textarea placeholder="...">
   * - Select: <div class="select-wrapper"><select>...</select></div>
   * - Checkbox: <div><input type="checkbox"><label>标签</label></div>
   * - Radio: <div><input type="radio"><label>标签</label></div>
   * - Range: <div><input type="range"><span>滑块</span></div>
   *
   * 所有组件都会设置以下样式：
   * - position: absolute（绝对定位）
   * - width, height, top, left（根据属性）
   * - color, fontSize（如果属性中定义了）
   */
  createElement(type: ComponentType, props: ComponentProps): HTMLElement {
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
        // select 元素需要用 div 包装，以便更好地控制样式和拖拽行为
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
      case ComponentType.Checkbox:
        element = this.createCheckRadio(type, props);
        break;
      case ComponentType.Radio:
        element = this.createCheckRadio(type, props);
        break;
      case ComponentType.Range: {
        const container = document.createElement('div');
        const input = document.createElement('input');
        input.type = 'range';
        input.min = '0';
        input.max = '100';
        input.value = String(props.value || 50);
        const label = document.createElement('span');
        label.textContent = '滑块';
        container.appendChild(input);
        container.appendChild(label);
        element = container;
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

    // 禁用原生拖拽（尤其 img 默认可拖拽），避免浏览器劫持鼠标手势，
    // 导致画布上组件无法通过 MoveManager 正常移动/放置
    element.draggable = false;

    // 应用可选样式
    if (props.color) element.style.color = props.color;
    if (props.fontSize) element.style.fontSize = props.fontSize;
    if (props.src && type === ComponentType.Image) {
      (element as HTMLImageElement).style.objectFit = 'contain';
    }

    return element;
  }
}

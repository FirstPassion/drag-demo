// 组件类型枚举
export enum ComponentType {
  Text = 'text',
  Button = 'button',
  Input = 'input',
  Image = 'image',
  Textarea = 'textarea',
  Select = 'select',
  Checkbox = 'checkbox',
  Radio = 'radio',
  Range = 'range',
  Custom = 'custom'
}

// 选项接口
export interface SelectOption {
  label: string;
  value: string | number;
}

// 组件属性接口
export interface ComponentProps {
  width: number;
  height: number;
  top: number;
  left: number;
  text?: string;
  src?: string;
  color?: string;
  fontSize?: string;
  placeholder?: string;
  value?: string | number;
  checked?: boolean;
  options?: SelectOption[];
}

// 属性模式定义
export interface PropertySchema {
  key: keyof ComponentProps;
  label: string;
  type: 'text' | 'number' | 'color' | 'select' | 'boolean';
  options?: SelectOption[];
  defaultValue?: unknown;
  unit?: string;
}

// 组件配置接口
export interface ComponentConfig {
  type: ComponentType;
  name: string;
  icon?: string;
  defaultProps: Partial<ComponentProps>;
  propertySchema: PropertySchema[];
}

// 画布上的组件实例
export interface ComponentInstance {
  id: string;
  type: ComponentType;
  props: ComponentProps;
  element?: HTMLElement;
}

/**
 * 组件类型枚举
 * 定义了所有支持的组件类型
 *
 * 每种类型对应一种 UI 组件：
 * - Text: 文本段落
 * - Button: 按钮
 * - Input: 单行输入框
 * - Image: 图片
 * - Textarea: 多行文本域
 * - Select: 下拉选择框
 * - Checkbox: 复选框
 * - Radio: 单选框
 * - Range: 滑块
 */
export enum ComponentType {
  Text = 'text',
  Button = 'button',
  Input = 'input',
  Image = 'image',
  Textarea = 'textarea',
  Select = 'select',
  Checkbox = 'checkbox',
  Radio = 'radio',
  Range = 'range'
}

/**
 * 下拉选项接口
 * 用于 Select 组件的选项配置
 */
export interface SelectOption {
  label: string;           // 选项显示文本
  value: string | number;  // 选项值
}

/**
 * 组件属性接口
 * 定义了所有组件可能拥有的属性
 *
 * 基础属性（所有组件都有）：
 * - width, height: 组件尺寸
 * - top, left: 组件在画布上的位置
 *
 * 可选属性（根据组件类型）：
 * - text: 文本内容（Text、Button、Checkbox、Radio）
 * - src: 图片地址（Image）
 * - color: 文字颜色（Text、Button）
 * - fontSize: 字号（Text、Button）
 * - placeholder: 占位文本（Input、Textarea）
 * - value: 值（Range）
 * - checked: 是否选中（Checkbox、Radio）
 * - options: 选项列表（Select）
 */
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

/**
 * 属性模式定义接口
 * 用于在属性面板中显示和编辑组件属性
 */
export interface PropertySchema {
  key: keyof ComponentProps;
  label: string;
  type: 'text' | 'number' | 'color' | 'select' | 'boolean';
  unit?: string;
}

/**
 * 组件配置接口
 * 定义了组件类型的完整配置信息
 */
export interface ComponentConfig {
  type: ComponentType;
  name: string;
  defaultProps: Partial<ComponentProps>;
  propertySchema: PropertySchema[];
}

/**
 * 组件实例接口
 * 表示画布上的一个具体组件
 *
 * 与 ComponentConfig 的区别：
 * - ComponentConfig: 组件类型的配置（模板）
 * - ComponentInstance: 画布上的具体组件（实例）
 */
export interface ComponentInstance {
  id: string;                    // 唯一标识（如 "comp_1623456789000_abc1234"）
  type: ComponentType;           // 组件类型
  props: ComponentProps;         // 组件属性
  element?: HTMLElement;         // 对应的 DOM 元素（渲染后设置）
}

import { ComponentRegistry } from './ComponentRegistry';
import { DragManager } from '../core/DragManager';
import { ComponentType } from '../types/component';

// 组件库管理
export class ComponentLibrary {
  private container: HTMLElement;
  private registry: ComponentRegistry;
  private dragManager: DragManager;

  constructor(
    container: HTMLElement,
    registry: ComponentRegistry,
    dragManager: DragManager
  ) {
    this.container = container;
    this.registry = registry;
    this.dragManager = dragManager;

    // 渲染组件列表
    this.render();
  }

  // 渲染组件库
  render(): void {
    // 清除容器（保留标题）
    const title = this.container.querySelector('h3');
    this.container.innerHTML = '';
    if (title) {
      this.container.appendChild(title);
    }

    // 渲染所有组件
    const configs = this.registry.getAllConfigs();
    configs.forEach(config => {
      const element = this.renderComponentItem(config.type);
      this.container.appendChild(element);
    });
  }

  // 渲染单个组件项
  private renderComponentItem(type: ComponentType): HTMLElement {
    const config = this.registry.getConfig(type);
    if (!config) {
      throw new Error(`Unknown component type: ${type}`);
    }

    // 创建卡片容器
    const card = document.createElement('div');
    card.classList.add('comp-card');
    card.setAttribute('draggable', 'true');

    // 图标
    const iconMap: Record<string, string> = {
      [ComponentType.Text]: 'T',
      [ComponentType.Button]: 'B',
      [ComponentType.Input]: 'I',
      [ComponentType.Image]: 'IMG',
      [ComponentType.Textarea]: 'TXT',
      [ComponentType.Select]: 'SEL',
      [ComponentType.Checkbox]: 'CHK',
      [ComponentType.Radio]: 'RDO',
      [ComponentType.Range]: 'RNG',
    };

    const descMap: Record<string, string> = {
      [ComponentType.Text]: '可编辑文本组件',
      [ComponentType.Button]: '可点击按钮组件',
      [ComponentType.Input]: '文本输入组件',
      [ComponentType.Image]: '图片展示组件',
      [ComponentType.Textarea]: '多行文本组件',
      [ComponentType.Select]: '下拉选择组件',
      [ComponentType.Checkbox]: '多选组件',
      [ComponentType.Radio]: '单选组件',
      [ComponentType.Range]: '范围选择组件',
    };

    const icon = document.createElement('div');
    icon.classList.add('comp-icon');
    icon.textContent = iconMap[type] || '?';

    const info = document.createElement('div');
    const label = document.createElement('div');
    label.classList.add('comp-label');
    label.textContent = config.name;
    const desc = document.createElement('div');
    desc.classList.add('comp-desc');
    desc.textContent = descMap[type] || '';
    info.appendChild(label);
    info.appendChild(desc);

    card.appendChild(icon);
    card.appendChild(info);

    // 设置拖拽事件
    this.dragManager.setupComponentDrag(card, type);

    // 设置特殊组件的事件
    this.dragManager.setupSpecialComponentEvents(card);

    return card;
  }

  // 获取容器元素
  getContainer(): HTMLElement {
    return this.container;
  }
}

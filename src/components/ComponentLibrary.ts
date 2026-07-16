import { ComponentRegistry } from './ComponentRegistry';
import { DragManager } from '../core/DragManager';
import { ComponentType } from '../types/component';

/**
 * 组件类型到图标的映射
 * 用于在组件库中显示组件的简写图标
 */
const ICON_MAP: Record<string, string> = {
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

/**
 * 组件类型到描述的映射
 * 用于在组件库中显示组件的简短描述
 */
const DESC_MAP: Record<string, string> = {
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

/**
 * 组件库管理
 * 负责在左侧面板显示所有可用的组件，并设置拖拽事件。
 *
 * 布局结构：
 * <div id="left">
 *   <h3>组件库</h3>
 *   <div class="comp-card" draggable="true">...</div>
 *   <div class="comp-card" draggable="true">...</div>
 *   ...
 * </div>
 *
 * 每个组件卡片包含：
 * - 图标（如 T、B、I 等）
 * - 组件名称（如"预览文本"）
 * - 组件描述（如"可编辑文本组件"）
 *
 * 交互：
 * - 用户可以拖拽组件卡片到画布区域
 * - 特殊组件（select、checkbox、radio）需要阻止其默认交互
 */
export class ComponentLibrary {
  constructor(
    private container: HTMLElement,      // 组件库的容器元素
    private registry: ComponentRegistry, // 组件注册表
    private dragManager: DragManager     // 拖拽管理器
  ) {
    this.render();
  }

  /**
   * 渲染组件库
   * 从注册表获取所有组件配置，为每个组件创建卡片
   */
  render(): void {
    // 清空容器（保留标题）
    const title = this.container.querySelector('h3');
    this.container.innerHTML = '';
    if (title) this.container.appendChild(title);

    // 为每个组件类型创建卡片
    this.registry.getAllConfigs().forEach(config => {
      this.container.appendChild(this.renderComponentItem(config.type));
    });
  }

  /**
   * 渲染单个组件卡片
   * @param type - 组件类型
   * @returns 组件卡片的 DOM 元素
   *
   * 结构：
   * <div class="comp-card" draggable="true">
   *   <div class="comp-icon">T</div>
   *   <div>
   *     <div class="comp-label">预览文本</div>
   *     <div class="comp-desc">可编辑文本组件</div>
   *   </div>
   * </div>
   */
  private renderComponentItem(type: ComponentType): HTMLElement {
    const config = this.registry.getConfig(type)!;

    // 创建卡片容器
    const card = document.createElement('div');
    card.classList.add('comp-card');
    card.setAttribute('draggable', 'true');  // 启用拖拽

    // 创建图标
    const icon = document.createElement('div');
    icon.classList.add('comp-icon');
    icon.textContent = ICON_MAP[type] || '?';

    // 创建信息区域
    const info = document.createElement('div');
    const label = document.createElement('div');
    label.classList.add('comp-label');
    label.textContent = config.name;
    const desc = document.createElement('div');
    desc.classList.add('comp-desc');
    desc.textContent = DESC_MAP[type] || '';
    info.appendChild(label);
    info.appendChild(desc);

    // 组装卡片
    card.appendChild(icon);
    card.appendChild(info);

    // 设置拖拽事件（由 DragManager 处理）
    this.dragManager.setupComponentDrag(card, type);
    // 设置特殊组件的事件（阻止 select、checkbox 等的默认交互）
    this.dragManager.setupSpecialComponentEvents(card);

    return card;
  }
}

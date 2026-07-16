import { AppState, AppEventType, AppEventHandler } from '../types';
import { ComponentInstance } from '../types/component';

/**
 * 中央状态管理器（发布/订阅模式）
 *
 * 整个应用只有一个 Store 实例，所有组件状态都存储在这里。
 * 其他模块通过订阅事件来响应状态变化。
 *
 * 核心设计：
 * - 单一数据源：所有状态集中管理
 * - 不可变更新：通过 setState() 更新，触发事件通知
 * - 事件驱动：其他模块通过 on() 订阅事件
 *
 * 数据流向：
 *   用户操作 → DragManager/MoveManager/SelectionManager → Store.setState()
 *     → 触发 state:changed 事件 → Editor.render() 重新渲染
 *     → 触发 component:selected 事件 → PropertyPanel 更新属性面板
 */
export class Store {
  private state: AppState;
  private listeners: Map<AppEventType, Set<AppEventHandler>>;

  constructor(initialState: AppState) {
    this.state = initialState;
    this.listeners = new Map();
  }

  /**
   * 获取当前状态（只读）
   * 注意：返回的是状态对象的引用，不是副本
   */
  getState(): Readonly<AppState> {
    return this.state;
  }

  /**
   * 更新状态
   * @param partial - 要更新的部分状态
   *
   * 这是更新状态的唯一入口，所有状态变更都必须通过此方法。
   * 更新后会自动触发 state:changed 事件。
   */
  setState(partial: Partial<AppState>): void {
    this.state = { ...this.state, ...partial };
    this.emit('state:changed', this.state);
  }

  /**
   * 获取所有组件列表
   * 用于渲染、遍历等操作
   */
  getComponents(): ComponentInstance[] {
    return this.state.components;
  }

  /**
   * 获取当前选中的组件 ID
   * 返回 null 表示没有选中任何组件
   */
  getSelectedId(): string | null {
    return this.state.selectedId;
  }

  /**
   * 获取当前选中的组件实例
   * @returns 选中的组件，或 null
   *
   * 调用场景：PropertyPanel 需要获取选中组件来显示属性
   */
  getSelectedComponent(): ComponentInstance | null {
    const id = this.state.selectedId;
    if (!id) return null;
    return this.state.components.find(c => c.id === id) || null;
  }

  /**
   * 根据 ID 获取组件
   * @param id - 组件的唯一标识
   * @returns 找到的组件，或 undefined
   */
  getComponentById(id: string): ComponentInstance | undefined {
    return this.state.components.find(c => c.id === id);
  }

  /**
   * 添加组件到状态中
   * @param component - 要添加的组件实例
   *
   * 调用链：用户从组件库拖拽组件到画布 → DragManager.handleDrop()
   *   → registry.createInstance() → store.addComponent()
   *   → 触发 component:added 和 state:changed 事件
   */
  addComponent(component: ComponentInstance): void {
    this.state.components.push(component);
    this.emit('component:added', component);
    this.emit('state:changed', this.state);
  }

  /**
   * 从状态中移除组件
   * @param id - 要移除的组件 ID
   *
   * 调用链：用户按 Delete 键 → main.ts setupKeyboardShortcuts → store.removeComponent()
   *   或：用户右键点击组件 → Editor.showDeleteButton() → store.removeComponent()
   *   或：组件内部 onkeydown → Editor.renderComponent() → store.removeComponent()
   */
  removeComponent(id: string): void {
    this.state.components = this.state.components.filter(c => c.id !== id);
    // 如果移除的是当前选中的组件，需要取消选中状态
    if (this.state.selectedId === id) {
      this.state.selectedId = null;
      this.emit('component:deselected', null);
    }
    this.emit('component:removed', id);
    this.emit('state:changed', this.state);
  }

  /**
   * 更新组件的属性
   * @param id - 组件 ID
   * @param props - 要更新的属性（部分更新）
   *
   * 调用链：用户在属性面板修改值 → PropertyPanel.handleInputChange()
   *   → store.updateComponent()
   *   或：用户拖拽移动组件 → MoveManager.setupMouseUp() → store.updateComponent()
   */
  updateComponent(id: string, props: Partial<import('../types/component').ComponentProps>): void {
    const component = this.state.components.find(c => c.id === id);
    if (component) {
      component.props = { ...component.props, ...props };
      this.emit('component:updated', component);
      this.emit('state:changed', this.state);
    }
  }

  /**
   * 选中组件
   * @param id - 要选中的组件 ID，传 null 表示取消选中
   *
   * 调用链：用户点击组件 → Editor.renderComponent() → selectionManager.select()
   *   → store.selectComponent() → 触发 component:selected 事件
   *   → SelectionManager.updateSelectionVisual() 添加选中样式
   *   → PropertyPanel.updatePanel() 更新属性面板
   */
  selectComponent(id: string | null): void {
    this.state.selectedId = id;
    if (id) {
      this.emit('component:selected', id);
    } else {
      this.emit('component:deselected', null);
    }
  }

  /**
   * 订阅事件
   * @param event - 事件类型
   * @param handler - 事件处理函数
   * @returns 取消订阅的函数
   *
   * 使用示例：
   *   const unsubscribe = store.on('state:changed', () => { ... });
   *   // 之后不再需要时调用 unsubscribe() 取消订阅
   */
  on(event: AppEventType, handler: AppEventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // 返回取消订阅函数，方便后续清理
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  /**
   * 触发事件
   * @param event - 事件类型
   * @param payload - 事件数据
   *
   * 内部方法，由各种 setState/addComponent/updateComponent 等方法调用
   */
  emit(event: AppEventType, payload?: unknown): void {
    this.listeners.get(event)?.forEach(handler => handler(payload));
  }

  /**
   * 获取状态快照（深拷贝）
   * 用于历史记录保存，确保保存的是当前时刻的状态副本
   */
  getSnapshot(): AppState {
    return {
      components: JSON.parse(JSON.stringify(this.state.components)),
      selectedId: this.state.selectedId
    };
  }

  /**
   * 从快照恢复状态（深拷贝）
   * 用于撤销/重做操作，将状态恢复到历史记录中的某个时刻
   */
  restoreSnapshot(snapshot: AppState): void {
    this.state = JSON.parse(JSON.stringify(snapshot));
    this.emit('state:changed', this.state);
  }
}

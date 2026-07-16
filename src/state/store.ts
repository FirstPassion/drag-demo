import { AppState, AppEventType, AppEventHandler } from '../types';

// 中央状态管理（发布/订阅模式）
export class Store {
  private state: AppState;
  private listeners: Map<AppEventType, Set<AppEventHandler>>;

  constructor(initialState: AppState) {
    this.state = initialState;
    this.listeners = new Map();
  }

  // 获取当前状态（只读）
  getState(): Readonly<AppState> {
    return this.state;
  }

  // 更新状态
  setState(partial: Partial<AppState>): void {
    this.state = { ...this.state, ...partial };
    this.emit('state:changed', this.state);
  }

  // 获取组件列表
  getComponents() {
    return this.state.components;
  }

  // 获取选中的组件ID
  getSelectedId() {
    return this.state.selectedId;
  }

  // 根据ID获取组件
  getComponentById(id: string) {
    return this.state.components.find(c => c.id === id);
  }

  // 添加组件
  addComponent(component: import('../types/component').ComponentInstance): void {
    this.state.components.push(component);
    this.emit('component:added', component);
    this.emit('state:changed', this.state);
  }

  // 移除组件
  removeComponent(id: string): void {
    this.state.components = this.state.components.filter(c => c.id !== id);
    if (this.state.selectedId === id) {
      this.state.selectedId = null;
      this.emit('component:deselected', null);
    }
    this.emit('component:removed', id);
    this.emit('state:changed', this.state);
  }

  // 更新组件
  updateComponent(id: string, props: Partial<import('../types/component').ComponentProps>): void {
    const component = this.state.components.find(c => c.id === id);
    if (component) {
      component.props = { ...component.props, ...props };
      this.emit('component:updated', component);
      this.emit('state:changed', this.state);
    }
  }

  // 选中组件
  selectComponent(id: string | null): void {
    this.state.selectedId = id;
    if (id) {
      this.emit('component:selected', id);
    } else {
      this.emit('component:deselected', null);
    }
  }

  // 订阅事件
  on(event: AppEventType, handler: AppEventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // 返回取消订阅函数
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  // 触发事件
  emit(event: AppEventType, payload?: unknown): void {
    this.listeners.get(event)?.forEach(handler => handler(payload));
  }

  // 获取状态快照
  getSnapshot(): AppState {
    return {
      components: JSON.parse(JSON.stringify(this.state.components)),
      selectedId: this.state.selectedId
    };
  }

  // 从快照恢复状态
  restoreSnapshot(snapshot: AppState): void {
    this.state = JSON.parse(JSON.stringify(snapshot));
    this.emit('state:changed', this.state);
  }
}
